import { Router, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthRequest } from '../middleware/auth';

export const routesRouter = Router();

// GET /api/routes
routesRouter.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const routes = await prisma.route.findMany({
      where: { active: true },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: {
          where: { status: { in: ['ACTIVE', 'DEPLOYED'] } },
          include: {
            locations: { orderBy: { timestamp: 'desc' }, take: 1 },
            occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: routes });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch routes.' });
  }
});

// GET /api/routes/:id
routesRouter.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const route = await prisma.route.findUnique({
      where: { id: req.params.id },
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        vehicles: {
          include: {
            locations: { orderBy: { timestamp: 'desc' }, take: 1 },
            occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
            crowdPredictions: { orderBy: { timestamp: 'desc' }, take: 3 },
          },
        },
      },
    });

    if (!route) {
      res.status(404).json({ success: false, message: 'Route not found.' });
      return;
    }

    res.json({ success: true, data: route });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch route details.' });
  }
});
