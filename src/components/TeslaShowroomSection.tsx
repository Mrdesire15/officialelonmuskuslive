import React, { useState } from 'react';
import {
  Wind,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Table,
  Gauge,
  BatteryCharging,
  Armchair,
  Wrench,
  X,
  FileText,
  ArrowLeftRight,
  Trophy,
  Flame,
  ShoppingBag,
  Package
} from 'lucide-react';
import { TeslaVehicle, VehicleDetailedSpecs, PageId, MerchProduct } from '../types';
import { TESLA_VEHICLES, getVehicleDetailedSpecs } from '../data/teslaVehicles';
import { MERCH_PRODUCTS } from '../data/merchProducts';

interface TeslaShowroomSectionProps {
  onSelectVehicleToOrder: (vehicle: TeslaVehicle) => void;
  onSelectMerchToOrder?: (product: MerchProduct, tierId: string, size: string) => void;
  onOpenMyOrders: () => void;
  ordersCount: number;
  onSelectPage?: (page: PageId) => void;
  vehicles?: TeslaVehicle[];
}

type DossierTab = 'performance' | 'battery' | 'interior' | 'essentials' | 'safety';

const formatMaxHp = (raw: string): string => {
  const cleaned = raw.split('(')[0].replace(/Equivalent|Peak|Combined/gi, '').trim();
  return cleaned;
};

const formatDragCd = (raw: string): string => {
  const match = raw.match(/[\d.]+\s*Cd/i);
  return match ? match[0] : raw.split('(')[0].trim();
};

const formatBatteryKwh = (raw: string): string => {
  const match = raw.match(/\d+\s*kWh/i);
  if (!match) return raw.split('(')[0].trim();
  const is4680 = raw.includes('4680');
  const isSolidState = raw.toLowerCase().includes('solid-state');
  const isNca = raw.includes('NCA');
  if (is4680) return `${match[0]} (4680)`;
  if (isSolidState) return `${match[0]} (Solid-State)`;
  if (isNca) return `${match[0]} (NCA)`;
  return match[0];
};

const formatAccelCompact = (raw: string): string => {
  return raw.replace('(0–60 MPH)', '').trim();
};

