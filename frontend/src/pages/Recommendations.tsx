import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, ShieldCheck, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import api from '../lib/api';
import { getScoreColor, getScoreBg } from '../lib/utils';

export default function Recommendations() {
  const { data: recsData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/recommendations').then(r => r.data.data),
    refetchInterval: 20000,
  });

  const recs = recsData || [];

  return (
    <AppLayout title="SmartRoute AI Recommendations">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="glass-card p-6 border-brand-500/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-brand-400 fill-brand-400" />
                <h1 className="text-xl font-bold text-white">SmartRoute™ Engine</h1>
                <span className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  AI Multi-Factor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                We calculate a weighted Travel Score based on wait time, crowd level, predicted crowd, seat probability, and travel time.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              Recalculate
            </button>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card p-6 h-40 animate-pulse bg-slate-900/40" />
              ))}
            </div>
          ) : recs.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
              <Star className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              <p className="font-semibold text-slate-400">No route recommendations available.</p>
            </div>
          ) : (
            recs.map((rec: {
              vehicleId: string;
              vehicleNumber: string;
              route: { name: string; source: string; destination: string; color: string };
              score: number;
              waitingTime: number;
              travelTime: number;
              occupancyPercentage: number;
              seatProbability: number;
              crowdLevel: string;
              reason: string;
              isAiRecommended: boolean;
            }, index: number) => {
              const scoreColor = getScoreColor(rec.score);
              const scoreBg = getScoreBg(rec.score);
              return (
                <div
                  key={rec.vehicleId}
                  className={`glass-card p-6 transition-all hover:border-slate-600/80 relative overflow-hidden ${
                    rec.isAiRecommended ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''
                  }`}
                >
                  {/* Top Badge for AI Choice */}
                  {rec.isAiRecommended && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl flex items-center gap-1 shadow-md">
                      <Zap className="w-3 h-3 fill-slate-950" /> ⭐ AI RECOMMENDED CHOICE
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    {/* Route Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-md" style={{ backgroundColor: rec.route?.color || '#3B82F6' }}>
                        {rec.route?.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">Route {rec.route?.name}</h3>
                          <span className="text-xs text-slate-400 font-mono">({rec.vehicleNumber})</span>
                        </div>
                        <p className="text-xs text-slate-400">{rec.route?.source} ➔ {rec.route?.destination}</p>
                      </div>
                    </div>

                    {/* Travel Score Badge */}
                    <div className={`px-4 py-2 rounded-xl border ${scoreBg} flex flex-col items-center min-w-[100px]`}>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Travel Score</span>
                      <span className={`text-2xl font-black ${scoreColor}`}>{rec.score}</span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                    <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400">Wait Time</span>
                      <div className="font-bold text-white text-sm">{rec.waitingTime} min</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400">Current Occupancy</span>
                      <div className="font-bold text-white text-sm">{Math.round(rec.occupancyPercentage)}%</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400">Seat Probability</span>
                      <div className="font-bold text-emerald-400 text-sm">{Math.round(rec.seatProbability * 100)}%</div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-slate-400">Status</span>
                      <div className="mt-0.5">
                        <CrowdBadge level={rec.crowdLevel} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* AI Reason Box */}
                  <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-200 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <span><strong>AI Reasoning:</strong> {rec.reason}</span>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link to={`/vehicle/${rec.vehicleId}`} className="btn-secondary text-xs py-2 px-4 flex items-center gap-1">
                      Vehicle & Prediction Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
