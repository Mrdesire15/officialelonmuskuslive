/**
 * Core Data Models representing the Django models specified in the architecture:
 * Profile, Company, FlyingCarSpec, GalleryImage
 */

export interface ProfileData {
  name: string;
  role: string;
  headline: string;
  quote: string;
  portrait: string;
  bio: string;
  netWorth: string;
  companiesCount: number;
  location: string;
  bornYear: number;
  citizenship: string;
}

export interface CompanyData {
  id: string;
  name: string;
  role: string;
  description: string;
  founded: string;
  valuationOrMarketCap: string;
  mission: string;
  iconName: 'rocket' | 'car' | 'brain' | 'twitter' | 'shovel' | 'satellite' | 'bot' | 'atom';
  status: string;
  url?: string;
  order: number;
}

export interface FlyingCarSpecData {
  id: string;
  label: string;
  value: string;
  unit?: string;
  highlight?: string;
  description: string;
  category: 'performance' | 'aerospace' | 'range' | 'tech';
  order: number;
}

export interface GalleryImageData {
  id: string;
  title: string;
  caption: string;
  subtitle: string;
  image: string;
  category: 'portraits' | 'honors' | 'spacex' | 'tesla';
  location: string;
  year: string;
  dateStr?: string;
  context: string;
  aspectRatio?: string;
  order: number;
  isFeatured?: boolean;
}

export type GalleryFilter = 'all' | 'portraits' | 'honors' | 'spacex' | 'tesla';

export interface VehicleColorOption {
  name: string;
  hex: string;
  price: number;
}

export interface VehicleWheelOption {
  name: string;
  size: string;
  price: number;
}

export interface VehiclePackageOption {
  id: string;
  name: string;
  price: number;
  description: string;
  isFlightPackage?: boolean;
}

export interface VehicleDetailedSpecs {
  horsepower: string;
  torque: string;
  quarterMile: string;
  dragCoefficient: string;
  brakingSystem: string;
  suspension: string;
  batteryPack: string;
  architectureVoltage: string;
  superchargingPeak: string;
  charge15MinMiles: string;
  seatingCapacity: string;
  cargoCapacity: string;
  towingCapacity: string;
  curbWeight: string;
  groundClearance: string;
  wheelsAndTires: string;
  infotainmentDisplay: string;
  audioSystem: string;
  climateFiltration: string;
  lightingAndGlass: string;
  autopilotHardware: string;
  safetyRatingAndAirbags: string;
  warrantyVehicle: string;
  warrantyBatteryDrive: string;
  standardEquipmentChecklist: string[];
  performanceHighlights: string[];
}

export interface TeslaVehicle {
  id: string;
  name: string;
  modelCode: string;
  tagline: string;
  basePrice: number;
  destinationFee?: number;
  minDeposit: number;
  maxPrice: number;
  isFlyingCar?: boolean;
  image: string;
  acceleration: string;
  topSpeed: string;
  range: string;
  powertrain: string;
  description: string;
  colors: VehicleColorOption[];
  wheels: VehicleWheelOption[];
  interiorColors: VehicleColorOption[];
  packages: VehiclePackageOption[];
  deliveryEstimate: string;
  popular?: boolean;
  detailedSpecs?: VehicleDetailedSpecs;
}

export interface MerchQualityTier {
  id: string;
  gradeCode: string;
  name: string;
  price: number;
  materialSpec: string;
  craftsmanshipNote: string;
  deliveryEstimate: string;
}

export interface MerchProduct {
  id: string;
  skuPrefix: string;
  name: string;
  categoryLabel: string;
  editionTag: string;
  description: string;
  image: string;
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  defaultSize: string;
  qualityTiers: MerchQualityTier[];
  highlights: string[];
}

export interface OrderTrackingEvent {
  id: string;
  stage: string;
  title: string;
  details: string;
  location?: string;
  timestamp: string;
  dateStr: string;
  statusType: 'submitted' | 'approved' | 'rejected' | 'stage_update' | 'delivered';
  externalTrackingUrl?: string;
}

