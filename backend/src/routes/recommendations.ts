import { Router, Response } from 'express';
import { prisma } from '../database/client';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth';
import { computeTravelScore, generateRecommendationReason } from '../services/aiService';

export const recommendationsRouter = Router();

// GET /api/recommendations
recommendationsRouter.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
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
      },
    });

    const recommendations = vehicles.map((vehicle, index) => {
      const occupancyPred = vehicle.occupancyPredictions[0];
      const occupancyPercentage = occupancyPred?.occupancyPercentage || 50;
      const seatProbability = occupancyPred?.seatProbability || 0.5;
      const confidence = occupancyPred?.confidence || 0.75;

      // Simulated ETA (3–15 min based on index)
      const waitingTime = 3 + index * 4;
      const travelTime = 15 + Math.floor(Math.random() * 20);

      const score = computeTravelScore({
        waitingTime,
        occupancyPercentage,
        seatProbability,
        travelTime,
        confidence,
      });

      return {
        vehicleId: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        route: vehicle.route,
        score,
        waitingTime,
        travelTime,
        occupancyPercentage,
        seatProbability,
        confidence,
        crowdLevel: occupancyPred?.crowdLevel || 'MODERATE',
        crowdPredictions: vehicle.crowdPredictions,
        location: vehicle.locations[0] || null,
        capacity: vehicle.capacity,
      };
    });

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);

    // Add reasons
    const withReasons = recommendations.map((rec, i) => ({
      ...rec,
      isAiRecommended: i === 0 && rec.score >= 60,
      reason: generateRecommendationReason(
        rec.vehicleNumber,
        rec.waitingTime,
        rec.occupancyPercentage,
        rec.seatProbability,
        rec.score,
        i === 0
      ),
    }));

    // Save recommendation to DB if authenticated
    if (req.user && withReasons.length > 0) {
      const top = withReasons[0];
      await prisma.recommendation.create({
        data: {
          userId: req.user.id,
          vehicleId: top.vehicleId,
          score: top.score,
          waitingTime: top.waitingTime,
          crowdLevel: top.crowdLevel as 'LOW' | 'MODERATE' | 'CROWDED' | 'OVERLOADED',
          seatProbability: top.seatProbability,
          travelTime: top.travelTime,
          reason: top.reason,
          isAiRecommended: true,
        },
      });
    }

    res.json({ success: true, data: withReasons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations.' });
  }
});
