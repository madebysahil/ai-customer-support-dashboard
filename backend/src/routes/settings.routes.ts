import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get all non-sensitive settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { isSensitive: false }
    });
    const formatted = settings.reduce((acc, s) => {
      acc[s.configKey] = s.configValue;
      return acc;
    }, {} as Record<string, any>);
    res.json({ data: formatted });
  } catch (err) {
    res.status(500).json({ status: 500, detail: 'Internal server error' });
  }
});

// Update a setting
router.patch('/:key', requireAuth, requireRole('ADMINISTRATOR'), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = (req as any).user.sub;
    
    const setting = await prisma.systemSetting.upsert({
      where: { configKey: key },
      update: { configValue: value, updatedById: userId },
      create: { configKey: key, configValue: value, isSensitive: false, updatedById: userId }
    });
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'Settings Modified',
        resourceType: 'SystemSetting',
        resourceId: key,
        newState: { value }
      }
    });
    
    res.json({ data: setting });
  } catch (err) {
    res.status(500).json({ status: 500, detail: 'Internal server error' });
  }
});

export default router;
