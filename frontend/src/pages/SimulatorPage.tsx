import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radio, Play, Pause, RotateCcw, Zap, Sliders, Activity, Bus, ShieldCheck } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import OccupancyBar from '../components/OccupancyBar';
import CrowdBadge from '../components/CrowdBadge';
import api from '../lib/api';
import { useSocket } from '../hooks/useSocket';

export default function SimulatorPage() {
  const { occupancyUpdates, deviceUpdates, demoPhase: liveDemoPhase } = useSocket();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('vehicle-21g-1');
  const [deviceCount, setDeviceCount] = useState<number>(30);
  const [boardingRate, setBoardingRate] = useState<number>(3);
  const [exitRate, setExitRate] = useState<number>(2);
  const [isSending, setIsSending] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [demoInterval, setDemoInterval] = useState<NodeJS.Timeout | null>(null);

  const { data: vehiclesData, refetch } = useQuery({
    queryKey: ['simulator-vehicles'],
    queryFn: () => api.get('/simulator/vehicles').then(r => r.data.data),
    refetchInterval: 10000,
  });

  const vehicles = vehiclesData || [];
  const selectedVehicle = vehicles.find((v: { id: string }) => v.id === selectedVehicleId) || vehicles[0];

  // Update slider if live socket update comes in for selected vehicle
  useEffect(() => {
    if (selectedVehicleId && deviceUpdates[selectedVehicleId]) {
      setDeviceCount(deviceUpdates[selectedVehicleId].anonymousDeviceCount);
    }
  }, [selectedVehicleId, deviceUpdates]);

  // Send single device telemetry update
  const handleSendTelemetry = async (newCount?: number) => {
    setIsSending(true);
    const countToSend = newCount !== undefined ? newCount : deviceCount;
    try {
      await api.post('/simulator/device', {
        vehicleId: selectedVehicleId,
        deviceCount: countToSend,
        boardingRate,
        exitRate,
      });
      refetch();
    } catch (err) {
      console.error('Telemetry send failed', err);
    } finally {
      setIsSending(false);
    }
  };

  // Apply scenario preset
  const handlePreset = async (scenario: 'NORMAL' | 'CROWD_SURGE' | 'PEAK_HOUR' | 'OVERLOAD' | 'RESET') => {
    setIsSending(true);
    try {
      await api.post('/simulator/crowd', {
        vehicleId: selectedVehicleId,
        scenario,
      });
      refetch();
    } catch (err) {
      console.error('Scenario preset failed', err);
    } finally {
      setIsSending(false);
    }
  };

  // Hackathon Demo Mode 8-phase automated runner
  const runNextDemoPhase = async (phaseNum: number) => {
    try {
      await api.post('/simulator/demo', { phase: phaseNum });
      setCurrentPhase(phaseNum);
    } catch (err) {
      console.error('Demo phase failed', err);
    }
  };

  const toggleDemoMode = () => {
    if (demoRunning) {
      if (demoInterval) clearInterval(demoInterval);
      setDemoRunning(false);
    } else {
      setDemoRunning(true);
      let nextP = currentPhase;
      runNextDemoPhase(nextP);
      const timer = setInterval(() => {
        nextP = nextP >= 8 ? 1 : nextP + 1;
        runNextDemoPhase(nextP);
      }, 4000); // Advance every 4 seconds
      setDemoInterval(timer);
    }
  };

  const resetDemoMode = async () => {
    if (demoInterval) clearInterval(demoInterval);
    setDemoRunning(false);
    setCurrentPhase(1);
    await runNextDemoPhase(1);
  };

  const currentOcc = occupancyUpdates[selectedVehicleId]?.occupancyPercentage ?? selectedVehicle?.occupancyPredictions?.[0]?.occupancyPercentage ?? 48;
  const currentCrowd = occupancyUpdates[selectedVehicleId]?.crowdLevel ?? selectedVehicle?.occupancyPredictions?.[0]?.crowdLevel ?? 'LOW';

  return (
    <AppLayout title="Device Telemetry Simulator">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="glass-card p-6 border-amber-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                <h1 className="text-xl font-bold text-white">Device Telemetry Simulator</h1>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                  Hackathon Prototype Infrastructure
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates operator-controlled sensing telemetry. Adjusting counts updates AI predictions & WebSocket feeds live.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
              <ShieldCheck className="w-4 h-4" />
              Simulated Telemetry — Privacy Safeguards Active
            </div>
          </div>
        </div>

        {/* ─── HACKATHON DEMO MODE CARD (1-CLICK PRESENTATION) ─── */}
        <div className="glass-card p-6 border-brand-500/40 relative overflow-hidden glow-brand">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-400 fill-brand-400 animate-bounce-gentle" />
                <h2 className="text-lg font-black text-white">HACKATHON DEMO MODE</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated 8-phase live presentation sequence demonstrating crowd surge, AI alert, operator deployment, & SmartRoute updates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDemoMode}
                className={`btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${
                  demoRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500'
                }`}
              >
                {demoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {demoRunning ? 'PAUSE DEMO' : 'START DEMO MODE'}
              </button>
              <button
                onClick={resetDemoMode}
                className="btn-secondary text-xs py-2.5 px-3 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESET
              </button>
            </div>
          </div>

          {/* Phase Progress Bar */}
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
              <div
                key={p}
                onClick={() => runNextDemoPhase(p)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  p === currentPhase ? 'bg-brand-400 ring-2 ring-brand-400/50' :
                  p < currentPhase ? 'bg-brand-600' : 'bg-slate-800'
                }`}
                title={`Phase ${p}`}
              />
            ))}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-brand-400 font-bold">Phase {currentPhase} of 8:</span>{' '}
              <span className="text-slate-200 font-medium">
                {currentPhase === 1 ? 'Phase 1: Normal baseline (48% occupancy)' :
                 currentPhase === 2 ? 'Phase 2: Rising passenger count (65% occupancy)' :
                 currentPhase === 3 ? 'Phase 3: Crowd surge detected (82% occupancy)' :
                 currentPhase === 4 ? 'Phase 4: AI predicts 92%+ overcrowding in 10 minutes' :
                 currentPhase === 5 ? 'Phase 5: Critical overcrowding alert generated' :
                 currentPhase === 6 ? 'Phase 6: Operator deploys additional fleet capacity' :
                 currentPhase === 7 ? 'Phase 7: Passengers redistributed (71% occupancy)' :
                 'Phase 8: System stabilizes & SmartRoute updates recommendation'}
              </span>
            </div>
            {demoRunning && (
              <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0 animate-live">
                ● RUNNING
              </span>
            )}
          </div>
        </div>

        {/* ─── MANUAL SIMULATOR CONTROLS ─── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-2 glass-card p-6 space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" /> Manual Telemetry Controls
            </h3>

            {/* Vehicle Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">TARGET VEHICLE</label>
              <select
                value={selectedVehicleId}
                onChange={e => setSelectedVehicleId(e.target.value)}
                className="input-field cursor-pointer"
              >
                {vehicles.map((v: { id: string; vehicleNumber: string; route?: { name: string } }) => (
                  <option key={v.id} value={v.id}>
                    Vehicle {v.vehicleNumber} (Route {v.route?.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Device Count Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">ANONYMOUS DEVICE COUNT</span>
                <span className="text-brand-400 font-black text-sm">{deviceCount} signals</span>
              </div>
              <input
                type="range"
                min="0"
                max={(selectedVehicle?.capacity || 60) + 20}
                value={deviceCount}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setDeviceCount(val);
                  handleSendTelemetry(val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 (Empty)</span>
                <span>Cap: {selectedVehicle?.capacity || 60}</span>
                <span>Overload (80+)</span>
              </div>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">BOARDING RATE / MIN</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={boardingRate}
                  onChange={e => setBoardingRate(parseInt(e.target.value, 10) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">EXIT RATE / MIN</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={exitRate}
                  onChange={e => setExitRate(parseInt(e.target.value, 10) || 0)}
                  className="input-field"
                />
              </div>
            </div>

            {/* Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">PRESET SCENARIOS</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handlePreset('NORMAL')} className="btn-secondary text-xs py-2 px-3">NORMAL</button>
                <button onClick={() => handlePreset('CROWD_SURGE')} className="bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 text-xs font-semibold px-3 py-2 rounded-xl transition-all">CROWD SURGE</button>
                <button onClick={() => handlePreset('PEAK_HOUR')} className="bg-orange-600/20 text-orange-300 border border-orange-500/30 hover:bg-orange-600/30 text-xs font-semibold px-3 py-2 rounded-xl transition-all">PEAK HOUR</button>
                <button onClick={() => handlePreset('OVERLOAD')} className="bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 text-xs font-semibold px-3 py-2 rounded-xl transition-all">OVERLOAD</button>
                <button onClick={() => handlePreset('RESET')} className="btn-secondary text-xs py-2 px-3">RESET</button>
              </div>
            </div>
          </div>

          {/* Real-time State Output */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Live AI State
            </h3>

            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Target Vehicle</span>
                <span className="font-bold text-white">{selectedVehicle?.vehicleNumber}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Occupancy</span>
                <CrowdBadge level={currentCrowd} size="sm" />
              </div>

              <OccupancyBar percentage={currentOcc} size="md" />

              <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Boarding Rate</span>
                  <div className="font-bold text-emerald-400">+{boardingRate}/min</div>
                </div>
                <div>
                  <span className="text-slate-400">Exit Rate</span>
                  <div className="font-bold text-red-400">-{exitRate}/min</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
              💡 <strong>Judge note:</strong> Changing values triggers backend AI estimation, updates PostgreSQL DB, and broadcasts WebSocket events to both Passenger and Operator dashboards instantly.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
