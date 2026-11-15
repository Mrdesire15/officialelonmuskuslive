import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import worldAtlasRaw from 'world-atlas/countries-110m.json';
import {
  Activity,
  Compass,
  ShieldCheck,
  Sparkles,
  MapPin,
} from 'lucide-react';
import {
  CHARITY_NGO_SECTIONS,
  CONTINENT_RELIEF_HUBS,
  CRISIS_COUNTRIES,
} from '../data/charityData';
import {
  CharityDonationRequest,
  CharitySupportRequest,
  ContinentReliefHub,
  CrisisCountry,
} from '../types';

interface WorldCountryProperties {
  name?: string;
}

interface HoveredGlobeTarget {
  countryName: string;
  isoId?: string;
  continentRegion: CrisisCountry['region'];
  continentHub: ContinentReliefHub;
  crisisCountry?: CrisisCountry;
  coords: [number, number];
}

interface CharityReliefGlobeProps {
  selectedCountryId: string;
  regionFilter: string;
  onSelectCountry: (countryId: string) => void;
  onSelectRegion: (region: string) => void;
  donations: CharityDonationRequest[];
  supportRequests: CharitySupportRequest[];
}

const HUB_DISPATCH_COORDS: [number, number] = [-97.74, 30.27]; // Starbase / Austin Operations Hub
const GLOBE_SIZE = 520;
const BASE_SCALE = 228;

// Map geographic centroid [lon, lat] & country name to our 5 continental humanitarian regions
function resolveContinentRegion(
  lon: number,
  lat: number,
  name: string,
  isoId?: string
): CrisisCountry['region'] {
  if (isoId) {
    const matchedCrisis = CRISIS_COUNTRIES.find((c) => c.isoNumeric === isoId);
    if (matchedCrisis && matchedCrisis.region !== 'Global') {
      return matchedCrisis.region;
    }
  }

  const lower = name.toLowerCase();
  const middleEastNames = [
    'saudi',
    'oman',
    'uae',
    'united arab',
    'qatar',
    'kuwait',
    'jordan',
    'israel',
    'palestine',
    'syria',
    'lebanon',
    'iraq',
    'iran',
    'yemen',
    'turkey',
    'egypt',
  ];
  if (middleEastNames.some((k) => lower.includes(k))) {
    return 'Middle East';
  }

  if (lon < -28) return 'Americas';
  if (lat >= 35 && lon >= -25 && lon <= 62) return 'Europe & Eurasia';
  if (lon >= 34 && lon <= 62 && lat >= 12 && lat < 38) return 'Middle East';
  if (lon >= -20 && lon <= 54 && lat >= -38 && lat < 38) return 'Africa';
  return 'Asia-Pacific';
}

