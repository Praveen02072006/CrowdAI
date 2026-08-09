import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const Role = { PASSENGER: 'PASSENGER', DRIVER: 'DRIVER', OPERATOR: 'OPERATOR', ADMIN: 'ADMIN' } as const;
const VehicleStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', MAINTENANCE: 'MAINTENANCE', DEPLOYED: 'DEPLOYED' } as const;
const CrowdLevel = { LOW: 'LOW', MODERATE: 'MODERATE', CROWDED: 'CROWDED', OVERLOADED: 'OVERLOADED' } as const;
const AlertType = { OVERCROWDING: 'OVERCROWDING', CAPACITY_WARNING: 'CAPACITY_WARNING', ROUTE_DELAY: 'ROUTE_DELAY', VEHICLE_BREAKDOWN: 'VEHICLE_BREAKDOWN', CROWD_SURGE: 'CROWD_SURGE', CAPACITY_DEPLOYED: 'CAPACITY_DEPLOYED' } as const;
const AlertSeverity = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' } as const;

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Yatra IQ database...');

  // ─── USERS ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Demo@2026', 10);

  const passenger = await prisma.user.upsert({
    where: { email: 'passenger@crowdsense.demo' },
    update: {},
    create: {
      name: 'Arjun Kumar',
      email: 'passenger@crowdsense.demo',
      passwordHash,
      role: Role.PASSENGER,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@crowdsense.demo' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'operator@crowdsense.demo',
      passwordHash,
      role: Role.OPERATOR,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@crowdsense.demo' },
    update: {},
    create: {
      name: 'Rajesh Venkat',
      email: 'admin@crowdsense.demo',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Users created');

  // ─── ROUTES ─────────────────────────────────────────────────────────────────
  const routes = await Promise.all([
    prisma.route.upsert({
      where: { id: 'route-21g' },
      update: {},
      create: {
        id: 'route-21g',
        name: '21G',
        source: 'Tambaram',
        destination: 'Chennai Central',
        color: '#3B82F6',
        active: true,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-18a' },
      update: {},
      create: {
        id: 'route-18a',
        name: '18A',
        source: 'Chrompet',
        destination: 'Egmore',
        color: '#10B981',
        active: true,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-5c' },
      update: {},
      create: {
        id: 'route-5c',
        name: '5C',
        source: 'Velachery',
        destination: 'T. Nagar',
        color: '#F59E0B',
        active: true,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-27b' },
      update: {},
      create: {
        id: 'route-27b',
        name: '27B',
        source: 'Anna Nagar',
        destination: 'Guindy',
        color: '#8B5CF6',
        active: true,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-45x' },
      update: {},
      create: {
        id: 'route-45x',
        name: '45X',
        source: 'Sholinganallur',
        destination: 'Broadway',
        color: '#EF4444',
        active: true,
      },
    }),
  ]);

  console.log('✅ Routes created');

  // ─── STOPS ───────────────────────────────────────────────────────────────────
  // Route 21G stops — Tambaram to Chennai Central (approximate Chennai coordinates)
  const stops21g = [
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000, seq: 1 },
    { name: 'Chrompet', lat: 12.9516, lng: 80.1462, seq: 2 },
    { name: 'Pallavaram', lat: 12.9677, lng: 80.1499, seq: 3 },
    { name: 'Meenambakkam', lat: 12.9941, lng: 80.1709, seq: 4 },
    { name: 'Alandur', lat: 13.0024, lng: 80.2050, seq: 5 },
    { name: 'St. Thomas Mount', lat: 13.0063, lng: 80.2008, seq: 6 },
    { name: 'Guindy', lat: 13.0067, lng: 80.2207, seq: 7 },
    { name: 'Saidapet', lat: 13.0202, lng: 80.2222, seq: 8 },
    { name: 'Little Mount', lat: 13.0257, lng: 80.2327, seq: 9 },
    { name: 'Chennai Central', lat: 13.0827, lng: 80.2707, seq: 10 },
  ];

  // Route 18A stops — Chrompet to Egmore
  const stops18a = [
    { name: 'Chrompet', lat: 12.9516, lng: 80.1462, seq: 1 },
    { name: 'Medavakkam', lat: 12.9165, lng: 80.1928, seq: 2 },
    { name: 'Velachery', lat: 12.9775, lng: 80.2209, seq: 3 },
    { name: 'Taramani', lat: 12.9860, lng: 80.2407, seq: 4 },
    { name: 'Adyar', lat: 13.0012, lng: 80.2565, seq: 5 },
    { name: 'Nandanam', lat: 13.0297, lng: 80.2420, seq: 6 },
    { name: 'Egmore', lat: 13.0732, lng: 80.2609, seq: 7 },
  ];

  // Route 5C stops — Velachery to T. Nagar
  const stops5c = [
    { name: 'Velachery', lat: 12.9775, lng: 80.2209, seq: 1 },
    { name: 'Taramani Road', lat: 12.9880, lng: 80.2350, seq: 2 },
    { name: 'Kotturpuram', lat: 13.0105, lng: 80.2453, seq: 3 },
    { name: 'Nandanam', lat: 13.0297, lng: 80.2420, seq: 4 },
    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, seq: 5 },
  ];

  // Route 27B stops — Anna Nagar to Guindy
  const stops27b = [
    { name: 'Anna Nagar West', lat: 13.0878, lng: 80.2101, seq: 1 },
    { name: 'Anna Nagar East', lat: 13.0851, lng: 80.2201, seq: 2 },
    { name: 'Kilpauk', lat: 13.0806, lng: 80.2414, seq: 3 },
    { name: 'Aminjikarai', lat: 13.0734, lng: 80.2359, seq: 4 },
    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, seq: 5 },
    { name: 'Saidapet', lat: 13.0202, lng: 80.2222, seq: 6 },
    { name: 'Guindy', lat: 13.0067, lng: 80.2207, seq: 7 },
  ];

  // Route 45X stops — Sholinganallur to Broadway
  const stops45x = [
    { name: 'Sholinganallur', lat: 12.9010, lng: 80.2279, seq: 1 },
    { name: 'Perungudi', lat: 12.9601, lng: 80.2449, seq: 2 },
    { name: 'Taramani', lat: 12.9860, lng: 80.2407, seq: 3 },
    { name: 'Adyar', lat: 13.0012, lng: 80.2565, seq: 4 },
    { name: 'Mylapore', lat: 13.0339, lng: 80.2676, seq: 5 },
    { name: 'Triplicane', lat: 13.0577, lng: 80.2790, seq: 6 },
    { name: 'Broadway', lat: 13.0921, lng: 80.2880, seq: 7 },
  ];

  const stopGroups = [
    { routeId: 'route-21g', stops: stops21g },
    { routeId: 'route-18a', stops: stops18a },
    { routeId: 'route-5c', stops: stops5c },
    { routeId: 'route-27b', stops: stops27b },
    { routeId: 'route-45x', stops: stops45x },
  ];

  for (const group of stopGroups) {
    for (const stop of group.stops) {
      await prisma.stop.upsert({
        where: { id: `stop-${group.routeId}-${stop.seq}` },
        update: {},
        create: {
          id: `stop-${group.routeId}-${stop.seq}`,
          routeId: group.routeId,
          name: stop.name,
          latitude: stop.lat,
          longitude: stop.lng,
          sequence: stop.seq,
        },
      });
    }
  }

  console.log('✅ Stops created (29 stops across 5 routes)');

  // ─── VEHICLES ────────────────────────────────────────────────────────────────
  const vehicleData = [
    // Route 21G - 4 vehicles
    { id: 'vehicle-21g-1', routeId: 'route-21g', number: 'TN 01 AB 2101', capacity: 65, driver: 'Karthik R', lat: 12.9516, lng: 80.1462 },
    { id: 'vehicle-21g-2', routeId: 'route-21g', number: 'TN 01 AB 2102', capacity: 65, driver: 'Suresh M', lat: 13.0067, lng: 80.2207 },
    { id: 'vehicle-21g-3', routeId: 'route-21g', number: 'TN 01 AB 2103', capacity: 55, driver: 'Vijay K', lat: 13.0202, lng: 80.2222 },
    // Route 18A - 3 vehicles
    { id: 'vehicle-18a-1', routeId: 'route-18a', number: 'TN 01 CD 1801', capacity: 60, driver: 'Anand S', lat: 12.9165, lng: 80.1928 },
    { id: 'vehicle-18a-2', routeId: 'route-18a', number: 'TN 01 CD 1802', capacity: 60, driver: 'Mohan P', lat: 13.0012, lng: 80.2565 },
    // Route 5C - 3 vehicles
    { id: 'vehicle-5c-1', routeId: 'route-5c', number: 'TN 01 EF 0501', capacity: 50, driver: 'Ravi B', lat: 12.9775, lng: 80.2209 },
    { id: 'vehicle-5c-2', routeId: 'route-5c', number: 'TN 01 EF 0502', capacity: 50, driver: 'Kumar V', lat: 13.0105, lng: 80.2453 },
    // Route 27B - 3 vehicles
    { id: 'vehicle-27b-1', routeId: 'route-27b', number: 'TN 01 GH 2701', capacity: 70, driver: 'Selvam T', lat: 13.0878, lng: 80.2101 },
    { id: 'vehicle-27b-2', routeId: 'route-27b', number: 'TN 01 GH 2702', capacity: 70, driver: 'Balan N', lat: 13.0418, lng: 80.2341 },
    // Route 45X - 3 vehicles
    { id: 'vehicle-45x-1', routeId: 'route-45x', number: 'TN 01 IJ 4501', capacity: 55, driver: 'Dinesh L', lat: 12.9010, lng: 80.2279 },
    { id: 'vehicle-45x-2', routeId: 'route-45x', number: 'TN 01 IJ 4502', capacity: 55, driver: 'Prasad G', lat: 13.0339, lng: 80.2676 },
    { id: 'vehicle-45x-3', routeId: 'route-45x', number: 'TN 01 IJ 4503', capacity: 55, driver: 'Ramesh C', lat: 13.0577, lng: 80.2790 },
  ];

  for (const v of vehicleData) {
    await prisma.vehicle.upsert({
      where: { id: v.id },
      update: {},
      create: {
        id: v.id,
        routeId: v.routeId,
        vehicleNumber: v.number,
        capacity: v.capacity,
        driverName: v.driver,
        status: VehicleStatus.ACTIVE,
      },
    });

    // Clear old time-series data to ensure idempotency
    await prisma.vehicleLocation.deleteMany({ where: { vehicleId: v.id } });
    await prisma.deviceObservation.deleteMany({ where: { vehicleId: v.id } });
    await prisma.occupancyPrediction.deleteMany({ where: { vehicleId: v.id } });
    await prisma.crowdPrediction.deleteMany({ where: { vehicleId: v.id } });

    // Create initial location
    await prisma.vehicleLocation.create({
      data: {
        vehicleId: v.id,
        latitude: v.lat,
        longitude: v.lng,
        speed: Math.floor(Math.random() * 40) + 10,
        heading: Math.floor(Math.random() * 360),
      },
    });

    // Create initial device observation
    const deviceCount = Math.floor(Math.random() * 50) + 10;
    await prisma.deviceObservation.create({
      data: {
        vehicleId: v.id,
        anonymousDeviceCount: deviceCount,
        boardingCount: Math.floor(Math.random() * 10),
        exitCount: Math.floor(Math.random() * 8),
        source: 'SEED',
      },
    });

    // Create initial occupancy prediction
    const occupancy = Math.floor(Math.random() * 80) + 10;
    const estimatedPassengers = Math.floor((v.capacity * occupancy) / 100);
    const crowdLevel = occupancy < 50 ? CrowdLevel.LOW : occupancy < 70 ? CrowdLevel.MODERATE : occupancy < 90 ? CrowdLevel.CROWDED : CrowdLevel.OVERLOADED;
    const seatProbability = Math.max(0, (100 - occupancy - 10) / 100);

    await prisma.occupancyPrediction.create({
      data: {
        vehicleId: v.id,
        estimatedPassengers,
        occupancyPercentage: occupancy,
        confidence: 0.82 + Math.random() * 0.15,
        crowdLevel,
        seatProbability,
      },
    });

    // Create crowd predictions (5, 10, 15 min)
    for (const horizon of [5, 10, 15]) {
      const trend = Math.floor(Math.random() * 20) - 5;
      const predicted = Math.min(100, Math.max(0, occupancy + trend * (horizon / 5)));
      const predCrowdLevel = predicted < 50 ? CrowdLevel.LOW : predicted < 70 ? CrowdLevel.MODERATE : predicted < 90 ? CrowdLevel.CROWDED : CrowdLevel.OVERLOADED;
      await prisma.crowdPrediction.create({
        data: {
          vehicleId: v.id,
          horizonMinutes: horizon,
          predictedOccupancy: predicted,
          confidence: 0.75 + Math.random() * 0.2,
          crowdLevel: predCrowdLevel,
        },
      });
    }
  }

  console.log('✅ Vehicles, locations, device observations, and predictions created');

  // ─── ALERTS ──────────────────────────────────────────────────────────────────
  await prisma.alert.deleteMany({ where: { vehicleId: { in: ['vehicle-21g-1', 'vehicle-45x-1'] } } });

  await prisma.alert.create({
    data: {
      vehicleId: 'vehicle-21g-1',
      type: AlertType.OVERCROWDING,
      severity: AlertSeverity.HIGH,
      message: 'Vehicle TN 01 AB 2101 predicted to reach 94% occupancy in 10 minutes',
      metadata: JSON.stringify({ currentOccupancy: 72, predicted10min: 94, route: '21G' }),
    },
  });

  await prisma.alert.create({
    data: {
      vehicleId: 'vehicle-45x-1',
      type: AlertType.CROWD_SURGE,
      severity: AlertSeverity.MEDIUM,
      message: 'Crowd surge detected on Route 45X at Sholinganallur',
      metadata: JSON.stringify({ currentOccupancy: 68, route: '45X' }),
    },
  });

  console.log('✅ Alerts created');

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
  await prisma.notification.deleteMany({ where: { userId: { in: [passenger.id, operator.id] } } });

  await prisma.notification.createMany({
    data: [
      {
        userId: passenger.id,
        title: 'Welcome to Yatra IQ!',
        message: 'Search for your destination to get AI-powered crowd predictions and smart route recommendations.',
        type: 'INFO',
      },
      {
        userId: passenger.id,
        title: 'Route 21G is getting crowded',
        message: 'AI predicts 94% occupancy on 21G in 10 minutes. Consider taking 18A for a comfortable journey.',
        type: 'ALERT',
      },
      {
        userId: operator.id,
        title: 'Overcrowding Alert — 21G',
        message: 'Vehicle TN 01 AB 2101 predicted to exceed capacity. Consider deploying additional vehicle.',
        type: 'CRITICAL',
      },
    ],
  });

  console.log('✅ Notifications created');

  // ─── SYSTEM CONFIG ───────────────────────────────────────────────────────────
  await prisma.systemConfig.upsert({
    where: { key: 'demo_mode' },
    update: {},
    create: { key: 'demo_mode', value: 'false' },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'ai_confidence_threshold' },
    update: {},
    create: { key: 'ai_confidence_threshold', value: '0.75' },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'crowd_surge_threshold' },
    update: {},
    create: { key: 'crowd_surge_threshold', value: '85' },
  });

  console.log('✅ System config created');
  console.log('\n🎉 Seeding complete! Demo credentials:');
  console.log('   passenger@crowdsense.demo / Demo@2026');
  console.log('   operator@crowdsense.demo  / Demo@2026');
  console.log('   admin@crowdsense.demo     / Demo@2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
