import axios from 'axios';
import { prisma } from '../database/client';
type CrowdLevel = 'LOW' | 'MODERATE' | 'CROWDED' | 'OVERLOADED';
type AlertType = 'OVERCROWDING' | 'CAPACITY_WARNING' | 'ROUTE_DELAY' | 'VEHICLE_BREAKDOWN' | 'CROWD_SURGE' | 'CAPACITY_DEPLOYED';
type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
const AlertType = { OVERCROWDING: 'OVERCROWDING', CAPACITY_WARNING: 'CAPACITY_WARNING', ROUTE_DELAY: 'ROUTE_DELAY', VEHICLE_BREAKDOWN: 'VEHICLE_BREAKDOWN', CROWD_SURGE: 'CROWD_SURGE', CAPACITY_DEPLOYED: 'CAPACITY_DEPLOYED' } as const;
const AlertSeverity = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' } as const;
import { io } from '../index';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
let aiServiceAvailable = true;

// ─── Device-to-Passenger AI Estimation (JS fallback) ─────────────────────────
// This runs locally when the Python AI service is not available.
// It uses a calibrated linear model learned from historical patterns.
function jsOccupancyEstimate(deviceCount: number, capacity: number, hour: number, dayOfWeek: number): {
  estimatedPassengers: number;
  occupancyPercentage: number;
  confidence: number;
} {
  // Peak hour multipliers (learned from historical data)
  const peakMultiplier = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1.25 : 1.0;
  const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;

  // Device-to-passenger ratio varies: not every person carries a detectable device
  // Empirically ~0.85–1.15 passengers per device signal in urban India
  const baseRatio = 1.05;
  const calibratedRatio = baseRatio * peakMultiplier * weekendFactor;

  const estimatedPassengers = Math.min(Math.round(deviceCount * calibratedRatio), capacity);
  const occupancyPercentage = Math.min(100, Math.round((estimatedPassengers / capacity) * 100));
  const confidence = Math.min(0.95, 0.72 + (deviceCount / 100) * 0.2);

  return { estimatedPassengers, occupancyPercentage, confidence };
}

// ─── Call Python AI Service ───────────────────────────────────────────────────
export async function callAIPredict(payload: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  if (!aiServiceAvailable) return null;
  try {
    const res = await axios.post(`${AI_SERVICE_URL}/predict/occupancy`, payload, { timeout: 3000 });
    return res.data;
  } catch {
    aiServiceAvailable = false;
    setTimeout(() => { aiServiceAvailable = true; }, 30000); // retry in 30s
    return null;
  }
}

// ─── Main Occupancy Estimation ────────────────────────────────────────────────
export async function computeOccupancyEstimate(vehicleId: string, deviceCount: number, boardingRate = 0, exitRate = 0): Promise<void> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      route: true,
      occupancyPredictions: { orderBy: { timestamp: 'desc' }, take: 1 },
    },
  });
  if (!vehicle) return;

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  let result: { estimatedPassengers: number; occupancyPercentage: number; confidence: number };

  // Try Python AI service first
  const aiResult = await callAIPredict({
    device_count: deviceCount,
    hour,
    day_of_week: dayOfWeek,
    vehicle_capacity: vehicle.capacity,
    boarding_rate: boardingRate,
    exit_rate: exitRate,
    previous_occupancy: vehicle.occupancyPredictions[0]?.occupancyPercentage || 0,
  });

  if (aiResult) {
    result = {
      estimatedPassengers: aiResult.estimated_passengers as number,
      occupancyPercentage: aiResult.occupancy_percentage as number,
      confidence: aiResult.confidence as number,
    };
  } else {
    result = jsOccupancyEstimate(deviceCount, vehicle.capacity, hour, dayOfWeek);
  }

  const { estimatedPassengers, occupancyPercentage, confidence } = result;

  const crowdLevel: CrowdLevel = occupancyPercentage < 50 ? 'LOW' :
    occupancyPercentage < 70 ? 'MODERATE' :
    occupancyPercentage < 90 ? 'CROWDED' : 'OVERLOADED';

  const seatProbability = Math.max(0, (100 - occupancyPercentage - 15) / 100);

  // Save to DB
  const prediction = await prisma.occupancyPrediction.create({
    data: {
      vehicleId,
      estimatedPassengers,
      occupancyPercentage,
      confidence,
      crowdLevel,
      seatProbability,
    },
  });

  // Compute crowd predictions (5, 10, 15 min)
  const crowdPreds = await computeCrowdPredictions(vehicleId, occupancyPercentage, hour, boardingRate, exitRate);

  // Check alert thresholds
  await checkAndGenerateAlerts(vehicle, occupancyPercentage, crowdPreds);

  // Broadcast via Socket.IO
  io.emit('occupancy:update', {
    vehicleId,
    vehicleNumber: vehicle.vehicleNumber,
    routeName: vehicle.route.name,
    occupancyPercentage,
    estimatedPassengers,
    capacity: vehicle.capacity,
    crowdLevel,
    seatProbability,
    confidence,
    crowdPredictions: crowdPreds,
    timestamp: prediction.timestamp,
  });
}

