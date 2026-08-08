import { Radio, ShieldCheck, Cpu, Users, TrendingUp } from 'lucide-react';

interface DeviceSenseVisualProps {
  deviceCount: number;
  estimatedPassengers: number;
  occupancyPercentage: number;
  capacity: number;
  confidence: number;
}

export default function DeviceSenseVisual({
  deviceCount,
  estimatedPassengers,
  occupancyPercentage,
  capacity,
  confidence,
}: DeviceSenseVisualProps) {
  return (
    <div className="glass-card p-6 border-brand-500/20 relative overflow-hidden">
      {/* Privacy Badge */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-brand-400 animate-pulse" />
          <h3 className="font-bold text-white text-base">DeviceSense™ Pipeline</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Privacy Protected — Aggregated Telemetry Only
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Step 1: Anonymous Signals */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-brand-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 text-brand-400">
            <Radio className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-white">{deviceCount}</div>
          <div className="text-xs text-slate-400 mt-0.5">Anonymous Devices</div>
          <div className="text-[10px] text-slate-500 mt-1">Presence signals</div>
        </div>

        <div className="hidden md:flex items-center justify-center text-slate-600 font-bold">→</div>

        {/* Step 2: AI Calibration */}
        <div className="bg-slate-800/80 border border-brand-500/40 rounded-xl p-4 text-center relative glow-brand">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 text-indigo-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-lg font-bold text-indigo-300">AI Calibration</div>
          <div className="text-xs text-slate-400 mt-0.5">Confidence: {Math.round(confidence * 100)}%</div>
          <div className="text-[10px] text-brand-400 mt-1">Multi-signal ratio</div>
        </div>

        <div className="hidden md:flex items-center justify-center text-slate-600 font-bold">→</div>

        {/* Step 3: Estimated Passengers & Occupancy */}
        <div className="bg-slate-800/80 border border-emerald-500/40 rounded-xl p-4 text-center">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto mb-2 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{estimatedPassengers}</div>
          <div className="text-xs text-slate-400 mt-0.5">Est. Passengers ({occupancyPercentage}%)</div>
          <div className="text-[10px] text-slate-500 mt-1">Cap: {capacity} seats</div>
        </div>
      </div>

      {/* Explicit Privacy Notice */}
      <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>No personal tracking:</strong> No phone numbers, MAC addresses, device IDs, or personal identity are collected or stored. Telemetry is purely numeric device presence.
        </span>
      </div>
    </div>
  );
}
