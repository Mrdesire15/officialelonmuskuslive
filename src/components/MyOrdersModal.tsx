import React, { useMemo, useState } from 'react';
import {
  X,
  Car,
  ShieldCheck,
  CheckCircle2,
  Download,
  Clock,
  MapPin,
  Trash2,
  Factory,
  Cog,
  ClipboardCheck,
  Truck,
  KeyRound,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart3,
  History,
  Calendar,
  Award,
  ExternalLink,
  Link2,
  Copy,
  FileText,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { OrderTrackingEvent, TeslaOrder } from '../types';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: TeslaOrder[];
  onCancelOrder: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, nextStatus: TeslaOrder['status']) => void;
  onAttachTrackingUrl?: (orderId: string, trackingUrl: string) => void;
  isAdmin?: boolean;
  onOrderNewCar: () => void;
  onOpenInbox?: () => void;
}

interface JourneyStage {
  id: 'production' | 'assembly' | 'inspection' | 'transit' | 'delivery';
  shortLabel: string;
  title: string;
  statusValue: TeslaOrder['status'];
  facility: string;
  description: (order: TeslaOrder) => string;
  icon: React.ComponentType<{ className?: string }>;
}

const ORDER_JOURNEY_STAGES: JourneyStage[] = [
  {
    id: 'production',
    shortLabel: 'Production',
    title: 'Production Queue & VIN Stamping',
    statusValue: 'Production Scheduled',
    facility: 'Gigafactory Texas · Chassis & Casting',
    description: (order) =>
      `Chassis VIN ${order.reservationVin} assigned to factory stamping press and structural battery cell allocation.`,
    icon: Factory,
  },
  {
    id: 'assembly',
    shortLabel: 'Assembly',
    title: 'Factory Assembly & Paint Shop',
    statusValue: 'Factory Assembly',
    facility: 'General Assembly Line · Automated Robotics',
    description: (order) =>
      `Drive unit installation, ${order.selectedColor.name} multi-coat exterior finish, ${order.selectedWheels.name}, and ${order.selectedInterior.name} cabin assembly.`,
    icon: Cog,
  },
  {
    id: 'inspection',
    shortLabel: 'Quality Check',
    title: 'End-of-Line Telemetry & ADAS Calibration',
    statusValue: 'Quality Inspection',
    facility: 'Gigafactory Quality & Dyno Bay',
    description: () =>
      'High-voltage pack isolation verification, ultrasonic panel gap audit, HW4 camera calibration, and rolling dyno test.',
    icon: ClipboardCheck,
  },
  {
    id: 'transit',
    shortLabel: 'In Transit',
    title: 'Insured Carrier Transit',
    statusValue: 'In Transit',
    facility: 'Tesla Logistics Dispatch Network',
    description: (order) =>
      `Loaded onto enclosed auto carrier en route to ${order.deliveryAddress || order.city || 'your Tesla Delivery Hub'}.`,
    icon: Truck,
  },
  {
    id: 'delivery',
    shortLabel: 'Delivery',
    title: 'Final Handover & Delivery',
    statusValue: 'Delivered',
    facility: 'Tesla Delivery Center Handover Bay',
    description: (order) =>
      `Final detail complete at ${order.city || 'Tesla Delivery Center'}. Digital key-card pairing and owner handover unlocked.`,
    icon: KeyRound,
  },
];