export interface TeslaOrder {
  orderId: string;
  reservationVin: string;
  vehicleId: string;
  vehicleName: string;
  isFlyingCar: boolean;
  itemCategory?: 'vehicle' | 'merch';
  merchSize?: string;
  merchQualityTier?: string;
  merchMaterialSpec?: string;
  merchQuantity?: number;
  paymentType: 'deposit' | 'full';
  depositAmount: number;
  totalPrice: number;
  amountPaidToday: number;
  balanceDue: number;
  selectedColor: VehicleColorOption;
  selectedInterior: VehicleColorOption;
  selectedWheels: VehicleWheelOption;
  selectedPackages: VehiclePackageOption[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  orderDate: string;
  status: 'Reservation Confirmed' | 'Pending Elon Musk Management Approval' | 'Pending Admin Payment Approval' | 'Payment Approved & VIN Allocated' | 'Payment Verification Needed' | 'Production Scheduled' | 'Factory Assembly' | 'Quality Inspection' | 'In Transit' | 'Ready for Delivery' | 'Delivered' | string;
  estimatedDelivery: string;
  flightModeCertified?: boolean;
  paymentStatus: 'pending_admin_approval' | 'approved' | 'rejected';
  paymentReference?: string;
  paymentMethod?: string;
  approvalNotes?: string;
  approvedAt?: string;
  deliveredAt?: string;
  deliveryDate?: string;
  externalTrackingUrl?: string;
  trackingHistory?: OrderTrackingEvent[];
  referralCodeUsed?: string;
  referralCommissionPercent?: number;
  referralCommissionAmount?: number;
}

export interface InAppReply {
  id: string;
  sender: 'admin' | 'visitor' | 'system' | 'concierge';
  senderName: string;
  body: string;
  timestamp: string;
  timeStr: string;
}

export interface InAppInboxMessage {
  id: string;
  sender: 'admin' | 'visitor' | 'system' | 'concierge';
  senderName: string;
  recipientEmail?: string;
  subject: string;
  body: string;
  timestamp: string;
  timeStr: string;
  read: boolean;
  category: 'payment_approval' | 'order_update' | 'vip_concierge' | 'price_alert' | 'charity_ngo' | 'general';
  orderId?: string;
  replies?: InAppReply[];
}

export interface ChatMessage {
  id: string;
  sender: 'visitor' | 'concierge' | 'elon_admin';
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  timeStr: string;
  type: 'text' | 'vip_request' | 'tesla_order' | 'system';
  vipData?: {
    tier: 'silver' | 'platinum' | 'gold';
    tierName: string;
    price: number;
    guestName: string;
    email: string;
    organization?: string;
    preferredDate: string;
    ticketId: string;
    status: 'pending' | 'confirmed';
  };
  teslaOrderData?: {
    vehicleId: string;
    vehicleName: string;
    isFlyingCar: boolean;
    depositAmount: number;
    totalPrice: number;
    reservationVin: string;
    customerName: string;
    color: string;
    status: 'pending' | 'confirmed';
  };
  read?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeStr: string;
  type: 'chat' | 'vip' | 'order';
  read: boolean;
  linkAction?: string;
}

export interface TeslaShareOrder {
  orderId: string;
  certificateNumber: string;
  shareQuantity: number;
  sharePrice: number;
  totalInvestment: number;
  custodyType: 'drs_computershare' | 'dtc_broker' | 'physical_vault';
  investorName: string;
  investorEmail: string;
  investorPhone: string;
  investorType: 'individual' | 'institutional' | 'family_office';
  entityName?: string;
  taxIdMasked?: string;
  brokerDtcNumber?: string;
  brokerAccountNumber?: string;
  paymentMethod: 'wire' | 'ach' | 'crypto';
  paymentStatus: 'pending_admin_approval' | 'approved' | 'rejected';
  orderDate: string;
  approvalNotes?: string;
  approvedAt?: string;
  referralCodeUsed?: string;
  referralCommissionPercent?: number;
  referralCommissionAmount?: number;
}

export interface SharePriceAlert {
  id: string;
  targetPrice: number;
  direction: 'above' | 'below';
  createdAt: string;
  status: 'active' | 'triggered';
  triggeredAt?: string;
  triggeredPrice?: number;
  note?: string;
}

export interface VipPassRequest {
  ticketId: string;
  tier: 'christmas-fan-card' | 'silver' | 'platinum' | 'gold';
  tierName: string;
  price: number;
  originalPrice?: number;
  guestName: string;
  organization?: string;
  email: string;
  purpose: string;
  preferredDate: string;
  requestedAt: string;
  orderDate: string;
  status: 'pending_admin_approval' | 'approved' | 'rejected';
  approvalNotes?: string;
  approvedAt?: string;
  referralCodeUsed?: string;
  referralCommissionPercent?: number;
  referralCommissionAmount?: number;
}

export interface ReferralConversion {
  id: string;
  orderId: string;
  orderType: 'vehicle' | 'shares' | 'vip' | 'merch';
  itemTitle: string;
  buyerName: string;
  referrerCode: string;
  orderAmount: number;
  commissionPercent: number;
  commissionEarned: number;
  status: 'pending_admin_approval' | 'approved' | 'rejected';
  createdAt: string;
  dateStr: string;
  approvedAt?: string;
}

export interface PaymentAccountRequest {
  id: string;
  paymentMethod: 'wire' | 'gift_card' | 'crypto';
  vehicleName: string;
  amountDue: number;
  visitorName: string;
  visitorEmail: string;
  note?: string;
  requestCategory?: 'vehicle' | 'merch' | 'charity_donation' | 'charity_support';
  status: 'pending_admin' | 'issued';
  issuedAccountDetails?: string;
  requestedAt: string;
  timeStr: string;
  issuedAt?: string;
}

export interface AdminPaymentAccounts {
  wireDetails: string;
  giftCardInstructions?: string;
  cryptoAddress: string;
  updatedAt?: string;
}

export interface CharityNgoSection {
  id: string;
  name: string;
  division: string;
  focus: string;
  description: string;
  impactMetric: string;
  leadProgram: string;
}

export type CrisisCategory = 'War & Armed Conflict' | 'Terrorism & Insurgency' | 'War & Terrorism Recovery';

export interface CrisisCountry {
  id: string;
  isoNumeric?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  name: string;
  continent: string;
  region: 'Europe & Eurasia' | 'Middle East' | 'Africa' | 'Asia-Pacific' | 'Americas' | 'Global';
  crisisType: CrisisCategory;
  reliefStatus?: string;
  activeProjects?: string[];
  urgentNeeds: string;
  activeNgoSectionId: string;
  displacedEstimate: string;
  image: string;
}

export interface ContinentReliefHub {
  id: string;
  continentName: string;
  region: CrisisCountry['region'];
  centerCoords: [number, number]; // [longitude, latitude]
  image: string;
  reliefSummary: string;
  flagshipOperations: string;
}

export interface CharityDonationRequest {
  donationId: string;
  ngoSectionId: string;
  ngoSectionName: string;
  countryId: string;
  countryName: string;
  crisisType: string;
  amountUsd: number;
  paymentMethod: 'wire' | 'gift_card' | 'crypto';
  paymentReference: string;
  donorName: string;
  donorEmail: string;
  donorCountry?: string;
  dedicationNote?: string;
  status: 'pending_admin_approval' | 'approved' | 'rejected';
  submittedAt: string;
  dateStr: string;
  approvalNotes?: string;
  approvedAt?: string;
}

export interface CharitySupportRequest {
  requestId: string;
  ngoSectionId: string;
  ngoSectionName: string;
  countryId: string;
  countryName: string;
  crisisType: CrisisCategory;
  aidCategory:
    | 'Starlink Crisis Connectivity'
    | 'Tesla Solar & Powerwall Aid'
    | 'Medical & Trauma Relief'
    | 'Emergency Food & Water'
    | 'Financial Relief Grant';
  requestedAmountUsd?: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  organizationName?: string;
  cityOrZone: string;
  situationSummary: string;
  needsAccountProvisioning: boolean;
  preferredPayoutMethod?: 'wire' | 'gift_card' | 'crypto';
  provisionedAccountDetails?: string;
  status: 'pending_admin_approval' | 'approved' | 'rejected';
  submittedAt: string;
  dateStr: string;
  approvalNotes?: string;
  approvedAt?: string;
}

export type PageId = 'executive' | 'enterprises' | 'flying-roadster' | 'showroom' | 'shares' | 'gallery';

export interface PageDefinition {
  id: PageId;
  index: number;
  numberStr: string;
  name: string;
  shortLabel: string;
  commandTitle: string;
  commandDesc: string;
  primaryActionLabel: string;
  iconName: 'sparkles' | 'rocket' | 'wind' | 'car' | 'dollar-sign' | 'trending-up' | 'camera';
}

