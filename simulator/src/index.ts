import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3001';

console.log('📡 CrowdSense AI Device Telemetry Simulator Engine starting...');

async function runSimulationCycle() {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/simulator/vehicles`);
    const vehicles = res.data?.data || [];

    if (vehicles.length === 0) return;

    // Pick random vehicle and apply realistic signal jitter (+/- 2 devices)
    const target = vehicles[Math.floor(Math.random() * vehicles.length)];
    const currentDevices = target.deviceObservations?.[0]?.anonymousDeviceCount || 30;
    const delta = Math.floor(Math.random() * 5) - 2;
    const newCount = Math.max(5, Math.min(target.capacity + 15, currentDevices + delta));

    await axios.post(`${BACKEND_URL}/api/simulator/device`, {
      vehicleId: target.id,
      deviceCount: newCount,
      boardingRate: Math.floor(Math.random() * 5) + 1,
      exitRate: Math.floor(Math.random() * 4) + 1,
    });

    console.log(`[SIMULATOR] Sent telemetry for ${target.vehicleNumber}: ${newCount} devices`);
  } catch (err: unknown) {
    const msg = (err as Error).message;
    console.log(`[SIMULATOR] Waiting for backend API connection... (${msg})`);
  }
}

// Run simulation cycle every 8 seconds
setInterval(runSimulationCycle, 8000);
setTimeout(runSimulationCycle, 3000);
