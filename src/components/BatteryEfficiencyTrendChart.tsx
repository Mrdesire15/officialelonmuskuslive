import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BatteryCharging, Flame, LineChart, RotateCcw, ShieldCheck } from 'lucide-react';
import { TeslaVehicle, VehicleDetailedSpecs } from '../types';
import { getVehicleDetailedSpecs } from '../data/teslaVehicles';

export type TrendMetricMode = 'health' | 'range' | 'efficiency';

interface VehicleTrendPoint {
  year: number;
  miles: number;
  sohPct: number;
  estRangeMiles: number;
  miPerKwh: number;
  whPerMi: number;
}

interface VehicleTrendSeries {
  vehicle: TeslaVehicle;
  specs: VehicleDetailedSpecs;
  color: string;
  isPerfMode: boolean;
  chemistryLabel: string;
  warrantyMiles: number;
  points: VehicleTrendPoint[];
}

interface BatteryEfficiencyTrendChartProps {
  vehicles: TeslaVehicle[];
  selectedVehicleIds: string[];
  onToggleVehicleId: (vehicleId: string) => void;
  onSyncWithCompare?: () => void;
  performanceModeByVehicle: Record<string, boolean>;
}

const SERIES_COLORS = [
  '#38bdf8', // sky-400
  '#f87171', // red-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#c084fc', // purple-400
  '#22d3ee', // cyan-400
  '#fb7185', // rose-400
  '#a3e635', // lime-400
];

