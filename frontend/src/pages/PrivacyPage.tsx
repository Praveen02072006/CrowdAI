import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle, XCircle, Info } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Header */}
        <div className="glass-card p-8 border-emerald-500/30 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">CrowdSense AI Privacy Center</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Our privacy-by-design framework guarantees anonymous density estimation without surveillance.
          </p>
        </div>

        {/* Grid: Collected vs Not Collected */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* WHAT WE COLLECT */}
          <div className="glass-card p-6 border-emerald-500/20">
            <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> What We Collect
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Aggregated Telemetry:</strong> Count of anonymous signals detected inside vehicle bounds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Timestamps & Vehicle IDs:</strong> Required to map predictions to transit routes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Boarding/Exit Rates:</strong> Numeric counts of passenger turnover at stops.</span>
              </li>
            </ul>
          </div>

          {/* WHAT WE NEVER COLLECT */}
          <div className="glass-card p-6 border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> What We NEVER Collect
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>NO Names or Contacts:</strong> Zero identity tracking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>NO Phone Numbers / MAC Addresses:</strong> Telemetry is purely numeric signal counts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>NO Messages, Files, or Photos:</strong> Devices are never accessed or scanned for content.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Rationale */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Why Anonymous Signal Presence?</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Traditional crowd monitoring relies on facial recognition cameras or personal GPS app tracking — both of which raise severe privacy concerns. CrowdSense AI uses operator-controlled sensor hubs that count anonymous device presence without identifying individuals or capturing visual media.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500 leading-relaxed">
          <Info className="w-4 h-4 text-brand-400 inline mr-2" />
          <strong>Hackathon Disclaimer:</strong> Prototype telemetry is simulated for the Hack Fusion '26 demonstration. Real-world deployment would require appropriate operator-controlled sensing infrastructure, platform compatibility, privacy safeguards, and applicable permissions.
        </div>
      </div>
    </div>
  );
}
