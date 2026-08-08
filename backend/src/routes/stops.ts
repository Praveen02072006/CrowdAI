import { Router, Response } from 'express';
import { prisma } from '../database/client';

export const stopsRouter = Router();

// GET /api/stops
stopsRouter.get('/', async (req, res: Response): Promise<void> => {
  try {
    const { routeId } = req.query;
    const stops = await prisma.stop.findMany({
      where: routeId ? { routeId: String(routeId) } : undefined,
      include: { route: { select: { name: true, color: true } } },
      orderBy: [{ routeId: 'asc' }, { sequence: 'asc' }],
    });
    res.json({ success: true, data: stops });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch stops.' });
  }
});
