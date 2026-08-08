import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, Bus, CheckCircle2, MapPin, Zap, RefreshCw, ShieldAlert, ArrowUpRight } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import LiveMap from '../components/LiveMap';
import api from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { formatTime } from '../lib/utils';

export default function OperatorDashboard() {
  const qc = useQueryClient();
  const { newAlert, fleetUpdate } = useSocket();
  const [deployingRoute, setDeployingRoute] = useState<string | null>(null);

  const { data: dashData, isLoading, refetch } = useQuery({
    queryKey: ['operator-dashboard'],
    queryFn: () => api.get('/operator/dashboard').then(r => r.data.data),
    refetchInterval: 15000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['operator-alerts'],
    queryFn: () => api.get('/operator/alerts').then(r => r.data.data),
    refetchInterval: 15000,
  });

  // FleetAI Deploy Capacity Mutation
  const deployMutation = useMutation({
    mutationFn: (targetRouteId: string) => api.post('/operator/deploy', { targetRouteId, reason: 'Operator manual capacity deployment via FleetAI' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operator-dashboard'] });
      qc.invalidateQueries({ queryKey: ['operator-alerts'] });
      setDeployingRoute(null);
    },
  });

  // Alert resolve mutation
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => api.patch(`/operator/alerts/${alertId}`, { status: 'RESOLVED' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['operator-dashboard'] });
      qc.invalidateQueries({ queryKey: ['operator-alerts'] });
    },
  });

  const vehicles = dashData?.vehicles || [];
  const fleetStats = dashData?.fleetStats || { total: 0, normal: 0, moderate: 0, crowded: 0, overcapacity: 0 };
  const routeDemand = dashData?.routeDemand || [];
  const activeAlerts = alertsData?.filter((a: { status: string }) => a.status === 'ACTIVE') || [];

  return (
    <AppLayout title="Operator Fleet Control Center">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Summary Banner */}
        <div className="glass-card p-6 border-purple-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-purple-400" />
                <h1 className="text-xl font-bold text-white">FleetAI™ Control Center</h1>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Operator Operations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitor fleet utilization, receive real-time overcrowding alerts, and deploy capacity dynamically.
              </p>
            </div>
            <button onClick={() => refetch()} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-center">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Fleet
            </button>
          </div>
        </div>

        {/* Fleet Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="stat-card">
            <span className="text-xs text-slate-400">Total Fleet</span>
            <span className="text-2xl font-bold text-white">{fleetStats.total}</span>
          </div>
          <div className="stat-card">
            <span className="text-xs text-slate-400">Normal (&lt;70%)</span>
            <span className="text-2xl font-bold text-emerald-400">{fleetStats.normal}</span>
          </div>
          <div className="stat-card">
            <span className="text-xs text-slate-400">Moderate (70-84%)</span>
            <span className="text-2xl font-bold text-amber-400">{fleetStats.moderate}</span>
          </div>
          <div className="stat-card">
            <span className="text-xs text-slate-400">Crowded (85-94%)</span>
            <span className="text-2xl font-bold text-orange-400">{fleetStats.crowded}</span>
          </div>
          <div className="stat-card">
            <span className="text-xs text-slate-400">Overcapacity (95%+)</span>
            <span className="text-2xl font-bold text-red-400">{fleetStats.overcapacity}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Alerts Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold text-white text-base">Real-Time AI Alerts ({activeAlerts.length})</h3>
                </div>
                {activeAlerts.length > 0 && (
                  <span className="text-xs text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 font-semibold animate-pulse">
                    ● ACTION REQUIRED
                  </span>
                )}
              </div>

              {activeAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  All fleet operations running within normal capacity thresholds.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert: {
                    id: string;
                    message: string;
                    severity: string;
                    type: string;
                    createdAt: string;
                    vehicle?: { vehicleNumber: string; route?: { name: string } };
                    metadata?: { currentOccupancy?: number; predicted10min?: number; route?: string };
                  }) => (
                    <div key={alert.id} className="bg-slate-900/80 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                            {alert.type}
                          </span>
                          <span className="text-[11px] text-slate-400">{formatTime(alert.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">{alert.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            const rId = alert.metadata?.route ? `route-${alert.metadata.route.toLowerCase()}` : 'route-21g';
                            deployMutation.mutate(rId);
                          }}
                          disabled={deployMutation.isPending}
                          className="btn-primary text-xs py-2 px-3 bg-purple-600 hover:bg-purple-500 flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" /> Deploy Vehicle
                        </button>
                        <button
                          onClick={() => resolveAlertMutation.mutate(alert.id)}
                          className="btn-secondary text-xs py-2 px-3"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Fleet Map */}
            <div className="glass-card p-4">
              <h3 className="font-bold text-white text-sm mb-3">Fleet Spatial Overview</h3>
              <LiveMap vehicles={vehicles} height="340px" />
            </div>
          </div>

          {/* FleetAI Capacity Recommendations & Route Demand */}
          <div className="space-y-6">
            <div className="glass-card p-6 border-purple-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">FleetAI Optimization</h3>
              </div>

              <div className="space-y-4">
                {routeDemand.map((rd: { routeId: string; routeName: string; avgOccupancy: number; vehicleCount: number; color: string }) => (
                  <div key={rd.routeId} className="bg-slate-800/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rd.color }} />
                        Route {rd.routeName}
                      </div>
                      <span className="text-slate-400">{rd.vehicleCount} vehicles</span>
                    </div>

                    <OccupancyBar percentage={rd.avgOccupancy} size="sm" />

                    {rd.avgOccupancy >= 75 ? (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-amber-400 font-medium">⚠️ Demand Surge Predicted</span>
                        <button
                          onClick={() => deployMutation.mutate(rd.routeId)}
                          disabled={deployMutation.isPending}
                          className="text-[11px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          Deploy Extra <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-400">✓ Capacity Balanced</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
