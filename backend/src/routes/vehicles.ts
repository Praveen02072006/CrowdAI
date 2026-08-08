import { Router, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { computeOccupancyEstimate } from '../services/aiService';

export const vehiclesRouter = Router();

const getVehicleWithData = async (id: string) => {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
      locations: { orderBy: { timestamp: 'desc' }, take: 1 },
      deviceObservations: { orderBy: { timestamp: 'desc' }, take: 1 },
      occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
      crowdPredictions: {
        orderBy: { timestamp: 'desc' },
        distinct: ['horizonMinutes'],
        take: 3,
      },
      alerts: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });
};

// GET /api/vehicles
vehiclesRouter.get('/', async (_req, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { in: ['ACTIVE', 'DEPLOYED'] } },
      include: {
        route: { select: { name: true, source: true, destination: true, color: true } },
        locations: { orderBy: { timestamp: 'desc' }, take: 1 },
        occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
        crowdPredictions: {
          orderBy: { timestamp: 'desc' },
          distinct: ['horizonMinutes'],
          take: 3,
        },
        alerts: { where: { status: 'ACTIVE' }, take: 1 },
      },
      orderBy: { vehicleNumber: 'asc' },
    });
    res.json({ success: true, data: vehicles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch vehicles.' });
  }
});

// GET /api/vehicles/:id
vehiclesRouter.get('/:id', async (req, res: Response): Promise<void> => {
  try {
    const vehicle = await getVehicleWithData(req.params.id);
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }
    res.json({ success: true, data: vehicle });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch vehicle details.' });
  }
});

// GET /api/vehicles/:id/predictions
vehiclesRouter.get('/:id/predictions', async (req, res: Response): Promise<void> => {
  try {
    const [occupancy, crowd, deviceObs] = await Promise.all([
      prisma.occupancyPrediction.findMany({
        where: { vehicleId: req.params.id },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
      prisma.crowdPrediction.findMany({
        where: { vehicleId: req.params.id },
        orderBy: { timestamp: 'desc' },
        take: 12,
      }),
      prisma.deviceObservation.findMany({
        where: { vehicleId: req.params.id },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
    ]);

    res.json({
      success: true,
      data: { occupancy, crowd, deviceObservations: deviceObs },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch predictions. Showing latest available estimate.' });
  }
});
