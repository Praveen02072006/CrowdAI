import { useParams, Link } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bus, MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import LiveMap from '../components/LiveMap';
import api from '../lib/api';

export default function RouteDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: route, isLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => api.get(`/routes/${id}`).then(r => r.data.data),
    enabled: !!id,
  });

  if (isLoading || !route) {
    return (
      <AppLayout title="Route Details">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="h-64 bg-slate-800 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Route ${route.name}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </Link>

        {/* Route Summary */}
        <div className="glass-card p-6 border-brand-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg" style={{ backgroundColor: route.color || '#3B82F6' }}>
              {route.name}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Route {route.name}</h1>
              <p className="text-sm text-slate-400">{route.source} ➔ {route.destination}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                <span>{route.stops?.length || 0} Total Stops</span>
                <span>•</span>
                <span>{route.vehicles?.length || 0} Vehicles Operating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Map */}
        <div className="glass-card p-4">
          <h3 className="font-bold text-white text-sm mb-3">Live Route Map</h3>
          <LiveMap vehicles={route.vehicles || []} height="320px" />
        </div>

        {/* Active Vehicles */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white text-base mb-4">Vehicles on Route {route.name}</h3>
          {route.vehicles?.length === 0 ? (
            <p className="text-sm text-slate-500">No vehicles active on this route right now.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {route.vehicles?.map((v: {
                id: string;
                vehicleNumber: string;
                capacity: number;
                occupancyPredictions?: Array<{ occupancyPercentage: number; crowdLevel: string }>;
              }) => {
                const occ = v.occupancyPredictions?.[0];
                const pct = occ?.occupancyPercentage || 0;
                return (
                  <Link key={v.id} to={`/vehicle/${v.id}`} className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-4 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{v.vehicleNumber}</span>
                      <CrowdBadge level={occ?.crowdLevel || 'MODERATE'} size="sm" />
                    </div>
                    <OccupancyBar percentage={pct} size="sm" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Route Stops Sequence */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white text-base mb-4">Complete Stop Sequence</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {route.stops?.map((s: { id: string; name: string; sequence: number }) => (
              <div key={s.id} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  {s.sequence}
                </div>
                <div className="font-medium text-sm text-slate-200">{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
