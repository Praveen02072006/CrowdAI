import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Bus, Clock, Users, Star, TrendingUp, Bell, ChevronRight, MapPin, Zap, Activity } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import LiveMap from '../components/LiveMap';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { getCrowdColor, getCrowdLabel, getCrowdFromOccupancy } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { vehicleLocations, occupancyUpdates, newAlert } = useSocket();
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const { data: vehiclesData, isLoading: vLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: recsData, isLoading: rLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then(r => r.data.data),
    refetchInterval: 30000,
  });

  // Merge real-time socket updates into vehicle data
  const vehicles = (vehiclesData || []).map((v: Record<string, unknown>) => {
    const update = occupancyUpdates[v.id as string];
    const locUpdate = vehicleLocations[v.id as string];
    if (update) {
      return {
        ...v,
        occupancyPredictions: [{ occupancyPercentage: update.occupancyPercentage, crowdLevel: update.crowdLevel, seatProbability: update.seatProbability, confidence: update.confidence, estimatedPassengers: update.estimatedPassengers }],
        locations: locUpdate ? [{ latitude: locUpdate.latitude, longitude: locUpdate.longitude }] : v.locations,
        _realtimeUpdate: true,
      };
    }
    return { ...v, locations: locUpdate ? [{ latitude: locUpdate.latitude, longitude: locUpdate.longitude }] : v.locations };
  });

  // Show alert banner
  useEffect(() => {
    if (newAlert) {
      setAlertBanner(newAlert.message);
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      const timer = setTimeout(() => setAlertBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [newAlert, qc]);

  const topRec = (recsData || [])[0];

  return (
    <AppLayout title="Dashboard">
      {/* Alert Banner */}
      {alertBanner && (
        <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 animate-slide-up">
          <Bell className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="flex-1">{alertBanner}</span>
          <button onClick={() => setAlertBanner(null)} className="text-red-400 hover:text-red-300 text-lg leading-none">×</button>
        </div>
      )}

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here's your real-time transit intelligence dashboard.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Vehicles', value: vehicles.length, icon: Bus, color: 'brand' },
          { label: 'Normal', value: vehicles.filter((v: { occupancyPredictions: Array<{ occupancyPercentage: number }> }) => (v.occupancyPredictions?.[0]?.occupancyPercentage || 0) < 70).length, icon: Activity, color: 'emerald' },
          { label: 'Crowded', value: vehicles.filter((v: { occupancyPredictions: Array<{ occupancyPercentage: number }> }) => (v.occupancyPredictions?.[0]?.occupancyPercentage || 0) >= 70 && (v.occupancyPredictions?.[0]?.occupancyPercentage || 0) < 90).length, icon: Users, color: 'amber' },
          { label: 'Very Crowded', value: vehicles.filter((v: { occupancyPredictions: Array<{ occupancyPercentage: number }> }) => (v.occupancyPredictions?.[0]?.occupancyPercentage || 0) >= 90).length, icon: TrendingUp, color: 'red' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center mb-1`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
            </div>
            <div className="text-2xl font-bold text-white">{vLoading ? '—' : stat.value}</div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden" style={{ height: '420px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold">Live Fleet Map</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-live">● LIVE</span>
              </div>
            </div>
            <LiveMap vehicles={vehicles} height="370px" />
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="space-y-4">
          {/* Top Recommendation */}
          <div className="glass-card p-5 border-brand-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-300">AI Recommendation</span>
              <Zap className="w-3 h-3 text-brand-400 ml-auto animate-bounce-gentle" />
            </div>
            {rLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-6 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-2 bg-slate-800 rounded" />
              </div>
            ) : topRec ? (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl font-black text-white">{topRec.route?.name}</div>
                    <div className="text-xs text-slate-400">{topRec.route?.source} → {topRec.route?.destination}</div>
                  </div>
                  <CrowdBadge level={topRec.crowdLevel} />
                </div>
                <OccupancyBar percentage={topRec.occupancyPercentage} />
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <div className="text-slate-400">ETA</div>
                    <div className="font-bold text-white">{topRec.waitingTime} min</div>
                  </div>
                  <div className="bg-slate-800/60 rounded-lg p-2">
                    <div className="text-slate-400">Seat</div>
                    <div className="font-bold text-emerald-400">{Math.round((topRec.seatProbability || 0) * 100)}%</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl text-xs text-slate-400 leading-relaxed">
                  {topRec.reason}
                </div>
                <Link to="/recommendations" className="mt-4 btn-primary w-full text-xs py-2 flex items-center justify-center gap-1">
                  View All Options <ChevronRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-400">No recommendation available.</p>
            )}
          </div>

          {/* Quick Search */}
          <Link to="/search" className="glass-card p-4 flex items-center gap-3 hover:border-slate-600/60 transition-colors group">
            <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Search Routes</div>
              <div className="text-xs text-slate-500">Find your destination</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">All Active Vehicles</h2>
          <span className="text-xs text-slate-500">Updates live via WebSocket</span>
        </div>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {vLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-3 animate-pulse">
                  <div className="h-5 bg-slate-800 rounded w-1/3" />
                  <div className="h-2 bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              ))
            : vehicles.map((v: Record<string, unknown>) => {
                const occ = (v.occupancyPredictions as Array<{ occupancyPercentage: number; crowdLevel: string; seatProbability: number }>)?.[0];
                const pct = occ?.occupancyPercentage || 0;
                const crowdLevel = occ?.crowdLevel || getCrowdFromOccupancy(pct);
                const route = v.route as { name: string; source: string; destination: string; color: string };
                return (
                  <Link key={v.id as string} to={`/vehicle/${v.id}`}
                    className="glass-card p-4 hover:border-slate-600/60 transition-all hover:scale-[1.01] group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route?.color || '#6366f1' }} />
                          <span className="text-sm font-bold text-white">{v.vehicleNumber as string}</span>
                          {(v as { _realtimeUpdate?: boolean })._realtimeUpdate && (
                            <span className="text-[10px] text-emerald-400 animate-live">● live</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Route {route?.name}</div>
                      </div>
                      <CrowdBadge level={crowdLevel} size="sm" />
                    </div>
                    <OccupancyBar percentage={pct} size="sm" />
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>Seat: {Math.round((occ?.seatProbability || 0) * 100)}%</span>
                      <span className="group-hover:text-brand-400 transition-colors">Details →</span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </AppLayout>
  );
}
