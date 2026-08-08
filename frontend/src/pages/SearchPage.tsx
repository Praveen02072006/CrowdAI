import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Bus, ChevronRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import api from '../lib/api';

export default function SearchPage() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [query, setQuery] = useState('');

  const { data: routesData, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: () => api.get('/routes').then(r => r.data.data),
  });

  const routes = routesData || [];

  const filteredRoutes = routes.filter((r: { name: string; source: string; destination: string }) => {
    const q = query.toLowerCase();
    const s = source.toLowerCase();
    const d = destination.toLowerCase();
    const matchesQuery = !query || r.name.toLowerCase().includes(q) || r.source.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q);
    const matchesSource = !source || r.source.toLowerCase().includes(s) || r.stops?.some((st: { name: string }) => st.name.toLowerCase().includes(s));
    const matchesDest = !destination || r.destination.toLowerCase().includes(d) || r.stops?.some((st: { name: string }) => st.name.toLowerCase().includes(d));
    return matchesQuery && matchesSource && matchesDest;
  });

  return (
    <AppLayout title="Search Routes">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Find Your Route</h1>
          <p className="text-sm text-slate-400">Search by route name, origin, or destination stop.</p>
        </div>

        {/* Search Controls */}
        <div className="glass-card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">FROM</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-source"
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="e.g. Tambaram, Chrompet..."
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">TO</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-destination"
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Chennai Central, Egmore..."
                  className="input-field pl-9"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">ROUTE CODE OR KEYWORD</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-query"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. 21G, 18A, Velachery..."
                className="input-field pl-9"
              />
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">
              Matching Routes ({filteredRoutes.length})
            </h2>
            <Link to="/recommendations" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
              View AI SmartRoute Recommendations <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-5 h-24 animate-pulse bg-slate-900/40" />
              ))}
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
              <Bus className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p className="font-semibold text-slate-400">No routes match your search criteria.</p>
              <p className="text-xs mt-1">Try clearing filters or searching for "21G" or "18A".</p>
            </div>
          ) : (
            filteredRoutes.map((route: {
              id: string;
              name: string;
              source: string;
              destination: string;
              color: string;
              stops: Array<{ name: string }>;
              vehicles: Array<{
                id: string;
                vehicleNumber: string;
                occupancyPredictions?: Array<{ occupancyPercentage: number; crowdLevel: string }>;
              }>;
            }) => (
              <div key={route.id} className="glass-card p-5 hover:border-slate-600/60 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md" style={{ backgroundColor: route.color || '#3B82F6' }}>
                      {route.name}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{route.name}</h3>
                      <p className="text-xs text-slate-400">{route.source} ➔ {route.destination}</p>
                    </div>
                  </div>
                  <Link to={`/route/${route.id}`} className="btn-secondary text-xs py-2 px-3 self-start sm:self-center flex items-center gap-1">
                    Route Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Active Vehicles on this Route */}
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-400 mb-3">ACTIVE VEHICLES ON ROUTE ({route.vehicles?.length || 0})</div>
                  {route.vehicles?.length === 0 ? (
                    <p className="text-xs text-slate-500">No vehicles active right now.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {route.vehicles.map(v => {
                        const occ = v.occupancyPredictions?.[0];
                        const pct = occ?.occupancyPercentage || 0;
                        return (
                          <Link key={v.id} to={`/vehicle/${v.id}`} className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between transition-colors">
                            <div>
                              <div className="font-semibold text-xs text-white">{v.vehicleNumber}</div>
                              <div className="text-[10px] text-slate-400">Tap for live predictions</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CrowdBadge level={occ?.crowdLevel || 'MODERATE'} size="sm" />
                              <span className="text-xs font-bold text-slate-200">{Math.round(pct)}%</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
