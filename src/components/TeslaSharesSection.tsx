import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Zap,
  Bot,
  Lock,
  FileText,
  Sparkles,
  ChevronRight,
  BarChart3,
  Coins,
  Calculator,
  RefreshCw,
  Bell,
  BellRing,
  Play,
  Pause,
  Trash2,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Percent,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  ComposedChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { PageId, SharePriceAlert } from '../types';

interface TeslaSharesSectionProps {
  onOpenPurchaseModal: (initialQty?: number) => void;
  onViewCertificateSample: () => void;
  onSelectPage: (pageId: PageId) => void;
  approvedSharesCount?: number;
  simulatedSharePrice?: number;
  onAdjustSimulatedPrice?: (nextPrice: number) => void;
  isMarketSimRunning?: boolean;
  onToggleMarketSim?: () => void;
  priceAlerts?: SharePriceAlert[];
  onCreatePriceAlert?: (targetPrice: number, direction: 'above' | 'below', note?: string) => void;
  onDeletePriceAlert?: (alertId: string) => void;
  onOpenInbox?: () => void;
}

interface HistoricalPoint {
  period: string;
  price: number;
  volumeM: number;
  catalyst: string;
}

type TimeframeKey = '6M' | '1Y' | '3Y' | '5Y';

const HISTORICAL_DATA: Record<TimeframeKey, HistoricalPoint[]> = {
  '6M': [
    { period: 'Jun 26', price: 214.20, volumeM: 84.2, catalyst: 'Q2 Delivery Beat (444K units)' },
    { period: 'Jul 26', price: 232.80, volumeM: 112.5, catalyst: 'Energy Storage Record 9.4 GWh' },
    { period: 'Aug 26', price: 225.40, volumeM: 76.8, catalyst: 'Summer Consolidation Phase' },
    { period: 'Sep 26', price: 241.60, volumeM: 95.4, catalyst: 'FSD v13 Neural Fleet Rollout' },
    { period: 'Oct 26', price: 256.90, volumeM: 118.1, catalyst: 'Cybercab & Megapack Margin Expansion' },
    { period: 'Nov 26', price: 268.50, volumeM: 104.6, catalyst: 'Current Treasury Allocation Desk Price' },
  ],
  '1Y': [
    { period: 'Dec 25', price: 182.40, volumeM: 91.0, catalyst: 'Year-End Institutional Rebalancing' },
    { period: 'Jan 26', price: 189.75, volumeM: 88.3, catalyst: 'Q4 Earnings & Austin Expansion' },
    { period: 'Feb 26', price: 196.30, volumeM: 79.4, catalyst: 'Megafactory Lathrop Full Run-Rate' },
    { period: 'Mar 26', price: 191.80, volumeM: 82.1, catalyst: 'Q1 Macro Rate Volatility' },
    { period: 'Apr 26', price: 204.50, volumeM: 97.6, catalyst: 'Optimus Gen-3 Factory Deployment' },
    { period: 'May 26', price: 209.10, volumeM: 85.2, catalyst: 'European Gigafactory Milestone' },
    { period: 'Jun 26', price: 214.20, volumeM: 84.2, catalyst: 'Q2 Delivery Beat (444K units)' },
    { period: 'Jul 26', price: 232.80, volumeM: 112.5, catalyst: 'Energy Storage Record 9.4 GWh' },
    { period: 'Aug 26', price: 225.40, volumeM: 76.8, catalyst: 'Summer Consolidation Phase' },
    { period: 'Sep 26', price: 241.60, volumeM: 95.4, catalyst: 'FSD v13 Neural Fleet Rollout' },
    { period: 'Oct 26', price: 256.90, volumeM: 118.1, catalyst: 'Cybercab & Megapack Margin Expansion' },
    { period: 'Nov 26', price: 268.50, volumeM: 104.6, catalyst: 'Current Treasury Allocation Desk Price' },
  ],
  '3Y': [
    { period: 'Q1 24', price: 175.79, volumeM: 102.4, catalyst: 'Model Y World Best-Selling Vehicle' },
    { period: 'Q2 24', price: 197.88, volumeM: 94.1, catalyst: 'Delaware Reincorporation & Shareholder Vote' },
    { period: 'Q3 24', price: 261.63, volumeM: 115.2, catalyst: 'We, Robot Autonomous Reveal' },
    { period: 'Q4 24', price: 248.90, volumeM: 108.7, catalyst: '4680 Structural Cell Ramp' },
    { period: 'Q1 25', price: 212.30, volumeM: 89.5, catalyst: 'Next-Gen Platform Tooling' },
    { period: 'Q2 25', price: 219.45, volumeM: 86.0, catalyst: 'Lathrop & Shanghai Megapack Surge' },
    { period: 'Q3 25', price: 235.10, volumeM: 92.8, catalyst: 'Cortex AI Cluster Activation' },
    { period: 'Q4 25', price: 182.40, volumeM: 91.0, catalyst: 'Year-End Portfolio Rotation' },
    { period: 'Q1 26', price: 191.80, volumeM: 82.1, catalyst: 'Q1 Delivery Stabilization' },
    { period: 'Q2 26', price: 214.20, volumeM: 84.2, catalyst: 'Q2 Gross Margin Recovery' },
    { period: 'Q3 26', price: 241.60, volumeM: 95.4, catalyst: 'FSD Neural Network Fleet Growth' },
    { period: 'Q4 26', price: 268.50, volumeM: 104.6, catalyst: 'Current Treasury Allocation Desk Price' },
  ],
  '5Y': [
    { period: '2021', price: 204.50, volumeM: 118.0, catalyst: 'S&P 500 Addition & $1T Cap Milestone' },
    { period: '2022', price: 123.18, volumeM: 126.4, catalyst: '3-for-1 Stock Split & Austin Opening' },
    { period: '2023', price: 248.48, volumeM: 132.1, catalyst: 'Cybertruck Launch & NACS Standard' },
    { period: '2024', price: 254.20, volumeM: 105.8, catalyst: 'Cybercab & Megapack Record Scaling' },
    { period: '2025', price: 231.90, volumeM: 90.4, catalyst: 'Optimus Commercial Pilots' },
    { period: '2026', price: 268.50, volumeM: 104.6, catalyst: 'Current Treasury Allocation Desk Price' },
  ],
};

interface DividendTierPreset {
  id: string;
  label: string;
  annualYieldPct: number;
  quarterlyDps: number;
  rationale: string;
}

const DIVIDEND_SCENARIOS: DividendTierPreset[] = [
  {
    id: 'conservative',
    label: '0.80% Yield (Conservative)',
    annualYieldPct: 0.80,
    quarterlyDps: 0.54,
    rationale: 'Preserves 92% FCF for Gigafactory AI & Optimus capex',
  },
  {
    id: 'standard',
    label: '1.50% Yield (Institutional)',
    annualYieldPct: 1.50,
    quarterlyDps: 1.01,
    rationale: 'Balanced return on mature Megapack & Supercharger cashflows',
  },
  {
    id: 'autonomous',
    label: '2.50% Yield (Robotaxi Scale)',
    annualYieldPct: 2.50,
    quarterlyDps: 1.68,
    rationale: 'Projected Cybercab fleet recurring software margin distribution',
  },
];

interface HistoricalDividendYear {
  year: string;
  regularDps: number;
  specialDps: number;
  totalDps: number;
  yieldPct: number;
  payoutRatioPct: number;
  refPrice: number;
  note: string;
}

const HISTORICAL_DIVIDEND_5Y: HistoricalDividendYear[] = [
  {
    year: '2022',
    regularDps: 1.20,
    specialDps: 0.20,
    totalDps: 1.40,
    yieldPct: 1.14,
    payoutRatioPct: 14.2,
    refPrice: 123.18,
    note: 'Austin & Berlin Gigafactory launch milestone allocation',
  },
  {
    year: '2023',
    regularDps: 1.60,
    specialDps: 0.35,
    totalDps: 1.95,
    yieldPct: 0.78,
    payoutRatioPct: 16.5,
    refPrice: 248.48,
    note: 'NACS Supercharger alliance & Cybertruck ramp distribution',
  },
  {
    year: '2024',
    regularDps: 2.16,
    specialDps: 0.44,
    totalDps: 2.60,
    yieldPct: 1.02,
    payoutRatioPct: 18.8,
    refPrice: 254.20,
    note: 'Record Megapack Lathrop output & FSD v12 fleet scale',
  },
  {
    year: '2025',
    regularDps: 2.80,
    specialDps: 0.56,
    totalDps: 3.36,
    yieldPct: 1.45,
    payoutRatioPct: 21.0,
    refPrice: 231.90,
    note: 'Cortex AI training cluster & Optimus pilot cashflows',
  },
  {
    year: '2026',
    regularDps: 3.40,
    specialDps: 0.64,
    totalDps: 4.04,
    yieldPct: 1.50,
    payoutRatioPct: 22.5,
    refPrice: 268.50,
    note: 'Trailing 12-month institutional benchmark ($1.01/qtr eq.)',
  },
];

interface DividendChartRow {
  label: string;
  regularDps: number;
  specialDps: number;
  totalDps: number;
  regularPayout: number;
  specialPayout: number;
  totalPayout: number;
  yieldPct: number;
  payoutRatioPct: number;
  effectiveShares: number;
  note: string;
  isProjected: boolean;
}

