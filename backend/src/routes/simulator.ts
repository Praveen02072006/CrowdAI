import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../database/client';
import { computeOccupancyEstimate } from '../services/aiService';
import { io } from '../index';

export const simulatorRouter = Router();

const deviceUpdateSchema = z.object({
  vehicleId: z.string(),
  deviceCount: z.number().int().min(0).max(200),
  boardingRate: z.number().min(0).max(20).optional().default(0),
  exitRate: z.number().min(0).max(20).optional().default(0),
});

const crowdScenarioSchema = z.object({
  vehicleId: z.string(),
  scenario: z.enum(['NORMAL', 'CROWD_SURGE', 'PEAK_HOUR', 'OVERLOAD', 'RESET']),
});

const demoSchema = z.object({
  phase: z.number().int().min(1).max(8),
  vehicleId: z.string().optional(),
});

// POST /api/simulator/device
simulatorRouter.post('/device', async (req, res: Response): Promise<void> => {
  try {
    const parsed = deviceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }

    const { vehicleId, deviceCount, boardingRate, exitRate } = parsed.data;

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    // Save device observation
    await prisma.deviceObservation.create({
      data: {
        vehicleId,
        anonymousDeviceCount: deviceCount,
        boardingCount: boardingRate,
        exitCount: exitRate,
        source: 'SIMULATOR',
      },
    });

    // Broadcast device update
    io.emit('device:update', {
      vehicleId,
      vehicleNumber: vehicle.vehicleNumber,
      anonymousDeviceCount: deviceCount,
      boardingRate,
      exitRate,
      source: 'SIMULATOR',
      timestamp: new Date().toISOString(),
    });

    // Trigger AI estimation → updates occupancy → triggers alerts → broadcasts
    await computeOccupancyEstimate(vehicleId, deviceCount, boardingRate, exitRate);

    res.json({
      success: true,
      message: 'Device telemetry processed. AI estimation complete.',
      data: { vehicleId, deviceCount, boardingRate, exitRate },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process device telemetry.' });
  }
});

// POST /api/simulator/crowd — preset scenarios
simulatorRouter.post('/crowd', async (req, res: Response): Promise<void> => {
  try {
    const parsed = crowdScenarioSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }

    const { vehicleId, scenario } = parsed.data;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Vehicle not found.' });
      return;
    }

    const scenarioConfigs: Record<string, { deviceCount: number; boardingRate: number; exitRate: number }> = {
      NORMAL:     { deviceCount: Math.floor(vehicle.capacity * 0.4), boardingRate: 2, exitRate: 2 },
      CROWD_SURGE:{ deviceCount: Math.floor(vehicle.capacity * 0.75), boardingRate: 8, exitRate: 1 },
      PEAK_HOUR:  { deviceCount: Math.floor(vehicle.capacity * 0.85), boardingRate: 10, exitRate: 3 },
      OVERLOAD:   { deviceCount: Math.floor(vehicle.capacity * 1.1), boardingRate: 12, exitRate: 1 },
      RESET:      { deviceCount: Math.floor(vehicle.capacity * 0.2), boardingRate: 1, exitRate: 5 },
    };

    const config = scenarioConfigs[scenario];

    await prisma.deviceObservation.create({
      data: {
        vehicleId,
        anonymousDeviceCount: config.deviceCount,
        boardingCount: config.boardingRate,
        exitCount: config.exitRate,
        source: 'SIMULATOR',
      },
    });

    io.emit('device:update', {
      vehicleId,
      vehicleNumber: vehicle.vehicleNumber,
      anonymousDeviceCount: config.deviceCount,
      boardingRate: config.boardingRate,
      exitRate: config.exitRate,
      scenario,
      source: 'SIMULATOR',
      timestamp: new Date().toISOString(),
    });

    await computeOccupancyEstimate(vehicleId, config.deviceCount, config.boardingRate, config.exitRate);

    res.json({
      success: true,
      message: `Scenario "${scenario}" applied to ${vehicle.vehicleNumber}.`,
      data: { vehicleId, scenario, config },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to apply scenario.' });
  }
});

// POST /api/simulator/demo — hackathon demo phases
simulatorRouter.post('/demo', async (req, res: Response): Promise<void> => {
  try {
    const parsed = demoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      return;
    }

    const { phase } = parsed.data;
    const vehicleId = 'vehicle-21g-1';
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      res.status(404).json({ success: false, message: 'Demo vehicle not found.' });
      return;
    }

    const phaseConfigs: Record<number, { deviceCount: number; boardingRate: number; exitRate: number; label: string }> = {
      1: { deviceCount: 28, boardingRate: 2, exitRate: 2, label: 'Normal - 48% occupancy' },
      2: { deviceCount: 38, boardingRate: 5, exitRate: 2, label: 'Rising - 65% occupancy' },
      3: { deviceCount: 48, boardingRate: 7, exitRate: 1, label: 'Crowded - 82% occupancy' },
      4: { deviceCount: 56, boardingRate: 9, exitRate: 1, label: 'AI predicts surge - 92%+ in 10 min' },
      5: { deviceCount: 58, boardingRate: 10, exitRate: 0, label: 'Alert triggered - Operator notified' },
      6: { deviceCount: 60, boardingRate: 11, exitRate: 0, label: 'Operator deploys additional vehicle' },
      7: { deviceCount: 40, boardingRate: 3, exitRate: 8, label: 'Passengers redistribute - 71%' },
      8: { deviceCount: 30, boardingRate: 2, exitRate: 6, label: 'System stabilizes - SmartRoute updated' },
    };

    const config = phaseConfigs[phase];
    if (!config) {
      res.status(400).json({ success: false, message: 'Invalid demo phase.' });
      return;
    }

    // Broadcast demo phase
    io.emit('demo:phase', { phase, label: config.label, vehicleId, vehicleNumber: vehicle.vehicleNumber });

    await prisma.deviceObservation.create({
      data: {
        vehicleId,
        anonymousDeviceCount: config.deviceCount,
        boardingCount: config.boardingRate,
        exitCount: config.exitRate,
        source: 'DEMO',
      },
    });

    await computeOccupancyEstimate(vehicleId, config.deviceCount, config.boardingRate, config.exitRate);

    res.json({ success: true, message: `Demo Phase ${phase}: ${config.label}`, data: { phase, config } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Demo phase failed.' });
  }
});

// GET /api/simulator/vehicles — list vehicles for simulator
simulatorRouter.get('/vehicles', async (_req, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: { in: ['ACTIVE', 'DEPLOYED'] } },
      select: {
        id: true,
        vehicleNumber: true,
        capacity: true,
        route: { select: { name: true } },
        deviceObservations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { anonymousDeviceCount: true, boardingCount: true, exitCount: true },
        },
        occupancyPredictions: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { occupancyPercentage: true, crowdLevel: true },
        },
      },
      orderBy: { vehicleNumber: 'asc' },
    });
    res.json({ success: true, data: vehicles });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch simulator vehicles.' });
  }
});
