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
  // Broadcast vehicle positions every 5 seconds
  setInterval(async () => {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { status: { in: ['ACTIVE', 'DEPLOYED'] } },
        include: {
          route: { include: { stops: { orderBy: { sequence: 'asc' } } } },
          locations: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      for (const vehicle of vehicles) {
        const currentLoc = vehicle.locations[0];
        if (!currentLoc || vehicle.route.stops.length < 2) continue;

        const stops = vehicle.route.stops;
        const currentLat = currentLoc.latitude;
        const currentLng = currentLoc.longitude;

        // Find nearest stop and move toward next one
        let nearestIdx = 0;
        let minDist = Infinity;
        stops.forEach((stop, i) => {
          const d = Math.sqrt(Math.pow(stop.latitude - currentLat, 2) + Math.pow(stop.longitude - currentLng, 2));
          if (d < minDist) { minDist = d; nearestIdx = i; }
        });

        const targetIdx = (nearestIdx + 1) % stops.length;
        const target = stops[targetIdx];

        // Move 10% toward target
        const newLat = currentLat + (target.latitude - currentLat) * 0.1;
        const newLng = currentLng + (target.longitude - currentLng) * 0.1;
        const speed = 20 + Math.random() * 20;

        await prisma.vehicleLocation.create({
          data: {
            vehicleId: vehicle.id,
            latitude: newLat,
            longitude: newLng,
            speed,
            heading: Math.atan2(target.longitude - currentLng, target.latitude - currentLat) * (180 / Math.PI),
          },
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
      console.error('Vehicle movement engine error:', err);
    }
  }, 5000);
}
