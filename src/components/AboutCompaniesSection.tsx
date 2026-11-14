import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  Car, 
  Brain, 
  Satellite, 
  Atom, 
  Shovel, 
  ExternalLink, 
  Flame, 
  Compass, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';
import { ProfileData, CompanyData, PageId } from '../types';

interface AboutCompaniesSectionProps {
  profile: ProfileData;
  companies: CompanyData[];
  onOpenContentStudio: () => void;
  onSelectPage?: (page: PageId) => void;
}

export const AboutCompaniesSection: React.FC<AboutCompaniesSectionProps> = ({
  profile,
  companies,
  onOpenContentStudio,
  onSelectPage,
}) => {
  // Sort companies in chronological founding order
  const chronologicalCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      const yearA = parseInt(a.founded, 10) || 2000;
      const yearB = parseInt(b.founded, 10) || 2000;
      return yearA - yearB;
    });
  }, [companies]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    chronologicalCompanies[0]?.id || 'co-spacex'
  );

  const selectedCompany = 
    chronologicalCompanies.find((c) => c.id === selectedCompanyId) || chronologicalCompanies[0];

  const selectedIndex = chronologicalCompanies.findIndex((c) => c.id === selectedCompany?.id);

  const getCompanyIcon = (name: CompanyData['iconName']) => {
    switch (name) {
      case 'rocket':
        return <Rocket className="w-5 h-5" />;
      case 'car':
        return <Car className="w-5 h-5" />;
      case 'brain':
        return <Brain className="w-5 h-5" />;
      case 'satellite':
        return <Satellite className="w-5 h-5" />;
      case 'atom':
        return <Atom className="w-5 h-5" />;
      case 'shovel':
        return <Shovel className="w-5 h-5" />;
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-[#061024] border-t border-blue-900/60 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-80 h-80 bg-blue-600/10 blur-[110px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-red-600/10 blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
          <div className="lg:col-span-8 space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
              Frontier <span className="us-text-gradient">Ventures</span> in Chronological Order
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl font-light">
              Guided by first-principles physics, each enterprise targets an existential civilizational threshold: reusable spaceflight, sustainable transport, planetary telecom, neural synthesis, 3D transit, and frontier artificial intelligence.
            </p>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="p-3.5 rounded-xl bg-[#08142b]/90 border border-blue-500/35 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-400 font-mono">Portfolio Reach:</span>
                <span className="font-mono font-bold text-blue-300">6 Global Entities</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-xs mt-1">
                <span className="text-slate-400 font-mono">Total Capital Scale:</span>
                <span className="font-mono font-bold text-red-300">$1.2+ Trillion Combined</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chronological Sequence Stepper / Timeline Bar */}
        <div className="mb-10 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center min-w-[700px] border border-blue-800/50 rounded-2xl bg-[#08142b]/95 p-2 gap-1.5">
            {chronologicalCompanies.map((c) => {
              const isSelected = c.id === selectedCompanyId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/35 to-red-600/25 border border-blue-400/70 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-[#0d1f42] text-slate-300 hover:text-white border border-transparent'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-red-600 text-white font-bold' : 'bg-[#0d1f42] text-blue-300'
                  }`}>
                    {getCompanyIcon(c.iconName)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-mono tracking-wider text-blue-300 tabular-nums">
                      {c.founded}
                    </div>
                    <div className="text-xs font-bold truncate text-white">
                      {c.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Company Focus Spotlight */}
        {selectedCompany && (
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-[#08142b]/95 border border-blue-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="font-mono text-red-400 font-bold tabular-nums">
                    VENTURE {String(selectedIndex + 1).padStart(2, '0')} OF 06
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 font-mono">Founded in {selectedCompany.founded}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-blue-300 font-mono">{selectedCompany.status}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 border border-white/15">
                    {getCompanyIcon(selectedCompany.iconName)}
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide">
                      {selectedCompany.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-300 font-medium">
                      {selectedCompany.role}
                    </p>
                  </div>
                </div>

                <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed">
                  {selectedCompany.description}
                </p>

                <div className="p-4 rounded-xl bg-[#050d1f] border border-blue-800/60">
                  <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1 font-mono">
                    Foundational Mission Objective
                  </div>
                  <div className="text-sm text-white font-medium italic">
                    &ldquo;{selectedCompany.mission}&rdquo;
                  </div>
                </div>
              </div>

              {/* Quick Spec Readout */}
              <div className="lg:col-span-4 space-y-3 p-5 rounded-xl bg-[#050d1f] border border-blue-800/60">
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider font-mono">
                  Operational Metrics
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-blue-900/60">
                    <span className="text-slate-400">Scale / Valuation</span>
                    <span className="font-mono font-bold text-red-300 tabular-nums">{selectedCompany.valuationOrMarketCap}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-blue-900/60">
                    <span className="text-slate-400">Founding Epoch</span>
                    <span className="font-mono text-white tabular-nums">{selectedCompany.founded}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-blue-900/60">
                    <span className="text-slate-400">Order in Portfolio</span>
                    <span className="font-mono text-blue-300 tabular-nums">#0{selectedIndex + 1} of 06</span>
                  </div>
                  {selectedCompany.url && (
                    <div className="pt-2">
                      <a
                        href={selectedCompany.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 hover:text-red-300 transition-colors"
                      >
                        <span>Visit {selectedCompany.name} Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6 Ventures Grid in Chronological Order */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider">
            All 6 Ventures In Chronological Sequence
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chronologicalCompanies.map((company, idx) => {
              const isSelected = company.id === selectedCompanyId;
              return (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompanyId(company.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#0b1b3a] border-red-500/70 shadow-lg shadow-blue-600/15'
                      : 'bg-[#08142b]/75 border-blue-900/60 hover:border-blue-500/60 hover:bg-[#0a1834]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-[#0e2147] text-blue-300'
                      }`}>
                        {getCompanyIcon(company.iconName)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{company.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">Venture #{String(idx + 1).padStart(2, '0')}</div>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-red-400 tabular-nums">
                      {company.founded}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {company.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-blue-900/60 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400">{company.valuationOrMarketCap}</span>
                    <span className={`font-semibold ${isSelected ? 'text-red-300' : 'text-blue-300'}`}>
                      {isSelected ? 'Active Selection' : 'Inspect'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Advance CTA */}
        <div className="mt-12 pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Next in Sequence: Aerospace & Automotive Convergence
          </div>

          <button
            onClick={() => {
              if (onSelectPage) onSelectPage('flying-roadster');
              else document.querySelector('#flying-roadster')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-600/25 border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Advance to 03 · Flying Roadster Flight Lab</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
};
