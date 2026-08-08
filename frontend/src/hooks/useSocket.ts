import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '../lib/socket';

interface VehicleLocation {
  vehicleId: string;
  vehicleNumber: string;
  routeName: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

interface OccupancyUpdate {
  vehicleId: string;
  vehicleNumber: string;
  routeName: string;
  occupancyPercentage: number;
  estimatedPassengers: number;
  capacity: number;
  crowdLevel: string;
  seatProbability: number;
  confidence: number;
  crowdPredictions: Array<{ horizon: number; predicted: number; crowdLevel: string }>;
  timestamp: Date;
  deploymentAction?: boolean;
}

interface AlertNew {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  routeName: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
}

interface DeviceUpdate {
  vehicleId: string;
  vehicleNumber: string;
  anonymousDeviceCount: number;
  boardingRate: number;
  exitRate: number;
  scenario?: string;
  source: string;
  timestamp: string;
}

interface DemoPhase {
  phase: number;
  label: string;
  vehicleId: string;
  vehicleNumber: string;
}

export function useSocket() {
  const [connected, setConnected] = useState(false);
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, VehicleLocation>>({});
  const [occupancyUpdates, setOccupancyUpdates] = useState<Record<string, OccupancyUpdate>>({});
  const [newAlert, setNewAlert] = useState<AlertNew | null>(null);
  const [deviceUpdates, setDeviceUpdates] = useState<Record<string, DeviceUpdate>>({});
  const [demoPhase, setDemoPhase] = useState<DemoPhase | null>(null);
  const [fleetUpdate, setFleetUpdate] = useState<unknown>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    setConnected(socket.connected);

    socket.on('vehicle:location', (data: VehicleLocation) => {
      setVehicleLocations(prev => ({ ...prev, [data.vehicleId]: data }));
    });

    socket.on('occupancy:update', (data: OccupancyUpdate) => {
      setOccupancyUpdates(prev => ({ ...prev, [data.vehicleId]: data }));
    });

    socket.on('alert:new', (data: AlertNew) => {
      setNewAlert(data);
    });

    socket.on('device:update', (data: DeviceUpdate) => {
      setDeviceUpdates(prev => ({ ...prev, [data.vehicleId]: data }));
    });

    socket.on('demo:phase', (data: DemoPhase) => {
      setDemoPhase(data);
    });

    socket.on('fleet:update', (data: unknown) => {
      setFleetUpdate(data);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('vehicle:location');
      socket.off('occupancy:update');
      socket.off('alert:new');
      socket.off('device:update');
      socket.off('demo:phase');
      socket.off('fleet:update');
    };
  }, []);

  return { connected, vehicleLocations, occupancyUpdates, newAlert, deviceUpdates, demoPhase, fleetUpdate };
}
