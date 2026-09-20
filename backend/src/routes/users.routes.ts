import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth';
import { prisma } from '../utils/prisma';

const router = Router();

// Get all users (ADMINISTRATOR only)
router.get('/', requireAuth, requireRole('ADMINISTRATOR'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, availabilityStatus: true, avatarUrl: true, createdAt: true, updatedAt: true }
    });
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ status: 500, detail: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, role: true, availabilityStatus: true, avatarUrl: true, createdAt: true, updatedAt: true }
    });
    
    if (!user) return res.status(404).json({ status: 404, detail: 'User not found' });
    
    const lastSession = await prisma.session.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ data: { ...user, lastLogin: lastSession?.createdAt || user.createdAt } });
  } catch (err) {
    res.status(500).json({ status: 500, detail: 'Internal server error' });
  }
});

export default router;
