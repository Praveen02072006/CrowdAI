import { Link as RouterLink } from 'react-router-dom';
import { Cpu, EyeOff, Radio, TrendingUp, Shield, ArrowLeft } from 'lucide-react';

export default function TechnologyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <RouterLink to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </RouterLink>

        {/* Header */}
        <div className="glass-card p-8 border-brand-500/30 text-center">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">CrowdSense AI Architecture & Methodology</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Technical rationale behind our camera-free occupancy estimation and AI forecasting system.
          </p>
        </div>

        {/* Three Core Judge Questions */}
        <div className="space-y-6">
          {/* Question 1 */}
          <div className="glass-card p-6 border-red-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 font-bold text-sm">
                01
              </div>
              <h2 className="text-lg font-bold text-white">Why Not Cameras?</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Camera-based visual surveillance systems introduce significant drawbacks in public transit:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pl-4 list-disc">
              <li><strong>Privacy Violations:</strong> Passengers resist facial recording in public spaces.</li>
              <li><strong>Environmental Vulnerability:</strong> Poor lighting, glare, weather, and crowded blind spots degrade camera accuracy.</li>
              <li><strong>High Cost & Maintenance:</strong> Optical lenses require constant cleaning, calibration, and high bandwidth processing.</li>
            </ul>
          </div>

          {/* Question 2 */}
          <div className="glass-card p-6 border-brand-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold text-sm">
                02
              </div>
              <h2 className="text-lg font-bold text-white">Why Device Presence?</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Anonymous device presence telemetry offers a robust non-visual signal:
            </p>
            <ul className="space-y-2 text-xs text-slate-300 pl-4 list-disc">
              <li><strong>Privacy by Design:</strong> Processes purely numeric presence counts — no identity or media captured.</li>
              <li><strong>Zero Operational Dependence:</strong> Sensor hubs operate reliably regardless of lighting or visual obstruction.</li>
              <li><strong>Lower Hardware Burden:</strong> Lightweight sensor hardware with minimal power requirements.</li>
            </ul>
          </div>

          {/* Question 3 */}
          <div className="glass-card p-6 border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-bold text-sm">
                03
              </div>
              <h2 className="text-lg font-bold text-white">Why AI?</h2>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm font-semibold text-emerald-300">
              "Device count alone does not equal passenger count. CrowdSense learns the relationship between anonymous device observations and known occupancy patterns, then predicts future demand."
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Device counts fluctuate based on passengers carrying multiple devices, children without devices, or varying detection ranges. Our AI calibration model maps dynamic signal presence to actual passenger count with high precision.
            </p>
          </div>
        </div>

        {/* System Data Flow */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-white text-base">Complete Pipeline Flow</h3>
          <div className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-brand-300 leading-relaxed overflow-x-auto">
            Device Signal → Aggregation → Device-to-Passenger AI Estimation → Current Occupancy → Future Crowd Prediction → Travel Score → SmartRoute → Passenger UI
          </div>
        </div>
      </div>
    </div>
  );
}