const renderRoundedBarShape = (hasTopCapKey: 'specialPayout' | 'specialDps') => {
  return (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    payload?: DividendChartRow;
  }) => {
    const { x = 0, y = 0, width = 0, height = 0, fill = '#3b82f6', payload } = props;
    if (width <= 0 || height <= 0) return <g />;
    const hasTopCap = payload ? payload[hasTopCapKey] > 0.0001 : false;
    const r = hasTopCap ? 0 : Math.min(6, width / 2, height);
    if (r === 0) {
      return <rect x={x} y={y} width={width} height={height} fill={fill} />;
    }
    const path = `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${
      x + width - r
    },${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
    return <path d={path} fill={fill} />;
  };
};

interface Growth10YRow {
  year: string;
  calendarYear: number;
  projectedSharePrice: number;
  startingShares: number;
  dripBonusShares: number;
  totalShares: number;
  baseValue: number;
  dripEquityGain: number;
  totalDripValue: number;
  nonDripTotalValue: number;
  compoundingAdvantage: number;
  baseAnnualDividend: number;
  compoundedBonusDividend: number;
  totalAnnualDividend: number;
}

const renderRoundedGrowthBarShape = (
  topKey: keyof Pick<Growth10YRow, 'dripEquityGain' | 'dripBonusShares' | 'compoundedBonusDividend'>
) => {
  return (props: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    payload?: Growth10YRow;
  }) => {
    const { x = 0, y = 0, width = 0, height = 0, fill = '#3b82f6', payload } = props;
    if (width <= 0 || height <= 0) return <g />;
    const hasTopCap = payload ? payload[topKey] > 0.0001 : false;
    const r = hasTopCap ? 0 : Math.min(6, width / 2, height);
    if (r === 0) {
      return <rect x={x} y={y} width={width} height={height} fill={fill} />;
    }
    const path = `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${
      x + width - r
    },${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`;
    return <path d={path} fill={fill} />;
  };
};

export const TeslaSharesSection: React.FC<TeslaSharesSectionProps> = ({
  onOpenPurchaseModal,
  onViewCertificateSample,
  onSelectPage,
  approvedSharesCount = 0,
  simulatedSharePrice = 268.50,
  onAdjustSimulatedPrice,
  isMarketSimRunning = false,
  onToggleMarketSim,
  priceAlerts = [],
  onCreatePriceAlert,
  onDeletePriceAlert,
  onOpenInbox,
}) => {
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcCustody, setCalcCustody] = useState<'drs' | 'broker' | 'physical'>('drs');
  const [chartTimeframe, setChartTimeframe] = useState<TimeframeKey>('1Y');

  // Dividend Calculator State
  const [dividendShares, setDividendShares] = useState<number>(100);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('standard');
  const [customQuarterlyDps, setCustomQuarterlyDps] = useState<number>(1.01);
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(false);
  const [dividendChartMetric, setDividendChartMetric] = useState<'payout' | 'dps'>('payout');
  const [dividendChartGranularity, setDividendChartGranularity] = useState<'annual' | 'quarterly'>('annual');

  // 10-Year Dividend Portfolio Growth Tracker State
  const [growthDividendRatePct, setGrowthDividendRatePct] = useState<number>(8);
  const [growthPriceRatePct, setGrowthPriceRatePct] = useState<number>(6);
  const [growthChartMetric, setGrowthChartMetric] = useState<'value' | 'shares' | 'income'>('value');

  // Target Share Price Alert Form State
  const [alertTargetInput, setAlertTargetInput] = useState<string>('275.00');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  const [alertNote, setAlertNote] = useState<string>('');
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const sharePrice = simulatedSharePrice;
  const baselineSessionPrice = 268.50;
  const sessionDelta = sharePrice - baselineSessionPrice;
  const sessionDeltaPct = ((4.82 / 100) * baselineSessionPrice + sessionDelta) / baselineSessionPrice * 100;
  const calcTotal = Math.round(calcQuantity * sharePrice * 100) / 100;

  const activeChartData = useMemo(() => {
    const baseSeries = HISTORICAL_DATA[chartTimeframe];
    if (baseSeries.length === 0) return baseSeries;
    return baseSeries.map((pt, idx) =>
      idx === baseSeries.length - 1
        ? {
            ...pt,
            price: sharePrice,
            catalyst:
              Math.abs(sharePrice - baselineSessionPrice) > 0.01
                ? 'Live Simulated Market Feed Price'
                : pt.catalyst,
          }
        : pt
    );
  }, [chartTimeframe, sharePrice]);

  const chartStats = useMemo(() => {
    const first = activeChartData[0]?.price ?? sharePrice;
    const last = activeChartData[activeChartData.length - 1]?.price ?? sharePrice;
    const diff = last - first;
    const pct = first > 0 ? (diff / first) * 100 : 0;
    const high = Math.max(...activeChartData.map((d) => d.price));
    const low = Math.min(...activeChartData.map((d) => d.price));
    const avgVol =
      activeChartData.reduce((acc, d) => acc + d.volumeM, 0) / activeChartData.length;
    return { first, last, diff, pct, high, low, avgVol };
  }, [activeChartData, sharePrice]);

  // Compute Quarterly Dividend Schedule
  const dividendSchedule = useMemo(() => {
    const quarters = [
      { quarter: 'Q1 Distribution', exDate: 'Mar 15, 2027', payDate: 'Mar 31, 2027' },
      { quarter: 'Q2 Distribution', exDate: 'Jun 15, 2027', payDate: 'Jun 30, 2027' },
      { quarter: 'Q3 Distribution', exDate: 'Sep 15, 2027', payDate: 'Sep 30, 2027' },
      { quarter: 'Q4 Distribution', exDate: 'Dec 15, 2027', payDate: 'Dec 31, 2027' },
    ];

    let runningShares = Math.max(0, dividendShares);
    let cumulativeCash = 0;

    const rows = quarters.map((q) => {
      const payout = Math.round(runningShares * customQuarterlyDps * 100) / 100;
      cumulativeCash += payout;
      const sharesHeldStart = runningShares;
      const newDripShares = reinvestDividends ? payout / sharePrice : 0;
      if (reinvestDividends) {
        runningShares = runningShares + newDripShares;
      }
      return {
        ...q,
        sharesHeld: sharesHeldStart,
        dps: customQuarterlyDps,
        payout,
        newDripShares,
      };
    });

    const totalAnnualPayout = Math.round(cumulativeCash * 100) / 100;
    const firstQuarterPayout = rows[0]?.payout ?? 0;
    const positionValue = dividendShares * sharePrice;
    const effectiveAnnualYield =
      positionValue > 0 ? (totalAnnualPayout / positionValue) * 100 : 0;

    return {
      rows,
      totalAnnualPayout,
      firstQuarterPayout,
      positionValue,
      effectiveAnnualYield,
      endingShares: runningShares,
    };
  }, [dividendShares, customQuarterlyDps, reinvestDividends, sharePrice]);

  // 5-Year Historical Dividend Distribution + Live 2027 Calculator Projection Comparison
  const dividendHistoryAnalytics = useMemo(() => {
    const safeShares = Math.max(0, dividendShares);
    let dripRunningShares = safeShares;

    const annualHistoricalSeries: DividendChartRow[] = HISTORICAL_DIVIDEND_5Y.map((item) => {
      const activeShares = reinvestDividends ? dripRunningShares : safeShares;
      const regularPayout = Math.round(item.regularDps * activeShares * 100) / 100;
      const specialPayout = Math.round(item.specialDps * activeShares * 100) / 100;
      const totalPayout = Math.round((regularPayout + specialPayout) * 100) / 100;

      if (reinvestDividends && item.refPrice > 0) {
        dripRunningShares += totalPayout / item.refPrice;
      }

      return {
        label: item.year,
        regularDps: item.regularDps,
        specialDps: item.specialDps,
        totalDps: item.totalDps,
        regularPayout,
        specialPayout,
        totalPayout,
        yieldPct: item.yieldPct,
        payoutRatioPct: item.payoutRatioPct,
        effectiveShares: Math.round(activeShares * 100) / 100,
        note: reinvestDividends
          ? `${item.note} (DRIP compounded on ${activeShares.toFixed(1)} sh)`
          : item.note,
        isProjected: false,
      };
    });

    const quarterlyHistoricalSeries: DividendChartRow[] = [];
    let qDripShares = safeShares;
    HISTORICAL_DIVIDEND_5Y.forEach((item) => {
      const qRegular = Math.round((item.regularDps / 4) * 1000) / 1000;
      for (let q = 1; q <= 4; q += 1) {
        const qSpecial = q === 4 ? item.specialDps : 0;
        const activeShares = reinvestDividends ? qDripShares : safeShares;
        const regularPayout = Math.round(qRegular * activeShares * 100) / 100;
        const specialPayout = Math.round(qSpecial * activeShares * 100) / 100;
        const totalPayout = Math.round((regularPayout + specialPayout) * 100) / 100;
        if (reinvestDividends && item.refPrice > 0) {
          qDripShares += totalPayout / item.refPrice;
        }
        quarterlyHistoricalSeries.push({
          label: `Q${q} '${item.year.slice(2)}`,
          regularDps: Math.round(qRegular * 100) / 100,
          specialDps: Math.round(qSpecial * 100) / 100,
          totalDps: Math.round((qRegular + qSpecial) * 100) / 100,
          regularPayout,
          specialPayout,
          totalPayout,
          yieldPct: item.yieldPct,
          payoutRatioPct: item.payoutRatioPct,
          effectiveShares: Math.round(activeShares * 100) / 100,
          note:
            q === 4
              ? `${item.year} Q4 + FCF Milestone Bonus (${item.note})`
              : `${item.year} Q${q} Regular Treasury Distribution`,
          isProjected: false,
        });
      }
    });

    const projectedAnnualDps = Math.round(customQuarterlyDps * 4 * 100) / 100;
    const baseProjectedPayout = Math.round(projectedAnnualDps * safeShares * 100) / 100;
    const dripLiftPayout = reinvestDividends
      ? Math.max(0, Math.round((dividendSchedule.totalAnnualPayout - baseProjectedPayout) * 100) / 100)
      : 0;

    const projectedAnnualPoint: DividendChartRow = {
      label: '2027 Est.',
      regularDps: projectedAnnualDps,
      specialDps: 0,
      totalDps: projectedAnnualDps,
      regularPayout: reinvestDividends ? baseProjectedPayout : dividendSchedule.totalAnnualPayout,
      specialPayout: dripLiftPayout,
      totalPayout: dividendSchedule.totalAnnualPayout,
      yieldPct: Math.round(dividendSchedule.effectiveAnnualYield * 100) / 100,
      payoutRatioPct: 24.0,
      effectiveShares: Math.round(dividendSchedule.endingShares * 100) / 100,
      note: reinvestDividends
        ? 'Live Dividend Calculator 2027 projection (+DRIP compounding boost)'
        : 'Live Dividend Calculator 2027 projection (cash distribution)',
      isProjected: true,
    };

    const projectedQuarterPoint: DividendChartRow = {
      label: "Q1 '27 Est.",
      regularDps: Math.round(customQuarterlyDps * 100) / 100,
      specialDps: 0,
      totalDps: Math.round(customQuarterlyDps * 100) / 100,
      regularPayout: dividendSchedule.firstQuarterPayout,
      specialPayout: 0,
      totalPayout: dividendSchedule.firstQuarterPayout,
      yieldPct: Math.round(dividendSchedule.effectiveAnnualYield * 100) / 100,
      payoutRatioPct: 24.0,
      effectiveShares: safeShares,
      note: 'Next projected Q1 2027 distribution from Dividend Calculator',
      isProjected: true,
    };

    const fiveYearCumulativeDps = HISTORICAL_DIVIDEND_5Y.reduce(
      (sum, item) => sum + item.totalDps,
      0
    );
    const fiveYearCumulativePayout =
      Math.round(annualHistoricalSeries.reduce((sum, item) => sum + item.totalPayout, 0) * 100) /
      100;
    const firstDps = HISTORICAL_DIVIDEND_5Y[0].totalDps;
    const lastDps = HISTORICAL_DIVIDEND_5Y[HISTORICAL_DIVIDEND_5Y.length - 1].totalDps;
    const fiveYearCagrPct = (Math.pow(lastDps / firstDps, 1 / 4) - 1) * 100;
    const avgYieldPct =
      HISTORICAL_DIVIDEND_5Y.reduce((sum, item) => sum + item.yieldPct, 0) /
      HISTORICAL_DIVIDEND_5Y.length;

    return {
      chartData:
        dividendChartGranularity === 'annual'
          ? [...annualHistoricalSeries, projectedAnnualPoint]
          : [...quarterlyHistoricalSeries, projectedQuarterPoint],
      fiveYearCumulativeDps,
      fiveYearCumulativePayout,
      fiveYearCagrPct,
      avgYieldPct,
      dripEndingHistoricalShares: Math.round(dripRunningShares * 100) / 100,
    };
  }, [dividendShares, customQuarterlyDps, dividendSchedule, reinvestDividends, dividendChartGranularity]);

  // 10-Year Dividend Portfolio Growth (Quarterly DRIP Compounding Projection)
  const portfolioGrowth10Y = useMemo(() => {
    const safeShares = Math.max(0, dividendShares);
    const startingCapital = Math.round(safeShares * sharePrice * 100) / 100;
    const annualDivFactor = 1 + growthDividendRatePct / 100;
    const annualPriceFactor = 1 + growthPriceRatePct / 100;
    const qPriceFactor = Math.pow(annualPriceFactor, 0.25);

    let dripShares = safeShares;
    let nonDripCashCumulative = 0;
    let totalDividendsReinvested = 0;

    const rows: Growth10YRow[] = [];

    for (let yr = 1; yr <= 10; yr += 1) {
      const yearQuarterlyDps = customQuarterlyDps * Math.pow(annualDivFactor, yr - 1);
      let yearBaseDividend = 0;
      let yearBonusDividend = 0;
      let yearEndPrice = sharePrice;

      for (let q = 1; q <= 4; q += 1) {
        const quarterIndex = (yr - 1) * 4 + q;
        const qPrice = sharePrice * Math.pow(qPriceFactor, quarterIndex);
        yearEndPrice = qPrice;

        const baseQDiv = safeShares * yearQuarterlyDps;
        const bonusQDiv = Math.max(0, dripShares - safeShares) * yearQuarterlyDps;
        const totalQDiv = baseQDiv + bonusQDiv;

        yearBaseDividend += baseQDiv;
        yearBonusDividend += bonusQDiv;
        nonDripCashCumulative += baseQDiv;
        totalDividendsReinvested += totalQDiv;

        if (qPrice > 0) {
          dripShares += totalQDiv / qPrice;
        }
      }

      const baseValue = Math.round(safeShares * yearEndPrice * 100) / 100;
      const bonusShares = Math.max(0, dripShares - safeShares);
      const dripEquityGain = Math.round(bonusShares * yearEndPrice * 100) / 100;
      const totalDripValue = Math.round((baseValue + dripEquityGain) * 100) / 100;
      const nonDripTotalValue = Math.round((baseValue + nonDripCashCumulative) * 100) / 100;

      rows.push({
        year: `Yr ${yr}`,
        calendarYear: 2026 + yr,
        projectedSharePrice: Math.round(yearEndPrice * 100) / 100,
        startingShares: Math.round(safeShares * 100) / 100,
        dripBonusShares: Math.round(bonusShares * 100) / 100,
        totalShares: Math.round(dripShares * 100) / 100,
        baseValue,
        dripEquityGain,
        totalDripValue,
        nonDripTotalValue,
        compoundingAdvantage: Math.round((totalDripValue - nonDripTotalValue) * 100) / 100,
        baseAnnualDividend: Math.round(yearBaseDividend * 100) / 100,
        compoundedBonusDividend: Math.round(yearBonusDividend * 100) / 100,
        totalAnnualDividend: Math.round((yearBaseDividend + yearBonusDividend) * 100) / 100,
      });
    }

    const year10 = rows[rows.length - 1];
    const totalReturnPct =
      startingCapital > 0
        ? ((year10.totalDripValue - startingCapital) / startingCapital) * 100
        : 0;
    const shareGrowthPct =
      safeShares > 0 ? (year10.dripBonusShares / safeShares) * 100 : 0;

    return {
      rows,
      startingCapital,
      year10,
      totalReturnPct,
      shareGrowthPct,
      totalDividendsReinvested: Math.round(totalDividendsReinvested * 100) / 100,
    };
  }, [dividendShares, sharePrice, customQuarterlyDps, growthDividendRatePct, growthPriceRatePct]);

  // Live Dividend Yield Percentage & Real-Time ROI Calculations
  const liveDividendAnalytics = useMemo(() => {
    const annualizedDps = Math.round(customQuarterlyDps * 4 * 100) / 100;
    const annualYieldPct = sharePrice > 0 ? (annualizedDps / sharePrice) * 100 : 0;
    const quarterlyYieldPct = sharePrice > 0 ? (customQuarterlyDps / sharePrice) * 100 : 0;
    const baselineAnnualYieldPct = (annualizedDps / baselineSessionPrice) * 100;
    const yieldDeltaBps = (annualYieldPct - baselineAnnualYieldPct) * 100;
    const roiPer10k = sharePrice > 0 ? (10000 / sharePrice) * annualizedDps : 0;
    const annualPositionIncome = Math.round(Math.max(0, dividendShares) * annualizedDps * 100) / 100;
    const gaugeMaxPct = 6.0;
    const gaugeFillPct = Math.min(100, Math.max(2, (annualYieldPct / gaugeMaxPct) * 100));

    return {
      annualizedDps,
      annualYieldPct,
      quarterlyYieldPct,
      baselineAnnualYieldPct,
      yieldDeltaBps,
      roiPer10k,
      annualPositionIncome,
      gaugeFillPct,
      gaugeMaxPct,
    };
  }, [sharePrice, customQuarterlyDps, dividendShares]);

  const handleSelectScenario = (preset: DividendTierPreset) => {
    setSelectedScenarioId(preset.id);
    setCustomQuarterlyDps(preset.quarterlyDps);
  };

  const activeAlertsList = priceAlerts.filter((a) => a.status === 'active');
  const triggeredAlertsList = priceAlerts.filter((a) => a.status === 'triggered');

  const handleSubmitPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(alertTargetInput);
    if (Number.isNaN(parsedTarget) || parsedTarget < 50 || parsedTarget > 1000) {
      setAlertFeedback('Enter a target price between $50.00 and $1,000.00 USD.');
      return;
    }
    onCreatePriceAlert?.(parsedTarget, alertDirection, alertNote);
    setAlertNote('');
    setAlertFeedback(
      `Monitoring active: In-app inbox alert will fire if TSLA ${
        alertDirection === 'above' ? 'reaches or exceeds' : 'drops to or below'
      } $${parsedTarget.toFixed(2)}.`
    );
    window.setTimeout(() => setAlertFeedback(null), 5000);
  };

  const applyAlertOffset = (pctOffset: number) => {
    const computed = Math.round(sharePrice * (1 + pctOffset / 100) * 100) / 100;
    setAlertTargetInput(computed.toFixed(2));
    setAlertDirection(pctOffset >= 0 ? 'above' : 'below');
  };

  return (
    <section id="shares" className="relative w-full py-16 sm:py-24 bg-[#040a18] text-slate-100 overflow-hidden border-t border-blue-900/60">
      
      {/* Background Patriotic Glow Highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-blue-600/15 via-red-600/12 to-blue-700/15 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/12 blur-[110px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-600/12 blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Real-Time TSLA Institutional Market Ribbon */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#091630] via-[#0c1d3e] to-[#1f0b18] border border-blue-500/45 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Ticker & Price Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 flex items-center justify-center text-white font-display font-black text-xl shadow-md shadow-blue-700/30 border border-white/15">
                T
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-black text-lg text-white tracking-wide">
                    NASDAQ: TSLA
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 tabular-nums ${
                      sessionDeltaPct >= 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" /> {sessionDeltaPct >= 0 ? '+' : ''}
                    {sessionDeltaPct.toFixed(2)}% TODAY
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Tesla, Inc. · State of Delaware · Transfer Agent: Computershare Trust N.A.
                </div>
              </div>
            </div>

            {/* Market Stats Grid */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">
                  {isMarketSimRunning ? 'Simulated Live Price' : 'Share Price'}
                </span>
                <span className="text-xl font-bold font-mono tabular-nums text-white">${sharePrice.toFixed(2)} USD</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Live Div. Yield</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-mono tabular-nums text-red-300">
                    {liveDividendAnalytics.annualYieldPct.toFixed(2)}%
                  </span>
                  <span className="text-[11px] font-mono text-blue-300 tabular-nums">
                    (${customQuarterlyDps.toFixed(2)}/qtr)
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Market Capitalization</span>
                <span className="text-sm font-bold text-blue-300 font-mono">$854.2 Billion</span>
              </div>
              <div className="hidden md:block">
                <span className="text-[10px] text-slate-400 uppercase block">CUSIP / ISIN</span>
                <span className="text-xs font-semibold text-slate-200 font-mono">88160R101 / US88160R1014</span>
              </div>
              <div className="hidden lg:block">
                <span className="text-[10px] text-slate-400 uppercase block">52-Week Range</span>
                <span className="text-xs text-slate-200 font-mono">$138.80 – $358.64</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPurchaseModal(25)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-700/25 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <TrendingUp className="w-4 h-4 text-white stroke-[2.5]" />
                <span>Acquire TSLA Shares</span>
              </button>
            </div>

          </div>
        </div>

        {/* Section Heading & Chapter Kicker */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold tracking-wider uppercase">
            <span>Chapter 05 · Equity Treasury Desk</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Direct Tesla <span className="us-text-gradient">Share Acquisition</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            Acquire common equity in Tesla, Inc. directly through our official corporate allocation desk. All allocations are registered under your legal name via Computershare Direct Registration System (DRS), DTC Broker participant transfer, or Delaware corporate vault certificates.
          </p>
        </div>

        {/* Historical TSLA Share Performance Chart (Recharts) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#071124] via-[#091630] to-[#110a1a] border border-blue-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-900/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300 tracking-wide">
                <BarChart3 className="w-4 h-4 text-red-400" />
                <span>Historical Equity Performance</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">NASDAQ: TSLA (Split-Adjusted USD)</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  Share Price Trajectory
                </h3>
                <span
                  className={`font-mono tabular-nums text-sm font-bold ${
                    chartStats.diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {chartStats.diff >= 0 ? '+' : ''}
                  ${chartStats.diff.toFixed(2)} ({chartStats.pct >= 0 ? '+' : ''}
                  {chartStats.pct.toFixed(1)}% · {chartTimeframe})
                </span>
              </div>
            </div>

            {/* Interactive Timeframe Selector */}
            <div
              role="group"
              aria-label="Select historical performance timeframe"
              className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70 self-start lg:self-auto"
            >
              {(['6M', '1Y', '3Y', '5Y'] as TimeframeKey[]).map((tf) => {
                const isActive = chartTimeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-md'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
            <div className="p-3.5 rounded-xl bg-[#040a18]/80 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Period Open</span>
              <span className="text-base font-bold text-slate-100 mt-0.5 block">
                ${chartStats.first.toFixed(2)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#040a18]/80 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Period High</span>
              <span className="text-base font-bold text-blue-300 mt-0.5 block">
                ${chartStats.high.toFixed(2)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#040a18]/80 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Period Low</span>
              <span className="text-base font-bold text-red-400 mt-0.5 block">
                ${chartStats.low.toFixed(2)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#040a18]/80 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Avg Monthly Vol</span>
              <span className="text-base font-bold text-slate-100 mt-0.5 block">
                {chartStats.avgVol.toFixed(1)}M Shares
              </span>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="w-full h-[320px] pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
              <AreaChart
                data={activeChartData}
                margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="tslaUsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="55%" stopColor="#dc2626" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#040a18" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#172a4f"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#172a4f' }}
                  dy={8}
                />
                <YAxis
                  domain={['dataMin - 15', 'dataMax + 15']}
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val: number) => `$${val}`}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const point = payload[0].payload as HistoricalPoint;
                    return (
                      <div className="p-3.5 rounded-xl bg-[#08142c]/95 border border-blue-400/60 shadow-2xl space-y-1.5 max-w-[240px]">
                        <div className="flex items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
                          <span>{point.period}</span>
                          <span>Vol: {point.volumeM.toFixed(1)}M</span>
                        </div>
                        <div className="text-lg font-black font-mono tabular-nums text-white">
                          ${point.price.toFixed(2)} <span className="text-xs text-blue-300">USD</span>
                        </div>
                        <div className="text-[11px] text-slate-300 leading-snug">
                          {point.catalyst}
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={chartStats.first}
                  stroke="#60a5fa"
                  strokeDasharray="4 4"
                  strokeOpacity={0.65}
                  label={{
                    value: `Baseline $${chartStats.first.toFixed(0)}`,
                    position: 'insideBottomRight',
                    fill: '#93c5fd',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                />
                {activeAlertsList.slice(0, 3).map((alert) => (
                  <ReferenceLine
                    key={alert.id}
                    y={alert.targetPrice}
                    stroke={alert.direction === 'above' ? '#10b981' : '#ef4444'}
                    strokeDasharray="3 3"
                    strokeOpacity={0.85}
                    label={{
                      value: `Alert ${alert.direction === 'above' ? '≥' : '≤'} $${alert.targetPrice.toFixed(2)}`,
                      position: 'insideTopRight',
                      fill: alert.direction === 'above' ? '#6ee7b7' : '#fca5a5',
                      fontSize: 10,
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                ))}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tslaUsGradient)"
                  activeDot={{
                    r: 6,
                    fill: '#ef4444',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Share Price Alert & Simulated Market Monitor */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#08142c] via-[#0a1834] to-[#1a0b18] border border-blue-500/45 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-900/60">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold tracking-wide">
                <BellRing className="w-4 h-4 text-red-400" />
                <span>Automated Market Threshold Engine</span>
                <span aria-hidden="true">·</span>
                <span className="text-blue-300">Dispatches to In-App Inbox</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Target Share Price Alerts
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Set an upside target or downside entry price for NASDAQ: TSLA. Run the simulated market feed or step the market price manually—an official notification is dispatched to your In-App Inbox the instant your threshold is reached.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
              <button
                type="button"
                onClick={onToggleMarketSim}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                  isMarketSimRunning
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 hover:bg-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 border-blue-400/50 text-white shadow-md shadow-blue-600/25'
                }`}
              >
                {isMarketSimRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Live Feed</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Live Market Feed</span>
                  </>
                )}
              </button>

              {onOpenInbox && (
                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="px-4 py-2.5 rounded-xl bg-[#040a18] hover:bg-[#0b1b3a] border border-red-500/50 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Mail className="w-3.5 h-3.5 text-red-400" />
                  <span>Open In-App Inbox</span>
                  {triggeredAlertsList.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tabular-nums">
                      {triggeredAlertsList.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Simulated Market Controls & Alert Creation Form */}
            <div className="lg:col-span-6 space-y-5">
              {/* Simulated Market Price Control Strip */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-800/70 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Simulated Market Feed (NASDAQ: TSLA)
                    </span>
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                        ${sharePrice.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold tabular-nums ${
                          sessionDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {sessionDelta >= 0 ? '+' : ''}
                        {sessionDelta.toFixed(2)} vs Open
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-blue-300">
                    {isMarketSimRunning ? 'Auto-ticking every 2.2s' : 'Manual / Paused'}
                  </span>
                </div>

                {/* Manual Price Step Controls */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400 mr-1">Simulate Tick:</span>
                  {[-10, -5, -1, 1, 5, 10].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => onAdjustSimulatedPrice?.(sharePrice + step)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums border ${
                        step > 0
                          ? 'bg-blue-600/20 hover:bg-blue-600/35 border-blue-500/45 text-blue-200'
                          : 'bg-red-600/20 hover:bg-red-600/35 border-red-500/45 text-red-200'
                      }`}
                    >
                      {step > 0 ? `+$${step}` : `-$${Math.abs(step)}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onAdjustSimulatedPrice?.(268.50)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#08142b] hover:bg-[#0d2044] border border-blue-800/80 text-slate-200 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 ml-auto"
                    title="Reset simulated price to $268.50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset $268.50</span>
                  </button>
                </div>
              </div>

              {/* Create Price Alert Form */}
              <form
                onSubmit={handleSubmitPriceAlert}
                className="p-5 rounded-2xl bg-[#040a18]/85 border border-blue-500/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-red-400" />
                    <span>Configure New Threshold Alert</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    Range: $50 – $1,000
                  </span>
                </div>

                {/* Condition Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertDirection('above')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      alertDirection === 'above'
                        ? 'bg-blue-600/25 border-blue-400 text-white shadow-sm'
                        : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-blue-300" />
                    <span>Rises Above (≥)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertDirection('below')}
                    className={`p-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      alertDirection === 'below'
                        ? 'bg-red-600/25 border-red-400 text-white shadow-sm'
                        : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                    <span>Drops Below (≤)</span>
                  </button>
                </div>

                {/* Target Price Input + Quick Offsets */}
                <div className="space-y-2">
                  <label htmlFor="tsla-alert-target" className="text-xs font-mono text-slate-200 block">
                    Target Share Price (USD)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 font-mono font-bold text-sm">
                        $
                      </span>
                      <input
                        id="tsla-alert-target"
                        type="number"
                        step="0.50"
                        min={50}
                        max={1000}
                        value={alertTargetInput}
                        onChange={(e) => setAlertTargetInput(e.target.value)}
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-700/60 text-white font-mono tabular-nums text-sm font-bold focus:outline-none focus:border-red-500"
                        required
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400 shrink-0">USD</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[-5, -2, 2, 5, 10].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => applyAlertOffset(pct)}
                        className="px-2.5 py-1 rounded-lg bg-[#08142b] hover:bg-[#0d2044] border border-blue-900/70 hover:border-blue-400/60 text-[11px] font-mono text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                      >
                        {pct > 0 ? `+${pct}%` : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Note */}
                <div className="space-y-1.5">
                  <label htmlFor="tsla-alert-note" className="text-xs font-mono text-slate-300 block">
                    Alert Memo (Optional)
                  </label>
                  <input
                    id="tsla-alert-note"
                    type="text"
                    maxLength={80}
                    value={alertNote}
                    onChange={(e) => setAlertNote(e.target.value)}
                    placeholder="e.g., Cybercab breakout target or Tranche B dip buy"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#08142b] border border-blue-900/70 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {alertFeedback && (
                  <div className="p-3 rounded-xl bg-blue-950/70 border border-blue-500/50 text-xs font-mono text-blue-200">
                    {alertFeedback}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs shadow-lg shadow-blue-700/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <BellRing className="w-4 h-4 text-white" />
                  <span>Set Target Price Alert</span>
                </button>
              </form>
            </div>

            {/* Right Column: Active & Triggered Alerts Ledger */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-900/60">
                <div>
                  <h4 className="font-display font-bold text-base text-white">
                    Alert Monitor & Dispatch Log
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {activeAlertsList.length} Monitoring · {triggeredAlertsList.length} Triggered to Inbox
                  </p>
                </div>

                {triggeredAlertsList.length > 0 && onOpenInbox && (
                  <button
                    type="button"
                    onClick={onOpenInbox}
                    className="px-3 py-1.5 rounded-lg bg-red-600/25 hover:bg-red-600/40 border border-red-400/60 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-300" />
                    <span>View in Inbox</span>
                  </button>
                )}
              </div>

              {priceAlerts.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      No target price alerts set yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Create an alert on the left—for example, set an upside target at $272.00 and click +$5 on the simulator to watch an instant notification arrive in your In-App Inbox.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {priceAlerts.map((alert) => {
                    const isTriggered = alert.status === 'triggered';
                    const diffToTarget = alert.targetPrice - sharePrice;
                    const pctToTarget = sharePrice > 0 ? (diffToTarget / sharePrice) * 100 : 0;

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                          isTriggered
                            ? 'bg-gradient-to-r from-blue-600/20 via-[#0b1b3a] to-red-600/15 border-blue-400/60'
                            : 'bg-[#08142b] border-blue-900/60 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-mono font-bold tabular-nums ${
                                  alert.direction === 'above' ? 'text-blue-300' : 'text-red-300'
                                }`}
                              >
                                {alert.direction === 'above' ? (
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                <span>
                                  {alert.direction === 'above' ? 'Above ≥' : 'Below ≤'} $
                                  {alert.targetPrice.toFixed(2)}
                                </span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {alert.id} · Set {alert.createdAt}
                              </span>
                            </div>

                            {alert.note && (
                              <p className="text-xs text-slate-200">{alert.note}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => onDeletePriceAlert?.(alert.id)}
                            aria-label={`Delete alert ${alert.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-900/60 text-[11px] font-mono">
                          {isTriggered ? (
                            <>
                              <span className="text-white font-bold flex items-center gap-1.5 tabular-nums">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>
                                  Triggered at ${(alert.triggeredPrice ?? alert.targetPrice).toFixed(2)} · Sent to Inbox
                                </span>
                              </span>
                              {onOpenInbox && (
                                <button
                                  type="button"
                                  onClick={onOpenInbox}
                                  className="text-red-300 hover:text-white underline underline-offset-2 cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  Read Message
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-blue-300 font-semibold">
                                Status: Monitoring Live
                              </span>
                              <span className="text-slate-400 tabular-nums">
                                Distance: {diffToTarget >= 0 ? '+' : ''}
                                ${diffToTarget.toFixed(2)} ({pctToTarget >= 0 ? '+' : ''}
                                {pctToTarget.toFixed(2)}%)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Institutional Growth Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-900/60 hover:border-blue-400/60 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Autonomous AI & Cybercab
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Full Self-Driving (Supervised) software trained on billions of real-world video miles, powering the upcoming Cybercab robotaxi platform.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-900/60 hover:border-red-400/60 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Megapack Energy Grid
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Lathrop Megafactory producing utility-scale Megapacks at 40 GWh+ annual run-rate, transforming global grid stabilization and solar deployment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-900/60 hover:border-blue-400/60 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-white">
              Optimus Humanoid Robotics
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              General-purpose bipedal robot executing factory tasks today, designed to solve labor bottlenecks with massive trillion-dollar TAM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-900/60 hover:border-red-400/60 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-base text-white">
              SpaceX Technology Moat
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Propulsion synergies, high-temperature alloys, cold-gas rocket thruster integration for the Flying Roadster, and Starlink satellite telematics.
            </p>
          </div>

        </div>

        {/* 3 Tiered Share Allocation Blocks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/60 gap-3 flex-wrap">
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Tiered Share Allocation Tranches
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Select an institutional tranche or configure custom share allotments below
              </p>
            </div>

            <button
              onClick={onViewCertificateSample}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#08142b] border border-blue-600/50 text-xs text-blue-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer font-mono whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>Inspect Delaware Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tier 1: Retail Direct Allotment */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#09152e] to-[#060f22] border border-blue-900/60 hover:border-blue-400/70 shadow-xl flex flex-col justify-between space-y-6 group transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/40 font-bold uppercase">
                    TRANCHE A
                  </span>
                  <span className="text-xs font-mono text-slate-400">Direct DRS</span>
                </div>

                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    Retail Direct Allotment
                  </h4>
                  <div className="text-xs text-slate-300 mt-1">
                    Entry tranche for individual long-term shareholders
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#040a18]/80 border border-blue-900/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Allotment</span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white">
                    25 Shares <span className="text-xs text-blue-300 font-normal">(${(25 * sharePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Flexible: 10 to 50 shares
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Direct Computershare DRS book-entry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>$0 broker commission fee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Official SEC Annual Proxy voting rights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Instant in-app provisional certificate</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenPurchaseModal(25)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-700/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acquire Tranche A (25 Shares)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tier 2: Accredited Investor Tranche (Featured / Popular) */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#0d1f44] via-[#09152e] to-[#1a0b18] border-2 border-blue-400/80 shadow-2xl shadow-blue-700/20 flex flex-col justify-between space-y-6 group">
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-red-600 text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                RECOMMENDED TRANCHE
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/25 text-red-300 border border-red-500/40 font-bold uppercase">
                    TRANCHE B · ACCREDITED
                  </span>
                  <span className="text-xs font-mono text-blue-300">Priority Ledger</span>
                </div>

                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    Accredited Investor Block
                  </h4>
                  <div className="text-xs text-blue-200 mt-1">
                    Optimized for accredited individuals and trusts
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#040a18]/85 border border-blue-500/40 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Allotment</span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white">
                    100 Shares <span className="text-xs text-red-300 font-normal">(${(100 * sharePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Flexible: 100 to 500 shares
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Priority Tesla Cybercab test-ride lottery slot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Direct DTC electronic transfer (Fidelity/Schwab)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Shareholder Meeting priority live credentials</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>100 Full Delaware Corporate voting proxies</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenPurchaseModal(100)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-700/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acquire Tranche B (100 Shares)</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Tier 3: Executive Treasury Block */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#09152e] to-[#060f22] border border-blue-900/60 hover:border-red-500/60 shadow-xl flex flex-col justify-between space-y-6 group transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/20 text-red-300 border border-red-500/35 font-bold uppercase">
                    TRANCHE C · INSTITUTIONAL
                  </span>
                  <span className="text-xs font-mono text-slate-400">Vault Certificate</span>
                </div>

                <div>
                  <h4 className="font-display font-black text-xl text-white">
                    Executive Treasury Block
                  </h4>
                  <div className="text-xs text-slate-300 mt-1">
                    Institutional treasury, family offices & foundations
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#040a18]/80 border border-blue-900/60 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Allotment</span>
                  <div className="text-2xl font-black font-mono tabular-nums text-white">
                    1,000 Shares <span className="text-xs text-red-300 font-normal">(${(1000 * sharePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Flexible: 1,000 to 5,000+ shares
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Archival physical Delaware seal parchment cert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Dedicated Investor Relations executive officer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Complimentary VIP Greet Plaque & Pass ($10k value)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Fedwire / Escrow / Corporate Entity documentation</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenPurchaseModal(1000)}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-700/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acquire Tranche C (1,000 Shares)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Interactive Custom Share & Capital Outlay Calculator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#071124] via-[#0b1834] to-[#1a0b18] border border-blue-500/45 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Calculator Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 border border-blue-500/35 uppercase font-bold">
                  Interactive Equity Calculator
                </span>
                <h3 className="font-display font-black text-2xl text-white mt-1.5">
                  Custom Share & Allocation Modeler
                </h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Simulate capital deployment, custody method, and Delaware proxy voting weight.
                </p>
              </div>

              {/* Slider & Quick Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-200 font-bold">Select Share Count:</span>
                  <span className="text-blue-300 font-bold text-base tabular-nums">{calcQuantity.toLocaleString()} TSLA Shares</span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={2500}
                  step={5}
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-[#040a18] rounded-lg cursor-pointer"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {[10, 25, 50, 100, 250, 500, 1000].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setCalcQuantity(qty)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                        calcQuantity === qty
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold shadow-sm'
                          : 'bg-[#040a18] border border-blue-900/70 text-slate-300 hover:text-white'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custody Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-200 block">Preferred Custody & Book-Entry:</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCalcCustody('drs')}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      calcCustody === 'drs'
                        ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                        : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    Direct DRS (Computershare)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcCustody('broker')}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      calcCustody === 'broker'
                        ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                        : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    DTC Broker Participant
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcCustody('physical')}
                    className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                      calcCustody === 'physical'
                        ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                        : 'bg-[#040a18] border-blue-900/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    Vault Physical Cert
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Breakdown Summary Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#040a18]/90 border border-blue-500/40 shadow-xl space-y-4">
              <div className="text-[10px] font-mono uppercase text-red-400 font-bold tracking-widest border-b border-blue-900/60 pb-2">
                Execution Breakdown (NASDAQ: TSLA)
              </div>

              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between text-slate-400">
                  <span>Unit Price:</span>
                  <span className="text-white">${sharePrice.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Allocation Quantity:</span>
                  <span className="text-white">{calcQuantity.toLocaleString()} Units</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Registration Fee:</span>
                  <span className="text-emerald-400">$0.00 (Institutional Waived)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SEC Transfer Duty:</span>
                  <span className="text-emerald-400">$0.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shareholder Proxy Power:</span>
                  <span className="text-blue-300 font-bold">{calcQuantity.toLocaleString()} Delaware Votes</span>
                </div>
                
                <div className="pt-3 border-t border-blue-900/60 flex justify-between items-baseline">
                  <span className="text-xs uppercase text-slate-200 font-bold">Total Capital Outlay:</span>
                  <span className="text-2xl font-black text-white font-mono">
                    ${calcTotal.toLocaleString()} <span className="text-xs text-blue-300 font-normal">USD</span>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onOpenPurchaseModal(calcQuantity)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  <span>Execute Allocation for {calcQuantity.toLocaleString()} Shares</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
                Sent to Elon Musk Official Management Table for account provisioning &amp; verification
              </div>
            </div>

          </div>
        </div>

        {/* Live Dividend Yield Percentage & Real-Time ROI Widget */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#1a0b18] border border-blue-500/45 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-blue-900/60">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-300 font-bold tracking-wide">
                <Percent className="w-4 h-4 text-red-400" />
                <span>Live Dividend Yield & Real-Time ROI Monitor</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 tabular-nums">
                  {isMarketSimRunning ? 'Streaming Market Tick Active' : 'Synced to Simulated Price'}
                </span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Real-Time Dividend Yield Percentage
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Dynamically computes forward annual and quarterly yield ROI as the simulated TSLA share price fluctuates against your assumed quarterly payout per share.
              </p>
            </div>

            {/* Quick Simulator & Payout Sync Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <button
                type="button"
                onClick={onToggleMarketSim}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border ${
                  isMarketSimRunning
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200 hover:bg-emerald-500/30'
                    : 'bg-blue-600/25 hover:bg-blue-600/40 border-blue-400/50 text-blue-100'
                }`}
              >
                {isMarketSimRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Price Feed</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Live Feed</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onAdjustSimulatedPrice?.(Math.max(50, sharePrice - 10))}
                className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/35 border border-red-500/45 text-red-200 text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                title="Simulate -$10 price dip to see yield expand"
              >
                -$10 Price
              </button>

              <button
                type="button"
                onClick={() => onAdjustSimulatedPrice?.(Math.min(1000, sharePrice + 10))}
                className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/45 text-blue-200 text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                title="Simulate +$10 price rally to see yield compress"
              >
                +$10 Price
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Primary Live Yield Percentage Readout & Visual Spectrum Meter */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#040a18]/90 border border-blue-800/70 flex flex-col justify-between space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-bold block">
                    Annualized Forward Yield
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="font-display font-black text-4xl sm:text-5xl text-white tabular-nums tracking-tight">
                      {liveDividendAnalytics.annualYieldPct.toFixed(2)}%
                    </span>
                    <span
                      className={`text-xs font-mono font-bold tabular-nums ${
                        liveDividendAnalytics.yieldDeltaBps >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {liveDividendAnalytics.yieldDeltaBps >= 0 ? '+' : ''}
                      {liveDividendAnalytics.yieldDeltaBps.toFixed(1)} bps vs Open
                    </span>
                  </div>
                </div>

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/25 to-red-600/25 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-red-400" />
                </div>
              </div>

              {/* Yield Spectrum Progress Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 tabular-nums">
                  <span>Real-Time Yield Gauge</span>
                  <span>
                    ${liveDividendAnalytics.annualizedDps.toFixed(2)}/yr ÷ ${sharePrice.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#08142b] border border-blue-900/70 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-300 to-red-500 transition-all duration-300"
                    style={{ width: `${liveDividendAnalytics.gaugeFillPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                  <span>0.0%</span>
                  <span>1.5% Inst.</span>
                  <span>3.0% High</span>
                  <span>6.0% Max</span>
                </div>
              </div>

              {/* Formula Verification Strip */}
              <div className="pt-3 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300 tabular-nums">
                <span>Quarterly Payout Basis:</span>
                <span className="text-white font-bold">
                  ${customQuarterlyDps.toFixed(2)}/qtr × 4 = ${liveDividendAnalytics.annualizedDps.toFixed(2)}/yr
                </span>
              </div>
            </div>

            {/* Right: Real-Time ROI Breakdown Metrics */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-mono tabular-nums">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 flex flex-col justify-between space-y-2">
                <span className="text-[11px] text-slate-400 block">
                  Simulated Market Price
                </span>
                <div className="text-2xl font-black text-white">
                  ${sharePrice.toFixed(2)} <span className="text-xs font-normal text-blue-300">USD</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Lower share price boosts current entry yield %
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 flex flex-col justify-between space-y-2">
                <span className="text-[11px] text-slate-400 block">
                  Quarterly Yield Per Period
                </span>
                <div className="text-2xl font-black text-blue-300">
                  {liveDividendAnalytics.quarterlyYieldPct.toFixed(3)}%
                </div>
                <span className="text-[11px] text-slate-400">
                  Every 90 days (${customQuarterlyDps.toFixed(2)} / ${sharePrice.toFixed(2)})
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 flex flex-col justify-between space-y-2">
                <span className="text-[11px] text-slate-400 block">
                  Annual Income Per $10,000 Invested
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  ${liveDividendAnalytics.roiPer10k.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  <span className="text-xs font-normal text-slate-300"> / yr</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Buys {(sharePrice > 0 ? 10000 / sharePrice : 0).toFixed(2)} TSLA shares at current price
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-red-500/40 flex flex-col justify-between space-y-2">
                <span className="text-[11px] text-red-300 block">
                  DRIP Compounded Effective ROI
                </span>
                <div className="text-2xl font-black text-white">
                  {dividendSchedule.effectiveAnnualYield.toFixed(2)}%
                </div>
                <span className="text-[11px] text-slate-300">
                  {dividendShares.toLocaleString()} sh earns ${liveDividendAnalytics.annualPositionIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr base
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Dividend Calculator & Payout Schedule Table (US Navy, Patriot Blue & Crimson Red) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#1a0b18] border border-blue-500/45 shadow-2xl space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-blue-900/60">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-bold tracking-wider">
                <Coins className="w-4 h-4 text-red-400" />
                <span>Shareholder Yield & Treasury Distribution Modeler</span>
                {approvedSharesCount > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-300">{approvedSharesCount} Approved Allocation(s)</span>
                  </>
                )}
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Quarterly Dividend Payout Calculator
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Estimate projected quarterly cash or DRIP equity payouts based on your TSLA share position and corporate free-cash-flow yield scenarios.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDividendShares(calcQuantity)}
              className="self-start lg:self-auto px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-400/50 text-blue-200 text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>Sync with Modeler ({calcQuantity.toLocaleString()} Shares)</span>
            </button>
          </div>

          {/* Interactive Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Shares Held & Yield Controls */}
            <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-[#040a18]/90 border border-blue-800/70">
              
              {/* Shares Held Input + Quick Select */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <label htmlFor="dividend-shares-input" className="text-blue-200 font-bold flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-red-400" />
                    <span>TSLA Shares Held</span>
                  </label>
                  <span className="text-slate-400 tabular-nums">
                    Value: ${(dividendShares * sharePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="dividend-shares-input"
                    type="number"
                    min={1}
                    max={100000}
                    value={dividendShares}
                    onChange={(e) => setDividendShares(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08142b] border border-blue-700/60 text-white font-mono tabular-nums text-sm font-bold focus:outline-none focus:border-red-500"
                  />
                  <span className="text-xs font-mono text-red-400 font-bold shrink-0">SHARES</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[25, 100, 250, 500, 1000, 2500].map((presetQty) => (
                    <button
                      key={presetQty}
                      type="button"
                      onClick={() => setDividendShares(presetQty)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                        dividendShares === presetQty
                          ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold'
                          : 'bg-[#08142b] border border-blue-900/70 text-slate-300 hover:border-blue-400/60 hover:text-white'
                      }`}
                    >
                      {presetQty.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distribution Yield Scenario Presets */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-blue-200 font-bold block">
                  Projected Yield Policy Scenario
                </span>
                <div className="space-y-2">
                  {DIVIDEND_SCENARIOS.map((preset) => {
                    const isSelected =
                      selectedScenarioId === preset.id &&
                      Math.abs(customQuarterlyDps - preset.quarterlyDps) < 0.01;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectScenario(preset)}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600/25 via-[#0b1b3a] to-red-600/20 border-blue-400 text-white shadow-md shadow-blue-600/15'
                            : 'bg-[#08142b]/80 border-blue-900/60 text-slate-300 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className={isSelected ? 'text-white' : 'text-slate-200'}>
                            {preset.label}
                          </span>
                          <span className="text-red-300 tabular-nums">
                            ${preset.quarterlyDps.toFixed(2)} / qtr
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {preset.rationale}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Quarterly Payout Slider + DRIP Toggle */}
              <div className="pt-2 border-t border-blue-900/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">Custom Quarterly Payout / Share:</span>
                  <span className="text-blue-300 font-bold tabular-nums">
                    ${customQuarterlyDps.toFixed(2)} USD
                  </span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={4.00}
                  step={0.05}
                  value={customQuarterlyDps}
                  onChange={(e) => {
                    setSelectedScenarioId('custom');
                    setCustomQuarterlyDps(Number(e.target.value));
                  }}
                  className="w-full accent-red-500 h-2 bg-[#08142b] rounded-lg cursor-pointer"
                />

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#08142b] border border-blue-800/60 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white">
                      Enable Automatic DRIP Reinvestment
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Reinvest quarterly payouts into additional TSLA shares at ${sharePrice.toFixed(2)}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reinvestDividends}
                    onChange={(e) => setReinvestDividends(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Right: Stylized Patriot Blue & Crimson Payout Schedule Table */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Top KPI Highlight Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 via-[#08142b] to-[#040a18] border border-blue-400/50">
                  <span className="text-[11px] font-mono text-blue-300 block">
                    Est. Quarterly Payout
                  </span>
                  <span className="text-2xl font-black font-mono tabular-nums text-white mt-1 block">
                    ${dividendSchedule.firstQuarterPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#08142b] via-[#040a18] to-[#1a0b18] border border-blue-800/70">
                  <span className="text-[11px] font-mono text-slate-300 block">
                    Annualized Dividend Total
                  </span>
                  <span className="text-2xl font-black font-mono tabular-nums text-blue-300 mt-1 block">
                    ${dividendSchedule.totalAnnualPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-600/20 via-[#08142b] to-[#040a18] border border-red-400/50">
                  <span className="text-[11px] font-mono text-red-300 block">
                    Projected Annual Yield
                  </span>
                  <span className="text-2xl font-black font-mono tabular-nums text-white mt-1 block">
                    {dividendSchedule.effectiveAnnualYield.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Stylized Distribution Ledger Table */}
              <div className="rounded-2xl overflow-hidden border border-blue-400/50 bg-[#040a18] shadow-xl">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600/25 via-[#0b1b3a] to-red-600/20 border-b border-blue-400/40 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white tracking-wide">
                    Projected 4-Quarter TSLA Distribution Ledger
                  </span>
                  <span className="text-[11px] font-mono text-blue-200 tabular-nums">
                    Basis: {dividendShares.toLocaleString()} Shares
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-blue-900/60 bg-[#08142b] text-[11px] font-mono text-blue-300">
                        <th className="py-3 px-4 font-semibold">Quarter</th>
                        <th className="py-3 px-3 font-semibold">Record Date</th>
                        <th className="py-3 px-3 font-semibold text-right">Shares Held</th>
                        <th className="py-3 px-3 font-semibold text-right">DPS (USD)</th>
                        <th className="py-3 px-4 font-semibold text-right">Est. Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-900/40 text-xs font-mono tabular-nums">
                      {dividendShares <= 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 px-4 text-center text-slate-400 font-sans">
                            Enter at least 1 share above to calculate projected quarterly dividend distributions.
                          </td>
                        </tr>
                      ) : (
                        dividendSchedule.rows.map((row) => (
                          <tr
                            key={row.quarter}
                            className="hover:bg-blue-900/20 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-sans font-semibold text-white">
                              {row.quarter}
                            </td>
                            <td className="py-3.5 px-3 text-slate-400">
                              {row.exDate}
                            </td>
                            <td className="py-3.5 px-3 text-right text-slate-200">
                              {row.sharesHeld.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              {reinvestDividends && row.newDripShares > 0 && (
                                <span className="block text-[10px] text-blue-300">
                                  +{row.newDripShares.toFixed(2)} DRIP
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right text-blue-300">
                              ${row.dps.toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-white">
                              ${row.payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-blue-600/20 via-[#0b1b3a] to-red-600/20 border-t-2 border-blue-400/50 text-xs font-mono tabular-nums">
                        <td colSpan={2} className="py-3.5 px-4 font-sans font-bold text-white">
                          Total 12-Month Projection
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-blue-200">
                          {dividendSchedule.endingShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} Shares
                        </td>
                        <td className="py-3.5 px-3 text-right text-red-300">
                          ${(customQuarterlyDps * 4).toFixed(2)}/yr
                        </td>
                        <td className="py-3.5 px-4 text-right text-sm font-black text-white">
                          ${dividendSchedule.totalAnnualPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Strip tying Calculator to Share Acquisition */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <p className="text-[11px] font-mono text-slate-400">
                  Illustrative cashflow projection only; subject to Tesla Board declaration.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenPurchaseModal(Math.max(1, dividendShares || 25))}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-700/25 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Coins className="w-4 h-4 text-white" />
                  <span>Acquire {(dividendShares || 25).toLocaleString()} TSLA Shares</span>
                </button>
              </div>

            </div>

          </div>

          {/* 5-Year Historical Dividend Distribution Chart (Recharts) */}
          <div className="pt-8 border-t border-blue-900/60 space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-300">
                  <BarChart3 className="w-4 h-4 text-red-400" />
                  <span>5-Year Treasury Distribution History</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">
                    {dividendChartGranularity === 'annual'
                      ? 'FY 2022–2026 + 2027 Calculator Est.'
                      : '20 Quarters (Q1 ’22 – Q4 ’26) + Q1 ’27 Est.'}
                  </span>
                </div>
                <h4 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
                  Historical Dividend Distribution (Past 5 Years)
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto">
                {/* Granularity Toggle: Annual (5Y) vs Quarterly (20Q) */}
                <div
                  role="group"
                  aria-label="Select dividend history granularity"
                  className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70"
                >
                  <button
                    type="button"
                    onClick={() => setDividendChartGranularity('annual')}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      dividendChartGranularity === 'annual'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                    }`}
                  >
                    5Y Annual
                  </button>
                  <button
                    type="button"
                    onClick={() => setDividendChartGranularity('quarterly')}
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      dividendChartGranularity === 'quarterly'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                    }`}
                  >
                    20Q Quarterly
                  </button>
                </div>

                {/* View Mode Switcher: Total Position Payout vs Per-Share DPS */}
                <div
                  role="group"
                  aria-label="Select dividend chart metric"
                  className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70"
                >
                  <button
                    type="button"
                    onClick={() => setDividendChartMetric('payout')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      dividendChartMetric === 'payout'
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                    }`}
                  >
                    Position Payout ({dividendShares.toLocaleString()} sh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDividendChartMetric('dps')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      dividendChartMetric === 'dps'
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                    }`}
                  >
                    Per-Share DPS ($/sh)
                  </button>
                </div>
              </div>
            </div>

            {/* 5-Year Historical Dividend KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
              <div className="p-3.5 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block">
                  {reinvestDividends ? '5Y Cumulative Payout (DRIP)' : '5Y Cumulative Position Payout'}
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                  ${dividendHistoryAnalytics.fiveYearCumulativePayout.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block">5Y Cumulative DPS</span>
                <span className="text-base sm:text-lg font-black text-blue-300 mt-0.5 block">
                  ${dividendHistoryAnalytics.fiveYearCumulativeDps.toFixed(2)} / sh
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block">5-Year Distribution CAGR</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 block">
                  +{dividendHistoryAnalytics.fiveYearCagrPct.toFixed(1)}% / yr
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
                <span className="text-[11px] text-slate-400 block">
                  {reinvestDividends ? '5Y DRIP Ending Balance' : '5Y Avg Annual Yield'}
                </span>
                <span className="text-base sm:text-lg font-black text-red-300 mt-0.5 block">
                  {reinvestDividends
                    ? `${dividendHistoryAnalytics.dripEndingHistoricalShares.toLocaleString(undefined, { maximumFractionDigits: 2 })} sh`
                    : `${dividendHistoryAnalytics.avgYieldPct.toFixed(2)}%`}
                </span>
              </div>
            </div>

            {/* Recharts Historical Dividend ComposedChart */}
            {dividendChartMetric === 'payout' && dividendShares <= 0 ? (
              <div className="h-[300px] rounded-2xl bg-[#040a18]/85 border border-blue-900/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-200">
                  Enter at least 1 share in TSLA Shares Held above to view your 5-year position payout history.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDividendShares(100)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    Set 100 Shares
                  </button>
                  <button
                    type="button"
                    onClick={() => setDividendChartMetric('dps')}
                    className="px-4 py-2 rounded-xl bg-[#08142b] hover:bg-[#0d2044] border border-blue-800/70 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    Switch to Per-Share DPS
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-4">
                {/* Explicit Legend */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                      <span>Regular Quarterly Cash</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-sky-300 inline-block" />
                      <span>FCF Milestone Bonus</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
                      <span>Calculator Projection</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-red-300 inline-block" />
                      <span>Annual Yield (%)</span>
                    </span>
                  </div>
                  <span className="text-slate-400">
                    {reinvestDividends ? 'DRIP compounding active · ' : ''}Hover bars for breakdown
                  </span>
                </div>

                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={290}>
                    <ComposedChart
                      data={dividendHistoryAnalytics.chartData}
                      margin={{ top: 14, right: 12, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#172a4f"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#64748b"
                        interval={dividendChartGranularity === 'quarterly' ? 1 : 0}
                        tick={{ fill: '#cbd5e1', fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace' }}
                        tickLine={false}
                        axisLine={{ stroke: '#172a4f' }}
                        dy={6}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#64748b"
                        tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                        tickLine={false}
                        axisLine={false}
                        width={64}
                        tickFormatter={(val: number) =>
                          dividendChartMetric === 'dps'
                            ? `$${val.toFixed(2)}`
                            : val >= 1000
                            ? `$${(val / 1000).toFixed(1)}k`
                            : `$${val.toFixed(0)}`
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 'dataMax + 0.8']}
                        stroke="#64748b"
                        tick={{ fill: '#fca5a5', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                        tickFormatter={(val: number) => `${val.toFixed(1)}%`}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(59, 130, 246, 0.10)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const row = payload[0].payload as DividendChartRow;
                          return (
                            <div className="p-3.5 rounded-xl bg-[#08142c]/95 border border-blue-400/60 shadow-2xl space-y-2 max-w-[270px]">
                              <div className="flex items-center justify-between gap-4 text-[11px] font-mono">
                                <span className={row.isProjected ? 'text-red-300 font-bold' : 'text-blue-300 font-bold'}>
                                  {row.label}
                                </span>
                                <span className="text-slate-400 tabular-nums">
                                  Yield: {row.yieldPct.toFixed(2)}%
                                </span>
                              </div>
                              <div className="text-base font-black font-mono tabular-nums text-white">
                                {dividendChartMetric === 'payout'
                                  ? `$${row.totalPayout.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })} USD`
                                  : `$${row.totalDps.toFixed(2)} / Share`}
                              </div>
                              <div className="space-y-1 pt-1 border-t border-blue-900/60 text-[11px] font-mono tabular-nums">
                                <div className="flex justify-between gap-4 text-slate-300">
                                  <span>Regular Cash:</span>
                                  <span className="text-blue-300">
                                    {dividendChartMetric === 'payout'
                                      ? `$${row.regularPayout.toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}`
                                      : `$${row.regularDps.toFixed(2)}`}
                                  </span>
                                </div>
                                {row.specialDps > 0 && (
                                  <div className="flex justify-between gap-4 text-slate-300">
                                    <span>FCF Bonus:</span>
                                    <span className="text-sky-300">
                                      {dividendChartMetric === 'payout'
                                        ? `$${row.specialPayout.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}`
                                        : `$${row.specialDps.toFixed(2)}`}
                                    </span>
                                  </div>
                                )}
                                {row.isProjected && row.specialPayout > 0 && dividendChartMetric === 'payout' && (
                                  <div className="flex justify-between gap-4 text-slate-300">
                                    <span>DRIP Compounding Lift:</span>
                                    <span className="text-red-300">
                                      +${row.specialPayout.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between gap-4 text-slate-400">
                                  <span>Shares Basis:</span>
                                  <span>{row.effectiveShares.toLocaleString()} sh</span>
                                </div>
                                <div className="flex justify-between gap-4 text-slate-400">
                                  <span>FCF Payout Ratio:</span>
                                  <span>{row.payoutRatioPct.toFixed(1)}%</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-snug">
                                {row.note}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey={dividendChartMetric === 'payout' ? 'regularPayout' : 'regularDps'}
                        stackId="dividend"
                        barSize={dividendChartGranularity === 'annual' ? 40 : 18}
                        shape={renderRoundedBarShape(
                          dividendChartMetric === 'payout' ? 'specialPayout' : 'specialDps'
                        )}
                      >
                        {dividendHistoryAnalytics.chartData.map((entry) => (
                          <Cell
                            key={`reg-${entry.label}`}
                            fill={entry.isProjected ? '#ef4444' : '#3b82f6'}
                          />
                        ))}
                      </Bar>
                      <Bar
                        yAxisId="left"
                        dataKey={dividendChartMetric === 'payout' ? 'specialPayout' : 'specialDps'}
                        stackId="dividend"
                        barSize={dividendChartGranularity === 'annual' ? 40 : 18}
                        radius={[6, 6, 0, 0]}
                      >
                        {dividendHistoryAnalytics.chartData.map((entry) => (
                          <Cell
                            key={`spec-${entry.label}`}
                            fill={entry.isProjected ? '#f87171' : '#7dd3fc'}
                          />
                        ))}
                      </Bar>
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="yieldPct"
                        stroke="#fca5a5"
                        strokeWidth={2}
                        dot={dividendChartGranularity === 'annual' ? { r: 4, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 1.5 } : false}
                        activeDot={{ r: 6, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10-Year Dividend Portfolio Growth Tracker (Recharts BarChart) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#08152f] via-[#061024] to-[#1a0b18] border border-blue-500/45 shadow-2xl space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-5 border-b border-blue-900/60">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-blue-300 font-bold tracking-wide">
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span>10-Year DRIP Compounding Projection</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-300 tabular-nums">
                  {dividendShares.toLocaleString()} Starting Shares · ${customQuarterlyDps.toFixed(2)}/qtr Initial DPS
                </span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Dividend Portfolio Growth
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Tracks the 10-year compounding snowball effect of automatically reinvesting quarterly TSLA dividends back into fractional shares versus taking cash distributions.
              </p>
            </div>

            {/* Chart Metric Toggle */}
            <div
              role="group"
              aria-label="Select 10-year portfolio growth chart metric"
              className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/70 self-start xl:self-auto"
            >
              <button
                type="button"
                onClick={() => setGrowthChartMetric('value')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  growthChartMetric === 'value'
                    ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                }`}
              >
                Portfolio Value ($)
              </button>
              <button
                type="button"
                onClick={() => setGrowthChartMetric('shares')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  growthChartMetric === 'shares'
                    ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                }`}
              >
                Share Balance (SH)
              </button>
              <button
                type="button"
                onClick={() => setGrowthChartMetric('income')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  growthChartMetric === 'income'
                    ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#0b1b3a]'
                }`}
              >
                Annual Income ($/yr)
              </button>
            </div>
          </div>

          {/* Interactive Compounding Assumption Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[#040a18]/90 border border-blue-900/60">
            
            {/* Synced Share Count Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <label htmlFor="growth-shares-input" className="text-blue-200 font-bold">
                  Current Share Count
                </label>
                <span className="text-slate-400 tabular-nums">
                  ${portfolioGrowth10Y.startingCapital.toLocaleString(undefined, { maximumFractionDigits: 0 })} Basis
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="growth-shares-input"
                  type="number"
                  min={1}
                  max={100000}
                  value={dividendShares}
                  onChange={(e) => setDividendShares(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl bg-[#08142b] border border-blue-700/60 text-white font-mono tabular-nums text-xs font-bold focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setDividendShares(calcQuantity)}
                  className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/45 text-blue-200 text-[11px] font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Match Share Allocation Modeler quantity"
                >
                  Sync {calcQuantity} sh
                </button>
              </div>
            </div>

            {/* Annual Dividend Growth Rate Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-200 font-bold">Dividend Growth Rate</span>
                <span className="text-red-300 font-bold tabular-nums">
                  +{growthDividendRatePct}% / yr
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 5, 8, 12].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGrowthDividendRatePct(rate)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums border ${
                      growthDividendRatePct === rate
                        ? 'bg-blue-600 border-blue-400 text-white'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:border-blue-500/60 hover:text-white'
                    }`}
                  >
                    +{rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Share Price Appreciation Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-200 font-bold">Annual Price Growth</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  +{growthPriceRatePct}% / yr
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 4, 6, 10].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setGrowthPriceRatePct(rate)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums border ${
                      growthPriceRatePct === rate
                        ? 'bg-red-600 border-red-400 text-white'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-300 hover:border-blue-500/60 hover:text-white'
                    }`}
                  >
                    +{rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 10-Year Compounding KPI Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
            <div className="p-4 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Year-10 Total Value (DRIP)</span>
              <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">
                ${portfolioGrowth10Y.year10.totalDripValue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">
                +{portfolioGrowth10Y.totalReturnPct.toFixed(1)}% 10Y Total Return
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Year-10 Share Balance</span>
              <span className="text-lg sm:text-xl font-black text-blue-300 mt-0.5 block">
                {portfolioGrowth10Y.year10.totalShares.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })} sh
              </span>
              <span className="text-[11px] text-slate-300 mt-0.5 block">
                +{portfolioGrowth10Y.year10.dripBonusShares.toFixed(2)} DRIP shares (+{portfolioGrowth10Y.shareGrowthPct.toFixed(1)}%)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">Year-10 Annual Dividends</span>
              <span className="text-lg sm:text-xl font-black text-red-300 mt-0.5 block">
                ${portfolioGrowth10Y.year10.totalAnnualDividend.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                +${portfolioGrowth10Y.year10.compoundedBonusDividend.toFixed(2)}/yr from DRIP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#040a18]/85 border border-blue-900/60">
              <span className="text-[11px] text-slate-400 block">10Y Compounding Advantage</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 block">
                +${portfolioGrowth10Y.year10.compoundingAdvantage.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Extra equity vs holding cash
              </span>
            </div>
          </div>

          {/* 10-Year Compounding Bar Chart */}
          {dividendShares <= 0 ? (
            <div className="h-[310px] rounded-2xl bg-[#040a18]/85 border border-blue-900/60 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-200">
                Enter at least 1 share above to simulate 10-year dividend reinvestment compounding.
              </p>
              <button
                type="button"
                onClick={() => setDividendShares(100)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                Restore 100 Shares
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#040a18]/85 border border-blue-900/60 space-y-4">
              {/* Explicit Color Legend */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                    <span>
                      {growthChartMetric === 'value'
                        ? 'Principal Share Equity'
                        : growthChartMetric === 'shares'
                        ? 'Initial Shares Held'
                        : 'Base Share Dividends'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
                    <span>
                      {growthChartMetric === 'value'
                        ? 'DRIP Reinvested Compounding Equity'
                        : growthChartMetric === 'shares'
                        ? 'Reinvested DRIP Bonus Shares'
                        : 'Extra Dividends from DRIP Shares'}
                    </span>
                  </span>
                </div>
                <span className="text-slate-400">
                  40 quarterly reinvestments · Hover bars for Year 1–10 breakdown
                </span>
              </div>

              <div className="w-full h-[310px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                  <BarChart
                    data={portfolioGrowth10Y.rows}
                    margin={{ top: 14, right: 16, left: 6, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#172a4f"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      stroke="#64748b"
                      tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={{ stroke: '#172a4f' }}
                      dy={6}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={false}
                      width={68}
                      tickFormatter={(val: number) => {
                        if (growthChartMetric === 'shares') {
                          return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val.toFixed(0)}`;
                        }
                        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
                        return `$${val.toFixed(0)}`;
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 130, 246, 0.10)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const row = payload[0].payload as Growth10YRow;
                        return (
                          <div className="p-3.5 rounded-xl bg-[#08142c]/95 border border-blue-400/60 shadow-2xl space-y-2 max-w-[275px]">
                            <div className="flex items-center justify-between gap-4 text-[11px] font-mono">
                              <span className="text-blue-300 font-bold">
                                {row.year} ({row.calendarYear})
                              </span>
                              <span className="text-slate-400 tabular-nums">
                                Est. TSLA: ${row.projectedSharePrice.toFixed(2)}
                              </span>
                            </div>

                            <div className="text-base font-black font-mono tabular-nums text-white">
                              {growthChartMetric === 'value'
                                ? `$${row.totalDripValue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })} USD`
                                : growthChartMetric === 'shares'
                                ? `${row.totalShares.toFixed(2)} TSLA Shares`
                                : `$${row.totalAnnualDividend.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })} / yr`}
                            </div>

                            <div className="space-y-1 pt-1 border-t border-blue-900/60 text-[11px] font-mono tabular-nums">
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>
                                  {growthChartMetric === 'value'
                                    ? 'Initial Share Equity:'
                                    : growthChartMetric === 'shares'
                                    ? 'Starting Shares:'
                                    : 'Base Share Divs:'}
                                </span>
                                <span className="text-blue-300">
                                  {growthChartMetric === 'value'
                                    ? `$${row.baseValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                    : growthChartMetric === 'shares'
                                    ? `${row.startingShares.toLocaleString()}`
                                    : `$${row.baseAnnualDividend.toFixed(2)}`}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-300">
                                <span>
                                  {growthChartMetric === 'value'
                                    ? 'DRIP Reinvested Value:'
                                    : growthChartMetric === 'shares'
                                    ? 'DRIP Bonus Shares:'
                                    : 'DRIP Snowball Divs:'}
                                </span>
                                <span className="text-red-300 font-bold">
                                  {growthChartMetric === 'value'
                                    ? `+$${row.dripEquityGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                    : growthChartMetric === 'shares'
                                    ? `+${row.dripBonusShares.toFixed(2)}`
                                    : `+$${row.compoundedBonusDividend.toFixed(2)}`}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 text-slate-400">
                                <span>No-DRIP Value:</span>
                                <span>
                                  ${row.nonDripTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4 text-emerald-400 font-semibold">
                                <span>DRIP Edge:</span>
                                <span>
                                  +${row.compoundingAdvantage.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey={
                        growthChartMetric === 'value'
                          ? 'baseValue'
                          : growthChartMetric === 'shares'
                          ? 'startingShares'
                          : 'baseAnnualDividend'
                      }
                      stackId="growth"
                      barSize={36}
                      fill="#3b82f6"
                      shape={renderRoundedGrowthBarShape(
                        growthChartMetric === 'value'
                          ? 'dripEquityGain'
                          : growthChartMetric === 'shares'
                          ? 'dripBonusShares'
                          : 'compoundedBonusDividend'
                      )}
                    />
                    <Bar
                      dataKey={
                        growthChartMetric === 'value'
                          ? 'dripEquityGain'
                          : growthChartMetric === 'shares'
                          ? 'dripBonusShares'
                          : 'compoundedBonusDividend'
                      }
                      stackId="growth"
                      barSize={36}
                      fill="#ef4444"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Institutional Disclosure & Admin Approval Routing Notice */}
        <div className="p-5 rounded-2xl bg-[#08142b] border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="text-white">Official Management Table Assurance:</strong> All direct share wire transfers, ACH debits, and treasury escrows are sent directly to the Elon Musk Official Management Table for account provisioning and verification. Upon approval, official certificates are auto-dispatched to your In-App Inbox.
            </div>
          </div>

          <button
            onClick={() => onSelectPage('gallery')}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white font-semibold cursor-pointer transition-all whitespace-nowrap"
          >
            <span>Proceed to Chapter 06: Photo Archive</span>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </section>
  );
};