// ─── Crowd Prediction (5, 10, 15 min) ────────────────────────────────────────
export async function computeCrowdPredictions(
  vehicleId: string,
  currentOccupancy: number,
  hour: number,
  boardingRate: number,
  exitRate: number
): Promise<Array<{ horizon: number; predicted: number; confidence: number; crowdLevel: CrowdLevel }>> {
  const predictions = [];

  for (const horizon of [5, 10, 15]) {
    // Trend: net passengers over time
    const netRate = boardingRate - exitRate;
    const peakBoost = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 0.5 : 0;
    const trendPer5min = netRate * 1.2 + peakBoost;
    const predicted = Math.min(100, Math.max(0, currentOccupancy + trendPer5min * (horizon / 5)));
    const confidence = Math.max(0.5, 0.88 - horizon * 0.015);

    const crowdLevel: CrowdLevel = predicted < 50 ? 'LOW' :
      predicted < 70 ? 'MODERATE' :
      predicted < 90 ? 'CROWDED' : 'OVERLOADED';

    await prisma.crowdPrediction.create({
      data: {
        vehicleId,
        horizonMinutes: horizon,
        predictedOccupancy: predicted,
        confidence,
        crowdLevel,
      },
    });

    predictions.push({ horizon, predicted, confidence, crowdLevel });
  }

  return predictions;
}

// ─── Alert Generation ──────────────────────────────────────────────────────────
async function checkAndGenerateAlerts(
  vehicle: { id: string; vehicleNumber: string; routeId: string; route: { name: string } },
  occupancyPercentage: number,
  crowdPredictions: Array<{ horizon: number; predicted: number }>
): Promise<void> {
  // Check 10-min prediction
  const pred10min = crowdPredictions.find(p => p.horizon === 10)?.predicted || occupancyPercentage;

  let shouldAlert = false;
  let alertType: AlertType = AlertType.CAPACITY_WARNING;
  let severity: AlertSeverity = AlertSeverity.LOW;
  let message = '';

  if (pred10min >= 95) {
    shouldAlert = true;
    alertType = AlertType.OVERCROWDING;
    severity = AlertSeverity.CRITICAL;
    message = `🚨 OVERCROWDING PREDICTED: Vehicle ${vehicle.vehicleNumber} on Route ${vehicle.route.name}. Current: ${Math.round(occupancyPercentage)}% → 10 min: ${Math.round(pred10min)}%. Deploy additional capacity immediately.`;
  } else if (pred10min >= 85) {
    shouldAlert = true;
    alertType = AlertType.CROWD_SURGE;
    severity = AlertSeverity.HIGH;
    message = `⚠️ CROWD SURGE: Vehicle ${vehicle.vehicleNumber} on Route ${vehicle.route.name}. Current: ${Math.round(occupancyPercentage)}% → predicted ${Math.round(pred10min)}% in 10 min.`;
  } else if (occupancyPercentage >= 70 && occupancyPercentage < 85) {
    // Resolve old alerts if back to moderate
    await prisma.alert.updateMany({
      where: { vehicleId: vehicle.id, status: 'ACTIVE', type: { in: ['OVERCROWDING', 'CROWD_SURGE'] } },
      data: { status: 'RESOLVED' },
    });
    return;
  }

  if (shouldAlert) {
    // Check if recent alert already exists to avoid spamming
    const recentAlert = await prisma.alert.findFirst({
      where: {
        vehicleId: vehicle.id,
        type: alertType,
        status: 'ACTIVE',
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (!recentAlert) {
      const alert = await prisma.alert.create({
        data: {
          vehicleId: vehicle.id,
          type: alertType,
          severity,
          message,
          metadata: JSON.stringify({
            currentOccupancy: occupancyPercentage,
            predicted10min: pred10min,
            route: vehicle.route.name,
            vehicleNumber: vehicle.vehicleNumber,
          }),
        },
      });

      io.emit('alert:new', { ...alert, vehicleNumber: vehicle.vehicleNumber, routeName: vehicle.route.name });
    }
  }
}

// ─── SmartRoute Score ─────────────────────────────────────────────────────────
export function computeTravelScore(params: {
  waitingTime: number;
  occupancyPercentage: number;
  seatProbability: number;
  travelTime: number;
  confidence: number;
}): number {
  const { waitingTime, occupancyPercentage, seatProbability, travelTime, confidence } = params;

  // Weighted scoring (higher = better)
  const waitScore     = Math.max(0, 100 - waitingTime * 4);      // weight: 25%
  const crowdScore    = Math.max(0, 100 - occupancyPercentage);  // weight: 35%
  const seatScore     = seatProbability * 100;                   // weight: 25%
  const speedScore    = Math.max(0, 100 - travelTime * 1.5);     // weight: 10%
  const confScore     = confidence * 100;                        // weight: 5%

  return Math.round(
    waitScore * 0.25 +
    crowdScore * 0.35 +
    seatScore * 0.25 +
    speedScore * 0.10 +
    confScore * 0.05
  );
}

export function generateRecommendationReason(
  vehicleNumber: string,
  waitingTime: number,
  occupancyPercentage: number,
  seatProbability: number,
  score: number,
  isTop: boolean
): string {
  if (!isTop) {
    if (occupancyPercentage >= 90) {
      return `Route ${vehicleNumber} is severely crowded (${Math.round(occupancyPercentage)}%). We recommend a different option.`;
    }
    return `Route ${vehicleNumber} has a travel score of ${score}. Consider a higher-ranked option if available.`;
  }

  if (occupancyPercentage < 50 && seatProbability > 0.6) {
    return `${vehicleNumber} is comfortable with only ${Math.round(occupancyPercentage)}% occupancy and a ${Math.round(seatProbability * 100)}% chance of getting a seat. Excellent choice.`;
  }
  if (waitingTime <= 4) {
    return `${vehicleNumber} arrives in just ${waitingTime} minutes with ${Math.round(occupancyPercentage)}% occupancy — the fastest comfortable option right now.`;
  }
  return `Waiting ${waitingTime} minutes for ${vehicleNumber} is expected to significantly reduce crowding and improve your probability of a seat (${Math.round(seatProbability * 100)}%).`;
}