const extractFirstFloat = (raw: string): number | null => {
  const cleaned = raw.replace(/,/g, '');
  const match = cleaned.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

interface EffectiveSpecMetrics {
  acceleration: string;
  horsepower: string;
  dragCoefficient: string;
  range: string;
  batteryDisplay: string;
  topSpeed: string;
  quarterMile: string;
  torque: string;
}

const getEffectiveSpecMetrics = (
  vehicle: TeslaVehicle,
  specs: VehicleDetailedSpecs,
  isPerfMode: boolean
): EffectiveSpecMetrics => {
  const baseAccelStr = formatAccelCompact(vehicle.acceleration);
  const baseHpStr = formatMaxHp(specs.horsepower);
  const baseDragStr = formatDragCd(specs.dragCoefficient);
  const baseRangeStr = vehicle.range.split('(')[0].trim();
  const baseBatteryStr = `${formatBatteryKwh(specs.batteryPack)} · ${specs.superchargingPeak.split('+')[0].trim()}`;
  const baseTopSpeedStr = vehicle.topSpeed.split('(')[0].trim();

  if (!isPerfMode) {
    return {
      acceleration: baseAccelStr,
      horsepower: baseHpStr,
      dragCoefficient: baseDragStr,
      range: baseRangeStr,
      batteryDisplay: baseBatteryStr,
      topSpeed: baseTopSpeedStr,
      quarterMile: specs.quarterMile,
      torque: specs.torque,
    };
  }

  // Recalculate Track-Ready / Maximum-Unlocked Metrics
  const baseAccelNum = extractFirstFloat(baseAccelStr);
  const baseHpNum = extractFirstFloat(baseHpStr);
  const baseDragNum = extractFirstFloat(baseDragStr);
  const baseRangeNum = extractFirstFloat(baseRangeStr);
  const baseSpeedNum = extractFirstFloat(baseTopSpeedStr);
  const baseKwhNum = extractFirstFloat(specs.batteryPack);
  const baseQmNum = extractFirstFloat(specs.quarterMile);
  const baseTorqueNum = extractFirstFloat(specs.torque);

  const trackAccel =
    baseAccelNum !== null
      ? `${Math.max(1.65, baseAccelNum * (baseAccelNum < 2.2 ? 0.90 : baseAccelNum < 3.0 ? 0.91 : 0.88)).toFixed(2)} s`
      : baseAccelStr;

  const trackHpNum = baseHpNum !== null ? Math.round((baseHpNum * 1.09) / 5) * 5 : null;
  const trackHp =
    trackHpNum !== null ? `${trackHpNum.toLocaleString()} HP Peak` : `${baseHpStr} Peak`;

  const trackDrag =
    baseDragNum !== null
      ? `${Math.max(0.185, baseDragNum - 0.014).toFixed(3)} Cd`
      : baseDragStr;

  const trackRange =
    baseRangeNum !== null ? `${Math.round(baseRangeNum * 0.84)} mi (Track)` : baseRangeStr;

  const peakDischargeKw =
    trackHpNum !== null ? Math.round((trackHpNum * 0.7457 * 1.12) / 5) * 5 : 650;
  const trackBattery =
    baseKwhNum !== null
      ? `${formatBatteryKwh(specs.batteryPack)} · ${peakDischargeKw} kW Max Draw`
      : baseBatteryStr;

  const trackTopSpeed =
    baseSpeedNum !== null
      ? `${
          baseSpeedNum >= 160
            ? Math.round(baseSpeedNum * 1.08)
            : Math.round(baseSpeedNum + 22)
        } MPH Vmax`
      : baseTopSpeedStr;

  const trackQmSpeed =
    baseSpeedNum !== null && baseSpeedNum >= 160 ? Math.round(baseSpeedNum * 0.82) : 134;
  const trackQm =
    baseQmNum !== null
      ? `${(baseQmNum * 0.92).toFixed(2)} s @ ${trackQmSpeed} MPH`
      : specs.quarterMile;

  const trackTorque =
    baseTorqueNum !== null
      ? `${Math.round((baseTorqueNum * 1.08) / 5) * 5} lb-ft Overboost`
      : specs.torque;

  return {
    acceleration: trackAccel,
    horsepower: trackHp,
    dragCoefficient: trackDrag,
    range: trackRange,
    batteryDisplay: trackBattery,
    topSpeed: trackTopSpeed,
    quarterMile: trackQm,
    torque: trackTorque,
  };
};

export const TeslaShowroomSection: React.FC<TeslaShowroomSectionProps> = ({
  onSelectVehicleToOrder,
  onSelectMerchToOrder,
  onSelectPage,
  vehicles = TESLA_VEHICLES,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'plaid' | 'sedan' | 'utility'>('all');
  const [showMatrix, setShowMatrix] = useState<boolean>(true);
  const [showCompare, setShowCompare] = useState<boolean>(true);
  const [compareSlotAId, setCompareSlotAId] = useState<string>('tesla-model-s-plaid');
  const [compareSlotBId, setCompareSlotBId] = useState<string>('tesla-cybertruck-cyberbeast');
  const [nextCompareTarget, setNextCompareTarget] = useState<'A' | 'B'>('B');
  const [inspectedVehicle, setInspectedVehicle] = useState<TeslaVehicle | null>(null);
  const [dossierTab, setDossierTab] = useState<DossierTab>('performance');
  const [performanceModeByVehicle, setPerformanceModeByVehicle] = useState<Record<string, boolean>>({});
  const [selectedTierByMerchId, setSelectedTierByMerchId] = useState<Record<string, string>>(() =>
    Object.fromEntries(MERCH_PRODUCTS.map((p) => [p.id, p.qualityTiers[0].id]))
  );
  const [selectedSizeByMerchId, setSelectedSizeByMerchId] = useState<Record<string, string>>(() =>
    Object.fromEntries(MERCH_PRODUCTS.map((p) => [p.id, p.defaultSize]))
  );
  const [brokenMerchImages, setBrokenMerchImages] = useState<Record<string, boolean>>({});

  const toggleVehiclePerformanceMode = (vehicleId: string) => {
    setPerformanceModeByVehicle((prev) => ({
      ...prev,
      [vehicleId]: !prev[vehicleId],
    }));
  };

  const allVehicles = vehicles && vehicles.length > 0 ? vehicles : TESLA_VEHICLES;

  const compareVehicleA =
    allVehicles.find((v) => v.id === compareSlotAId) || allVehicles[0];
  const compareVehicleB =
    allVehicles.find((v) => v.id === compareSlotBId) ||
    allVehicles.find((v) => v.id !== compareVehicleA.id) ||
    allVehicles[0];

  const handleAssignToCompare = (vehicleId: string) => {
    setShowCompare(true);
    if (vehicleId === compareVehicleA.id || vehicleId === compareVehicleB.id) {
      document.getElementById('compare-models-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (nextCompareTarget === 'A') {
      setCompareSlotAId(vehicleId);
      setNextCompareTarget('B');
    } else {
      setCompareSlotBId(vehicleId);
      setNextCompareTarget('A');
    }
    document.getElementById('compare-models-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSwapCompareModels = () => {
    const prevA = compareVehicleA.id;
    const prevB = compareVehicleB.id;
    setCompareSlotAId(prevB);
    setCompareSlotBId(prevA);
  };

  // Filtered vehicles
  const filteredVehicles = allVehicles.filter((vehicle) => {
    if (activeTab === 'plaid') {
      return (
        vehicle.name.includes('Plaid') ||
        vehicle.name.includes('Performance') ||
        vehicle.name.includes('Cyberbeast')
      );
    }
    if (activeTab === 'sedan') {
      return (
        vehicle.name.includes('Model S') ||
        vehicle.name.includes('Model 3')
      );
    }
    if (activeTab === 'utility') {
      return (
        vehicle.name.includes('Cybertruck') ||
        vehicle.name.includes('Model Y') ||
        vehicle.name.includes('Model X')
      );
    }
    return true;
  });

  const haloVehicle =
    allVehicles.find((v) => v.id === 'tesla-model-s-plaid') || allVehicles[0];
  const haloVehicleSpecs = getVehicleDetailedSpecs(haloVehicle);

  const openDossier = (vehicle: TeslaVehicle, initialTab: DossierTab = 'performance') => {
    setInspectedVehicle(vehicle);
    setDossierTab(initialTab);
  };

  const inspectedSpecs = inspectedVehicle ? getVehicleDetailedSpecs(inspectedVehicle) : null;

  return (
    <section
      id="showroom"
      className="py-16 md:py-24 bg-[#061024] relative border-t border-blue-900/60 overflow-hidden"
    >
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Headline */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
              Order Your <span className="us-text-gradient">Tesla Vehicle</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed font-light">
              Full high-performance engineering specs, V4 Supercharging, cabin tech, NHTSA 5-star safety systems, and complete factory equipment included across every real street-legal production vehicle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => {
                const nextState = !showCompare;
                setShowCompare(nextState);
                if (nextState) {
                  setTimeout(() => {
                    document
                      .getElementById('compare-models-panel')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }
              }}
              className={`px-3.5 py-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                showCompare
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 border-blue-400/60 text-white font-bold shadow-sm'
                  : 'border-blue-800/60 bg-[#08142b] hover:bg-[#0d1f42] text-blue-100'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{showCompare ? 'Hide Compare Models' : 'Compare Models'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="px-3.5 py-2 rounded-lg border border-blue-800/60 bg-[#08142b] hover:bg-[#0d1f42] text-blue-100 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Table className="w-3.5 h-3.5 text-red-400" />
              <span>{showMatrix ? 'Hide Fleet Spec Matrix' : 'Show Fleet Spec Matrix'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('official-merch-collection')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="px-3.5 py-2 rounded-lg border border-blue-500/45 bg-[#08142b] hover:bg-blue-600/25 text-blue-100 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
              <span>Apparel &amp; Hats ($50–$500)</span>
            </button>
          </div>
        </div>

        {/* Official Apparel & Headwear Showcase ($50 - $500 Quality Graded) */}
        <div id="official-merch-collection" className="mb-14 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-blue-900/60">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
                Official Apparel &amp; Headwear · Quality-Graded Pricing
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                Signature Black Tee &amp; 3D Trucker Hat
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-300 tabular-nums">
              $50 – $500 USD per item depending on fabric &amp; build grade
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MERCH_PRODUCTS.map((product) => {
              const activeTierId = selectedTierByMerchId[product.id] || product.qualityTiers[0].id;
              const activeTier =
                product.qualityTiers.find((t) => t.id === activeTierId) || product.qualityTiers[0];
              const activeSize = selectedSizeByMerchId[product.id] || product.defaultSize;
              const isBroken = !!brokenMerchImages[product.id];

              return (
                <div
                  key={product.id}
                  className="rounded-2xl bg-[#08142b]/95 border border-blue-900/60 hover:border-blue-400/60 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  {/* Studio Product Image */}
                  <div className="relative aspect-[4/3] bg-[#040a18] overflow-hidden border-b border-blue-900/60">
                    {isBroken ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                        <Package className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="text-xs font-mono uppercase">{product.name}</span>
                      </div>
                    ) : (
                      <img
                        src={product.image}
                        alt={`${product.name} studio photograph`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenMerchImages((prev) => ({ ...prev, [product.id]: true }))
                        }
                        className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-200">{product.editionTag}</span>
                      <span className="text-blue-200 tabular-nums">
                        ${product.minPrice} – ${product.maxPrice}
                      </span>
                    </div>
                  </div>

                  {/* Contiguous Details & Interactive Quality / Size Selector */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                            {product.categoryLabel}
                          </div>
                          <h4 className="font-display text-xl font-bold text-white">
                            {product.name}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] font-mono uppercase text-slate-400">
                            Selected Grade
                          </div>
                          <div className="text-2xl font-display font-bold text-white font-mono tabular-nums">
                            ${activeTier.price}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-light leading-relaxed">
                        {product.description}
                      </p>

                      {/* Quality Grade Selector ($50 - $500) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-blue-300 font-semibold uppercase tracking-wider">
                            Quality Tier ($50 – $500)
                          </span>
                          <span className="text-slate-300">{activeTier.gradeCode} · {activeTier.name}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {product.qualityTiers.map((tier) => {
                            const selected = tier.id === activeTier.id;
                            return (
                              <button
                                key={tier.id}
                                type="button"
                                onClick={() =>
                                  setSelectedTierByMerchId((prev) => ({
                                    ...prev,
                                    [product.id]: tier.id,
                                  }))
                                }
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  selected
                                    ? 'bg-gradient-to-r from-blue-600/35 to-red-600/30 border-blue-400 text-white shadow-sm'
                                    : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:border-blue-500/60 hover:text-white'
                                }`}
                              >
                                <div className="text-sm font-mono font-bold tabular-nums text-white">
                                  ${tier.price}
                                </div>
                                <div className="text-[10px] font-mono text-blue-200 truncate">
                                  {tier.name.split(' ')[0]}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Material Spec Readout */}
                        <div className="p-3 rounded-xl bg-[#040a18]/90 border border-blue-900/60 space-y-1 text-xs">
                          <div className="font-mono font-semibold text-blue-200 text-[11px]">
                            {activeTier.materialSpec}
                          </div>
                          <div className="text-[11px] text-slate-300 leading-snug">
                            {activeTier.craftsmanshipNote}
                          </div>
                        </div>
                      </div>

                      {/* Size / Fit Selector */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-300 uppercase tracking-wider">Size / Fit</span>
                          <span className="text-blue-300">{activeSize}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.sizes.map((size) => {
                            const isSizeSelected = activeSize === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() =>
                                  setSelectedSizeByMerchId((prev) => ({
                                    ...prev,
                                    [product.id]: size,
                                  }))
                                }
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                                  isSizeSelected
                                    ? 'bg-blue-600 border-blue-400 text-white'
                                    : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:text-white hover:border-blue-500/50'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Purchase Action */}
                    <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-mono text-slate-400">
                        {activeTier.deliveryEstimate}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectMerchToOrder?.(product, activeTier.id, activeSize)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs font-mono transition-all shadow-md border border-white/15 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Now · ${activeTier.price}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Flagship Model: Real Production Halo Spotlight */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-[#08142b]/95 border border-blue-500/45 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual */}
            <div className="lg:col-span-6 relative aspect-[16/10] rounded-xl overflow-hidden bg-[#040a18] border border-blue-800/60 group">
              <img
                src={haloVehicle.image}
                alt={haloVehicle.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/85 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-md">
                Official US MSRP · 20% Advance Deposit (${Math.round(haloVehicle.basePrice * 0.20).toLocaleString()})
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 font-mono">
                <span>Tri-Motor Carbon-Sleeved Flagship</span>
                <span className="font-semibold text-blue-300">{haloVehicle.deliveryEstimate}</span>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
                <Zap className="w-4 h-4 text-red-400" />
                <span>Production Flagship · High-Performance Engineering</span>
              </div>

              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {haloVehicle.name}
                </h3>
                <p className="text-xs text-red-300 font-medium pt-1 font-mono tabular-nums">
                  {haloVehicleSpecs.horsepower} · {haloVehicleSpecs.quarterMile} · {haloVehicleSpecs.superchargingPeak}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                {haloVehicle.description}
              </p>

              {/* High-Performance Spotlight Metrics Grid with Performance Mode Toggle */}
              {(() => {
                const isHaloPerf = !!performanceModeByVehicle[haloVehicle.id];
                const haloEffective = getEffectiveSpecMetrics(haloVehicle, haloVehicleSpecs, isHaloPerf);
                return (
                  <div
                    className={`rounded-2xl p-3.5 border transition-colors space-y-2.5 ${
                      isHaloPerf
                        ? 'bg-gradient-to-br from-[#0b1329] to-[#210a16] border-red-500/65'
                        : 'bg-[#040a18]/75 border-blue-900/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-blue-900/50">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-red-400" />
                        <span>{isHaloPerf ? 'Track Calibration · Max Unlocked' : 'Standard EPA Telemetry'}</span>
                      </span>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={isHaloPerf}
                        onClick={() => toggleVehiclePerformanceMode(haloVehicle.id)}
                        className={`px-3 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isHaloPerf
                            ? 'bg-gradient-to-r from-red-600 to-blue-600 border-red-400 text-white shadow-sm'
                            : 'bg-[#08142b] hover:bg-[#0d2044] border-blue-700/70 text-blue-200'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${isHaloPerf ? 'text-white' : 'text-red-400'}`} />
                        <span>Performance Mode: {isHaloPerf ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono tabular-nums">
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">0–60 MPH Time</span>
                        <span className={`text-sm font-bold ${isHaloPerf ? 'text-red-300' : 'text-blue-300'}`}>
                          {haloEffective.acceleration}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">Max Horsepower</span>
                        <span className="text-sm font-bold text-emerald-300">{haloEffective.horsepower}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">Drag Coefficient</span>
                        <span className="text-sm font-bold text-white">{haloEffective.dragCoefficient}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">Range (Miles)</span>
                        <span className="text-sm font-bold text-red-300">{haloEffective.range}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">Battery &amp; Peak</span>
                        <span className="text-xs font-bold text-blue-200 leading-snug block">
                          {isHaloPerf ? haloEffective.batteryDisplay : formatBatteryKwh(haloVehicleSpecs.batteryPack)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/60">
                        <span className="text-[10px] text-slate-400 uppercase block">Top Speed</span>
                        <span className="text-sm font-bold text-white">{haloEffective.topSpeed}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Price & Actions */}
              <div className="p-4 rounded-xl bg-[#050d1f] border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-mono">Official US Base MSRP</div>
                  <div className="flex items-baseline gap-2.5">
                    <div className="text-2xl font-bold font-mono text-white tabular-nums">
                      ${haloVehicle.basePrice.toLocaleString()}
                    </div>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      (+${(haloVehicle.destinationFee ?? 1640).toLocaleString()} Dest.)
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-300 font-mono mt-0.5 tabular-nums">
                    20% Advance Deposit: ${Math.round(haloVehicle.basePrice * 0.20).toLocaleString()} · Delivered ${(haloVehicle.basePrice + (haloVehicle.destinationFee ?? 1640)).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDossier(haloVehicle)}
                    className="px-4 py-3 rounded-xl bg-[#08142b] hover:bg-[#0d2044] border border-blue-500/45 text-blue-100 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-300" />
                    <span>Full Specs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectVehicleToOrder(haloVehicle)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-600/25 border border-white/15 flex items-center justify-center gap-2 cursor-pointer font-mono whitespace-nowrap shrink-0"
                  >
                    <Zap className="w-4 h-4 text-white" />
                    <span>Configure & Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-Side Fleet Comparison Matrix */}
        {showMatrix && (
          <div className="mb-14 overflow-hidden rounded-2xl border border-blue-800/60 bg-[#08142b]/90">
            <div className="p-4 bg-[#0b1b3a] border-b border-blue-800/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-blue-100 uppercase tracking-wider flex items-center gap-2">
                <Table className="w-4 h-4 text-red-400" />
                <span>High-Performance Fleet & Equipment Matrix</span>
              </span>
              <span className="text-[11px] text-blue-300 font-mono tabular-nums">
                {allVehicles.length} Models Available · Click any model for full real-car specs
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blue-900/60 text-blue-200 font-mono uppercase text-[10px] bg-[#061126]">
                    <th className="py-3 px-4">Model & Tier</th>
                    <th className="py-3 px-3">0–60 MPH</th>
                    <th className="py-3 px-3">Max HP</th>
                    <th className="py-3 px-3">Drag Coeff.</th>
                    <th className="py-3 px-3">Range (Miles)</th>
                    <th className="py-3 px-3">Battery Pack</th>
                    <th className="py-3 px-3">US Base MSRP</th>
                    <th className="py-3 px-4 text-right">Inspect / Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/40 font-mono tabular-nums">
                  {allVehicles.map((vehicle, idx) => {
                    const specs = getVehicleDetailedSpecs(vehicle);
                    const destFee = vehicle.destinationFee ?? 1640;
                    return (
                      <tr key={vehicle.id} className="hover:bg-blue-950/50 transition-colors">
                        <td className="py-3.5 px-4 font-sans font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-red-400 font-mono font-normal">#{idx + 1}</span>
                            <span>{vehicle.name}</span>
                            {vehicle.isFlyingCar && (
                              <span className="text-blue-300 text-[10px] uppercase font-mono">
                                · Flying
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                            {vehicle.topSpeed} · {specs.seatingCapacity.split('(')[0].trim()}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-blue-300 font-bold">
                          {formatAccelCompact(vehicle.acceleration)}
                        </td>
                        <td className="py-3.5 px-3 text-emerald-300 font-semibold">
                          {formatMaxHp(specs.horsepower)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-200">
                          {formatDragCd(specs.dragCoefficient)}
                        </td>
                        <td className="py-3.5 px-3 text-slate-200">{vehicle.range}</td>
                        <td className="py-3.5 px-3 text-blue-200 text-[11px]">
                          {formatBatteryKwh(specs.batteryPack)}
                        </td>
                        <td className="py-3.5 px-3 text-white font-bold">
                          <div>${vehicle.basePrice.toLocaleString()}</div>
                          <div className="text-[10px] font-normal text-slate-400">
                            +${destFee.toLocaleString()} Dest.
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDossier(vehicle)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#040a18] border border-blue-700/60 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-medium transition-colors cursor-pointer font-sans whitespace-nowrap"
                            >
                              Specs
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectVehicleToOrder(vehicle)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600/25 border border-blue-500/40 hover:bg-red-600 hover:border-red-500 text-blue-100 hover:text-white text-xs font-medium transition-all cursor-pointer font-sans whitespace-nowrap"
                            >
                              {vehicle.isFlyingCar ? 'Pre-Order' : 'Order'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare Models Side-by-Side Workbench */}
        {showCompare && compareVehicleA && compareVehicleB && (() => {
          const specsA = getVehicleDetailedSpecs(compareVehicleA);
          const specsB = getVehicleDetailedSpecs(compareVehicleB);
          const isPerfA = !!performanceModeByVehicle[compareVehicleA.id];
          const isPerfB = !!performanceModeByVehicle[compareVehicleB.id];
          const effA = getEffectiveSpecMetrics(compareVehicleA, specsA, isPerfA);
          const effB = getEffectiveSpecMetrics(compareVehicleB, specsB, isPerfB);

          const comparisonRows: Array<{
            label: string;
            category: string;
            valA: string;
            valB: string;
            numA?: number | null;
            numB?: number | null;
            better?: 'higher' | 'lower';
          }> = [
            {
              label: '0–60 MPH Time',
              category: 'Performance',
              valA: effA.acceleration,
              valB: effB.acceleration,
              numA: extractFirstFloat(effA.acceleration),
              numB: extractFirstFloat(effB.acceleration),
              better: 'lower',
            },
            {
              label: 'Max Horsepower',
              category: 'Performance',
              valA: effA.horsepower,
              valB: effB.horsepower,
              numA: extractFirstFloat(effA.horsepower),
              numB: extractFirstFloat(effB.horsepower),
              better: 'higher',
            },
            {
              label: 'Instant Torque',
              category: 'Performance',
              valA: effA.torque,
              valB: effB.torque,
            },
            {
              label: '1/4 Mile Sprint',
              category: 'Performance',
              valA: effA.quarterMile,
              valB: effB.quarterMile,
              numA: extractFirstFloat(effA.quarterMile),
              numB: extractFirstFloat(effB.quarterMile),
              better: 'lower',
            },
            {
              label: 'Top Speed',
              category: 'Performance',
              valA: effA.topSpeed,
              valB: effB.topSpeed,
              numA: extractFirstFloat(effA.topSpeed),
              numB: extractFirstFloat(effB.topSpeed),
              better: 'higher',
            },
            {
              label: 'Drag Coefficient',
              category: 'Aerodynamics',
              valA: effA.dragCoefficient,
              valB: effB.dragCoefficient,
              numA: extractFirstFloat(effA.dragCoefficient),
              numB: extractFirstFloat(effB.dragCoefficient),
              better: 'lower',
            },
            {
              label: 'Range (Miles)',
              category: 'Battery',
              valA: effA.range,
              valB: effB.range,
              numA: extractFirstFloat(effA.range),
              numB: extractFirstFloat(effB.range),
              better: 'higher',
            },
            {
              label: 'Battery Capacity & Output',
              category: 'Battery',
              valA: effA.batteryDisplay,
              valB: effB.batteryDisplay,
              numA: extractFirstFloat(specsA.batteryPack),
              numB: extractFirstFloat(specsB.batteryPack),
              better: 'higher',
            },
            {
              label: 'Supercharging Peak & 15m Gain',
              category: 'Charging',
              valA: `${specsA.superchargingPeak} (${specsA.charge15MinMiles})`,
              valB: `${specsB.superchargingPeak} (${specsB.charge15MinMiles})`,
            },
            {
              label: 'Powertrain & Architecture',
              category: 'Drivetrain',
              valA: `${compareVehicleA.powertrain} · ${specsA.architectureVoltage}`,
              valB: `${compareVehicleB.powertrain} · ${specsB.architectureVoltage}`,
            },
            {
              label: 'Braking & Suspension',
              category: 'Chassis',
              valA: `${specsA.brakingSystem.split('+')[0].trim()} · ${specsA.suspension.split('(')[0].trim()}`,
              valB: `${specsB.brakingSystem.split('+')[0].trim()} · ${specsB.suspension.split('(')[0].trim()}`,
            },
            {
              label: 'Seating & Cargo Capacity',
              category: 'Utility',
              valA: `${specsA.seatingCapacity.split('(')[0].trim()} · ${specsA.cargoCapacity.split('(')[0].trim()}`,
              valB: `${specsB.seatingCapacity.split('(')[0].trim()} · ${specsB.cargoCapacity.split('(')[0].trim()}`,
            },
            {
              label: 'Towing & Curb Weight',
              category: 'Utility',
              valA: `${specsA.towingCapacity.split('(')[0].trim()} · ${specsA.curbWeight.split(' ')[0]} lbs`,
              valB: `${specsB.towingCapacity.split('(')[0].trim()} · ${specsB.curbWeight.split(' ')[0]} lbs`,
            },
            {
              label: 'Displays, Audio & Filtration',
              category: 'Cabin Tech',
              valA: `${specsA.infotainmentDisplay.split('+')[0].trim()} · ${specsA.audioSystem.split(' ')[0]} · HEPA`,
              valB: `${specsB.infotainmentDisplay.split('+')[0].trim()} · ${specsB.audioSystem.split(' ')[0]} · HEPA`,
            },
            {
              label: 'Safety, Airbags & Warranty',
              category: 'Protection',
              valA: `${specsA.safetyRatingAndAirbags.split('·')[0].trim()} · ${specsA.warrantyBatteryDrive.split('Battery')[0].trim()}`,
              valB: `${specsB.safetyRatingAndAirbags.split('·')[0].trim()} · ${specsB.warrantyBatteryDrive.split('Battery')[0].trim()}`,
            },
            {
              label: 'US Base MSRP & 20% Advance Deposit',
              category: 'Real Pricing',
              valA: `$${compareVehicleA.basePrice.toLocaleString()} MSRP ($${Math.round(compareVehicleA.basePrice * 0.20).toLocaleString()} 20% adv. · $${(compareVehicleA.basePrice + (compareVehicleA.destinationFee ?? 1640)).toLocaleString()} deliv.)`,
              valB: `$${compareVehicleB.basePrice.toLocaleString()} MSRP ($${Math.round(compareVehicleB.basePrice * 0.20).toLocaleString()} 20% adv. · $${(compareVehicleB.basePrice + (compareVehicleB.destinationFee ?? 1640)).toLocaleString()} deliv.)`,
              numA: compareVehicleA.basePrice,
              numB: compareVehicleB.basePrice,
              better: 'lower',
            },
          ];

          return (
            <div
              id="compare-models-panel"
              className="mb-14 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#1a0b18] border border-blue-500/45 shadow-2xl overflow-hidden"
            >
              {/* Compare Header & Vehicle Pickers */}
              <div className="p-5 sm:p-6 border-b border-blue-900/60 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-bold tracking-wider uppercase">
                      <ArrowLeftRight className="w-4 h-4 text-red-400" />
                      <span>Head-to-Head Specification Workbench</span>
                    </div>
                    <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                      Compare Models Side-by-Side
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-light">
                      Choose any two real Tesla production models below—or click <strong className="text-white">+ Compare</strong> on any catalog card—to inspect their performance, battery, chassis, and factory equipment side by side.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwapCompareModels}
                    className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#040a18] hover:bg-[#0d2044] border border-blue-700/70 text-blue-200 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-red-400" />
                    <span>Swap Model A ↔ B</span>
                  </button>
                </div>

                {/* Dual Vehicle Selection Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Model A Selector Card */}
                  <div className="p-4 rounded-2xl bg-[#040a18]/90 border border-blue-500/45 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-blue-300 font-bold uppercase tracking-wider">Model A</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPerfA}
                        onClick={() => toggleVehiclePerformanceMode(compareVehicleA.id)}
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          isPerfA
                            ? 'bg-red-600 border-red-400 text-white'
                            : 'bg-[#08142b] border-blue-800/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>Performance Mode: {isPerfA ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    <select
                      aria-label="Select Vehicle A to compare"
                      value={compareVehicleA.id}
                      onChange={(e) => setCompareSlotAId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08142b] border border-blue-700/60 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
                    >
                      {allVehicles.map((v) => (
                        <option key={`optA-${v.id}`} value={v.id}>
                          {v.name} — ${v.basePrice.toLocaleString()}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={compareVehicleA.image}
                        alt={compareVehicleA.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-14 rounded-lg object-cover border border-blue-900/60 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{compareVehicleA.name}</div>
                        <div className="text-xs font-mono text-blue-300 tabular-nums">
                          ${compareVehicleA.basePrice.toLocaleString()} · {effA.acceleration}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectVehicleToOrder(compareVehicleA)}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Order A
                      </button>
                    </div>
                  </div>

                  {/* Model B Selector Card */}
                  <div className="p-4 rounded-2xl bg-[#040a18]/90 border border-red-500/45 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                      <span className="text-red-300 font-bold uppercase tracking-wider">Model B</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPerfB}
                        onClick={() => toggleVehiclePerformanceMode(compareVehicleB.id)}
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          isPerfB
                            ? 'bg-red-600 border-red-400 text-white'
                            : 'bg-[#08142b] border-red-900/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>Performance Mode: {isPerfB ? 'ON' : 'OFF'}</span>
                      </button>
                    </div>

                    <select
                      aria-label="Select Vehicle B to compare"
                      value={compareVehicleB.id}
                      onChange={(e) => setCompareSlotBId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08142b] border border-red-700/60 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-red-400 cursor-pointer"
                    >
                      {allVehicles.map((v) => (
                        <option key={`optB-${v.id}`} value={v.id}>
                          {v.name} — ${v.basePrice.toLocaleString()}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={compareVehicleB.image}
                        alt={compareVehicleB.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-14 rounded-lg object-cover border border-red-900/60 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{compareVehicleB.name}</div>
                        <div className="text-xs font-mono text-red-300 tabular-nums">
                          ${compareVehicleB.basePrice.toLocaleString()} · {effB.acceleration}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectVehicleToOrder(compareVehicleB)}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Order B
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Spec Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#040a18] border-b border-blue-900/70 font-mono uppercase text-[10px]">
                      <th className="py-3.5 px-5 text-slate-400 w-[26%]">Specification Metric</th>
                      <th className="py-3.5 px-4 text-blue-300 w-[37%]">
                        Model A · {compareVehicleA.name}
                      </th>
                      <th className="py-3.5 px-4 text-red-300 w-[37%]">
                        Model B · {compareVehicleB.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-900/40 font-mono tabular-nums">
                    {comparisonRows.map((row) => {
                      let winner: 'A' | 'B' | null = null;
                      if (
                        row.better &&
                        row.numA != null &&
                        row.numB != null &&
                        Math.abs(row.numA - row.numB) > 0.0001
                      ) {
                        if (row.better === 'higher') {
                          winner = row.numA > row.numB ? 'A' : 'B';
                        } else {
                          winner = row.numA < row.numB ? 'A' : 'B';
                        }
                      }

                      return (
                        <tr key={row.label} className="hover:bg-blue-950/35 transition-colors">
                          <td className="py-3.5 px-5 font-sans">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                              {row.category}
                            </span>
                            <span className="font-bold text-white text-xs">{row.label}</span>
                          </td>
                          <td
                            className={`py-3.5 px-4 ${
                              winner === 'A'
                                ? 'text-emerald-300 font-bold bg-blue-600/10'
                                : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {winner === 'A' && (
                                <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <span>{row.valA}</span>
                            </div>
                          </td>
                          <td
                            className={`py-3.5 px-4 ${
                              winner === 'B'
                                ? 'text-emerald-300 font-bold bg-red-600/10'
                                : 'text-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {winner === 'B' && (
                                <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <span>{row.valB}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Filter Tabs for Vehicle Cards */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="text-xs font-mono font-semibold text-blue-300 uppercase tracking-wider">
            Vehicle Catalog & Real-Car Engineering Specifications
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#040a18] border border-blue-900/60 text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              All Vehicles ({allVehicles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('plaid')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'plaid'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Plaid &amp; Performance (
              {
                allVehicles.filter(
                  (v) =>
                    v.name.includes('Plaid') ||
                    v.name.includes('Performance') ||
                    v.name.includes('Cyberbeast')
                ).length
              }
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sedan')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'sedan'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Luxury &amp; Sport Sedans (
              {
                allVehicles.filter(
                  (v) => v.name.includes('Model S') || v.name.includes('Model 3')
                ).length
              }
              )
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('utility')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'utility'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              SUVs &amp; Cybertruck (
              {
                allVehicles.filter(
                  (v) =>
                    v.name.includes('Cybertruck') ||
                    v.name.includes('Model Y') ||
                    v.name.includes('Model X')
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVehicles.map((vehicle, idx) => {
            const specs = getVehicleDetailedSpecs(vehicle);
            const isSelectedA = showCompare && compareVehicleA?.id === vehicle.id;
            const isSelectedB = showCompare && compareVehicleB?.id === vehicle.id;

            return (
              <div
                key={vehicle.id}
                className={`rounded-2xl bg-[#08142b]/90 border transition-all overflow-hidden flex flex-col group shadow-lg ${
                  isSelectedA
                    ? 'border-blue-400 shadow-blue-600/20'
                    : isSelectedB
                    ? 'border-red-400 shadow-red-600/20'
                    : 'border-blue-900/60 hover:border-blue-400/70'
                }`}
              >
                <div className="relative aspect-[16/10] bg-[#040a18] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/90 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#040a18]/90 text-[10px] font-mono text-blue-200 border border-blue-800/70">
                    #{idx + 1} · {vehicle.modelCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignToCompare(vehicle.id)}
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelectedA
                        ? 'bg-blue-600 border-blue-300 text-white'
                        : isSelectedB
                        ? 'bg-red-600 border-red-300 text-white'
                        : 'bg-[#040a18]/90 hover:bg-blue-600 border-blue-700/70 text-slate-200 hover:text-white'
                    }`}
                    title="Compare this model side-by-side"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>
                      {isSelectedA ? 'Comparing A' : isSelectedB ? 'Comparing B' : '+ Compare'}
                    </span>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="text-red-300 font-bold">{vehicle.acceleration}</span>
                    <span className="text-blue-200">{vehicle.range}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-display text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                        {vehicle.name}
                      </h4>
                      <p className="text-xs text-slate-300 font-light mt-1 line-clamp-2">
                        {vehicle.description}
                      </p>
                    </div>

                    {/* Detailed High-Performance Specification Grid with Per-Vehicle Performance Mode Toggle */}
                    {(() => {
                      const isPerfMode = !!performanceModeByVehicle[vehicle.id];
                      const effectiveSpecs = getEffectiveSpecMetrics(vehicle, specs, isPerfMode);

                      return (
                        <div
                          className={`rounded-xl border p-3 space-y-2 transition-colors ${
                            isPerfMode
                              ? 'bg-gradient-to-br from-[#0b1329] to-[#210a16] border-red-500/65'
                              : 'bg-[#040a18]/90 border-blue-900/65'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider font-bold border-b border-blue-900/60 pb-2">
                            <span className="flex items-center gap-1.5 text-blue-300 truncate">
                              <Gauge className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span className="truncate">
                                {isPerfMode ? 'Track Unlocked Specs' : 'Specification Grid'}
                              </span>
                            </span>

                            <button
                              type="button"
                              role="switch"
                              aria-checked={isPerfMode}
                              aria-label={`Toggle Performance Mode for ${vehicle.name}`}
                              onClick={() => toggleVehiclePerformanceMode(vehicle.id)}
                              className={`px-2 py-1 rounded-md border text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ${
                                isPerfMode
                                  ? 'bg-gradient-to-r from-red-600 to-blue-600 border-red-400 text-white shadow-sm'
                                  : 'bg-[#08142b] hover:bg-[#0d2044] border-blue-700/70 text-blue-200'
                              }`}
                            >
                              <Flame className={`w-3 h-3 ${isPerfMode ? 'text-white' : 'text-red-400'}`} />
                              <span>Performance Mode: {isPerfMode ? 'ON' : 'OFF'}</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono tabular-nums">
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">0–60 MPH Time</span>
                              <span className={`font-bold mt-0.5 block ${isPerfMode ? 'text-red-300' : 'text-blue-300'}`}>
                                {effectiveSpecs.acceleration}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">Max Horsepower</span>
                              <span className="text-emerald-300 font-bold mt-0.5 block">
                                {effectiveSpecs.horsepower}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">Drag Coeff.</span>
                              <span className="text-white font-bold mt-0.5 block">
                                {effectiveSpecs.dragCoefficient}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">Range (Miles)</span>
                              <span className={`font-bold mt-0.5 block ${isPerfMode ? 'text-amber-300' : 'text-blue-200'}`}>
                                {effectiveSpecs.range}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">Top Speed</span>
                              <span className="text-white font-bold mt-0.5 block">
                                {effectiveSpecs.topSpeed}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-[#08142b]/85 border border-blue-900/50">
                              <span className="text-slate-400 block text-[9.5px] uppercase">Battery Cap.</span>
                              <span className="text-white font-bold mt-0.5 block truncate" title={effectiveSpecs.batteryDisplay}>
                                {isPerfMode ? `${extractFirstFloat(specs.batteryPack) ?? 100} kWh Track` : formatBatteryKwh(specs.batteryPack)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Key Standard Offerings Preview */}
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="truncate">{specs.brakingSystem.split('+')[0].trim()} & {specs.suspension.split('(')[0].trim()}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="truncate">{specs.safetyRatingAndAirbags}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="truncate">{specs.warrantyBatteryDrive}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-blue-900/60 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">Real US Base MSRP</div>
                      <div className="text-base font-bold font-mono text-white tabular-nums">
                        ${vehicle.basePrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-blue-300 tabular-nums">
                        +${(vehicle.destinationFee ?? 1640).toLocaleString()} Dest · 20% Adv: ${Math.round(vehicle.basePrice * 0.20).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDossier(vehicle)}
                        className="px-3 py-2 rounded-xl bg-[#040a18] hover:bg-[#0d2044] border border-blue-700/60 text-blue-100 text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Full Specs
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectVehicleToOrder(vehicle)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer font-mono whitespace-nowrap shrink-0"
                      >
                        {vehicle.isFlyingCar ? 'Pre-Order' : 'Order'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comprehensive Real-Car Standard Offerings Summary Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#1a0b18] border border-blue-500/40 shadow-2xl space-y-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-blue-900/60">
            <div>
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                Standard Across Every Vehicle Delivery
              </span>
              <h3 className="font-display font-black text-2xl text-white mt-1">
                Complete Real-Car Systems & Included Equipment
              </h3>
            </div>
            <span className="text-xs font-mono text-blue-300">
              Turnkey Road, Climate, Safety & Ownership Readiness
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-mono font-bold">
                <Gauge className="w-4 h-4 text-red-400" />
                <span>Drivetrain & Chassis</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>· Dual / Tri-Motor Torque Vectoring AWD</li>
                <li>· 4-Piston / Carbon-Ceramic Braking + ABS & ESC</li>
                <li>· Adaptive Air / Damper Suspension</li>
                <li>· Direct TPMS & Emergency Tire Mobility Kit</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-mono font-bold">
                <BatteryCharging className="w-4 h-4 text-red-400" />
                <span>Battery & Supercharging</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>· 81–210 kWh High-Density Structural Pack</li>
                <li>· 250–350 kW V3/V4 Supercharger Network</li>
                <li>· Mobile Connector (NEMA 5-15/14-50) + J1772</li>
                <li>· Octovalve Heat Pump Winter Thermal Prep</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-mono font-bold">
                <Armchair className="w-4 h-4 text-red-400" />
                <span>Cabin, Comfort & Media</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>· 15.4"–18.5" Primary OLED + Rear Display</li>
                <li>· Heated & Ventilated Seats + Heated Steering</li>
                <li>· HEPA Bioweapon Defense Medical Filtration</li>
                <li>· Dual Qi Wireless Pads, 65W USB-C & All-Weather Mats</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-mono font-bold">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Safety, Keys & Warranty</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>· HW4 AI4 8-Camera 360° Vision + AEB + Blind Spot</li>
                <li>· 8–12 Airbags, ISOFIX/LATCH & Sentry Dashcam</li>
                <li>· 2x NFC Key Cards + Smartphone UWB Phone Key</li>
                <li>· 4-Yr/50k Vehicle & 8-Yr/150k Battery Warranty</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section Advance CTA */}
        <div className="mt-8 pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Next in Sequence: Direct Tesla Equity & Treasury Desk
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSelectPage) onSelectPage('shares');
              else document.querySelector('#shares')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-600/25 border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Advance to 05 · TSLA Shares & Equity</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Full Vehicle Engineering & Real-Car Equipment Dossier Modal */}
      {inspectedVehicle && inspectedSpecs && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn"
          onClick={() => setInspectedVehicle(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dossier Header */}
            <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-md">
                  {inspectedVehicle.isFlyingCar ? (
                    <Wind className="w-5 h-5 text-white" />
                  ) : (
                    <Zap className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-white">
                    {inspectedVehicle.name}
                  </h3>
                  <p className="text-xs font-mono text-blue-200/80">
                    {inspectedVehicle.modelCode} · Full Performance & Real-Car Equipment Dossier
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedVehicle(null)}
                aria-label="Close vehicle specifications"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Preview Banner + Category Tabs */}
            <div className="p-5 border-b border-blue-900/60 bg-[#040a18]/70 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-5 relative aspect-[16/9] rounded-xl overflow-hidden bg-[#08142b] border border-blue-900/60">
                  <img
                    src={inspectedVehicle.image}
                    alt={inspectedVehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex justify-between text-[11px] font-mono text-white tabular-nums">
                    <span>{inspectedVehicle.acceleration}</span>
                    <span className="text-blue-300">${inspectedVehicle.basePrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2.5">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                    {inspectedVehicle.description}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums pt-1">
                    <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Peak Output</span>
                      <span className="text-emerald-300 font-bold">
                        {inspectedSpecs.horsepower.split('(')[0].trim()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Top Speed</span>
                      <span className="text-white font-bold">{inspectedVehicle.topSpeed}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Range</span>
                      <span className="text-blue-300 font-bold">{inspectedVehicle.range}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dossier Section Switcher */}
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'performance', label: 'High Performance', icon: Gauge },
                    { id: 'battery', label: 'Battery & Supercharging', icon: BatteryCharging },
                    { id: 'interior', label: 'Cabin, Audio & Climate', icon: Armchair },
                    { id: 'essentials', label: 'Real-Car Checklist & Cargo', icon: Wrench },
                    { id: 'safety', label: 'Safety, FSD & Warranty', icon: ShieldCheck },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = dossierTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDossierTab(tab.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 border-blue-400/60 text-white'
                          : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:text-white hover:border-blue-500/50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dossier Tab Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {dossierTab === 'performance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Peak Horsepower</span>
                      <span className="text-white font-bold mt-0.5 block">{inspectedSpecs.horsepower}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Instant Torque</span>
                      <span className="text-blue-300 font-bold mt-0.5 block">{inspectedSpecs.torque}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">1/4 Mile Sprint</span>
                      <span className="text-emerald-400 font-bold mt-0.5 block">{inspectedSpecs.quarterMile}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Drag Coefficient</span>
                      <span className="text-white font-bold mt-0.5 block">{inspectedSpecs.dragCoefficient}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Braking System & Regeneration</span>
                      <span className="text-slate-100 font-semibold mt-0.5 block">{inspectedSpecs.brakingSystem}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Suspension & Dynamics</span>
                      <span className="text-slate-100 font-semibold mt-0.5 block">{inspectedSpecs.suspension}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2">
                    <div className="text-xs font-mono font-bold text-red-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Engineering Highlights</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {inspectedSpecs.performanceHighlights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {dossierTab === 'battery' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Battery Pack Chemistry & Capacity</span>
                    <span className="text-white font-bold mt-1 block">{inspectedSpecs.batteryPack}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">High-Voltage Architecture</span>
                    <span className="text-blue-300 font-bold mt-1 block">{inspectedSpecs.architectureVoltage}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Peak Supercharger Input</span>
                    <span className="text-red-300 font-bold mt-1 block">{inspectedSpecs.superchargingPeak}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">15-Minute Fast Charge Gain</span>
                    <span className="text-emerald-400 font-bold mt-1 block">{inspectedSpecs.charge15MinMiles}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Powertrain & Thermal System</span>
                    <span className="text-slate-100 font-semibold mt-1 block">
                      {inspectedVehicle.powertrain} · Integrated Octovalve Heat Pump & Active Pre-Conditioning
                    </span>
                  </div>
                </div>
              )}

              {dossierTab === 'interior' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Cockpit Displays & Controls</span>
                    <span className="text-white font-bold mt-1 block">{inspectedSpecs.infotainmentDisplay}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Acoustic Audio Architecture</span>
                    <span className="text-blue-300 font-bold mt-1 block">{inspectedSpecs.audioSystem}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Seating Configuration</span>
                    <span className="text-slate-100 font-semibold mt-1 block">{inspectedSpecs.seatingCapacity}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Climate & HEPA Filtration</span>
                    <span className="text-slate-100 font-semibold mt-1 block">{inspectedSpecs.climateFiltration}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Exterior Lighting & Acoustic Glass</span>
                    <span className="text-slate-100 font-semibold mt-1 block">{inspectedSpecs.lightingAndGlass}</span>
                  </div>
                </div>
              )}

              {dossierTab === 'essentials' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Total Cargo & Frunk</span>
                      <span className="text-white font-bold mt-0.5 block">{inspectedSpecs.cargoCapacity}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Towing Rating</span>
                      <span className="text-blue-300 font-bold mt-0.5 block">{inspectedSpecs.towingCapacity}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60">
                      <span className="text-slate-400 block text-[11px]">Curb Weight & Ride Height</span>
                      <span className="text-slate-200 font-bold mt-0.5 block">
                        {inspectedSpecs.curbWeight} · {inspectedSpecs.groundClearance}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-3">
                      <span className="text-slate-400 block text-[11px]">Standard Wheels & OEM Performance Tires</span>
                      <span className="text-slate-100 font-semibold mt-0.5 block">{inspectedSpecs.wheelsAndTires}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/60 space-y-2.5">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      Complete Included Real-Car Essentials Checklist
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                      {inspectedSpecs.standardEquipmentChecklist.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {dossierTab === 'safety' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Active Safety & Autopilot Hardware</span>
                    <span className="text-white font-bold mt-1 block">{inspectedSpecs.autopilotHardware}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Crash Rating, Restraints & Airbags</span>
                    <span className="text-emerald-300 font-bold mt-1 block">{inspectedSpecs.safetyRatingAndAirbags}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Basic Vehicle Warranty</span>
                    <span className="text-blue-200 font-bold mt-1 block">{inspectedSpecs.warrantyVehicle}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                    <span className="text-slate-400 block text-[11px]">Battery & Drive Unit Warranty</span>
                    <span className="text-red-300 font-bold mt-1 block">{inspectedSpecs.warrantyBatteryDrive}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dossier Footer */}
            <div className="p-5 border-t border-blue-900/60 bg-[#040a18] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-300 tabular-nums">
                Delivery Window: <strong className="text-white">{inspectedVehicle.deliveryEstimate}</strong> · 20% Advance Deposit: ${Math.round(inspectedVehicle.basePrice * 0.20).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInspectedVehicle(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-800/70 text-slate-300 hover:text-white text-xs font-mono cursor-pointer whitespace-nowrap"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectedVehicle;
                    setInspectedVehicle(null);
                    onSelectVehicleToOrder(target);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs font-mono shadow-lg cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure Trim & Reserve Vehicle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