const extractFloat = (raw: string): number | null => {
  const match = raw.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

const buildVehicleTrendSeries = (
  vehicle: TeslaVehicle,
  colorIndex: number,
  isPerfMode: boolean
): VehicleTrendSeries => {
  const specs = getVehicleDetailedSpecs(vehicle);
  const baseRange = extractFloat(vehicle.range) ?? 320;
  const effectiveBaseRange = isPerfMode ? Math.round(baseRange * 0.84) : Math.round(baseRange);
  const batteryKwh = extractFloat(specs.batteryPack) ?? 100;
  const warrantyMiles = specs.warrantyBatteryDrive.includes('150,000') ? 150000 : 120000;

  const is4680 = specs.batteryPack.includes('4680');
  const isPlaid =
    vehicle.name.toLowerCase().includes('plaid') ||
    vehicle.name.toLowerCase().includes('cyberbeast');

  const chemistryLabel = is4680 ? '4680 Structural' : 'High-Density NCA';
  const initialDrop = is4680 ? 1.35 : isPlaid ? 1.7 : 1.5;
  const annualSlope =
    (is4680 ? 0.62 : isPlaid ? 0.78 : 0.7) + (isPerfMode ? 0.14 : 0);

  const points: VehicleTrendPoint[] = Array.from({ length: 9 }, (_, year) => {
    const sohPct =
      year === 0
        ? 100.0
        : Number(
            Math.max(
              78,
              100 - (initialDrop * (1 - Math.exp(-year * 1.15)) + annualSlope * year)
            ).toFixed(1)
          );
    const estRangeMiles = Math.round(effectiveBaseRange * (sohPct / 100));
    const miPerKwh = Number((estRangeMiles / Math.max(1, batteryKwh)).toFixed(2));
    const whPerMi = Math.round((batteryKwh * 1000) / Math.max(1, estRangeMiles));
    const miles = Math.round((warrantyMiles / 8) * year);

    return {
      year,
      miles,
      sohPct,
      estRangeMiles,
      miPerKwh,
      whPerMi,
    };
  });

  return {
    vehicle,
    specs,
    color: SERIES_COLORS[colorIndex % SERIES_COLORS.length],
    isPerfMode,
    chemistryLabel,
    warrantyMiles,
    points,
  };
};

export const BatteryEfficiencyTrendChart: React.FC<BatteryEfficiencyTrendChartProps> = ({
  vehicles,
  selectedVehicleIds,
  onToggleVehicleId,
  onSyncWithCompare,
  performanceModeByVehicle,
}) => {
  const [metricMode, setMetricMode] = useState<TrendMetricMode>('health');
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(760);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Responsive container width tracking via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const next = Math.max(300, Math.floor(el.getBoundingClientRect().width));
      setContainerWidth(next);
    };

    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const activeSeriesList = useMemo(() => {
    const chosen = vehicles.filter((v) => selectedVehicleIds.includes(v.id));
    const list = chosen.length > 0 ? chosen : vehicles.slice(0, 2);
    return list.map((vehicle) => {
      const stableIdx = Math.max(
        0,
        vehicles.findIndex((item) => item.id === vehicle.id)
      );
      return buildVehicleTrendSeries(
        vehicle,
        stableIdx,
        !!performanceModeByVehicle[vehicle.id]
      );
    });
  }, [vehicles, selectedVehicleIds, performanceModeByVehicle]);

  const chartHeight = containerWidth < 520 ? 270 : 320;
  const margin = useMemo(
    () => ({
      top: 18,
      right: containerWidth < 520 ? 18 : 26,
      bottom: 40,
      left: containerWidth < 520 ? 46 : 56,
    }),
    [containerWidth]
  );

  // Render interactive D3.js line chart
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || activeSeriesList.length === 0) return;

    const innerWidth = Math.max(180, containerWidth - margin.left - margin.right);
    const innerHeight = Math.max(140, chartHeight - margin.top - margin.bottom);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 8]).range([0, innerWidth]);

    const getValue = (pt: VehicleTrendPoint): number => {
      if (metricMode === 'health') return pt.sohPct;
      if (metricMode === 'range') return pt.estRangeMiles;
      return pt.miPerKwh;
    };

    const allValues = activeSeriesList.flatMap((s) => s.points.map(getValue));
    let yMin: number;
    let yMax: number;

    if (metricMode === 'health') {
      yMin = 68;
      yMax = 101;
    } else if (metricMode === 'range') {
      const minVal = d3.min(allValues) ?? 220;
      const maxVal = d3.max(allValues) ?? 420;
      yMin = Math.max(0, Math.floor((minVal - 25) / 20) * 20);
      yMax = Math.ceil((maxVal + 20) / 20) * 20;
    } else {
      const minVal = d3.min(allValues) ?? 2.0;
      const maxVal = d3.max(allValues) ?? 4.2;
      yMin = Math.max(0, Math.floor((minVal - 0.3) * 10) / 10);
      yMax = Math.ceil((maxVal + 0.3) * 10) / 10;
    }

    const yScale = d3.scaleLinear().domain([yMin, yMax]).nice().range([innerHeight, 0]);

    // Subtle horizontal gridlines
    const yTicks = yScale.ticks(5);
    g.append('g')
      .attr('class', 'grid-y')
      .selectAll('line')
      .data(yTicks)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', 'rgba(59, 130, 246, 0.16)')
      .attr('stroke-dasharray', '3,4');

    // Vertical year tick gridlines
    const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    g.append('g')
      .attr('class', 'grid-x')
      .selectAll('line')
      .data(xTicks)
      .join('line')
      .attr('x1', (d) => xScale(d))
      .attr('x2', (d) => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(59, 130, 246, 0.09)');

    // 70% Warranty Replacement Floor threshold line in Health mode
    if (metricMode === 'health') {
      const floorY = yScale(70);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', floorY)
        .attr('y2', floorY)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.25)
        .attr('stroke-dasharray', '5,4')
        .attr('opacity', 0.8);

      g.append('text')
        .attr('x', innerWidth - 4)
        .attr('y', floorY - 5)
        .attr('text-anchor', 'end')
        .attr('fill', '#fca5a5')
        .attr('font-size', '10px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .text('70% Warranty Threshold');
    }

    // X-Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(containerWidth < 460 ? [0, 2, 4, 6, 8] : xTicks)
      .tickFormat((d) => `Yr ${Number(d)}`);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('path, line').attr('stroke', 'rgba(96, 165, 250, 0.35)');
    xAxisGroup
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Y-Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        if (metricMode === 'health') return `${Number(d)}%`;
        if (metricMode === 'range') return `${Number(d)} mi`;
        return `${Number(d).toFixed(1)}`;
      });

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('path, line').attr('stroke', 'rgba(96, 165, 250, 0.35)');
    yAxisGroup
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace');

    // Y-Axis unit label
    g.append('text')
      .attr('x', 4)
      .attr('y', -6)
      .attr('fill', '#93c5fd')
      .attr('font-size', '9.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text(
        metricMode === 'health'
          ? 'Battery State of Health (% SoH)'
          : metricMode === 'range'
          ? 'Projected Driving Range (Miles)'
          : 'Pack Efficiency (mi / kWh)'
      );

    // Line & subtle area generators
    const defs = svg.append('defs');

    activeSeriesList.forEach((series) => {
      const areaGradId = `area-grad-${series.vehicle.id}`;
      const grad = defs
        .append('linearGradient')
        .attr('id', areaGradId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', series.color)
        .attr('stop-opacity', 0.16);
      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', series.color)
        .attr('stop-opacity', 0.0);

      const areaGen = d3
        .area<VehicleTrendPoint>()
        .x((d) => xScale(d.year))
        .y0(innerHeight)
        .y1((d) => yScale(getValue(d)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(series.points)
        .attr('d', areaGen)
        .attr('fill', `url(#${areaGradId})`);

      const lineGen = d3
        .line<VehicleTrendPoint>()
        .x((d) => xScale(d.year))
        .y((d) => yScale(getValue(d)))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(series.points)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', series.isPerfMode ? '6,3' : '')
        .attr('d', lineGen);

      // Data points
      g.selectAll(`.dot-${series.vehicle.id}`)
        .data(series.points)
        .join('circle')
        .attr('cx', (d) => xScale(d.year))
        .attr('cy', (d) => yScale(getValue(d)))
        .attr('r', (d) => (hoverYear === d.year ? 5.2 : 3))
        .attr('fill', series.color)
        .attr('stroke', '#040a18')
        .attr('stroke-width', 1.5);
    });

    // Active hover vertical guide line
    if (hoverYear !== null) {
      g.append('line')
        .attr('x1', xScale(hoverYear))
        .attr('x2', xScale(hoverYear))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', 'rgba(226, 232, 240, 0.45)')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');
    }

    // Transparent pointer capture overlay for smooth desktop & touch scrubbing
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove touchmove', (event: MouseEvent | TouchEvent) => {
        const [mx] = d3.pointer(event);
        const yearEstimate = Math.round(xScale.invert(mx));
        const clamped = Math.max(0, Math.min(8, yearEstimate));
        setHoverYear(clamped);
      })
      .on('mouseleave', () => {
        setHoverYear(null);
      });
  }, [activeSeriesList, metricMode, hoverYear, containerWidth, chartHeight, margin]);

  const activeInspectionYear = hoverYear ?? 8;

  return (
    <div className="mb-14 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#11122a] border border-blue-500/45 shadow-2xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-blue-900/60 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <span>D3.js Lifecycle Telemetry · Years 0–8 (Warranty Horizon)</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              Battery Health &amp; Efficiency Trends Over Time
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              Select vehicle models below to compare projected 8-year pack retention (% SoH), driving range curves, and mi/kWh efficiency. Toggling <strong className="text-white">Performance Mode</strong> on any card dynamically updates its dashed track curve.
            </p>
          </div>

          {/* Metric View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#040a18] border border-blue-900/60 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setMetricMode('health')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                metricMode === 'health'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              % Battery Health
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('range')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                metricMode === 'range'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Est. Range (mi)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('efficiency')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                metricMode === 'efficiency'
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              mi / kWh Efficiency
            </button>
          </div>
        </div>

        {/* Interactive Model Selection Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {vehicles.map((vehicle, idx) => {
              const isSelected = selectedVehicleIds.includes(vehicle.id);
              const color = SERIES_COLORS[idx % SERIES_COLORS.length];
              const isPerf = !!performanceModeByVehicle[vehicle.id];
              const shortTitle = vehicle.name.replace(/^20\d{2}\s+Tesla\s+/i, '');

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => onToggleVehicleId(vehicle.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0c1d3d] border-blue-400/75 text-white font-bold shadow-sm'
                      : 'bg-[#040a18] border-blue-900/60 text-slate-400 hover:text-slate-200 hover:border-blue-700/70'
                  }`}
                >
                  <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 10 10" aria-hidden="true">
                    <circle
                      cx="5"
                      cy="5"
                      r="4"
                      fill={isSelected ? color : '#475569'}
                    />
                  </svg>
                  <span>{shortTitle}</span>
                  {isPerf && <Flame className="w-3 h-3 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {onSyncWithCompare && (
            <button
              type="button"
              onClick={onSyncWithCompare}
              className="px-3 py-1.5 rounded-lg bg-[#040a18] hover:bg-[#0d2044] border border-blue-800/70 text-blue-200 hover:text-white text-[11px] font-mono flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3 h-3 text-blue-400" />
              <span>Sync Compare Models</span>
            </button>
          )}
        </div>
      </div>

      {/* D3 SVG Visualization + Live Year Inspection Readout */}
      <div className="p-4 sm:p-6 space-y-5">
        <div
          ref={containerRef}
          className="w-full rounded-2xl bg-[#040a18]/90 border border-blue-900/60 p-3 sm:p-4"
        >
          <svg
            ref={svgRef}
            width={containerWidth}
            height={chartHeight}
            className="w-full overflow-visible select-none"
            role="img"
            aria-label="D3.js line chart of Battery Health and Efficiency trends over 8 years"
          />
        </div>

        {/* Live Telemetry Readout Cards at Active Scrubbed Year (defaults to Year 8 horizon) */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <span className="text-blue-200 font-bold flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span>
                {hoverYear !== null
                  ? `Inspected Milestone: Year ${activeInspectionYear} Snapshot`
                  : `Year ${activeInspectionYear} End-of-Warranty Projection (Hover or tap chart to scrub Years 0–8)`}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solid line = EPA Baseline · Dashed = Performance Mode</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeSeriesList.map((series) => {
              const point =
                series.points.find((p) => p.year === activeInspectionYear) ||
                series.points[series.points.length - 1];
              const shortTitle = series.vehicle.name.replace(/^20\d{2}\s+Tesla\s+/i, '');

              return (
                <div
                  key={`readout-${series.vehicle.id}`}
                  className="p-3.5 rounded-2xl bg-[#040a18]/90 border border-blue-900/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 10 10" aria-hidden="true">
                        <circle cx="5" cy="5" r="4" fill={series.color} />
                      </svg>
                      <span className="text-xs font-bold text-white truncate">
                        {shortTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                      ~{Math.round(point.miles / 1000)}k mi
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono tabular-nums pt-1 border-t border-blue-900/50">
                    <div>
                      <span className="text-slate-400 block text-[9px]">Health</span>
                      <span className="text-emerald-300 font-bold">{point.sohPct}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Est. Range</span>
                      <span className="text-white font-bold">{point.estRangeMiles} mi</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">Efficiency</span>
                      <span className="text-blue-200 font-bold">{point.miPerKwh} mi/kWh</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
