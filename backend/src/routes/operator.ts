import { Router, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { computeOccupancyEstimate } from '../services/aiService';
import { io } from '../index';

export const operatorRouter = Router();
operatorRouter.use(authenticate);
operatorRouter.use(requireRole('OPERATOR', 'ADMIN'));

// GET /api/operator/dashboard
operatorRouter.get('/dashboard', async (_req, res: Response): Promise<void> => {
  try {
    const [vehicles, activeAlerts, routeStats] = await Promise.all([
      prisma.vehicle.findMany({
        include: {
          route: { select: { name: true, source: true, destination: true, color: true } },
          locations: { orderBy: { timestamp: 'desc' }, take: 1 },
          occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
          crowdPredictions: { orderBy: { timestamp: 'desc' }, distinct: ['horizonMinutes'], take: 3 },
          alerts: { where: { status: 'ACTIVE' }, take: 1 },
        },
        orderBy: { vehicleNumber: 'asc' },
      }),
      prisma.alert.findMany({
        where: { status: 'ACTIVE' },
        include: { vehicle: { select: { vehicleNumber: true, route: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.route.findMany({
        where: { active: true },
        include: {
          vehicles: {
            include: { occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 } },
          },
        },
      }),
    ]);

    const fleetStats = {
      total: vehicles.length,
      normal: vehicles.filter(v => (v.occupancyPredictions[0]?.occupancyPercentage || 0) < 70).length,
      moderate: vehicles.filter(v => {
        const o = v.occupancyPredictions[0]?.occupancyPercentage || 0;
        return o >= 70 && o < 85;
      }).length,
      crowded: vehicles.filter(v => {
        const o = v.occupancyPredictions[0]?.occupancyPercentage || 0;
        return o >= 85 && o < 95;
      }).length,
      overcapacity: vehicles.filter(v => (v.occupancyPredictions[0]?.occupancyPercentage || 0) >= 95).length,
    };

    const routeDemand = routeStats.map(route => {
      const avgOccupancy = route.vehicles.reduce((sum, v) => {
        return sum + (v.occupancyPredictions[0]?.occupancyPercentage || 0);
      }, 0) / Math.max(route.vehicles.length, 1);
      return {
        routeId: route.id,
        routeName: route.name,
        source: route.source,
        destination: route.destination,
        color: route.color,
        avgOccupancy: Math.round(avgOccupancy),
        vehicleCount: route.vehicles.length,
      };
    });

    res.json({
      success: true,
      data: { vehicles, fleetStats, activeAlerts, routeDemand },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load operator dashboard.' });
  }
});

// POST /api/operator/deploy — deploy additional vehicle to route
operatorRouter.post('/deploy', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { vehicleId, targetRouteId, reason } = req.body;

    if (!vehicleId && !targetRouteId) {
      res.status(400).json({ success: false, message: 'vehicleId or targetRouteId required.' });
      return;
    }

    // Simulate capacity deployment: reduce occupancy on overcrowded vehicles on this route
    const vehicles = await prisma.vehicle.findMany({
      where: { routeId: targetRouteId || undefined },
      include: { occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 }, route: true },
    });

    const updatedVehicles = [];

    for (const vehicle of vehicles) {
      const currentOcc = vehicle.occupancyPredictions[0]?.occupancyPercentage || 0;
      if (currentOcc > 80) {
        // Redistribute ~25-30% of passengers to new vehicle
        const reducedOcc = Math.max(40, currentOcc - 27);
        const reducedPassengers = Math.round((reducedOcc / 100) * vehicle.capacity);

        await prisma.occupancyPrediction.create({
          data: {
            vehicleId: vehicle.id,
            estimatedPassengers: reducedPassengers,
            occupancyPercentage: reducedOcc,
            confidence: 0.88,
            crowdLevel: reducedOcc < 50 ? 'LOW' : reducedOcc < 70 ? 'MODERATE' : 'CROWDED',
            seatProbability: Math.max(0, (100 - reducedOcc - 10) / 100),
          },
        });

        updatedVehicles.push({ vehicleId: vehicle.id, vehicleNumber: vehicle.vehicleNumber, from: currentOcc, to: reducedOcc });

        // Broadcast update
        io.emit('occupancy:update', {
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          routeName: vehicle.route.name,
          occupancyPercentage: reducedOcc,
          estimatedPassengers: reducedPassengers,
          capacity: vehicle.capacity,
          crowdLevel: reducedOcc < 70 ? 'MODERATE' : 'CROWDED',
          seatProbability: Math.max(0, (100 - reducedOcc - 10) / 100),
          confidence: 0.88,
          timestamp: new Date(),
          deploymentAction: true,
        });
      }
    }

    // Create capacity deployed alert
    const routeVehicle = vehicles[0];
    if (routeVehicle) {
      const deployAlert = await prisma.alert.create({
        data: {
          vehicleId: routeVehicle.id,
          type: 'CAPACITY_DEPLOYED',
          severity: 'LOW',
          message: `✅ Additional capacity deployed on Route ${routeVehicle.route.name}. Occupancy redistributed.`,
          metadata: JSON.stringify({ updatedVehicles, reason }),
          status: 'ACTIVE',
        },
      });

      io.emit('fleet:update', {
        action: 'CAPACITY_DEPLOYED',
        routeName: routeVehicle.route.name,
        updatedVehicles,
        alert: deployAlert,
      });

      // Resolve overcrowding alerts for this route
      await prisma.alert.updateMany({
        where: {
          vehicleId: { in: vehicles.map(v => v.id) },
          type: { in: ['OVERCROWDING', 'CROWD_SURGE'] },
          status: 'ACTIVE',
        },
        data: { status: 'RESOLVED' },
      });
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user!.id,
        action: 'DEPLOY_CAPACITY',
        metadata: JSON.stringify({ targetRouteId, reason, updatedVehicles }),
      },
    });

    // Notify passengers
    const passengers = await prisma.user.findMany({ where: { role: 'PASSENGER' } });
    for (const p of passengers.slice(0, 5)) {
      const notif = await prisma.notification.create({
        data: {
          userId: p.id,
          title: '✅ Additional capacity deployed',
          message: `Crowd levels are being reduced on Route ${routeVehicle?.route.name || 'your route'}. An updated recommendation is available.`,
          type: 'SUCCESS',
        },
      });
      io.to(`user:${p.id}`).emit('notification:new', notif);
    }

    res.json({
      success: true,
      message: 'Additional capacity deployed successfully.',
      data: { updatedVehicles },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Deployment failed. Please try again.' });
  }
});

// GET /api/operator/alerts
operatorRouter.get('/alerts', async (_req, res: Response): Promise<void> => {
  try {
    const alerts = await prisma.alert.findMany({
      include: {
        vehicle: {
          select: {
            vehicleNumber: true,
            capacity: true,
            route: { select: { name: true, source: true, destination: true } },
            occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: alerts });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
});

// PATCH /api/operator/alerts/:id
operatorRouter.patch('/alerts/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { status },
    });
    if (status === 'RESOLVED') {
      io.emit('alert:resolved', { alertId: alert.id });
    }
    res.json({ success: true, data: alert });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update alert.' });
  }
});
