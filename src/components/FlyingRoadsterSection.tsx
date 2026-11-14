import React, { useState } from 'react';
import { 
  Gauge, 
  Zap, 
  Wind, 
  Shield, 
  Compass, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Activity,
  Layers
} from 'lucide-react';
import { FlyingCarSpecData, PageId } from '../types';

interface FlyingRoadsterSectionProps {
  specs: FlyingCarSpecData[];
  onOpenContentStudio: () => void;
  onPreOrderFlyingCar: () => void;
  onSelectPage?: (page: PageId) => void;
}

export const FlyingRoadsterSection: React.FC<FlyingRoadsterSectionProps> = ({
  specs,
  onOpenContentStudio,
  onPreOrderFlyingCar,
  onSelectPage,
}) => {
  const [thrusterActive, setThrusterActive] = useState<boolean>(false);
  const [selectedSpecId, setSelectedSpecId] = useState<string>(specs[0]?.id || 'spec-0-60');

  // Sort specs by order
  const orderedSpecs = [...specs].sort((a, b) => a.order - b.order);
  const selectedSpec = orderedSpecs.find((s) => s.id === selectedSpecId) || orderedSpecs[0];

  return (
    <section id="flying-roadster" className="py-16 md:py-24 bg-[#040a18] relative overflow-hidden border-t border-blue-900/60">
      {/* Background American Blue & Crimson Red ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[480px] h-[480px] bg-blue-600/12 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-[420px] h-[420px] bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Headline */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-300 font-semibold font-mono">
            <span className="w-6 h-[2px] bg-gradient-to-r from-blue-500 to-red-500" />
            <span>SpaceX Cold-Gas Thrusters · Sub-Orbital Flight Lab</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
            Tesla <span className="us-text-gradient">Flying Roadster</span> Flight Lab
          </h2>
          <p className="text-slate-300 text-base leading-relaxed font-light">
            Merging all-electric tri-motor powertrain with genuine SpaceX orbital cold-gas thruster canisters. The results redefine physics: sub-second 0–60 MPH acceleration, cornering g-forces exceeding racecars, and controlled short-hop levitation.
          </p>
        </div>

        {/* Ordered Engineering Breakdown: 4 Critical Systems */}
        <div className="mb-12">
          <div className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider mb-4">
            Subsystem Architecture In Order of Operation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#08142b]/90 border border-blue-800/60">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-blue-400 font-bold">STAGE 01</span>
                <span className="text-slate-400">Pneumatic Storage</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">COPV Nitrogen Matrix</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Carbon-overwrapped pressure vessels store ultra-dense gaseous nitrogen at 10,000 PSI behind rear seats.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08142b]/90 border border-red-900/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-red-400 font-bold">STAGE 02</span>
                <span className="text-slate-400">Nozzle Array</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">10 Vectoring Thrusters</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seamlessly integrated cold-gas thrusters deployed cleanly behind license plate and rocker panels.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08142b]/90 border border-blue-800/60">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-blue-400 font-bold">STAGE 03</span>
                <span className="text-slate-400">Launch Envelope</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Sub-Second 0–60</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Combined torque vectoring and cold rocket thrust catapult the vehicle from 0 to 60 MPH in under 1 second.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08142b]/90 border border-red-900/50">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-red-400 font-bold">STAGE 04</span>
                <span className="text-slate-400">Aerodynamics</span>
              </div>
              <h4 className="font-bold text-sm text-white mb-1">Hover Levitation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pulsed vectoring allows short-hop levitation above ground obstacles and cornering assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Thruster Flight Mode Simulator Bar */}
        <div className="mb-12 p-6 rounded-2xl bg-[#08142b]/95 border border-blue-500/40 shadow-xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-400 font-semibold font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Cold-Gas Vectoring Simulator</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                SpaceX Aerospace Package Command Console
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl font-light">
                Toggle the rocket thruster system to simulate live pressurization, thrust vector calculation, and dynamic hover telemetry.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-400 font-mono">Armed Status</div>
                <div className={`text-xs font-bold font-mono ${thrusterActive ? 'text-red-300' : 'text-blue-300'}`}>
                  {thrusterActive ? 'THRUSTERS ARMED (10 NOZZLES)' : 'GROUND CRUISE ACTIVE'}
                </div>
              </div>

              <button
                onClick={() => setThrusterActive(!thrusterActive)}
                className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md font-mono whitespace-nowrap shrink-0 ${
                  thrusterActive
                    ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-red-600/30 ring-2 ring-red-400/60'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40'
                }`}
              >
                <Wind className="w-4 h-4" />
                <span>{thrusterActive ? 'DISENGAGE FLIGHT MODE' : 'ENGAGE SPACEX FLIGHT MODE'}</span>
              </button>
            </div>
          </div>

          {/* Active Thruster Simulation Banner */}
          {thrusterActive && (
            <div className="mt-6 pt-5 border-t border-blue-500/35 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
              <div className="p-3 rounded-lg bg-blue-600/15 border border-blue-500/35">
                <div className="text-xs text-blue-300 font-mono">COPV Pressure</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">10,000 PSI</div>
              </div>
              <div className="p-3 rounded-lg bg-red-600/15 border border-red-500/35">
                <div className="text-xs text-red-300 font-mono">0-60 Time Window</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">0.88 Seconds</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-600/15 border border-blue-500/35">
                <div className="text-xs text-blue-300 font-mono">Lateral G-Force</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">3.5 G Max</div>
              </div>
              <div className="p-3 rounded-lg bg-red-600/15 border border-red-500/35">
                <div className="text-xs text-red-300 font-mono">Flight Clearance</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">1.8m Hover Capable</div>
              </div>
            </div>
          )}
        </div>

        {/* Specs Grid */}
        <div className="space-y-4 mb-12">
          <div className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider">
            Verified Flight Lab Performance Benchmarks
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orderedSpecs.map((spec) => {
              const isSelected = spec.id === selectedSpecId;
              return (
                <div
                  key={spec.id}
                  onClick={() => setSelectedSpecId(spec.id)}
                  className={`p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#0b1b3a] border-red-500/75 shadow-lg shadow-blue-600/15'
                      : 'bg-[#08142b]/80 border-blue-900/60 hover:border-blue-500/60 hover:bg-[#0a1834]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider font-mono">
                      {spec.highlight || spec.category}
                    </span>
                    <div className="text-xs text-slate-400 font-mono tabular-nums">
                      SPEC #0{spec.order}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight font-mono tabular-nums">
                      {spec.value}
                    </span>
                    {spec.unit && (
                      <span className="text-sm font-semibold text-red-400 font-mono">
                        {spec.unit}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-medium text-blue-100 mb-1">
                    {spec.label}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {spec.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Advance CTA & Direct Pre-order */}
        <div className="p-6 rounded-2xl bg-[#08142b]/95 border border-blue-500/35 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
              Reserve Tesla Flying Roadster Allocation
            </div>
            <div className="text-sm text-slate-200 font-light mt-0.5">
              Deposits start from $10,000. Next in order: Review the complete commercial Tesla vehicle lineup.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onPreOrderFlyingCar}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 via-blue-700 to-blue-600 text-white font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-600/25 border border-white/15 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Wind className="w-4 h-4 text-white" />
              <span>Pre-Order Flying Car ($10k+)</span>
            </button>

            <button
              onClick={() => {
                if (onSelectPage) onSelectPage('showroom');
                else document.querySelector('#showroom')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl border border-blue-700/60 hover:border-blue-400 bg-[#050d1f] text-blue-100 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Advance to 04 · Tesla Fleet Store</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
