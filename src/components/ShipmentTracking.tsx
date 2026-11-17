import React, { useState } from 'react';
import {
  Factory,
  Cog,
  ClipboardCheck,
  Truck,
  KeyRound,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { OrderTrackingEvent, TeslaOrder } from '../types';

export interface ShipmentStageDefinition {
  id: 'production' | 'assembly' | 'inspection' | 'transit' | 'delivery';
  stepNumber: string;
  shortLabel: string;
  title: string;
  statusValue: TeslaOrder['status'];
  facility: (order: TeslaOrder) => string;
  description: (order: TeslaOrder) => string;
  telemetryTag: (order: TeslaOrder) => string;
  icon: React.ComponentType<{ className?: string }>;
}

export const SHIPMENT_STAGES: ShipmentStageDefinition[] = [
  {
    id: 'production',
    stepNumber: '01',
    shortLabel: 'Production',
    title: 'Production Queue & Chassis Allocation',
    statusValue: 'Production Scheduled',
    facility: (order) =>
      order.isFlyingCar
        ? 'Starbase Aerospace Division · Boca Chica, TX'
        : order.itemCategory === 'merch'
        ? 'Tesla Design & Garment Mill · Fremont, CA'
        : 'Gigafactory Texas · Chassis & Casting',
    description: (order) =>
      order.itemCategory === 'merch'
        ? `Order ${order.reservationVin} queued for ${order.merchQualityTier || 'Executive'} fabric lot allocation and serial weave tagging.`
        : order.isFlyingCar
        ? `Aerospace VIN ${order.reservationVin} allocated to carbon-composite monocoque tooling and SpaceX cold-gas thruster manifold allocation.`
        : `Chassis VIN ${order.reservationVin} assigned to gigapress stamping line and structural battery pack cell allocation.`,
    telemetryTag: (order) =>
      order.itemCategory === 'merch' ? 'Lot Queued' : 'Chassis & Battery Bay',
    icon: Factory,
  },
  {
    id: 'assembly',
    stepNumber: '02',
    shortLabel: 'Assembly',
    title: 'Factory Assembly & Finish',
    statusValue: 'Factory Assembly',
    facility: (order) =>
      order.isFlyingCar
        ? 'Aerospace Integration Bay · Flight Propulsion Line'
        : order.itemCategory === 'merch'
        ? 'Precision Tailoring & 3D Embroidery Studio'
        : 'General Assembly Line · Automated Robotics',
    description: (order) =>
      order.itemCategory === 'merch'
        ? `Precision construction of ${order.vehicleName} (${order.merchSize || 'Standard'}, Qty ${order.merchQuantity || 1}) with ${order.merchMaterialSpec || 'archival-grade finish'}.`
        : `Tri-motor / drive unit integration, ${order.selectedColor.name} multi-coat exterior paint, ${order.selectedWheels.name}, and ${order.selectedInterior.name} cockpit trim.`,
    telemetryTag: (order) =>
      order.itemCategory === 'merch' ? 'Craft & Embroidery' : `${order.selectedColor.name} Finish`,
    icon: Cog,
  },
  {
    id: 'inspection',
    stepNumber: '03',
    shortLabel: 'Quality Check',
    title: 'Telemetry Audit & Quality Inspection',
    statusValue: 'Quality Inspection',
    facility: (order) =>
      order.isFlyingCar
        ? 'Flight Readiness & Avionics Verification Pad'
        : order.itemCategory === 'merch'
        ? 'Archival Quality & Packaging Control'
        : 'Gigafactory Quality & Dyno Bay',
    description: (order) =>
      order.itemCategory === 'merch'
        ? 'Stitch density audit, dimensional sizing check, and serialized authenticity seal verification.'
        : order.isFlyingCar
        ? 'High-voltage pack isolation check, 10-thruster pressure certification, HW4 sensor alignment, and aero sealing verification.'
        : 'High-voltage pack isolation test, ultrasonic panel gap calibration, HW4 vision calibration, and rolling dyno sign-off.',
    telemetryTag: (order) =>
      order.itemCategory === 'merch' ? 'QC Seal Passed' : 'HW4 & Dyno Audit',
    icon: ClipboardCheck,
  },
  {
    id: 'transit',
    stepNumber: '04',
    shortLabel: 'In Transit',
    title: 'Insured Carrier Transit',
    statusValue: 'In Transit',
    facility: () => 'Tesla Logistics Dispatch Network',
    description: (order) =>
      `Loaded onto insured enclosed carrier en route to ${order.deliveryAddress || order.city || 'your Tesla Delivery Hub'}.`,
    telemetryTag: (order) => order.city || 'Regional Dispatch',
    icon: Truck,
  },
  {
    id: 'delivery',
    stepNumber: '05',
    shortLabel: 'Delivery',
    title: 'Final Handover & Delivery',
    statusValue: 'Delivered',
    facility: (order) =>
      order.city ? `${order.city} · Tesla Delivery Center` : 'Tesla Delivery Center Handover Bay',
    description: (order) =>
      order.itemCategory === 'merch'
        ? `Signed parcel delivery completed at ${order.deliveryAddress || order.city || 'your destination address'}.`
        : `Final detail complete at ${order.city || 'Tesla Delivery Center'}. Digital key-card pairing and owner handover unlocked.`,
    telemetryTag: () => 'Owner Handover',
    icon: KeyRound,
  },
];

export function getOrderStageIndex(order: TeslaOrder): number {
  switch (order.status) {
    case 'Delivered':
    case 'Ready for Delivery':
      return 4;
    case 'In Transit':
      return 3;
    case 'Quality Inspection':
      return 2;
    case 'Factory Assembly':
    case 'Payment Approved & VIN Allocated':
      return 1;
    case 'Production Scheduled':
    case 'Reservation Confirmed':
    case 'Pending Elon Musk Management Approval':
    case 'Pending Admin Payment Approval':
    case 'Payment Verification Needed':
    default:
      return 0;
  }
}

export function sanitizeExternalUrl(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

function formatShortDate(raw?: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function resolveStageDateLabel(
  stageIdx: number,
  currentStageIdx: number,
  order: TeslaOrder,
  trackingEvents: OrderTrackingEvent[],
  isDelivered: boolean
): string {
  const stageMatchers: RegExp[] = [
    /production|reservation|submitted|scheduled|queued/i,
    /assembly|approved|vin|paint/i,
    /quality|inspection|calibration|dyno/i,
    /transit|carrier|dispatch|shipping/i,
    /deliver|handover|completed|ready/i,
  ];

  const matcher = stageMatchers[stageIdx];
  const matchedEvent = trackingEvents.find(
    (evt) => matcher.test(evt.stage) || matcher.test(evt.title)
  );
  if (matchedEvent?.dateStr) {
    return matchedEvent.dateStr;
  }

  if (stageIdx === 0) {
    return order.orderDate || 'Logged';
  }
  if (stageIdx === 1 && order.approvedAt) {
    return formatShortDate(order.approvedAt) || order.orderDate;
  }
  if (stageIdx === 4 && (isDelivered || order.deliveredAt || order.deliveryDate)) {
    return (
      order.deliveryDate ||
      formatShortDate(order.deliveredAt) ||
      order.estimatedDelivery
    );
  }

  if (stageIdx < currentStageIdx || (isDelivered && stageIdx === 4)) {
    return order.orderDate || 'Completed';
  }
  if (stageIdx === currentStageIdx) {
    return order.paymentStatus === 'pending_admin_approval'
      ? 'Awaiting Clearance'
      : 'Active Stage';
  }
  return `Est. ${order.estimatedDelivery}`;
}

interface ShipmentTrackingProps {
  order: TeslaOrder;
  trackingEvents: OrderTrackingEvent[];
  onUpdateOrderStatus?: (orderId: string, nextStatus: TeslaOrder['status']) => void;
  inspectedStep?: number;
  onSelectStep?: (idx: number) => void;
}

export const ShipmentTracking: React.FC<ShipmentTrackingProps> = ({
  order,
  trackingEvents,
  onUpdateOrderStatus,
  inspectedStep,
  onSelectStep,
}) => {
  const currentStageIdx = getOrderStageIndex(order);
  const [localSelectedStep, setLocalSelectedStep] = useState<number>(currentStageIdx);
  const activeInspectedIdx =
    inspectedStep !== undefined ? inspectedStep : localSelectedStep;

  const isPending =
    !order.paymentStatus || order.paymentStatus === 'pending_admin_approval';
  const isApproved = order.paymentStatus === 'approved';
  const isRejected = order.paymentStatus === 'rejected';
  const isDelivered = currentStageIdx === SHIPMENT_STAGES.length - 1;

  const progressPercent = Math.round(
    ((currentStageIdx + 1) / SHIPMENT_STAGES.length) * 100
  );
  const railWidthPercent =
    (currentStageIdx / (SHIPMENT_STAGES.length - 1)) * 100;

  const nextStage =
    currentStageIdx < SHIPMENT_STAGES.length - 1
      ? SHIPMENT_STAGES[currentStageIdx + 1]
      : null;

  const inspectedStage = SHIPMENT_STAGES[activeInspectedIdx] || SHIPMENT_STAGES[currentStageIdx];
  const InspectedIcon = inspectedStage.icon;
  const safeExternalUrl = sanitizeExternalUrl(order.externalTrackingUrl);

  const originHub = order.isFlyingCar
    ? 'Starbase, TX'
    : order.itemCategory === 'merch'
    ? 'Fremont, CA'
    : 'Gigafactory Austin, TX';
  const destinationHub =
    order.city || order.deliveryAddress || 'Tesla Delivery Center';

  const handleStageSelect = (idx: number) => {
    setLocalSelectedStep(idx);
    onSelectStep?.(idx);
  };

  return (
    <section
      aria-label={`Shipment Tracking for ${order.vehicleName}`}
      className="p-4 sm:p-5 rounded-xl bg-[#040a18]/95 border border-blue-800/60 space-y-4"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-900/50">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Truck className="w-4 h-4 text-blue-300 shrink-0" />
            <h5 className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
              Shipment Tracking
            </h5>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs font-mono tabular-nums text-blue-300 font-semibold">
              Stage {currentStageIdx + 1} of {SHIPMENT_STAGES.length} ({progressPercent}%)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300">
            <span className="inline-flex items-center gap-1 text-slate-200">
              <Navigation className="w-3 h-3 text-blue-400 shrink-0" />
              <span>{originHub}</span>
            </span>
            <span aria-hidden="true" className="text-slate-500">→</span>
            <span className="inline-flex items-center gap-1 text-slate-200">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span>{destinationHub}</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400 tabular-nums">
              {isDelivered
                ? `Delivered ${resolveStageDateLabel(4, currentStageIdx, order, trackingEvents, isDelivered)}`
                : `Est. ${order.estimatedDelivery}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {safeExternalUrl && (
            <a
              href={safeExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#08142b] hover:bg-[#0d2044] border border-emerald-500/45 text-emerald-300 hover:text-emerald-200 text-[11px] font-mono font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Carrier Link</span>
            </a>
          )}

          {isApproved && nextStage && onUpdateOrderStatus ? (
            <button
              type="button"
              onClick={() => {
                const updatedIdx = currentStageIdx + 1;
                onUpdateOrderStatus(order.orderId, nextStage.statusValue);
                handleStageSelect(updatedIdx);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shadow-sm"
            >
              <span>Advance to {nextStage.shortLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : isDelivered ? (
            <span className="text-[11px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Delivery Complete</span>
            </span>
          ) : isRejected ? (
            <span className="text-[11px] font-mono font-semibold text-red-300 flex items-center gap-1.5 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Verification Hold</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>Awaiting Management Clearance</span>
            </span>
          )}
        </div>
      </div>

      {/* Horizontal Visual Rail */}
      <div className="relative pt-1 pb-1">
        <div
          className="absolute top-[22px] sm:top-[24px] left-[10%] right-[10%] h-1.5 rounded-full bg-[#0d1f44] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isDelivered
                ? 'bg-gradient-to-r from-blue-500 via-emerald-400 to-emerald-400'
                : isRejected
                ? 'bg-gradient-to-r from-red-600 to-red-400'
                : 'bg-gradient-to-r from-blue-500 via-indigo-400 to-red-500'
            }`}
            style={{ width: `${railWidthPercent}%` }}
          />
        </div>

        <div className="relative grid grid-cols-5 gap-1 sm:gap-2">
          {SHIPMENT_STAGES.map((stage, idx) => {
            const StepIcon = stage.icon;
            const isCompleted =
              idx < currentStageIdx || (isDelivered && idx === currentStageIdx);
            const isCurrent = idx === currentStageIdx && !isDelivered;
            const isInspected = idx === activeInspectedIdx;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleStageSelect(idx)}
                aria-current={
                  isCurrent || (isDelivered && idx === 4) ? 'step' : undefined
                }
                aria-label={`${stage.shortLabel}: ${stage.title}`}
                className="group flex flex-col items-center text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg py-0.5"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-blue-600 to-emerald-500 border-emerald-300/80 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? isRejected
                        ? 'bg-red-950 border-red-400 text-red-200 ring-4 ring-red-500/20'
                        : 'bg-gradient-to-br from-blue-600 to-red-600 border-white/90 text-white ring-4 ring-blue-500/25 shadow-lg shadow-blue-500/30'
                      : 'bg-[#071226] border-blue-900/80 text-slate-400 group-hover:text-white group-hover:border-blue-500/70'
                  } ${
                    isInspected && !isCurrent
                      ? 'ring-2 ring-blue-400/70 scale-105'
                      : ''
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                <span
                  className={`mt-2 text-[10px] sm:text-xs font-mono font-semibold leading-tight whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-white'
                      : isCompleted
                      ? 'text-emerald-300'
                      : isInspected
                      ? 'text-blue-300'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {stage.shortLabel}
                </span>

                <span
                  className={`mt-0.5 text-[10px] font-mono tabular-nums transition-opacity ${
                    isCurrent
                      ? isRejected
                        ? 'text-red-300 opacity-100'
                        : 'text-blue-300 opacity-100'
                      : isCompleted
                      ? 'text-emerald-400/85 opacity-100'
                      : isInspected
                      ? 'text-blue-300/90 opacity-100'
                      : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isCompleted
                    ? 'Completed'
                    : isCurrent
                    ? isRejected
                      ? 'Hold'
                      : isPending
                      ? 'Queued'
                      : 'Active'
                    : 'Upcoming'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean Vertical Timeline of Production, Assembly & Delivery Stages */}
      <div className="pt-2 border-t border-blue-900/50">
        <div className="relative pl-6 space-y-2.5 before:content-[''] before:absolute before:left-[9px] before:top-3 before:bottom-3 before:w-px before:bg-blue-900/80">
          {SHIPMENT_STAGES.map((stage, idx) => {
            const StageIcon = stage.icon;
            const isCompleted =
              idx < currentStageIdx || (isDelivered && idx === currentStageIdx);
            const isCurrent = idx === currentStageIdx && !isDelivered;
            const isSelected = idx === activeInspectedIdx;
            const stageDate = resolveStageDateLabel(
              idx,
              currentStageIdx,
              order,
              trackingEvents,
              isDelivered
            );

            return (
              <button
                key={`timeline-${stage.id}`}
                type="button"
                onClick={() => handleStageSelect(idx)}
                aria-expanded={isSelected}
                className={`relative w-full text-left rounded-lg px-3 py-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isSelected
                    ? 'bg-[#08142b] border border-blue-700/70'
                    : 'hover:bg-[#08142b]/60 border border-transparent'
                }`}
              >
                {/* Vertical Timeline Spine Node */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-6 top-3 w-[18px] h-[18px] rounded-full flex items-center justify-center border text-[9px] font-mono font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-200 text-white'
                      : isCurrent
                      ? isRejected
                        ? 'bg-red-600 border-red-200 text-white'
                        : 'bg-blue-600 border-white text-white shadow-sm shadow-blue-500/40'
                      : 'bg-[#040a18] border-blue-800/80 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <StageIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isCurrent
                          ? isRejected
                            ? 'text-red-400'
                            : 'text-blue-300'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">
                      {stage.stepNumber}
                    </span>
                    <span
                      className={`font-semibold ${
                        isCompleted || isCurrent || isSelected
                          ? 'text-white'
                          : 'text-slate-300'
                      }`}
                    >
                      {stage.shortLabel}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-[11px] text-slate-400">
                      {stage.facility(order)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums shrink-0">
                    <span
                      className={
                        isCompleted
                          ? 'text-emerald-300 font-semibold'
                          : isCurrent
                          ? isRejected
                            ? 'text-red-300 font-semibold'
                            : 'text-blue-300 font-semibold'
                          : 'text-slate-400'
                      }
                    >
                      {stageDate}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <p className="mt-1.5 text-[11px] text-slate-300 leading-relaxed">
                    {stage.description(order)}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Telemetry Detail Strip */}
      <div className="p-3 rounded-lg bg-[#08142b]/85 border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              activeInspectedIdx < currentStageIdx ||
              (isDelivered && activeInspectedIdx === 4)
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : activeInspectedIdx === currentStageIdx
                ? isRejected
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                : 'bg-[#040a18] text-slate-400 border border-blue-900/60'
            }`}
          >
            <InspectedIcon className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-white">{inspectedStage.title}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-[11px] text-blue-300">
                {inspectedStage.telemetryTag(order)}
              </span>
              {order.flightModeCertified && activeInspectedIdx >= 2 && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-300">
                    <Sparkles className="w-3 h-3" />
                    Flight Certified
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {inspectedStage.facility(order)} — {inspectedStage.description(order)}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono tabular-nums shrink-0 sm:text-right">
          {activeInspectedIdx < currentStageIdx ||
          (isDelivered && activeInspectedIdx === 4) ? (
            <span className="text-emerald-300 font-semibold">
              Milestone Completed
            </span>
          ) : activeInspectedIdx === currentStageIdx ? (
            <span
              className={
                isRejected
                  ? 'text-red-300 font-semibold'
                  : 'text-blue-300 font-semibold'
              }
            >
              {isPending
                ? 'Queued (Awaiting Management)'
                : isRejected
                ? 'Verification Required'
                : 'Currently In Progress'}
            </span>
          ) : (
            <span className="text-slate-400">
              Est. {order.estimatedDelivery}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
