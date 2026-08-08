import { Router, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

// GET /api/notifications
notificationsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// POST /api/notifications/:id/read
notificationsRouter.post('/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// POST /api/notifications/read-all
notificationsRouter.post('/read-all', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});
