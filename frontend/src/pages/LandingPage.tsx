import { Link } from 'react-router-dom';
import {
  Bus, Zap, Shield, Map, TrendingUp, Users, ChevronRight,
  ArrowRight, Activity, Radio, Star, CheckCircle, AlertTriangle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Yatra IQ Logo" className="w-56 md:w-64 h-auto object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/technology" className="hover:text-white transition-colors">Technology</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[200px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 rounded-full px-4 py-2 text-sm text-brand-400 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Hack Fusion '26 — Demo Transport Network
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6 animate-slide-up">
            <span className="text-white">Know the Crowd</span>
            <br />
            <span className="text-gradient">Before You Board.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Predict passenger density, discover less-crowded journeys, and help transport operators respond
            before overcrowding happens — using anonymous device signals and AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/login" id="cta-try-demo"
              className="btn-primary flex items-center justify-center gap-2 text-base py-3.5 px-8 glow-brand">
              Try Live Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/technology" id="cta-technology"
              className="btn-secondary flex items-center justify-center gap-2 text-base py-3.5 px-8">
              Explore Technology
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Pipeline Visual */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="glass-card p-6 md:p-8">
            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-widest mb-8">
              The CrowdSense AI Pipeline
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              {[
                { icon: Radio, label: 'Anonymous Signals', color: 'text-slate-400', bg: 'bg-slate-800' },
                { arrow: true },
                { icon: Zap, label: 'AI Estimation', color: 'text-brand-400', bg: 'bg-brand-500/10' },
                { arrow: true },
                { icon: Activity, label: 'Crowd Prediction', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { arrow: true },
                { icon: Star, label: 'SmartRoute', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((item, i) => (
                item.arrow ? (
                  <ArrowRight key={i} className="w-5 h-5 text-slate-600 rotate-90 md:rotate-0" />
                ) : (
                  <div key={i} className={`flex items-center gap-2 px-4 py-3 rounded-xl ${item.bg} border border-white/5`}>
                    {item.icon && <item.icon className={`w-4 h-4 ${item.color}`} />}
                    <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">The Problem with Public Transport Today</h2>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Passengers board buses blindly — no information about crowd levels, no way to predict if a seat will be available. Operators can't pre-empt overcrowding. Everyone loses.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'No Crowd Visibility', desc: 'Passengers have no idea how crowded the next bus will be until they board.' },
              { icon: AlertTriangle, title: 'Reactive, Not Proactive', desc: 'Operators only learn about overcrowding after it becomes a problem.' },
              { icon: Map, title: 'Inefficient Routes', desc: 'Some buses are overloaded while nearby alternatives run empty.' },
            ].map(item => (
              <div key={item.title} className="glass-card p-6 text-left">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How CrowdSense Works</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A four-stage pipeline that converts anonymous device presence into actionable transport intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                num: '01',
                title: 'DeviceSense',
                subtitle: 'Camera-free anonymous detection',
                desc: 'Operator-controlled infrastructure detects the presence of anonymous device signals within vehicles. No identity, no personal data — only aggregated counts.',
                color: 'brand',
                icon: Radio,
              },
              {
                num: '02',
                title: 'CrowdPredict',
                subtitle: 'AI-powered future crowd estimation',
                desc: 'Our AI model (XGBoost / Random Forest) learns the relationship between anonymous device counts and occupancy patterns, then predicts future crowding at 5, 10, and 15-minute horizons.',
                color: 'amber',
                icon: TrendingUp,
              },
              {
                num: '03',
                title: 'SmartRoute',
                subtitle: 'Weighted travel recommendation',
                desc: 'A multi-factor Travel Score (wait time + crowd + seat probability + travel time) recommends the best vehicle — not just the fastest, but the most comfortable.',
                color: 'emerald',
                icon: Star,
              },
              {
                num: '04',
                title: 'FleetAI',
                subtitle: 'Operator capacity optimization',
                desc: 'When AI detects predicted overcrowding, operators receive actionable alerts and can deploy additional capacity — instantly updating passenger recommendations.',
                color: 'purple',
                icon: Activity,
              },
            ].map(item => (
              <div key={item.num} className="glass-card p-6 relative overflow-hidden group hover:border-slate-600/60 transition-colors">
                <div className="absolute top-4 right-4 text-6xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                  {item.num}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-${item.color}-500/10`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                </div>
                <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-3">{item.subtitle}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for Everyone</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-400">For Passengers</h3>
              {[
                'Real-time occupancy on every vehicle',
                'AI prediction: 5, 10, 15 minute forecast',
                'Seat probability estimation',
                'SmartRoute recommendation with reasoning',
                'Live vehicle tracking on map',
                'Overcrowding alerts and notifications',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-400">For Operators</h3>
              {[
                'Fleet overview with real-time crowd status',
                'AI overcrowding alerts before they happen',
                'Route demand comparison and analysis',
                'One-click capacity deployment',
                'Live passenger update after deployment',
                'Admin AI analytics and model metrics',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-12 text-center border-emerald-500/20">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Privacy by Design</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              CrowdSense AI never collects names, phone numbers, contacts, messages, or any personal identity.
              Only aggregated, anonymous device-presence counts are processed. Your identity is never involved.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {['No names', 'No phone numbers', 'No personal data'].map(item => (
                <div key={item} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl py-3 text-emerald-300 font-medium">
                  ✓ {item}
                </div>
              ))}
            </div>
            <Link to="/privacy" className="inline-flex items-center gap-2 mt-8 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium">
              Read our full privacy policy <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">See It Live</h2>
          <p className="text-slate-400 mb-8">
            Use the Device Simulator to watch the entire pipeline in action — from anonymous device count to AI prediction to SmartRoute recommendation changing in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary flex items-center justify-center gap-2 text-base py-3.5 px-8">
              Start Live Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/simulator" className="btn-secondary flex items-center justify-center gap-2 text-base py-3.5 px-8">
              <Radio className="w-4 h-4" />
              Device Simulator
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-6">
            Demo credentials: passenger@crowdsense.demo / Demo@2026
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-brand-500" />
            <span className="font-medium text-slate-300">CrowdSense AI</span>
            <span>— Hack Fusion '26</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/technology" className="hover:text-slate-300 transition-colors">Technology</Link>
            <Link to="/simulator" className="hover:text-slate-300 transition-colors">Simulator</Link>
          </div>
          <span className="text-[11px]">Demo Transport Network — Not a real service</span>
        </div>
      </footer>
    </div>
  );
}
