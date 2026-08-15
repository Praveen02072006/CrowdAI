import { Server, Socket } from 'socket.io';
import { prisma } from '../database/client';

export function setupSocketIO(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined their room`);
    });

    // Join vehicle tracking room
    socket.on('join:vehicle', (vehicleId: string) => {
      socket.join(`vehicle:${vehicleId}`);
    });

    // Join operator room
    socket.on('join:operator', () => {
      socket.join('operator');
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  // ─── Vehicle Location Broadcast (from simulator) ──────────────────────────
  // Automatically move vehicles on a 5s interval
  startVehicleMovementEngine(io);
}

function startVehicleMovementEngine(io: Server): void {
  let consecutiveFailures = 0;
  const MAX_FAILURES = 3;
  const BACKOFF_MS = 60_000; // 60 seconds backoff after circuit opens
  let circuitOpen = false;
  let circuitOpenedAt = 0;

  async function tick() {
    // Circuit breaker: if too many failures, wait before retrying
    if (circuitOpen) {
      const elapsed = Date.now() - circuitOpenedAt;
      if (elapsed < BACKOFF_MS) return; // still in backoff, skip
      // Try to recover
      circuitOpen = false;
      consecutiveFailures = 0;
      console.log('🔄 Vehicle engine: retrying DB connection after backoff...');
    }

    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { status: { in: ['ACTIVE', 'DEPLOYED'] } },
        include: {
          route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
          locations: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      // Reset failure count on success
      if (consecutiveFailures > 0) {
        console.log('✅ Vehicle engine: DB connection restored.');
        consecutiveFailures = 0;
      }

      for (const vehicle of vehicles) {
        const currentLoc = vehicle.locations[0];
        if (!currentLoc || vehicle.route.stops.length < 2) continue;

        const stops = vehicle.route.stops;
        const currentLat = currentLoc.latitude;
        const currentLng = currentLoc.longitude;

        // Find nearest stop and move toward next one
        let nearestIdx = 0;
        let minDist = Infinity;
        stops.forEach((stop: any, i: number) => {
          const d = Math.sqrt(Math.pow(stop.latitude - currentLat, 2) + Math.pow(stop.longitude - currentLng, 2));
          if (d < minDist) { minDist = d; nearestIdx = i; }
        });

        const targetIdx = (nearestIdx + 1) % stops.length;
        const target = stops[targetIdx];

        // Move 10% toward target
        const newLat = currentLat + (target.latitude - currentLat) * 0.1;
        const newLng = currentLng + (target.longitude - currentLng) * 0.1;
        const speed = 20 + Math.random() * 20;
        const heading = Math.atan2(target.longitude - currentLng, target.latitude - currentLat) * (180 / Math.PI);

        // ── Update the existing location row instead of inserting a new one ──
        // This avoids flooding the DB with a new row every 10 seconds per vehicle
        await prisma.vehicleLocation.update({
          where: { id: currentLoc.id },
          data: { latitude: newLat, longitude: newLng, speed, heading, timestamp: new Date() },
        });

        io.emit('vehicle:location', {
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.vehicleNumber,
          routeName: vehicle.route.name,
          latitude: newLat,
          longitude: newLng,
          speed,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      consecutiveFailures++;
      if (consecutiveFailures <= MAX_FAILURES) {
        console.error(`Vehicle movement engine error (attempt ${consecutiveFailures}/${MAX_FAILURES}):`, (err as Error).message);
      }
      if (consecutiveFailures >= MAX_FAILURES && !circuitOpen) {
        circuitOpen = true;
        circuitOpenedAt = Date.now();
        console.warn(`⚠️  Vehicle engine: DB unreachable after ${MAX_FAILURES} failures. Pausing for ${BACKOFF_MS / 1000}s before retrying.`);
      }
    }
  }

  // Broadcast vehicle positions every 10 seconds (was 5s — reduces DB load by 50%)
  setInterval(tick, 10_000);
}