export const CharityReliefGlobe: React.FC<CharityReliefGlobeProps> = ({
  selectedCountryId,
  regionFilter,
  onSelectCountry,
  onSelectRegion,
  donations,
  supportRequests,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rotationRef = useRef<[number, number, number]>([-22, -20, 0]);
  const scaleRef = useRef<number>(BASE_SCALE);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveringGlobeRef = useRef<boolean>(false);
  const animTimerRef = useRef<d3.Timer | null>(null);

  const [hoveredTarget, setHoveredTarget] = useState<HoveredGlobeTarget | null>(null);
  const [renderTick, setRenderTick] = useState<number>(0);

  // Parse local bundled TopoJSON into GeoJSON country features once
  const worldCountries = useMemo(() => {
    const topology = worldAtlasRaw as unknown as Topology<{
      countries: GeometryCollection<WorldCountryProperties>;
    }>;
    const fc = feature(topology, topology.objects.countries) as FeatureCollection<
      Geometry,
      WorldCountryProperties
    >;
    return fc.features;
  }, []);

  const crisisByIso = useMemo(() => {
    const map = new Map<string, CrisisCountry>();
    CRISIS_COUNTRIES.forEach((c) => {
      if (c.isoNumeric) {
        map.set(String(c.isoNumeric), c);
      }
    });
    return map;
  }, []);

  const selectedCountry = useMemo(
    () => CRISIS_COUNTRIES.find((c) => c.id === selectedCountryId) || CRISIS_COUNTRIES[0],
    [selectedCountryId]
  );

  const hubByRegion = useMemo(() => {
    const map = new Map<string, ContinentReliefHub>();
    CONTINENT_RELIEF_HUBS.forEach((h) => map.set(h.region, h));
    return map;
  }, []);

  // Smooth animated rotation helper when clicking country cards or continent hubs
  const animateGlobeTo = (targetCoords: [number, number], targetZoom?: number) => {
    if (animTimerRef.current) {
      animTimerRef.current.stop();
      animTimerRef.current = null;
    }

    const startRot: [number, number, number] = [...rotationRef.current];
    const endRot: [number, number, number] = [-targetCoords[0], -Math.max(-55, Math.min(55, targetCoords[1])), 0];
    const interpolateRot = d3.interpolateArray(startRot, endRot);
    const startScale = scaleRef.current;
    const endScale = targetZoom ? BASE_SCALE * targetZoom : scaleRef.current;
    const duration = 680;

    const timer = d3.timer((elapsed) => {
      const t = Math.min(1, elapsed / duration);
      const eased = d3.easeCubicOut(t);
      const next = interpolateRot(eased);
      rotationRef.current = [next[0], next[1], next[2] ?? 0];
      scaleRef.current = startScale + (endScale - startScale) * eased;
      setRenderTick((tick) => (tick + 1) % 1000000);
      if (t >= 1) {
        timer.stop();
        animTimerRef.current = null;
      }
    });
    animTimerRef.current = timer;
  };

  // Smoothly focus globe when user picks a specific country outside the globe
  useEffect(() => {
    if (selectedCountry?.coordinates) {
      animateGlobeTo(selectedCountry.coordinates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  // Smoothly focus globe when user clicks a continent filter
  useEffect(() => {
    if (regionFilter && regionFilter !== 'All') {
      const hub = hubByRegion.get(regionFilter);
      if (hub) {
        animateGlobeTo(hub.centerCoords);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionFilter]);

  // Gentle auto-rotation timer
  useEffect(() => {
    const timer = d3.timer(() => {
      if (!isDraggingRef.current && !isHoveringGlobeRef.current && !animTimerRef.current) {
        rotationRef.current = [
          rotationRef.current[0] + 0.16,
          rotationRef.current[1],
          rotationRef.current[2],
        ];
        setRenderTick((tick) => (tick + 1) % 1000000);
      }
    });
    return () => {
      timer.stop();
    };
  }, []);

  // Attach D3 drag behavior onto the SVG
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svgSelection = d3.select(svgEl);
    const dragBehavior = d3
      .drag<SVGSVGElement, unknown>()
      .on('start', () => {
        isDraggingRef.current = true;
        if (animTimerRef.current) {
          animTimerRef.current.stop();
          animTimerRef.current = null;
        }
      })
      .on('drag', (event) => {
        const sensitivity = 75 / scaleRef.current;
        const [lambda, phi, gamma] = rotationRef.current;
        const nextPhi = Math.max(-72, Math.min(72, phi - event.dy * sensitivity));
        rotationRef.current = [lambda + event.dx * sensitivity, nextPhi, gamma];
        setRenderTick((tick) => (tick + 1) % 1000000);
      })
      .on('end', () => {
        isDraggingRef.current = false;
      });

    svgSelection.call(dragBehavior);
    return () => {
      svgSelection.on('.drag', null);
    };
  }, []);


  // D3 Orthographic projection for the current render tick
  const projection = useMemo(() => {
    void renderTick;
    return d3
      .geoOrthographic()
      .scale(scaleRef.current)
      .translate([GLOBE_SIZE / 2, GLOBE_SIZE / 2])
      .clipAngle(90)
      .rotate(rotationRef.current);
  }, [renderTick]);

  const pathGenerator = useMemo(() => d3.geoPath(projection), [projection]);
  const graticulePath = useMemo(() => pathGenerator(d3.geoGraticule10()) || '', [pathGenerator]);
  const spherePath = useMemo(() => pathGenerator({ type: 'Sphere' }) || '', [pathGenerator]);

  // Current visible hemisphere center in lon/lat for dot/arc occlusion checks
  const visibleCenter: [number, number] = [-rotationRef.current[0], -rotationRef.current[1]];

  const handleCountryHover = (feat: Feature<Geometry, WorldCountryProperties>) => {
    const isoId = feat.id !== undefined ? String(feat.id).padStart(3, '0') : undefined;
    const rawId = feat.id !== undefined ? String(feat.id) : undefined;
    const matchedCrisis =
      (rawId ? crisisByIso.get(rawId) : undefined) ||
      (isoId ? crisisByIso.get(isoId) : undefined);

    const countryName = matchedCrisis?.name || feat.properties?.name || 'International Territory';
    const centroid = d3.geoCentroid(feat);
    const coords: [number, number] = matchedCrisis?.coordinates || [
      Number.isFinite(centroid[0]) ? centroid[0] : 0,
      Number.isFinite(centroid[1]) ? centroid[1] : 0,
    ];
    const continentRegion =
      matchedCrisis?.region || resolveContinentRegion(coords[0], coords[1], countryName, rawId);
    const continentHub =
      hubByRegion.get(continentRegion) || CONTINENT_RELIEF_HUBS[0];

    setHoveredTarget({
      countryName,
      isoId: rawId,
      continentRegion,
      continentHub,
      crisisCountry: matchedCrisis,
      coords,
    });
  };

  const handleCountryClick = (feat: Feature<Geometry, WorldCountryProperties>) => {
    const isoId = feat.id !== undefined ? String(feat.id).padStart(3, '0') : undefined;
    const rawId = feat.id !== undefined ? String(feat.id) : undefined;
    const matchedCrisis =
      (rawId ? crisisByIso.get(rawId) : undefined) ||
      (isoId ? crisisByIso.get(isoId) : undefined);

    if (matchedCrisis) {
      onSelectCountry(matchedCrisis.id);
      return;
    }

    const countryName = feat.properties?.name || '';
    const centroid = d3.geoCentroid(feat);
    const coords: [number, number] = [
      Number.isFinite(centroid[0]) ? centroid[0] : 0,
      Number.isFinite(centroid[1]) ? centroid[1] : 0,
    ];
    const continentRegion = resolveContinentRegion(coords[0], coords[1], countryName, rawId);
    onSelectRegion(continentRegion);
  };

  // Active intelligence target displayed in the side dossier (hovered takes priority, falls back to selected)
  const activeDisplayCountry: CrisisCountry | undefined =
    hoveredTarget?.crisisCountry || (!hoveredTarget ? selectedCountry : undefined);

  const activeRegionKey =
    hoveredTarget?.continentRegion ||
    (regionFilter !== 'All' ? (regionFilter as CrisisCountry['region']) : selectedCountry.region);

  const activeContinentHub =
    hoveredTarget?.continentHub ||
    hubByRegion.get(activeRegionKey) ||
    CONTINENT_RELIEF_HUBS[0];

  const activeContinentCountries = useMemo(
    () =>
      CRISIS_COUNTRIES.filter((c) =>
        activeRegionKey === 'Global' ? c.id !== 'global-all' : c.region === activeRegionKey
      ),
    [activeRegionKey]
  );

  const activeNgo = useMemo(() => {
    if (!activeDisplayCountry) return null;
    return (
      CHARITY_NGO_SECTIONS.find((n) => n.id === activeDisplayCountry.activeNgoSectionId) ||
      CHARITY_NGO_SECTIONS[0]
    );
  }, [activeDisplayCountry]);

  const targetDonationStats = useMemo(() => {
    if (!activeDisplayCountry) {
      const regionIds = new Set(activeContinentCountries.map((c) => c.id));
      const regionDonations = donations.filter((d) => regionIds.has(d.countryId));
      const regionSupport = supportRequests.filter((s) => regionIds.has(s.countryId));
      return {
        donationCount: regionDonations.length,
        donationTotal: regionDonations.reduce((acc, d) => acc + d.amountUsd, 0),
        supportCount: regionSupport.length,
      };
    }

    const matchingDonations =
      activeDisplayCountry.id === 'global-all'
        ? donations
        : donations.filter((d) => d.countryId === activeDisplayCountry.id);
    const matchingSupport =
      activeDisplayCountry.id === 'global-all'
        ? supportRequests
        : supportRequests.filter((s) => s.countryId === activeDisplayCountry.id);

    return {
      donationCount: matchingDonations.length,
      donationTotal: matchingDonations.reduce((acc, d) => acc + d.amountUsd, 0),
      supportCount: matchingSupport.length,
    };
  }, [activeDisplayCountry, activeContinentCountries, donations, supportRequests]);

  // Precompute projected supply arc paths from Elon Musk Global Dispatch Hub to visible active nations
  const supplyArcs = useMemo(() => {
    const visibleTargets = CRISIS_COUNTRIES.filter((c) => {
      if (!c.coordinates || c.id === 'global-all') return false;
      if (regionFilter !== 'All' && regionFilter !== 'Global' && c.region !== regionFilter) {
        return c.id === selectedCountryId || c.id === hoveredTarget?.crisisCountry?.id;
      }
      return true;
    });

    return visibleTargets
      .map((c) => {
        const coords = c.coordinates!;
        const isFront = d3.geoDistance(coords, visibleCenter) < Math.PI / 2;
        if (!isFront && c.id !== selectedCountryId && c.id !== hoveredTarget?.crisisCountry?.id) {
          return null;
        }
        const geoLine: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [HUB_DISPATCH_COORDS, coords],
          },
        };
        const d = pathGenerator(geoLine);
        if (!d) return null;
        const isHighlighted =
          c.id === selectedCountryId || c.id === hoveredTarget?.crisisCountry?.id;
        return { id: c.id, d, isHighlighted };
      })
      .filter((item): item is { id: string; d: string; isHighlighted: boolean } => item !== null);
  }, [pathGenerator, regionFilter, selectedCountryId, hoveredTarget, visibleCenter]);

  return (
    <div className="rounded-2xl bg-[#040b1b] border border-blue-500/40 overflow-hidden shadow-xl">
      {/* Main 3D Globe + Live Hover Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Left: Interactive D3 Orthographic 3D SVG Canvas */}
        <div
          className="lg:col-span-7 relative flex flex-col items-center justify-center p-3 sm:p-4 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),rgba(4,10,24,0.98)_72%)] border-b lg:border-b-0 lg:border-r border-blue-900/60"
          onMouseEnter={() => {
            isHoveringGlobeRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveringGlobeRef.current = false;
            setHoveredTarget(null);
          }}
        >
          {/* Floating Live Hover Readout Pill */}
          <div className="w-full flex items-center justify-between gap-2 mb-1 px-1 text-[10px] font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>War Relief</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Anti-Terror Aid</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Recovery</span>
              </span>
            </div>
            <span className="text-blue-300 tabular-nums hidden sm:inline">
              {hoveredTarget
                ? `Inspecting: ${hoveredTarget.countryName}`
                : `Focused: ${selectedCountry.name}`}
            </span>
          </div>

          <div className="relative w-full max-w-[430px] aspect-square select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}
              className="w-full h-full cursor-grab active:cursor-grabbing overflow-visible"
              role="img"
              aria-label="Interactive 3D D3.js humanitarian crisis and relief globe"
            >
              <defs>
                <radialGradient id="charity-globe-ocean" cx="38%" cy="32%" r="68%">
                  <stop offset="0%" stopColor="#123069" />
                  <stop offset="52%" stopColor="#081838" />
                  <stop offset="100%" stopColor="#030916" />
                </radialGradient>
                <radialGradient id="charity-globe-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="78%" stopColor="rgba(59,130,246,0)" />
                  <stop offset="94%" stopColor="rgba(59,130,246,0.22)" />
                  <stop offset="100%" stopColor="rgba(239,68,68,0.12)" />
                </radialGradient>
              </defs>

              {/* Outer atmospheric halo */}
              <circle
                cx={GLOBE_SIZE / 2}
                cy={GLOBE_SIZE / 2}
                r={scaleRef.current + 14}
                fill="url(#charity-globe-halo)"
                pointerEvents="none"
              />

              {/* Deep ocean sphere */}
              <path
                d={spherePath}
                fill="url(#charity-globe-ocean)"
                stroke="rgba(96, 165, 250, 0.42)"
                strokeWidth={1.25}
              />

              {/* Latitude / Longitude Graticule */}
              <path
                d={graticulePath}
                fill="none"
                stroke="rgba(59, 130, 246, 0.16)"
                strokeWidth={0.65}
              />

              {/* All World Country Polygons */}
              <g>
                {worldCountries.map((feat, idx) => {
                  const d = pathGenerator(feat);
                  if (!d) return null;

                  const rawId = feat.id !== undefined ? String(feat.id) : undefined;
                  const paddedId = rawId ? rawId.padStart(3, '0') : undefined;
                  const crisisMatch =
                    (rawId ? crisisByIso.get(rawId) : undefined) ||
                    (paddedId ? crisisByIso.get(paddedId) : undefined);

                  const isSelected = crisisMatch?.id === selectedCountryId;
                  const isHovered =
                    hoveredTarget &&
                    ((rawId && hoveredTarget.isoId === rawId) ||
                      hoveredTarget.countryName === (crisisMatch?.name || feat.properties?.name));

                  const centroid = d3.geoCentroid(feat);
                  const featRegion =
                    crisisMatch?.region ||
                    resolveContinentRegion(
                      Number.isFinite(centroid[0]) ? centroid[0] : 0,
                      Number.isFinite(centroid[1]) ? centroid[1] : 0,
                      feat.properties?.name || '',
                      rawId
                    );
                  const isRegionHighlighted =
                    regionFilter !== 'All' && regionFilter !== 'Global' && featRegion === regionFilter;

                  let fill = '#0b1e42';
                  let stroke = '#1e3f7a';
                  let strokeWidth = 0.55;

                  if (crisisMatch) {
                    const dimmedByRegion =
                      regionFilter !== 'All' &&
                      regionFilter !== 'Global' &&
                      crisisMatch.region !== regionFilter;

                    if (crisisMatch.crisisType === 'War & Armed Conflict') {
                      fill = dimmedByRegion ? '#5c1922' : '#dc2626';
                    } else if (crisisMatch.crisisType === 'Terrorism & Insurgency') {
                      fill = dimmedByRegion ? '#5c3c12' : '#d97706';
                    } else {
                      fill = dimmedByRegion ? '#163569' : '#2563eb';
                    }
                    stroke = isSelected ? '#ffffff' : '#fca5a5';
                    strokeWidth = isSelected ? 1.6 : 0.85;
                  } else if (isRegionHighlighted) {
                    fill = '#122c5c';
                    stroke = '#3b82f6';
                  }

                  if (isHovered) {
                    fill = crisisMatch ? '#f43f5e' : '#1d4ed8';
                    stroke = '#ffffff';
                    strokeWidth = 1.5;
                  }

                  return (
                    <path
                      key={rawId || `geo-${idx}`}
                      d={d}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-colors duration-150 cursor-pointer"
                      onMouseEnter={() => handleCountryHover(feat)}
                      onClick={() => handleCountryClick(feat)}
                    />
                  );
                })}
              </g>

              {/* Geodesic Humanitarian Dispatch Arcs */}
              <g pointerEvents="none">
                {supplyArcs.map((arc) => (
                  <path
                    key={`arc-${arc.id}`}
                    d={arc.d}
                    fill="none"
                    stroke={arc.isHighlighted ? '#93c5fd' : 'rgba(96, 165, 250, 0.35)'}
                    strokeWidth={arc.isHighlighted ? 1.8 : 0.9}
                    strokeDasharray={arc.isHighlighted ? '5 3' : '3 3'}
                  />
                ))}
              </g>

              {/* Active Crisis Beacon Pins */}
              <g pointerEvents="none">
                {CRISIS_COUNTRIES.map((country) => {
                  if (!country.coordinates || country.id === 'global-all') return null;
                  const isFront = d3.geoDistance(country.coordinates, visibleCenter) < Math.PI / 2;
                  if (!isFront) return null;
                  const projected = projection(country.coordinates);
                  if (!projected) return null;
                  const isSelected = country.id === selectedCountryId;
                  const isHovered = hoveredTarget?.crisisCountry?.id === country.id;
                  const dotColor =
                    country.crisisType === 'Terrorism & Insurgency'
                      ? '#fbbf24'
                      : country.crisisType === 'War & Terrorism Recovery'
                      ? '#60a5fa'
                      : '#f87171';

                  return (
                    <g key={`pin-${country.id}`} transform={`translate(${projected[0]}, ${projected[1]})`}>
                      {(isSelected || isHovered) && (
                        <circle
                          r={11}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth={1.4}
                          strokeOpacity={0.85}
                        />
                      )}
                      <circle
                        r={isSelected || isHovered ? 4.5 : 3}
                        fill={dotColor}
                        stroke="#040a18"
                        strokeWidth={1.1}
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Quick Continent Rotation Buttons under the globe */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {CONTINENT_RELIEF_HUBS.map((hub) => {
              const isFocused = regionFilter === hub.region;
              return (
                <button
                  key={`globe-jump-${hub.id}`}
                  type="button"
                  onClick={() => {
                    onSelectRegion(hub.region);
                    animateGlobeTo(hub.centerCoords);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
                    isFocused
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-[#08142b] border border-blue-900/70 text-slate-300 hover:text-white hover:border-blue-500/70'
                  }`}
                >
                  {hub.region === 'Global' ? 'Global' : hub.region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Hover & Selected Country / Continent Intelligence Dossier */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-[#061024] flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            {/* Status Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-blue-900/60">
              <div className="flex items-center gap-2 text-[11px] font-mono text-blue-300">
                <Compass className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>
                  {hoveredTarget
                    ? hoveredTarget.crisisCountry
                      ? 'Hovered Crisis Nation Telemetry'
                      : 'Hovered Continent & Regional Hub'
                    : 'Selected Allocation Target'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>Live</span>
              </span>
            </div>

            {activeDisplayCountry ? (
              /* Active Crisis Nation Details */
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono text-blue-300">
                    {activeDisplayCountry.continent} · {activeDisplayCountry.region}
                  </div>
                  <h5 className="font-display font-bold text-base text-white mt-0.5">
                    {activeDisplayCountry.name}
                  </h5>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono mt-1">
                    <span className="text-red-300 font-semibold">
                      {activeDisplayCountry.crisisType}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-emerald-300">
                      {activeDisplayCountry.reliefStatus || 'Active Relief Dispatch'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeDisplayCountry.urgentNeeds}
                </p>

                {/* Active Support Projects List */}
                <div className="p-3 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-red-400" />
                    <span>Active Support Projects</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-200">
                    {(activeDisplayCountry.activeProjects || []).map((proj) => (
                      <li key={proj} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{proj}</span>
                      </li>
                    ))}
                  </ul>
                  {activeNgo && (
                    <div className="pt-2 border-t border-blue-900/50 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Lead Division: {activeNgo.name}</span>
                    </div>
                  )}
                </div>

                {/* Live Relief Metrics */}
                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono tabular-nums">
                  <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                    <div className="text-[10px] text-slate-400 uppercase">Affected Civilians</div>
                    <div className="text-white font-bold mt-0.5 text-[11px] leading-snug">
                      {activeDisplayCountry.displacedEstimate}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                    <div className="text-[10px] text-slate-400 uppercase">Portal Activity</div>
                    <div className="text-emerald-300 font-bold mt-0.5 text-[11px] leading-snug">
                      ${targetDonationStats.donationTotal.toLocaleString()} · {targetDonationStats.supportCount} Appeals
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Non-crisis hovered country -> Show Continental Relief Hub & Active Nations in that Continent */
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono text-blue-300 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span>{hoveredTarget?.countryName} · {activeContinentHub.continentName}</span>
                  </div>
                  <h5 className="font-display font-bold text-base text-white mt-0.5">
                    {activeContinentHub.continentName} Relief Operations
                  </h5>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeContinentHub.reliefSummary}
                </p>

                <div className="p-3 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 font-bold">
                    Active Crisis Support Missions in {activeContinentHub.region} ({activeContinentCountries.length})
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeContinentCountries.map((c) => (
                      <div
                        key={`continent-list-${c.id}`}
                        className="flex items-center justify-between gap-2 text-[11px] py-1 border-b border-blue-900/40 last:border-b-0"
                      >
                        <span className="text-white font-medium truncate">{c.name}</span>
                        <span className="text-[10px] font-mono text-amber-300 shrink-0">
                          {c.reliefStatus || 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs font-mono tabular-nums">
                  <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                    <div className="text-[10px] text-slate-400 uppercase">Regional Donations</div>
                    <div className="text-emerald-300 font-bold mt-0.5 text-[11px]">
                      ${targetDonationStats.donationTotal.toLocaleString()} USD
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#08142b] border border-blue-900/60">
                    <div className="text-[10px] text-slate-400 uppercase">Support Appeals</div>
                    <div className="text-white font-bold mt-0.5 text-[11px]">
                      {targetDonationStats.supportCount} Logged
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-blue-900/60 flex items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <span>Click any highlighted country on the globe to target relief</span>
            <span className="text-blue-300 shrink-0 tabular-nums">
              {CRISIS_COUNTRIES.length - 1} Active Nations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
