import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get audit logs (ADMINISTRATOR only)
router.get('/', requireAuth, requireRole('ADMINISTRATOR'), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { actor: { select: { fullName: true } } },
      orderBy: { executedAt: 'desc' },
      take: 50
    });
    res.json({ data: logs });
  } catch (err) {
    res.status(500).json({ status: 500, detail: 'Internal server error' });
  }
});

export default router;
