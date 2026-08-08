import { useParams, Link } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bus, Clock, MapPin, Shield, TrendingUp, AlertTriangle, ArrowLeft, Radio } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import DeviceSenseVisual from '../components/DeviceSenseVisual';
import LiveMap from '../components/LiveMap';
import api from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { getCrowdColor } from '../lib/utils';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { occupancyUpdates, vehicleLocations } = useSocket();

  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => api.get(`/vehicles/${id}`).then(r => r.data.data),
    enabled: !!id,
    refetchInterval: 15000,
  });

  const { data: predictionsData } = useQuery({
    queryKey: ['vehicle-predictions', id],
    queryFn: () => api.get(`/vehicles/${id}/predictions`).then(r => r.data.data),
    enabled: !!id,
    refetchInterval: 15000,
  });

  if (isLoading || !vehicleData) {
    return (
      <AppLayout title="Vehicle Details">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
          <div className="h-40 bg-slate-800 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  // Socket overrides
  const liveOcc = occupancyUpdates[id || ''];
  const liveLoc = vehicleLocations[id || ''];

  const vehicle = {
    ...vehicleData,
    locations: liveLoc ? [{ latitude: liveLoc.latitude, longitude: liveLoc.longitude, speed: liveLoc.speed }] : vehicleData.locations,
  };

  const occupancy = liveOcc?.occupancyPercentage ?? vehicle.occupancyPredictions?.[0]?.occupancyPercentage ?? 50;
  const estimatedPassengers = liveOcc?.estimatedPassengers ?? vehicle.occupancyPredictions?.[0]?.estimatedPassengers ?? Math.round((occupancy / 100) * vehicle.capacity);
  const crowdLevel = liveOcc?.crowdLevel ?? vehicle.occupancyPredictions?.[0]?.crowdLevel ?? 'MODERATE';
  const seatProb = liveOcc?.seatProbability ?? vehicle.occupancyPredictions?.[0]?.seatProbability ?? 0.5;
  const confidence = liveOcc?.confidence ?? vehicle.occupancyPredictions?.[0]?.confidence ?? 0.82;
  const deviceObs = vehicle.deviceObservations?.[0]?.anonymousDeviceCount ?? Math.round(estimatedPassengers * 0.9);

  // Predictions Chart Data
  const crowdPreds = liveOcc?.crowdPredictions ?? vehicle.crowdPredictions ?? [];

  const chartData = [
    { name: 'Current', occupancy: Math.round(occupancy) },
    { name: '+5m', occupancy: Math.round(crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 5)?.predictedOccupancy || crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 5)?.predicted || occupancy * 1.05) },
    { name: '+10m', occupancy: Math.round(crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 10)?.predictedOccupancy || crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 10)?.predicted || occupancy * 1.12) },
    { name: '+15m', occupancy: Math.round(crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 15)?.predictedOccupancy || crowdPreds.find((p: { horizonMinutes?: number; horizon?: number }) => (p.horizonMinutes || p.horizon) === 15)?.predicted || occupancy * 1.18) },
  ];

  return (
    <AppLayout title={`Vehicle ${vehicle.vehicleNumber}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Vehicle Header Card */}
        <div className="glass-card p-6 border-brand-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  {vehicle.vehicleNumber}
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                    ACTIVE
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Route {vehicle.route?.name}: {vehicle.route?.source} ➔ {vehicle.route?.destination}
                </p>
              </div>
            </div>
            <CrowdBadge level={crowdLevel} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Estimated Occupancy</div>
              <div className="text-lg font-bold text-white">{Math.round(occupancy)}%</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Passengers</div>
              <div className="text-lg font-bold text-emerald-400">{estimatedPassengers} / {vehicle.capacity}</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">Seat Probability</div>
              <div className="text-lg font-bold text-amber-400">{Math.round(seatProb * 100)}%</div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400">AI Confidence</div>
              <div className="text-lg font-bold text-indigo-400">{Math.round(confidence * 100)}%</div>
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h3 className="font-bold text-white text-base">CrowdPredict™ Horizon</h3>
            </div>
            <span className="text-xs text-slate-500">AI 15-Minute Forecast</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickFormatter={v => `${v}%`} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: number) => [`${value}%`, 'Occupancy']}
                />
                <Area type="monotone" dataKey="occupancy" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOcc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DeviceSense Technical Visualization */}
        <DeviceSenseVisual
          deviceCount={deviceObs}
          estimatedPassengers={estimatedPassengers}
          occupancyPercentage={Math.round(occupancy)}
          capacity={vehicle.capacity}
          confidence={confidence}
        />

        {/* Live Location Map */}
        <div className="glass-card p-4">
          <h3 className="font-bold text-white text-sm mb-3">Live Vehicle Location</h3>
          <LiveMap vehicles={[vehicle]} height="280px" selectedVehicleId={vehicle.id} />
        </div>

        {/* Route Stops Sequence */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white text-base mb-4">Route Stops Sequence</h3>
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-4">
            {vehicle.route?.stops?.map((stop: { id: string; name: string; sequence: number }) => (
              <div key={stop.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-brand-500" />
                <div className="font-semibold text-sm text-slate-200">{stop.name}</div>
                <div className="text-xs text-slate-500">Stop #{stop.sequence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