function getOrderStageIndex(order: TeslaOrder): number {
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

type VehicleModelCategory =
  | 'Model S'
  | 'Cybertruck'
  | 'Model X'
  | 'Model 3'
  | 'Model Y'
  | 'Official Apparel'
  | 'Custom Fleet';

const MODEL_CATEGORIES: {
  key: VehicleModelCategory;
  color: string;
  dotClass: string;
}[] = [
  { key: 'Model S', color: '#3b82f6', dotClass: 'bg-blue-500' },
  { key: 'Cybertruck', color: '#ef4444', dotClass: 'bg-red-500' },
  { key: 'Model X', color: '#10b981', dotClass: 'bg-emerald-500' },
  { key: 'Model 3', color: '#a855f7', dotClass: 'bg-purple-500' },
  { key: 'Model Y', color: '#f59e0b', dotClass: 'bg-amber-500' },
  { key: 'Official Apparel', color: '#ec4899', dotClass: 'bg-pink-500' },
  { key: 'Custom Fleet', color: '#06b6d4', dotClass: 'bg-cyan-500' },
];

function getOrderModelCategory(order: TeslaOrder): VehicleModelCategory {
  if (order.itemCategory === 'merch') return 'Official Apparel';
  const name = order.vehicleName.toLowerCase();
  const id = order.vehicleId.toLowerCase();
  if (name.includes('model s') || id.includes('model-s')) return 'Model S';
  if (name.includes('cybertruck') || name.includes('cyberbeast') || id.includes('cybertruck')) {
    return 'Cybertruck';
  }
  if (name.includes('model x') || id.includes('model-x')) return 'Model X';
  if (name.includes('model 3') || id.includes('model-3')) return 'Model 3';
  if (name.includes('model y') || id.includes('model-y')) return 'Model Y';
  return 'Custom Fleet';
}

function parseOrderDateSafe(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function formatMonthShort(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const yr = date.getFullYear().toString().slice(-2);
  return `${month} '${yr}`;
}

function isOrderCompleted(order: TeslaOrder): boolean {
  return order.status === 'Delivered' || order.status === 'Ready for Delivery';
}

function getOrderDeliveryDateLabel(order: TeslaOrder): string {
  if (order.deliveryDate) return order.deliveryDate;
  if (order.deliveredAt) {
    const d = new Date(order.deliveredAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  return order.orderDate || order.estimatedDelivery;
}

function sanitizeExternalUrl(raw?: string): string | null {
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

function getOrderTrackingHistory(order: TeslaOrder): OrderTrackingEvent[] {
  if (order.trackingHistory && order.trackingHistory.length > 0) {
    const sorted = [...order.trackingHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const safeOrderUrl = sanitizeExternalUrl(order.externalTrackingUrl);
    if (safeOrderUrl && !sorted.some((evt) => sanitizeExternalUrl(evt.externalTrackingUrl) === safeOrderUrl)) {
      sorted.push({
        id: `dynamic-ext-${order.orderId}`,
        stage: order.status || 'Logistics Dispatch',
        title: 'External Shipment Tracking Link Attached',
        details: `Live carrier tracking portal assigned by Elon Musk Management for ${order.vehicleName} (VIN ${order.reservationVin}).`,
        location: order.deliveryAddress || order.city || 'Tesla Logistics Dispatch Network',
        timestamp: new Date().toISOString(),
        dateStr: order.orderDate,
        statusType: 'stage_update',
        externalTrackingUrl: safeOrderUrl,
      });
    }
    return sorted;
  }

  const events: OrderTrackingEvent[] = [
    {
      id: `fallback-submit-${order.orderId}`,
      stage: 'Production',
      title: 'Reservation & Deposit Logged',
      details: `${order.paymentType === 'full' ? 'Full settlement' : '20% advance deposit'} ($${order.amountPaidToday.toLocaleString()}) recorded for ${order.vehicleName}.`,
      location: `${order.deliveryAddress || 'Tesla Delivery Hub'}, ${order.city || 'Austin, TX'}`,
      timestamp: parseOrderDateSafe(order.orderDate).toISOString(),
      dateStr: order.orderDate,
      statusType: 'submitted',
    },
  ];

  if (order.paymentStatus === 'approved') {
    events.push({
      id: `fallback-approve-${order.orderId}`,
      stage: 'Assembly',
      title: 'Payment Approved & VIN Allocated',
      details: order.approvalNotes || `VIN ${order.reservationVin} approved by Elon Musk Official Management Table.`,
      location: 'Elon Musk Official Management Table & Treasury',
      timestamp: order.approvedAt || parseOrderDateSafe(order.orderDate).toISOString(),
      dateStr: order.approvedAt
        ? new Date(order.approvedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : order.orderDate,
      statusType: 'approved',
    });
  } else if (order.paymentStatus === 'rejected') {
    events.push({
      id: `fallback-reject-${order.orderId}`,
      stage: 'Production',
      title: 'Payment Verification Hold',
      details: order.approvalNotes || 'Additional transfer confirmation requested.',
      location: 'Elon Musk Official Management Table · Treasury',
      timestamp: parseOrderDateSafe(order.orderDate).toISOString(),
      dateStr: order.orderDate,
      statusType: 'rejected',
    });
  }

  if (
    order.status === 'Quality Inspection' ||
    order.status === 'In Transit' ||
    isOrderCompleted(order)
  ) {
    events.push({
      id: `fallback-status-${order.orderId}`,
      stage: isOrderCompleted(order) ? 'Delivery' : order.status,
      title: isOrderCompleted(order) ? 'Final Delivery Completed' : `Current Stage: ${order.status}`,
      details: isOrderCompleted(order)
        ? `Handover finalized for ${order.customerName} at ${order.city || 'Tesla Delivery Center'}.`
        : `Vehicle telemetry updated to ${order.status}.`,
      location: `${order.deliveryAddress || order.city || 'Tesla Delivery Center'}`,
      timestamp: order.deliveredAt || new Date().toISOString(),
      dateStr: getOrderDeliveryDateLabel(order),
      statusType: isOrderCompleted(order) ? 'delivered' : 'stage_update',
    });
  }

  const safeOrderUrl = sanitizeExternalUrl(order.externalTrackingUrl);
  if (safeOrderUrl) {
    events.push({
      id: `fallback-ext-${order.orderId}`,
      stage: order.status || 'Logistics Dispatch',
      title: 'External Shipment Tracking Link Attached',
      details: `Live carrier tracking portal assigned by Elon Musk Management for ${order.vehicleName} (VIN ${order.reservationVin}).`,
      location: `${order.deliveryAddress || order.city || 'Tesla Logistics Dispatch Network'}`,
      timestamp: new Date().toISOString(),
      dateStr: order.orderDate,
      statusType: 'stage_update',
      externalTrackingUrl: safeOrderUrl,
    });
  }

  return events;
}

interface OrderChartRow {
  periodKey: string;
  label: string;
  totalCount: number;
  totalSpend: number;
  'Model S': number;
  Cybertruck: number;
  'Model X': number;
  'Model 3': number;
  'Model Y': number;
  'Official Apparel': number;
  'Custom Fleet': number;
  countByModel: Record<VehicleModelCategory, number>;
  spendByModel: Record<VehicleModelCategory, number>;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onCancelOrder,
  onUpdateOrderStatus,
  onAttachTrackingUrl,
  isAdmin = false,
  onOrderNewCar,
  onOpenInbox,
}) => {
  const [inspectedStepByOrder, setInspectedStepByOrder] = useState<Record<string, number>>({});
  const [expandedHistoryByOrder, setExpandedHistoryByOrder] = useState<Record<string, boolean>>({});
  const [trackingUrlDrafts, setTrackingUrlDrafts] = useState<Record<string, string>>({});
  const [trackingUrlErrors, setTrackingUrlErrors] = useState<Record<string, string>>({});
  const [copiedTrackingEventId, setCopiedTrackingEventId] = useState<string | null>(null);
  const [ordersViewTab, setOrdersViewTab] = useState<'all' | 'active' | 'timeline'>('all');
  const [downloadedOrderId, setDownloadedOrderId] = useState<string | null>(null);
  const [generatedInvoiceOrderId, setGeneratedInvoiceOrderId] = useState<string | null>(null);
  const [showTrendsChart, setShowTrendsChart] = useState<boolean>(true);
  const [chartGrouping, setChartGrouping] = useState<'monthly' | 'daily'>('monthly');
  const [chartMetric, setChartMetric] = useState<'count' | 'spend'>('count');
  const [focusedModel, setFocusedModel] = useState<VehicleModelCategory | 'all'>('all');

  const handleTrackingUrlSubmit = (order: TeslaOrder) => {
    const raw = (trackingUrlDrafts[order.orderId] ?? order.externalTrackingUrl ?? '').trim();
    const safeUrl = sanitizeExternalUrl(raw);
    if (!safeUrl) {
      setTrackingUrlErrors((prev) => ({
        ...prev,
        [order.orderId]: 'Enter a valid http:// or https:// tracking URL.',
      }));
      return;
    }

    setTrackingUrlErrors((prev) => ({ ...prev, [order.orderId]: '' }));
    onAttachTrackingUrl?.(order.orderId, safeUrl);
    setTrackingUrlDrafts((prev) => ({ ...prev, [order.orderId]: safeUrl }));
    setExpandedHistoryByOrder((prev) => ({ ...prev, [order.orderId]: true }));
  };

  const handleCopyTrackingLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTrackingEventId(id);
    window.setTimeout(() => {
      setCopiedTrackingEventId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const ownershipAnalytics = useMemo(() => {
    const activeOrders = orders.filter((o) => !isOrderCompleted(o));
    const completedOrders = orders
      .filter((o) => isOrderCompleted(o))
      .sort((a, b) => {
        const tsA = a.deliveredAt
          ? new Date(a.deliveredAt).getTime()
          : parseOrderDateSafe(a.orderDate).getTime();
        const tsB = b.deliveredAt
          ? new Date(b.deliveredAt).getTime()
          : parseOrderDateSafe(b.orderDate).getTime();
        return tsB - tsA;
      });

    const distinctModels = new Set(completedOrders.map((o) => getOrderModelCategory(o))).size;
    const totalDeliveredSpend = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const latestDeliveryDate =
      completedOrders.length > 0 ? getOrderDeliveryDateLabel(completedOrders[0]) : '—';

    return {
      activeOrders,
      completedOrders,
      distinctModels,
      totalDeliveredSpend,
      latestDeliveryDate,
    };
  }, [orders]);

  const orderTrendAnalytics = useMemo(() => {
    const emptyCounts = (): Record<VehicleModelCategory, number> => ({
      'Model S': 0,
      Cybertruck: 0,
      'Model X': 0,
      'Model 3': 0,
      'Model Y': 0,
      'Official Apparel': 0,
      'Custom Fleet': 0,
    });

    const overallCounts = emptyCounts();
    const overallSpend = emptyCounts();
    let totalPortfolioSpend = 0;

    orders.forEach((order) => {
      const cat = getOrderModelCategory(order);
      overallCounts[cat] += 1;
      overallSpend[cat] += order.totalPrice;
      totalPortfolioSpend += order.totalPrice;
    });

    const buckets = new Map<
      string,
      {
        label: string;
        sortTs: number;
        counts: Record<VehicleModelCategory, number>;
        spend: Record<VehicleModelCategory, number>;
      }
    >();

    if (chartGrouping === 'monthly') {
      const now = new Date();
      for (let i = 5; i >= 0; i -= 1) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.set(key, {
          label: formatMonthShort(d),
          sortTs: d.getTime(),
          counts: emptyCounts(),
          spend: emptyCounts(),
        });
      }

      orders.forEach((order) => {
        const d = parseOrderDateSafe(order.orderDate);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets.has(key)) {
          buckets.set(key, {
            label: formatMonthShort(monthStart),
            sortTs: monthStart.getTime(),
            counts: emptyCounts(),
            spend: emptyCounts(),
          });
        }
        const bucket = buckets.get(key)!;
        const cat = getOrderModelCategory(order);
        bucket.counts[cat] += 1;
        bucket.spend[cat] += order.totalPrice;
      });
    } else {
      if (orders.length === 0) {
        const today = new Date();
        const key = today.toISOString().slice(0, 10);
        buckets.set(key, {
          label: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sortTs: today.getTime(),
          counts: emptyCounts(),
          spend: emptyCounts(),
        });
      } else {
        orders.forEach((order) => {
          const d = parseOrderDateSafe(order.orderDate);
          const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate()
          ).padStart(2, '0')}`;
          if (!buckets.has(dayKey)) {
            buckets.set(dayKey, {
              label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              sortTs: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
              counts: emptyCounts(),
              spend: emptyCounts(),
            });
          }
          const bucket = buckets.get(dayKey)!;
          const cat = getOrderModelCategory(order);
          bucket.counts[cat] += 1;
          bucket.spend[cat] += order.totalPrice;
        });
      }
    }

    const chartRows: OrderChartRow[] = Array.from(buckets.entries())
      .sort((a, b) => a[1].sortTs - b[1].sortTs)
      .map(([periodKey, b]) => {
        const rowSource = chartMetric === 'count' ? b.counts : b.spend;
        const totalCount =
          focusedModel === 'all'
            ? Object.values(b.counts).reduce((acc, v) => acc + v, 0)
            : b.counts[focusedModel];
        const totalSpend =
          focusedModel === 'all'
            ? Object.values(b.spend).reduce((acc, v) => acc + v, 0)
            : b.spend[focusedModel];

        return {
          periodKey,
          label: b.label,
          totalCount,
          totalSpend,
          'Model S': rowSource['Model S'],
          Cybertruck: rowSource.Cybertruck,
          'Model X': rowSource['Model X'],
          'Model 3': rowSource['Model 3'],
          'Model Y': rowSource['Model Y'],
          'Official Apparel': rowSource['Official Apparel'],
          'Custom Fleet': rowSource['Custom Fleet'],
          countByModel: b.counts,
          spendByModel: b.spend,
        };
      });

    const modelDistribution = MODEL_CATEGORIES.map((cat) => {
      const count = overallCounts[cat.key];
      const spend = overallSpend[cat.key];
      const sharePct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
      return {
        ...cat,
        count,
        spend,
        sharePct,
      };
    }).filter((item) => item.count > 0);

    const topModel =
      modelDistribution.length > 0
        ? [...modelDistribution].sort((a, b) => b.count - a.count || b.spend - a.spend)[0]
        : null;

    const populatedCategories = MODEL_CATEGORIES.filter((cat) => overallCounts[cat.key] > 0);
    const activeCategories =
      focusedModel !== 'all'
        ? MODEL_CATEGORIES.filter((cat) => cat.key === focusedModel)
        : populatedCategories.length > 0
        ? populatedCategories
        : MODEL_CATEGORIES.slice(0, 5);

    return {
      chartRows,
      modelDistribution,
      topModel,
      totalPortfolioSpend,
      activeCategories,
    };
  }, [orders, chartGrouping, chartMetric, focusedModel]);

  if (!isOpen) return null;

  const handleDownloadCertificate = (order: TeslaOrder, stageIdx: number) => {
    const activeStage = ORDER_JOURNEY_STAGES[stageIdx];
    const lines = [
      'TESLA EXECUTIVE FLEET — OFFICIAL RESERVATION & BUILD CERTIFICATE',
      '==================================================================',
      `Order Reference : ${order.orderId}`,
      `Reservation VIN : ${order.reservationVin}`,
      `Order Date      : ${order.orderDate}`,
      `Vehicle Model   : ${order.vehicleName}`,
      `Exterior Finish : ${order.selectedColor.name}`,
      `Wheel Package   : ${order.selectedWheels.name}`,
      `Interior Cabin  : ${order.selectedInterior.name}`,
      `Total Vehicle Price : $${order.totalPrice.toLocaleString()} USD`,
      `Deposit Paid Today  : $${order.amountPaidToday.toLocaleString()} USD`,
      `Remaining Balance   : $${order.balanceDue.toLocaleString()} USD`,
      `Payment Status      : ${order.paymentStatus.toUpperCase()}`,
      `Build Stage (${stageIdx + 1}/5)   : ${activeStage.title} (${order.status})`,
      `Delivery Location   : ${order.deliveryAddress || 'Tesla Delivery Center'}, ${order.city || ''}`,
      `Estimated Window    : ${order.estimatedDelivery}`,
      '==================================================================',
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tesla-Certificate-${order.reservationVin}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedOrderId(order.orderId);
    window.setTimeout(() => {
      setDownloadedOrderId((prev) => (prev === order.orderId ? null : prev));
    }, 2800);
  };

  const handleGeneratePdfInvoice = (order: TeslaOrder) => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    const deliveryDateLabel = getOrderDeliveryDateLabel(order);
    const invoiceNumber = `INV-${order.orderId.replace(/^TSLA-ORD-/, '')}`;
    const paymentMethodLabel =
      order.paymentMethod === 'gift_card'
        ? 'GIFT CARD'
        : order.paymentMethod === 'wire'
        ? 'WIRE TRANSFER / ACH'
        : order.paymentMethod === 'crypto'
        ? 'CRYPTOCURRENCY (BTC / DOGE / USDC)'
        : (order.paymentMethod || 'ESCROW').toUpperCase();
    const paymentStatusLabel =
      order.paymentStatus === 'approved'
        ? 'APPROVED & VERIFIED'
        : order.paymentStatus === 'rejected'
        ? 'VERIFICATION HOLD'
        : 'PENDING VERIFICATION';

    // Top Header Banner
    doc.setFillColor(6, 16, 36);
    doc.rect(0, 0, pageWidth, 108, 'F');
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 104, pageWidth, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TESLA EXECUTIVE FLEET', margin, 42);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(147, 197, 253);
    doc.text('OFFICIAL VEHICLE INVOICE, PAYMENT RECORD & VIN ALLOCATION', margin, 60);
    doc.text('Issued & Verified via Elon Musk Official Management Table', margin, 76);

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`INVOICE #: ${invoiceNumber}`, pageWidth - margin, 42, { align: 'right' });
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`Order ID: ${order.orderId}`, pageWidth - margin, 58, { align: 'right' });
    doc.text(`Order Date: ${order.orderDate}`, pageWidth - margin, 72, { align: 'right' });
    doc.text(`Delivered: ${deliveryDateLabel}`, pageWidth - margin, 86, { align: 'right' });

    let y = 136;

    // Customer & Delivery Section
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 74, 4, 4, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('BILLED TO / REGISTERED OWNER', margin + 12, y + 18);
    doc.text('DELIVERY & LOGISTICS DESTINATION', margin + contentWidth / 2 + 6, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(order.customerName, margin + 12, y + 35);
    doc.text(order.customerEmail, margin + 12, y + 49);
    doc.text(order.customerPhone || '+1 (555) 019-2834', margin + 12, y + 63);

    doc.text(order.deliveryAddress || 'Tesla Delivery Center', margin + contentWidth / 2 + 6, y + 35);
    doc.text(
      `${order.city || 'Austin, TX'}${order.postalCode ? ` ${order.postalCode}` : ''}`,
      margin + contentWidth / 2 + 6,
      y + 49
    );
    doc.text(`Final Status: ${order.status}`, margin + contentWidth / 2 + 6, y + 63);

    y += 94;

    // VIN Allocation Box
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentWidth, 64, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text('OFFICIAL VIN ALLOCATION & VEHICLE SPECIFICATION', margin + 12, y + 18);

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`VIN: ${order.reservationVin}`, margin + 12, y + 37);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Model: ${order.vehicleName}${order.flightModeCertified ? ' (SpaceX Cold Gas Flight Certified)' : ''}`,
      margin + 12,
      y + 52
    );
    doc.text(
      `Approved: ${order.approvedAt ? new Date(order.approvedAt).toLocaleDateString('en-US') : order.orderDate}`,
      pageWidth - margin - 12,
      y + 37,
      { align: 'right' }
    );

    y += 82;

    // Configuration Details Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ORDER CONFIGURATION & LINE ITEMS', margin, y);
    y += 10;

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ITEM / SPECIFICATION', margin + 10, y + 14);
    doc.text('DETAILS', pageWidth - margin - 10, y + 14, { align: 'right' });
    y += 22;

    const configRows: Array<[string, string]> = [
      ['Vehicle Model', order.vehicleName],
      ['Exterior Finish', order.selectedColor.name],
      ['Wheel Package', `${order.selectedWheels.name}${order.selectedWheels.size ? ` (${order.selectedWheels.size})` : ''}`],
      ['Interior Cockpit', order.selectedInterior.name],
      [
        'Autonomous & Aerospace Packages',
        order.selectedPackages && order.selectedPackages.length > 0
          ? order.selectedPackages.map((p) => p.name).join(', ')
          : 'Standard Factory Equipment',
      ],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    configRows.forEach(([label, val], idx) => {
      const wrappedVal = doc.splitTextToSize(val, contentWidth * 0.55);
      const rowHeight = Math.max(22, wrappedVal.length * 12 + 10);
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 10, y + 15);
      doc.setTextColor(15, 23, 42);
      doc.text(wrappedVal, pageWidth - margin - 10, y + 15, { align: 'right' });
      y += rowHeight;
    });

    y += 20;

    // Payment Status & Financial Ledger
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PAYMENT STATUS & SETTLEMENT SUMMARY', margin, y);
    y += 10;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 128, 4, 4, 'FD');

    const paymentRows: Array<[string, string, boolean?]> = [
      ['Payment Status', paymentStatusLabel, true],
      ['Settlement Method', paymentMethodLabel],
      ['Payment Reference', order.paymentReference || 'N/A'],
      ['Payment Plan', order.paymentType === 'full' ? 'Full Vehicle Settlement' : 'Reservation Deposit + Delivery Balance'],
      ['Total Configured Vehicle Price', `$${order.totalPrice.toLocaleString()} USD`, true],
      ['Amount Paid / Verified Deposit', `$${order.amountPaidToday.toLocaleString()} USD`],
      ['Remaining Balance Due', `$${order.balanceDue.toLocaleString()} USD`],
    ];

    let py = y + 18;
    paymentRows.forEach(([label, val, highlight]) => {
      doc.setFont('helvetica', highlight ? 'bold' : 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(71, 85, 105);
      doc.text(label, margin + 12, py);
      doc.setFont('courier', highlight ? 'bold' : 'normal');
      doc.setTextColor(highlight && label === 'Payment Status' ? 5 : 15, highlight && label === 'Payment Status' ? 150 : 23, highlight && label === 'Payment Status' ? 105 : 42);
      doc.text(val, pageWidth - margin - 12, py, { align: 'right' });
      py += 16;
    });

    y += 146;

    if (order.approvalNotes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('Management Table Notes:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(order.approvalNotes, contentWidth);
      doc.text(noteLines, margin, y + 14);
      y += 16 + noteLines.length * 12;
    }

    // Footer Stamp
    const footerY = Math.min(740, Math.max(y + 18, 690));
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Generated ${new Date().toLocaleString('en-US')} · Official Customer Record · Elon Musk Official Management Table`,
      margin,
      footerY + 16
    );
    doc.text(`VIN ${order.reservationVin} · ${order.orderId}`, pageWidth - margin, footerY + 16, {
      align: 'right',
    });

    doc.save(`Tesla-Invoice-${order.orderId}.pdf`);

    setGeneratedInvoiceOrderId(order.orderId);
    window.setTimeout(() => {
      setGeneratedInvoiceOrderId((prev) => (prev === order.orderId ? null : prev));
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">

        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                My Tesla Vehicle Fleet & Orders
              </h3>
              <p className="text-xs text-blue-200/80">
                Live Production-to-Delivery tracking & fleet buying trend analytics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close My Orders modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Order Frequency & Model-Type Buying Trends Recharts Panel */}
          <div className="rounded-2xl bg-[#08142b] border border-blue-800/60 overflow-hidden">
            <div className="p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/50 bg-[#050d20]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm sm:text-base text-white">
                    Order Frequency &amp; Model Buying Trends
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Vehicle reservation volume over time categorized by Tesla model family
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrendsChart((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-[#08142b] hover:bg-[#0d2044] border border-blue-800/70 text-xs font-mono font-semibold text-blue-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <span>{showTrendsChart ? 'Collapse Analytics' : 'Show Trends Chart'}</span>
                {showTrendsChart ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {showTrendsChart && (
              <div className="p-4 sm:p-5 space-y-4">
                {/* Summary KPI Strip + Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="grid grid-cols-3 gap-2.5 flex-1 text-xs font-mono tabular-nums">
                    <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Fleet Orders</span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {orders.length}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Top Model Type</span>
                      <span className="text-sm sm:text-base font-bold text-blue-300 truncate block">
                        {orderTrendAnalytics.topModel
                          ? `${orderTrendAnalytics.topModel.key} (${orderTrendAnalytics.topModel.count})`
                          : 'No orders yet'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#040a18]/90 border border-blue-900/60">
                      <span className="text-[10px] text-slate-400 block">Total Allocation</span>
                      <span className="text-sm sm:text-base font-bold text-emerald-300">
                        ${orderTrendAnalytics.totalPortfolioSpend.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Chart Time & Metric Switchers */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div
                      role="group"
                      aria-label="Order timeline grouping"
                      className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70"
                    >
                      <button
                        type="button"
                        onClick={() => setChartGrouping('monthly')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          chartGrouping === 'monthly'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartGrouping('daily')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          chartGrouping === 'daily'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        By Date
                      </button>
                    </div>

                    <div
                      role="group"
                      aria-label="Order chart metric"
                      className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70"
                    >
                      <button
                        type="button"
                        onClick={() => setChartMetric('count')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          chartMetric === 'count'
                            ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Order Count
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartMetric('spend')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          chartMetric === 'spend'
                            ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Value ($ USD)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Model Filter / Legend Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFocusedModel('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        focusedModel === 'all'
                          ? 'bg-blue-600/25 border-blue-400 text-white'
                          : 'bg-[#040a18] border-blue-900/70 text-slate-300 hover:text-white'
                      }`}
                    >
                      All Models
                    </button>
                    {MODEL_CATEGORIES.filter(
                      (cat) =>
                        cat.key !== 'Custom Fleet' ||
                        orderTrendAnalytics.modelDistribution.some((m) => m.key === 'Custom Fleet')
                    ).map((cat) => {
                      const match = orderTrendAnalytics.modelDistribution.find((m) => m.key === cat.key);
                      const isActive = focusedModel === cat.key;
                      return (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFocusedModel(isActive ? 'all' : cat.key)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                            isActive
                              ? 'bg-[#0d2044] border-blue-400 text-white font-bold'
                              : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-sm ${cat.dotClass} shrink-0`} />
                          <span>{cat.key}</span>
                          {match && (
                            <span className="text-slate-400 tabular-nums">({match.count})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recharts Stacked BarChart Container */}
                <div className="relative p-3 sm:p-4 rounded-xl bg-[#040a18]/90 border border-blue-900/60">
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={210}>
                      <BarChart
                        data={orderTrendAnalytics.chartRows}
                        margin={{ top: 10, right: 10, left: 0, bottom: 2 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#172a4f"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="label"
                          stroke="#64748b"
                          tick={{
                            fill: '#cbd5e1',
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                          tickLine={false}
                          axisLine={{ stroke: '#172a4f' }}
                          dy={4}
                        />
                        <YAxis
                          stroke="#64748b"
                          allowDecimals={false}
                          width={chartMetric === 'spend' ? 58 : 36}
                          tick={{
                            fill: '#cbd5e1',
                            fontSize: 11,
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val: number) =>
                            chartMetric === 'count'
                              ? `${val}`
                              : val >= 1000
                              ? `$${Math.round(val / 1000)}k`
                              : `$${val}`
                          }
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(59, 130, 246, 0.12)' }}
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const row = payload[0].payload as OrderChartRow;
                            const nonZeroModels = MODEL_CATEGORIES.filter(
                              (cat) =>
                                row.countByModel[cat.key] > 0 &&
                                (focusedModel === 'all' || cat.key === focusedModel)
                            );
                            return (
                              <div className="p-3 rounded-xl bg-[#08142c]/95 border border-blue-400/60 shadow-2xl space-y-2 min-w-[210px]">
                                <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
                                  <span className="text-blue-300 font-bold">{row.label}</span>
                                  <span className="text-slate-300 tabular-nums">
                                    {row.totalCount} {row.totalCount === 1 ? 'order' : 'orders'}
                                  </span>
                                </div>
                                <div className="text-sm font-black font-mono tabular-nums text-white">
                                  ${row.totalSpend.toLocaleString()} USD
                                </div>
                                {nonZeroModels.length > 0 ? (
                                  <div className="pt-1.5 border-t border-blue-900/60 space-y-1 text-[11px] font-mono tabular-nums">
                                    {nonZeroModels.map((cat) => (
                                      <div
                                        key={cat.key}
                                        className="flex items-center justify-between gap-4 text-slate-200"
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <span className={`w-2 h-2 rounded-sm ${cat.dotClass}`} />
                                          <span>{cat.key}</span>
                                        </span>
                                        <span className="text-white font-semibold">
                                          {chartMetric === 'count'
                                            ? `${row.countByModel[cat.key]}x`
                                            : `$${row.spendByModel[cat.key].toLocaleString()}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    No orders placed in this period
                                  </div>
                                )}
                              </div>
                            );
                          }}
                        />
                        {orderTrendAnalytics.activeCategories.map((cat, index, arr) => (
                          <Bar
                            key={cat.key}
                            dataKey={cat.key}
                            stackId="orders"
                            fill={cat.color}
                            maxBarSize={42}
                            radius={index === arr.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {orders.length === 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-900/50 text-center text-[11px] font-mono text-slate-400">
                      Reserve any vehicle from the Tesla Showroom to plot your order frequency and model distribution timeline.
                    </div>
                  )}

                  {orderTrendAnalytics.modelDistribution.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-900/50 space-y-2">
                      <div className="flex h-2 w-full rounded-full overflow-hidden bg-[#08142b]">
                        {orderTrendAnalytics.modelDistribution.map((item) => (
                          <div
                            key={item.key}
                            style={{
                              width: `${Math.max(item.sharePct, 4)}%`,
                              backgroundColor: item.color,
                            }}
                            title={`${item.key}: ${item.count} (${item.sharePct}%)`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300 tabular-nums">
                        <div className="flex flex-wrap items-center gap-3">
                          {orderTrendAnalytics.modelDistribution.map((item) => (
                            <span key={item.key} className="inline-flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-sm ${item.dotClass}`} />
                              <span className="text-white font-semibold">{item.key}</span>
                              <span className="text-slate-400">
                                {item.sharePct}% ({item.count})
                              </span>
                            </span>
                          ))}
                        </div>
                        <span className="text-slate-400">Buying mix by model share</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="p-8 sm:p-10 text-center rounded-2xl bg-[#08142b] border border-blue-900/60 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0d1f44] border border-blue-700/50 mx-auto flex items-center justify-center text-blue-300">
                <Car className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">No Active Vehicle Orders</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  You have not placed a reservation for a Tesla production vehicle yet. Configure a vehicle in the showroom to track its journey from Production to Delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOrderNewCar();
                }}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-semibold text-xs cursor-pointer shadow-md whitespace-nowrap"
              >
                Browse Fleet & Reserve
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* View Switcher: All Orders vs Active Builds vs Historical Ownership Timeline */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div
                  role="tablist"
                  aria-label="Vehicle order views"
                  className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70 w-fit"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ordersViewTab === 'all'}
                    onClick={() => setOrdersViewTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      ordersViewTab === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ordersViewTab === 'active'}
                    onClick={() => setOrdersViewTab('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      ordersViewTab === 'active'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Active Builds ({ownershipAnalytics.activeOrders.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={ordersViewTab === 'timeline'}
                    onClick={() => setOrdersViewTab('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      ordersViewTab === 'timeline'
                        ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Ownership Timeline ({ownershipAnalytics.completedOrders.length})</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {ordersViewTab === 'timeline'
                    ? 'Permanent record of delivered vehicles & milestones'
                    : 'Click Tracking History on any order to inspect full audit log'}
                </span>
              </div>

              {/* Active / In-Progress Vehicle Order Cards */}
              {ordersViewTab !== 'timeline' && (
                <div className="space-y-4">
                  {(ordersViewTab === 'active'
                    ? ownershipAnalytics.activeOrders
                    : ownershipAnalytics.activeOrders.length > 0
                    ? ownershipAnalytics.activeOrders
                    : []
                  ).map((order) => {
                    const isPending = !order.paymentStatus || order.paymentStatus === 'pending_admin_approval';
                    const isApproved = order.paymentStatus === 'approved';
                    const isRejected = order.paymentStatus === 'rejected';

                    const currentStageIdx = getOrderStageIndex(order);
                    const inspectedIdx =
                      inspectedStepByOrder[order.orderId] !== undefined
                        ? inspectedStepByOrder[order.orderId]
                        : currentStageIdx;
                    const inspectedStage = ORDER_JOURNEY_STAGES[inspectedIdx];
                    const InspectedIcon = inspectedStage.icon;
                    const progressPercent = Math.round(((currentStageIdx + 1) / ORDER_JOURNEY_STAGES.length) * 100);
                    const railWidthPercent = (currentStageIdx / (ORDER_JOURNEY_STAGES.length - 1)) * 100;
                    const isDelivered = currentStageIdx === ORDER_JOURNEY_STAGES.length - 1;
                    const nextStage =
                      currentStageIdx < ORDER_JOURNEY_STAGES.length - 1
                        ? ORDER_JOURNEY_STAGES[currentStageIdx + 1]
                        : null;
                    const trackingEvents = getOrderTrackingHistory(order);
                    const isHistoryExpanded = !!expandedHistoryByOrder[order.orderId];

                    return (
                      <div
                        key={order.orderId}
                        className="p-5 rounded-xl bg-[#08142b] border border-blue-900/60 hover:border-blue-400/70 transition-all space-y-4"
                      >
                        {/* Top Order Summary Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-blue-900/50">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-blue-300 font-mono tabular-nums font-semibold">
                              <span>{order.orderId}</span>
                              <span aria-hidden="true" className="text-slate-500">·</span>
                              <span className="text-slate-400 font-sans font-normal">{order.orderDate}</span>
                            </div>
                            <h4 className="font-display text-lg font-bold text-white">
                              {order.vehicleName}
                            </h4>
                            <div className="text-xs text-slate-300">
                              {order.itemCategory === 'merch'
                                ? `${order.merchQualityTier || order.selectedInterior.name} · Size: ${order.merchSize || 'Standard'} · Qty: ${order.merchQuantity || 1}`
                                : `Color: ${order.selectedColor.name} · Wheels: ${order.selectedWheels.name} · Interior: ${order.selectedInterior.name}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isPending && (
                              <span className="text-xs px-2.5 py-1 rounded bg-red-600/20 text-red-200 border border-red-400/50 font-semibold flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5" />
                                Pending Elon Musk Management Approval
                              </span>
                            )}
                            {isApproved && (
                              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {isDelivered ? 'Delivered & Handed Over' : 'Approved & In Build'}
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-xs px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-semibold flex items-center gap-1 whitespace-nowrap">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Payment Verification Needed
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => onCancelOrder(order.orderId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-blue-950/60 transition-colors cursor-pointer"
                              title="Cancel reservation & refund deposit"
                              aria-label={`Cancel order ${order.orderId}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Stylized Production-to-Delivery Step-Progress Tracker Bar */}
                        <div className="p-4 rounded-xl bg-[#040a18]/90 border border-blue-800/55 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-mono font-bold text-blue-300 uppercase tracking-wider">
                                Production to Delivery Journey
                              </span>
                              <span aria-hidden="true" className="text-slate-600">·</span>
                              <span className="font-mono tabular-nums text-white font-semibold">
                                Stage {currentStageIdx + 1}/5 ({progressPercent}%)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isApproved && nextStage && onUpdateOrderStatus ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedIdx = currentStageIdx + 1;
                                    onUpdateOrderStatus(order.orderId, nextStage.statusValue);
                                    setInspectedStepByOrder((prev) => ({
                                      ...prev,
                                      [order.orderId]: updatedIdx,
                                    }));
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 shadow-sm"
                                >
                                  <span>Advance to {nextStage.shortLabel}</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              ) : isDelivered ? (
                                <span className="text-[11px] font-mono font-semibold text-emerald-300 flex items-center gap-1 whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Journey Complete
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Select any milestone to inspect details
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Multi-Node Connected Track Rail */}
                          <div className="relative pt-1 pb-1">
                            {/* Base Background Rail (positioned vertically centered behind w-9/w-10 nodes) */}
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

                            {/* 5 Step Nodes */}
                            <div className="relative grid grid-cols-5 gap-1 sm:gap-2">
                              {ORDER_JOURNEY_STAGES.map((stage, idx) => {
                                const StepIcon = stage.icon;
                                const isCompleted = idx < currentStageIdx || (isDelivered && idx === currentStageIdx);
                                const isCurrent = idx === currentStageIdx && !isDelivered;
                                const isInspected = idx === inspectedIdx;

                                return (
                                  <button
                                    key={stage.id}
                                    type="button"
                                    onClick={() =>
                                      setInspectedStepByOrder((prev) => ({
                                        ...prev,
                                        [order.orderId]: idx,
                                      }))
                                    }
                                    aria-current={isCurrent || (isDelivered && idx === 4) ? 'step' : undefined}
                                    aria-label={`${stage.title} milestone`}
                                    className="group flex flex-col items-center text-center cursor-pointer focus:outline-none"
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
                                      } ${isInspected && !isCurrent ? 'ring-2 ring-blue-400/60 scale-105' : ''}`}
                                    >
                                      {isCompleted && idx < currentStageIdx ? (
                                        <Check className="w-4 h-4 stroke-[3]" />
                                      ) : isDelivered && idx === 4 ? (
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
                                      className={`mt-0.5 text-[9px] font-mono uppercase tracking-wider transition-opacity ${
                                        isCurrent
                                          ? isRejected
                                            ? 'text-red-300 opacity-100'
                                            : 'text-blue-300 opacity-100'
                                          : isCompleted
                                          ? 'text-emerald-400/80 opacity-100'
                                          : isInspected
                                          ? 'text-blue-300/90 opacity-100'
                                          : 'opacity-0 group-hover:opacity-75 text-slate-400'
                                      }`}
                                    >
                                      {idx < currentStageIdx || (isDelivered && idx === 4)
                                        ? 'Done'
                                        : isCurrent
                                        ? isRejected
                                          ? 'Hold'
                                          : 'Active'
                                        : isInspected
                                        ? 'View'
                                        : 'Next'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Milestone Inspection Panel */}
                          <div className="p-3 rounded-lg bg-[#08142b]/85 border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  inspectedIdx < currentStageIdx || (isDelivered && inspectedIdx === 4)
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : inspectedIdx === currentStageIdx
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
                                    {inspectedStage.facility}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 leading-relaxed">
                                  {inspectedStage.description(order)}
                                </p>
                              </div>
                            </div>

                            <div className="text-[11px] font-mono shrink-0 sm:text-right">
                              {inspectedIdx < currentStageIdx || (isDelivered && inspectedIdx === 4) ? (
                                <span className="text-emerald-300 font-semibold">Milestone Completed</span>
                              ) : inspectedIdx === currentStageIdx ? (
                                <span className={isRejected ? 'text-red-300 font-semibold' : 'text-blue-300 font-semibold'}>
                                  {isPending
                                    ? 'Queued (Awaiting Elon Musk Management)'
                                    : isRejected
                                    ? 'Action Required'
                                    : 'Currently In Progress'}
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  Est. {order.estimatedDelivery}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Approval Status Callout */}
                        {isPending ? (
                          <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-500/35 text-xs text-blue-100 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                              <span>Sent to Elon Musk Official Management Table for account provisioning and payment verification. Once verified, assembly progression unlocks automatically.</span>
                            </div>
                            {onOpenInbox && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onOpenInbox();
                                }}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] shrink-0 font-bold cursor-pointer whitespace-nowrap"
                              >
                                Open Inbox
                              </button>
                            )}
                          </div>
                        ) : isApproved ? (
                          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Payment approved by Elon Musk Official Management Table — VIN {order.reservationVin} active in Gigafactory telemetry ({order.status}).
                            </span>
                          </div>
                        ) : null}

                        {/* Core Financial & Logistics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <div className="text-slate-400 text-[10px] uppercase">
                              {order.itemCategory === 'merch' ? 'SKU Reference' : 'Reservation VIN'}
                            </div>
                            <div className="font-mono tabular-nums text-blue-300 font-bold">{order.reservationVin}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[10px] uppercase">
                              {order.itemCategory === 'merch' ? 'Paid Today' : 'Paid Today (Deposit)'}
                            </div>
                            <div className="font-mono tabular-nums text-white font-bold">${order.amountPaidToday.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[10px] uppercase">
                              {order.itemCategory === 'merch' ? 'Order Total' : 'Real Vehicle Price'}
                            </div>
                            <div className="font-mono tabular-nums text-white font-bold">${order.totalPrice.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 text-[10px] uppercase">Estimated Delivery</div>
                            <div className="text-slate-200 font-medium">{order.estimatedDelivery}</div>
                          </div>
                        </div>

                        {/* Admin External Tracking URL Input (Admin Only) */}
                        {isAdmin && onAttachTrackingUrl && (
                          <div className="p-3.5 rounded-xl bg-[#040a18]/90 border border-blue-500/40 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                              <span className="text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5 text-red-400" />
                                <span>Elon Musk Management · External Shipment Tracking URL</span>
                              </span>
                              {order.externalTrackingUrl && (
                                <span className="text-emerald-400 font-semibold">
                                  Active Link Published
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="url"
                                value={trackingUrlDrafts[order.orderId] ?? order.externalTrackingUrl ?? ''}
                                onChange={(e) => {
                                  const nextVal = e.target.value;
                                  setTrackingUrlDrafts((prev) => ({ ...prev, [order.orderId]: nextVal }));
                                  if (trackingUrlErrors[order.orderId]) {
                                    setTrackingUrlErrors((prev) => ({ ...prev, [order.orderId]: '' }));
                                  }
                                }}
                                placeholder="Paste external tracking URL (e.g. https://carrier.com/track/VIN...)"
                                className="flex-1 px-3 py-2 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleTrackingUrlSubmit(order)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-sm"
                              >
                                <Link2 className="w-3.5 h-3.5" />
                                <span>{order.externalTrackingUrl ? 'Update Tracking URL' : 'Attach Tracking URL'}</span>
                              </button>
                            </div>
                            {trackingUrlErrors[order.orderId] && (
                              <div className="text-[11px] font-mono text-red-300">
                                {trackingUrlErrors[order.orderId]}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer Action Row */}
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-300 border-t border-blue-900/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>{order.customerName} · {order.deliveryAddress || order.city || 'Tesla Delivery Center'}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {sanitizeExternalUrl(order.externalTrackingUrl) && (
                              <a
                                href={sanitizeExternalUrl(order.externalTrackingUrl)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-mono whitespace-nowrap font-semibold"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>External Tracking</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setExpandedHistoryByOrder((prev) => ({
                                  ...prev,
                                  [order.orderId]: !prev[order.orderId],
                                }))
                              }
                              aria-expanded={isHistoryExpanded}
                              className="text-xs text-slate-200 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono whitespace-nowrap"
                            >
                              <History className="w-3.5 h-3.5 text-blue-300" />
                              <span>Tracking History ({trackingEvents.length})</span>
                              {isHistoryExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>

                            {isDelivered && (
                              <button
                                type="button"
                                onClick={() => handleGeneratePdfInvoice(order)}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs flex items-center gap-1.5 cursor-pointer font-mono font-semibold whitespace-nowrap shadow-sm"
                              >
                                {generatedInvoiceOrderId === order.orderId ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>PDF Invoice Ready</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Generate PDF Invoice</span>
                                  </>
                                )}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadCertificate(order, currentStageIdx)}
                              className="text-xs text-blue-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono whitespace-nowrap"
                            >
                              {downloadedOrderId === order.orderId ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">Certificate Downloaded</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Certificate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Individual Order Tracking History Log */}
                        {isHistoryExpanded && (
                          <div className="p-4 rounded-xl bg-[#040a18]/90 border border-blue-800/60 space-y-3">
                            <div className="flex items-center justify-between gap-2 text-xs font-mono">
                              <span className="text-blue-300 font-bold uppercase tracking-wider">
                                Individual Order Tracking History
                              </span>
                              <span className="text-slate-400 tabular-nums">
                                {trackingEvents.length} logged {trackingEvents.length === 1 ? 'event' : 'events'}
                              </span>
                            </div>

                            <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-blue-800/70">
                              {trackingEvents.map((evt) => {
                                const safeEvtUrl = sanitizeExternalUrl(evt.externalTrackingUrl);
                                return (
                                  <div key={evt.id} className="relative space-y-1 text-xs">
                                    <span
                                      aria-hidden="true"
                                      className={`absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                                        evt.statusType === 'delivered' || evt.statusType === 'approved'
                                          ? 'bg-emerald-500 border-emerald-200'
                                          : evt.statusType === 'rejected'
                                          ? 'bg-red-500 border-red-200'
                                          : 'bg-blue-500 border-blue-200'
                                      }`}
                                    />
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{evt.title}</span>
                                        <span className="text-[11px] font-mono text-blue-300">
                                          {evt.stage}
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                        {evt.dateStr}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                      {evt.details}
                                    </p>
                                    {evt.location && (
                                      <div className="text-[10px] font-mono text-slate-400">
                                        Hub: {evt.location}
                                      </div>
                                    )}
                                    {safeEvtUrl && (
                                      <div className="mt-1.5 p-2.5 rounded-lg bg-[#08142b] border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Link2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                                          <a
                                            href={safeEvtUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[11px] font-mono text-blue-300 hover:text-white underline truncate"
                                          >
                                            {safeEvtUrl}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleCopyTrackingLink(evt.id, safeEvtUrl)}
                                            className="px-2 py-1 rounded bg-[#040a18] border border-blue-800/70 text-[10px] font-mono text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer"
                                          >
                                            {copiedTrackingEventId === evt.id ? (
                                              <>
                                                <Check className="w-3 h-3 text-emerald-400" />
                                                <span className="text-emerald-300">Copied</span>
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3 h-3" />
                                                <span>Copy</span>
                                              </>
                                            )}
                                          </button>
                                          <a
                                            href={safeEvtUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap"
                                          >
                                            <span>Open Live Tracking</span>
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {ordersViewTab === 'active' && ownershipAnalytics.activeOrders.length === 0 && (
                    <div className="p-6 rounded-xl bg-[#08142b] border border-blue-900/60 text-center space-y-2">
                      <p className="text-xs font-semibold text-white">
                        All existing vehicle orders have been delivered.
                      </p>
                      <button
                        type="button"
                        onClick={() => setOrdersViewTab('timeline')}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold cursor-pointer"
                      >
                        View Ownership Timeline ({ownershipAnalytics.completedOrders.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Historical Ownership Record Timeline View (Previous Completed Orders) */}
              {(ordersViewTab === 'timeline' ||
                (ordersViewTab === 'all' && ownershipAnalytics.completedOrders.length > 0)) && (
                <div className="p-5 rounded-2xl bg-[#040a18]/90 border border-emerald-500/35 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-900/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm sm:text-base text-white">
                          Ownership Record &amp; Completed Deliveries Timeline
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Chronological ownership log showing delivery dates, models, final statuses, and full tracking records
                        </p>
                      </div>
                    </div>

                    {ownershipAnalytics.completedOrders.length > 0 && (
                      <div className="flex items-center gap-3 text-[11px] font-mono tabular-nums text-slate-300">
                        <span>
                          Delivered: <strong className="text-emerald-300">{ownershipAnalytics.completedOrders.length}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>
                          Models: <strong className="text-white">{ownershipAnalytics.distinctModels}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span>
                          Value: <strong className="text-white">${ownershipAnalytics.totalDeliveredSpend.toLocaleString()}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {ownershipAnalytics.completedOrders.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-[#08142b]/80 border border-blue-900/50 space-y-3">
                      <p className="text-xs text-slate-200 font-semibold">
                        No completed vehicle deliveries recorded yet.
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        Once an approved reservation advances through Production, Assembly, Quality Check, and In Transit to Delivery, it is permanently archived here with its delivery date and ownership certificate.
                      </p>
                      {ownershipAnalytics.activeOrders.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOrdersViewTab('active')}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold cursor-pointer"
                        >
                          Track Active Builds ({ownershipAnalytics.activeOrders.length})
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-[9px] sm:before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-blue-500 before:to-blue-900">
                      {ownershipAnalytics.completedOrders.map((order) => {
                        const deliveryDateLabel = getOrderDeliveryDateLabel(order);
                        const trackingEvents = getOrderTrackingHistory(order);
                        const isHistoryExpanded = !!expandedHistoryByOrder[order.orderId];

                        return (
                          <div
                            key={`history-${order.orderId}`}
                            className="relative p-4 rounded-xl bg-[#08142b] border border-blue-900/60 hover:border-emerald-400/50 transition-colors space-y-3"
                          >
                            {/* Timeline Spine Milestone Dot */}
                            <span
                              aria-hidden="true"
                              className="absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#040a18] flex items-center justify-center text-white shadow-md shadow-emerald-500/25"
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-blue-900/50">
                              <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                                  <span className="inline-flex items-center gap-1 text-emerald-300 font-bold tabular-nums">
                                    <Calendar className="w-3 h-3" />
                                    Delivered {deliveryDateLabel}
                                  </span>
                                  <span aria-hidden="true" className="text-slate-600">·</span>
                                  <span className="text-slate-400 tabular-nums">
                                    Ordered {order.orderDate}
                                  </span>
                                  <span aria-hidden="true" className="text-slate-600">·</span>
                                  <span className="text-blue-300 tabular-nums">{order.orderId}</span>
                                </div>
                                <h5 className="font-display text-base font-bold text-white">
                                  {order.vehicleName}
                                </h5>
                                <div className="text-xs text-slate-300">
                                  {order.selectedColor.name} · {order.selectedWheels.name} · {order.selectedInterior.name}
                                </div>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1 whitespace-nowrap">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Final Status: {order.status}
                                </span>
                                <span className="text-[11px] font-mono tabular-nums text-slate-300">
                                  ${order.totalPrice.toLocaleString()} · VIN {order.reservationVin}
                                </span>
                              </div>
                            </div>

                            {/* Admin External Tracking URL Input (Admin Only) */}
                            {isAdmin && onAttachTrackingUrl && (
                              <div className="p-3 rounded-lg bg-[#040a18]/90 border border-blue-500/40 space-y-2">
                                <div className="text-[10px] font-mono text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <Link2 className="w-3.5 h-3.5 text-red-400" />
                                  <span>Elon Musk Management · External Shipment Tracking URL</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="url"
                                    value={trackingUrlDrafts[order.orderId] ?? order.externalTrackingUrl ?? ''}
                                    onChange={(e) => {
                                      const nextVal = e.target.value;
                                      setTrackingUrlDrafts((prev) => ({ ...prev, [order.orderId]: nextVal }));
                                      if (trackingUrlErrors[order.orderId]) {
                                        setTrackingUrlErrors((prev) => ({ ...prev, [order.orderId]: '' }));
                                      }
                                    }}
                                    placeholder="Paste external tracking URL (e.g. https://carrier.com/track/VIN...)"
                                    className="flex-1 px-3 py-1.5 text-xs bg-[#08142b] border border-blue-900/70 rounded-lg text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleTrackingUrlSubmit(order)}
                                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                                  >
                                    <Link2 className="w-3.5 h-3.5" />
                                    <span>{order.externalTrackingUrl ? 'Update Tracking URL' : 'Attach Tracking URL'}</span>
                                  </button>
                                </div>
                                {trackingUrlErrors[order.orderId] && (
                                  <div className="text-[11px] font-mono text-red-300">
                                    {trackingUrlErrors[order.orderId]}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>
                                  {order.customerName} · {order.deliveryAddress || order.city || 'Tesla Delivery Center'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {sanitizeExternalUrl(order.externalTrackingUrl) && (
                                  <a
                                    href={sanitizeExternalUrl(order.externalTrackingUrl)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-mono whitespace-nowrap font-semibold"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>External Tracking</span>
                                  </a>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedHistoryByOrder((prev) => ({
                                      ...prev,
                                      [order.orderId]: !prev[order.orderId],
                                    }))
                                  }
                                  aria-expanded={isHistoryExpanded}
                                  className="text-xs text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer font-mono whitespace-nowrap"
                                >
                                  <History className="w-3.5 h-3.5 text-blue-300" />
                                  <span>Tracking History ({trackingEvents.length})</span>
                                  {isHistoryExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleGeneratePdfInvoice(order)}
                                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs flex items-center gap-1.5 cursor-pointer font-mono font-semibold whitespace-nowrap shadow-sm"
                                >
                                  {generatedInvoiceOrderId === order.orderId ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                                      <span>PDF Invoice Ready</span>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>Generate PDF Invoice</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadCertificate(order, 4)}
                                  className="text-xs text-blue-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono whitespace-nowrap"
                                >
                                  {downloadedOrderId === order.orderId ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-300">Certificate Downloaded</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-3.5 h-3.5" />
                                      <span>Certificate</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {isHistoryExpanded && (
                              <div className="p-3.5 rounded-lg bg-[#040a18]/90 border border-blue-800/60 space-y-2.5">
                                <div className="text-[11px] font-mono text-blue-300 font-bold uppercase tracking-wider">
                                  Complete Order Tracking History
                                </div>
                                <div className="relative pl-5 space-y-2.5 before:content-[''] before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-blue-800/70">
                                  {trackingEvents.map((evt) => {
                                    const safeEvtUrl = sanitizeExternalUrl(evt.externalTrackingUrl);
                                    return (
                                      <div key={evt.id} className="relative space-y-1 text-xs">
                                        <span
                                          aria-hidden="true"
                                          className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2 ${
                                            evt.statusType === 'delivered' || evt.statusType === 'approved'
                                              ? 'bg-emerald-500 border-emerald-200'
                                              : evt.statusType === 'rejected'
                                              ? 'bg-red-500 border-red-200'
                                              : 'bg-blue-500 border-blue-200'
                                          }`}
                                        />
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="font-semibold text-white">
                                            {evt.title}{' '}
                                            <span className="text-[11px] font-mono text-blue-300 font-normal">
                                              ({evt.stage})
                                            </span>
                                          </span>
                                          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                            {evt.dateStr}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-300">{evt.details}</p>
                                        {evt.location && (
                                          <div className="text-[10px] font-mono text-slate-400">
                                            Hub: {evt.location}
                                          </div>
                                        )}
                                        {safeEvtUrl && (
                                          <div className="mt-1 p-2 rounded-lg bg-[#08142b] border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <Link2 className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                                              <a
                                                href={safeEvtUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] font-mono text-blue-300 hover:text-white underline truncate"
                                              >
                                                {safeEvtUrl}
                                              </a>
                                            </div>
                                            <a
                                              href={safeEvtUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-2.5 py-1 rounded bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-[10px] font-mono font-bold flex items-center gap-1 whitespace-nowrap shrink-0"
                                            >
                                              <span>Open Live Tracking</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/60 bg-[#050d20] flex items-center justify-between text-xs">
          <span className="text-slate-300">
            Total active fleet orders: <strong className="text-white font-mono tabular-nums">{orders.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOrderNewCar();
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 cursor-pointer whitespace-nowrap"
            >
              Order Another Tesla
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-blue-800/80 bg-[#0b1b3a] text-slate-200 hover:text-white cursor-pointer whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
