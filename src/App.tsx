/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { BellRing, X } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, syncVerifiedVisitorProfile } from './firebase';
import { 
  INITIAL_PROFILE, 
  INITIAL_COMPANIES, 
  INITIAL_FLYING_CAR_SPECS, 
  INITIAL_GALLERY 
} from './data/initialData';
import { TESLA_VEHICLES } from './data/teslaVehicles';
import { 
  ProfileData, 
  CompanyData, 
  FlyingCarSpecData, 
  GalleryImageData,
  TeslaVehicle,
  TeslaOrder,
  TeslaShareOrder,
  SharePriceAlert,
  InAppInboxMessage,
  InAppReply,
  VipPassRequest,
  ReferralConversion,
  PaymentAccountRequest,
  AdminPaymentAccounts,
  CharityDonationRequest,
  CharitySupportRequest,
  PageId
} from './types';
import { PAGES_CONFIG } from './data/pagesData';
import { Navbar } from './components/Navbar';
import { PagePaginationFooter } from './components/PagePaginationFooter';
import { HeroSection } from './components/HeroSection';
import { AboutCompaniesSection } from './components/AboutCompaniesSection';
import { FlyingRoadsterSection } from './components/FlyingRoadsterSection';
import { TeslaShowroomSection } from './components/TeslaShowroomSection';
import { TeslaSharesSection } from './components/TeslaSharesSection';
import { GallerySection } from './components/GallerySection';
import { LightboxModal } from './components/LightboxModal';
import { CaptionEditorModal } from './components/CaptionEditorModal';
import { AddPhotoModal } from './components/AddPhotoModal';
import { ContentStudioModal } from './components/ContentStudioModal';
import { TeslaOrderModal } from './components/TeslaOrderModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { RsvpModal } from './components/RsvpModal';
import { ExecutiveChatWidget } from './components/ExecutiveChatWidget';
import { InAppInboxModal } from './components/InAppInboxModal';
import { HiddenAdminPortalModal } from './components/HiddenAdminPortalModal';
import { TeslaSharePurchaseModal } from './components/TeslaSharePurchaseModal';
import { ShareCertificateModal } from './components/ShareCertificateModal';
import { ReferralModal } from './components/ReferralModal';
import { CharityDonationModal } from './components/CharityDonationModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { VisitorAuthModal } from './components/VisitorAuthModal';
import { SiteLockoutScreen } from './components/SiteLockoutScreen';
import { Footer } from './components/Footer';
import {
  getLockoutStatus,
  LockoutStatus,
  subscribeToLockoutChange,
} from './utils/securityLockout';
import {
  DevicePermissionState,
  SoundTone,
  dispatchAppNotification,
  getNotificationPermissionState,
  getSavedPhoneAlertsEnabled,
  getSavedSoundEnabled,
  initNotificationAudioUnlocker,
  requestPhoneNotificationPermission,
  savePhoneAlertsEnabled,
  saveSoundEnabled,
} from './utils/deviceNotifications';

const STORAGE_KEYS = {
  PROFILE: 'elon_meet_profile_v1',
  COMPANIES: 'elon_meet_companies_v1',
  SPECS: 'elon_meet_specs_v1',
  GALLERY: 'elon_meet_gallery_v1',
  ORDERS: 'elon_meet_orders_v1',
  SHARES: 'elon_meet_shares_v1',
  PRICE_ALERTS: 'elon_meet_price_alerts_v1',
  INBOX: 'elon_meet_inbox_v1',
  CUSTOM_CARS: 'elon_meet_custom_cars_v1',
  VIP_REQUESTS: 'elon_meet_vip_requests_v1',
  REFERRAL_CODE: 'elon_meet_referral_code_v1',
  APPLIED_REFERRAL_CODE: 'elon_meet_applied_referral_v1',
  COMMISSION_PERCENT: 'elon_meet_commission_pct_v1',
  REFERRAL_CONVERSIONS: 'elon_meet_referral_conversions_v1',
  ACCOUNT_REQUESTS: 'elon_meet_account_requests_v1',
  ADMIN_PAYMENT_ACCOUNTS: 'elon_meet_admin_payment_accounts_v1',
  CHARITY_DONATIONS: 'elon_meet_charity_donations_v1',
  CHARITY_SUPPORT: 'elon_meet_charity_support_v1',
};

function generateVisitorReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars[Math.floor(Math.random() * chars.length)];
  }
  for (let i = 0; i < 2; i++) {
    part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ELON-${part1}-${part2}`;
}

const INITIAL_INBOX_MESSAGES: InAppInboxMessage[] = [
  {
    id: 'msg-welcome-01',
    sender: 'concierge',
    senderName: 'Executive Concierge Desk',
    subject: 'Welcome to Executive Fleet & In-App Command',
    body: 'Greetings. This official terminal gives you direct, unmediated access to executive briefings, the aerospace Tesla Flying Roadster reservation program, and priority vehicle production queueing.\n\nAll vehicle reservation payments, account provisioning requests, and wires are sent directly to the Elon Musk Official Management Table for verification and chassis VIN allocation. You can message the table directly here and reply inside the app anytime without third-party email.',
    category: 'general',
    read: false,
    timestamp: new Date().toISOString(),
    timeStr: 'Today',
    replies: [
      {
        id: 'reply-concierge-01',
        sender: 'concierge',
        senderName: 'Concierge Protocol',
        body: 'Tip: Click "Pre-Order Flying Car" at top right to configure cold-gas rocket thruster options and submit your reservation.',
        timestamp: new Date().toISOString(),
        timeStr: 'Today',
      }
    ],
  },
  {
    id: 'msg-treasury-notice',
    sender: 'concierge',
    senderName: 'Tesla Central Treasury Desk',
    subject: 'Direct In-App Payment Approval & VIN Allocation Protocol',
    body: 'Notice to vehicle buyers: To ensure strict allocation integrity, all Wire/ACH transfer account requests, crypto escrow settlements, and deposits are sent directly to the Elon Musk Official Management Table for account provisioning and verification.\n\nUpon submission of an order, your reservation VIN will enter "Pending Verification" status. You will receive an instant approval dispatch and build certificate right in this messaging inbox.',
    category: 'payment_approval',
    read: true,
    timestamp: new Date().toISOString(),
    timeStr: 'Today',
    replies: [],
  },
];

export default function App() {
  // Profile state with local storage fallback
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed: ProfileData = JSON.parse(saved);
        // Ensure new official theme display photo takes effect if previous default was stored
        if (!parsed.portrait || parsed.portrait === '/assets/aistudio/elo_e882ff2e.webp' || parsed.portrait.includes('OIP__19__b4ca5349')) {
          parsed.portrait = INITIAL_PROFILE.portrait;
        }
        return parsed;
      }
      return INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Companies state
  const [companies, setCompanies] = useState<CompanyData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  // Flying Car Specs state
  const [specs, setSpecs] = useState<FlyingCarSpecData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPECS);
      return saved ? JSON.parse(saved) : INITIAL_FLYING_CAR_SPECS;
    } catch {
      return INITIAL_FLYING_CAR_SPECS;
    }
  });

  // Gallery Images state (populated with the uploaded photos with DOGE photo as #1 and contemplation photo in gallery)
  const [gallery, setGallery] = useState<GalleryImageData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (saved) {
        let parsed: GalleryImageData[] = JSON.parse(saved);
        const hasDogeFirst = parsed.length > 0 && parsed[0].image.includes('OIP__19__b4ca5349');
        if (!hasDogeFirst) {
          const filtered = parsed.filter(item => !item.image.includes('OIP__19__b4ca5349'));
          parsed = [INITIAL_GALLERY[0], ...filtered];
        }
        const hasContemplation = parsed.some(item => item.image.includes('OIP__20__21234731'));
        if (!hasContemplation && INITIAL_GALLERY[1]) {
          parsed.splice(1, 0, INITIAL_GALLERY[1]);
        }
        return parsed;
      }
      return INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  // Tesla Vehicle Orders State (persisted to localStorage)
  const [orders, setOrders] = useState<TeslaOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // In-App Messaging Inbox State (persisted to localStorage)
  const [inboxMessages, setInboxMessages] = useState<InAppInboxMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INBOX);
      return saved ? JSON.parse(saved) : INITIAL_INBOX_MESSAGES;
    } catch {
      return INITIAL_INBOX_MESSAGES;
    }
  });

  // Admin Custom Car Listings State (persisted to localStorage)
  const [customCars, setCustomCars] = useState<TeslaVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CARS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Tesla TSLA Direct Share Allocations State (persisted to localStorage)
  const [shareOrders, setShareOrders] = useState<TeslaShareOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHARES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // VIP Greet & Meet Pass Requests directed to Admin (persisted to localStorage)
  const [vipRequests, setVipRequests] = useState<VipPassRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIP_REQUESTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulated Live TSLA Market Price & Share Price Alerts
  const [simulatedSharePrice, setSimulatedSharePrice] = useState<number>(268.50);
  const [isMarketSimRunning, setIsMarketSimRunning] = useState<boolean>(false);
  const [priceAlerts, setPriceAlerts] = useState<SharePriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Visitor Auto-Generated Referral Code & Commission Program
  const [visitorReferralCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
      if (saved && saved.trim()) return saved.trim().toUpperCase();
      const generated = generateVisitorReferralCode();
      localStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, generated);
      return generated;
    } catch {
      return generateVisitorReferralCode();
    }
  });

  const [appliedReferralCode, setAppliedReferralCode] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref')?.trim().toUpperCase();
        if (refParam && /^[A-Z0-9-]{4,32}$/.test(refParam)) {
          localStorage.setItem(STORAGE_KEYS.APPLIED_REFERRAL_CODE, refParam);
          return refParam;
        }
      }
      return localStorage.getItem(STORAGE_KEYS.APPLIED_REFERRAL_CODE) || '';
    } catch {
      return '';
    }
  });

  const [commissionPercent, setCommissionPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMISSION_PERCENT);
      const parsed = saved ? Number(saved) : 5;
      return !Number.isNaN(parsed) && parsed >= 0.5 && parsed <= 50 ? parsed : 5;
    } catch {
      return 5;
    }
  });

  const [referralConversions, setReferralConversions] = useState<ReferralConversion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REFERRAL_CONVERSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [paymentAccountRequests, setPaymentAccountRequests] = useState<PaymentAccountRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNT_REQUESTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adminPaymentAccounts, setAdminPaymentAccounts] = useState<AdminPaymentAccounts>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PAYMENT_ACCOUNTS);
      return saved ? JSON.parse(saved) : { wireDetails: '', giftCardInstructions: '', cryptoAddress: '' };
    } catch {
      return { wireDetails: '', giftCardInstructions: '', cryptoAddress: '' };
    }
  });

  const [charityDonations, setCharityDonations] = useState<CharityDonationRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHARITY_DONATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [charitySupportRequests, setCharitySupportRequests] = useState<CharitySupportRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHARITY_SUPPORT);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal control states
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryImageData | null>(null);
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState<boolean>(false);
  const [isContentStudioOpen, setIsContentStudioOpen] = useState<boolean>(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState<boolean>(false);
  const [orderingVehicle, setOrderingVehicle] = useState<TeslaVehicle | null>(null);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [isCharityOpen, setIsCharityOpen] = useState<boolean>(false);
  const [shareModalInitialQty, setShareModalInitialQty] = useState<number>(25);
  const [selectedShareCertOrder, setSelectedShareCertOrder] = useState<TeslaShareOrder | null>(null);

  // Visitor Email Authentication State (automatically persisted across visits)
  const [visitorUser, setVisitorUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>(() => getLockoutStatus());

  // Mobile Phone Notifications & App Sound State
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<DevicePermissionState>(() =>
    getNotificationPermissionState()
  );
  const [phoneAlertsEnabled, setPhoneAlertsEnabled] = useState<boolean>(() =>
    getSavedPhoneAlertsEnabled()
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => getSavedSoundEnabled());
  const [activePushToast, setActivePushToast] = useState<{
    id: string;
    title: string;
    body: string;
    category?: string;
  } | null>(null);
  const [optInDismissed, setOptInDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('elon_meet_phone_optin_dismissed_v1') === 'true';
    } catch {
      return false;
    }
  });
  const knownInboxIdsRef = useRef<Set<string> | null>(null);
  const knownReplyCountsRef = useRef<Map<string, number>>(new Map());
  const pushToastTimerRef = useRef<number | null>(null);

  // Active page state for arranged page-by-page experience
  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'about' || hash === 'enterprises') return 'enterprises';
        if (hash === 'flying-roadster' || hash === 'flying-car') return 'flying-roadster';
        if (hash === 'showroom' || hash === 'tesla') return 'showroom';
        if (hash === 'shares' || hash === 'tsla' || hash === 'equity') return 'shares';
        if (hash === 'gallery') return 'gallery';
      }
    } catch {
      // fallback
    }
    return 'executive';
  });

  // Slide-in transition animation direction when switching pages
  const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

  // View arrangement mode: 'paged' (page by page, arranged) or 'scroll' (continuous)
  const [viewMode, setViewMode] = useState<'paged' | 'scroll'>('paged');

  // Admin state (requires passcode verification; never granted via URL params)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('elon_admin_access') === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });

  // Keyboard shortcut opens password-protected Admin Portal (or exits admin if already unlocked)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        if (isAdmin) {
          setIsAdmin(false);
          try {
            localStorage.setItem('elon_admin_access', 'false');
          } catch {}
        } else if (!getLockoutStatus().isLocked) {
          setIsAdminPortalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  // Monitor 3-strike 5-minute site lockout & live countdown
  useEffect(() => {
    const sync = () => setLockoutStatus(getLockoutStatus());
    const unsub = subscribeToLockoutChange(sync);
    return unsub;
  }, []);

  useEffect(() => {
    if (!lockoutStatus.isLocked) return;
    const timer = window.setInterval(() => {
      setLockoutStatus(getLockoutStatus());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutStatus.isLocked]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage save failed for profile', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    } catch (e) {
      console.warn('LocalStorage save failed for companies', e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SPECS, JSON.stringify(specs));
    } catch (e) {
      console.warn('LocalStorage save failed for specs', e);
    }
  }, [specs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    } catch (e) {
      console.warn('LocalStorage save failed for gallery', e);
    }
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage save failed for orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inboxMessages));
    } catch (e) {
      console.warn('LocalStorage save failed for inbox', e);
    }
  }, [inboxMessages]);

  // Subscribe to Firebase Auth state for automatic returning-visitor sign-in persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setVisitorUser(user);
      setAuthReady(true);
      if (user && user.emailVerified) {
        void syncVerifiedVisitorProfile(user).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // Unlock Web Audio API on first user gesture and sync notification permission / SW clicks
  useEffect(() => {
    const cleanupAudio = initNotificationAudioUnlocker();

    const syncPermission = () => {
      setPermissionState(getNotificationPermissionState());
    };
    window.addEventListener('focus', syncPermission);

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OPEN_NOTIFICATION_INBOX') {
        setIsInboxOpen(true);
      }
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
    }

    return () => {
      cleanupAudio();
      window.removeEventListener('focus', syncPermission);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      }
    };
  }, []);

  // Automatically trigger phone notifications, app chimes, and top push banner for new inbox messages & replies
  useEffect(() => {
    if (knownInboxIdsRef.current === null) {
      knownInboxIdsRef.current = new Set(inboxMessages.map((m) => m.id));
      inboxMessages.forEach((m) => {
        knownReplyCountsRef.current.set(m.id, (m.replies || []).length);
      });
      return;
    }

    const triggerAlert = (title: string, body: string, category: string, messageId: string) => {
      const upperTitle = title.toUpperCase();
      const tone: SoundTone = upperTitle.includes('APPROVED')
        ? 'approval'
        : category === 'price_alert' || upperTitle.includes('UPDATE') || upperTitle.includes('VERIFICATION')
        ? 'alert'
        : 'message';

      void dispatchAppNotification({
        title,
        body,
        tag: messageId,
        category,
        messageId,
        playSound: soundEnabled,
        soundTone: tone,
        sendToOs: phoneAlertsEnabled,
      });

      const toastId = `toast-${messageId}-${Date.now()}`;
      setActivePushToast({ id: toastId, title, body, category });
      if (pushToastTimerRef.current !== null) {
        window.clearTimeout(pushToastTimerRef.current);
      }
      pushToastTimerRef.current = window.setTimeout(() => {
        setActivePushToast((curr) => (curr?.id === toastId ? null : curr));
      }, 6000);
    };

    // Detect brand new incoming unread notifications
    for (const msg of inboxMessages) {
      if (!knownInboxIdsRef.current.has(msg.id)) {
        knownInboxIdsRef.current.add(msg.id);
        knownReplyCountsRef.current.set(msg.id, (msg.replies || []).length);
        if (!msg.read && msg.sender !== 'visitor') {
          triggerAlert(msg.subject, msg.body, msg.category, msg.id);
        }
        continue;
      }

      // Detect new incoming replies on existing threads
      const prevRepliesCount = knownReplyCountsRef.current.get(msg.id) ?? 0;
      const currentReplies = msg.replies || [];
      if (currentReplies.length > prevRepliesCount) {
        knownReplyCountsRef.current.set(msg.id, currentReplies.length);
        const latestReply = currentReplies[currentReplies.length - 1];
        if (latestReply && latestReply.sender !== 'visitor') {
          triggerAlert(
            `${latestReply.senderName}: ${msg.subject}`,
            latestReply.body,
            msg.category,
            msg.id
          );
        }
      }
    }
  }, [inboxMessages, soundEnabled, phoneAlertsEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(customCars));
    } catch (e) {
      console.warn('LocalStorage save failed for custom cars', e);
    }
  }, [customCars]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHARES, JSON.stringify(shareOrders));
    } catch (e) {
      console.warn('LocalStorage save failed for share orders', e);
    }
  }, [shareOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(priceAlerts));
    } catch (e) {
      console.warn('LocalStorage save failed for price alerts', e);
    }
  }, [priceAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIP_REQUESTS, JSON.stringify(vipRequests));
    } catch (e) {
      console.warn('LocalStorage save failed for VIP requests', e);
    }
  }, [vipRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMISSION_PERCENT, String(commissionPercent));
    } catch (e) {
      console.warn('LocalStorage save failed for commission percent', e);
    }
  }, [commissionPercent]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REFERRAL_CONVERSIONS, JSON.stringify(referralConversions));
    } catch (e) {
      console.warn('LocalStorage save failed for referral conversions', e);
    }
  }, [referralConversions]);

  useEffect(() => {
    try {
      if (appliedReferralCode) {
        localStorage.setItem(STORAGE_KEYS.APPLIED_REFERRAL_CODE, appliedReferralCode);
      }
    } catch {}
  }, [appliedReferralCode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_REQUESTS, JSON.stringify(paymentAccountRequests));
    } catch (e) {
      console.warn('LocalStorage save failed for account requests', e);
    }
  }, [paymentAccountRequests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PAYMENT_ACCOUNTS, JSON.stringify(adminPaymentAccounts));
    } catch (e) {
      console.warn('LocalStorage save failed for admin payment accounts', e);
    }
  }, [adminPaymentAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARITY_DONATIONS, JSON.stringify(charityDonations));
    } catch (e) {
      console.warn('LocalStorage save failed for charity donations', e);
    }
  }, [charityDonations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARITY_SUPPORT, JSON.stringify(charitySupportRequests));
    } catch (e) {
      console.warn('LocalStorage save failed for charity support requests', e);
    }
  }, [charitySupportRequests]);

  // Simulated Market Feed Interval (ticks price every 2.2s when running)
  useEffect(() => {
    if (!isMarketSimRunning) return;
    const timer = window.setInterval(() => {
      setSimulatedSharePrice((prev) => {
        const delta = (Math.random() - 0.45) * 3.2;
        const next = Math.round((prev + delta) * 100) / 100;
        return Math.min(450, Math.max(150, next));
      });
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isMarketSimRunning]);

  // Monitor Simulated Share Price Against Active Target Alerts & Dispatch to In-App Inbox
  useEffect(() => {
    const newlyTriggered = priceAlerts.filter(
      (alert) =>
        alert.status === 'active' &&
        ((alert.direction === 'above' && simulatedSharePrice >= alert.targetPrice) ||
          (alert.direction === 'below' && simulatedSharePrice <= alert.targetPrice))
    );

    if (newlyTriggered.length === 0) return;

    const triggeredIds = new Set(newlyTriggered.map((a) => a.id));
    const nowIso = new Date().toISOString();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setPriceAlerts((prev) =>
      prev.map((a) =>
        triggeredIds.has(a.id)
          ? {
              ...a,
              status: 'triggered',
              triggeredAt: nowIso,
              triggeredPrice: simulatedSharePrice,
            }
          : a
      )
    );

    const alertNotifications: InAppInboxMessage[] = newlyTriggered.map((alert) => ({
      id: `msg-price-alert-${alert.id}-${Date.now()}`,
      sender: 'concierge',
      senderName: 'TSLA Market Desk · Automated Alert',
      subject: `TSLA Target Price Reached: $${simulatedSharePrice.toFixed(2)} (${
        alert.direction === 'above' ? 'Above' : 'Below'
      } $${alert.targetPrice.toFixed(2)})`,
      body: `Automated Market Threshold Notification:\n\nSimulated NASDAQ: TSLA share price has reached $${simulatedSharePrice.toFixed(
        2
      )} USD, crossing your ${
        alert.direction === 'above' ? 'upside target' : 'downside entry'
      } alert set at $${alert.targetPrice.toFixed(2)} USD.\n\nAlert ID: ${alert.id}\nTriggered At: ${new Date().toLocaleString()}${
        alert.note ? `\nNote: ${alert.note}` : ''
      }\n\nYou can return to the Tesla Direct Equity Desk to acquire shares at this market price or reply directly here to coordinate an institutional block allocation.`,
      category: 'price_alert',
      read: false,
      timestamp: nowIso,
      timeStr: timeNow,
      replies: [],
    }));

    setInboxMessages((prev) => [...alertNotifications, ...prev]);
  }, [simulatedSharePrice, priceAlerts]);

  const handleCreatePriceAlert = (
    targetPrice: number,
    direction: 'above' | 'below',
    note?: string
  ) => {
    const newAlert: SharePriceAlert = {
      id: `ALERT-${Date.now().toString().slice(-5)}`,
      targetPrice: Math.round(targetPrice * 100) / 100,
      direction,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      note: note?.trim() || undefined,
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeletePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // Combined fleet of standard models + admin custom added car listings
  const allVehicles = [...TESLA_VEHICLES, ...customCars];

  // Gallery handlers
  const handleSaveCaption = (updatedItem: GalleryImageData) => {
    setGallery((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleAddPhoto = (newPhoto: GalleryImageData) => {
    setGallery((prev) => [newPhoto, ...prev]);
  };

  const handleResetGallery = () => {
    if (window.confirm('Reset all gallery captions and photos back to initial defaults?')) {
      setGallery(INITIAL_GALLERY);
      localStorage.removeItem(STORAGE_KEYS.GALLERY);
    }
  };

  // Page navigation handlers
  const handleSelectPage = (page: PageId) => {
    const oldIndex = PAGES_CONFIG.findIndex((p) => p.id === activePage);
    const newIndex = PAGES_CONFIG.findIndex((p) => p.id === page);
    if (newIndex !== -1 && oldIndex !== -1 && newIndex !== oldIndex) {
      setSlideDirection(newIndex > oldIndex ? 'forward' : 'backward');
    }
    setActivePage(page);
    try {
      const hashMapping: Record<PageId, string> = {
        'executive': '#meet',
        'enterprises': '#about',
        'flying-roadster': '#flying-roadster',
        'showroom': '#showroom',
        'shares': '#shares',
        'gallery': '#gallery',
      };
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hashMapping[page]);
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrimaryAction = (pageId: PageId) => {
    switch (pageId) {
      case 'executive':
        setIsRsvpOpen(true);
        break;
      case 'enterprises':
        handleSelectPage('flying-roadster');
        break;
      case 'flying-roadster':
        handlePreOrderFlyingRoadster();
        break;
      case 'showroom':
        if (TESLA_VEHICLES.length > 0) {
          setOrderingVehicle(TESLA_VEHICLES[0]);
        }
        break;
      case 'shares':
        setShareModalInitialQty(25);
        setIsShareModalOpen(true);
        break;
      case 'gallery':
        if (gallery.length > 0) {
          setLightboxIndex(0);
        }
        break;
    }
  };

  // Keyboard shortcut listener for fast chapter jumping (1-5 and Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Check number keys 1-5
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= PAGES_CONFIG.length) {
        e.preventDefault();
        const targetPage = PAGES_CONFIG[keyNum - 1];
        if (targetPage) {
          handleSelectPage(targetPage.id);
        }
      }

      // Arrow keys (Left / Right) for previous / next page
      if (e.key === 'ArrowRight') {
        const currentIndex = PAGES_CONFIG.findIndex((p) => p.id === activePage);
        if (currentIndex < PAGES_CONFIG.length - 1) {
          e.preventDefault();
          handleSelectPage(PAGES_CONFIG[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = PAGES_CONFIG.findIndex((p) => p.id === activePage);
        if (currentIndex > 0) {
          e.preventDefault();
          handleSelectPage(PAGES_CONFIG[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePage]);

  const logReferralConversion = (params: {
    orderId: string;
    orderType: 'vehicle' | 'shares' | 'vip';
    itemTitle: string;
    buyerName: string;
    referrerCode: string;
    orderAmount: number;
    pct?: number;
    earned?: number;
  }) => {
    const normalizedCode = params.referrerCode.trim().toUpperCase();
    if (!normalizedCode) return;
    const pct = params.pct ?? commissionPercent;
    const earned =
      params.earned ?? Math.round(params.orderAmount * (pct / 100) * 100) / 100;
    const now = new Date();
    const conv: ReferralConversion = {
      id: `REF-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      orderId: params.orderId,
      orderType: params.orderType,
      itemTitle: params.itemTitle,
      buyerName: params.buyerName,
      referrerCode: normalizedCode,
      orderAmount: params.orderAmount,
      commissionPercent: pct,
      commissionEarned: earned,
      status: 'pending_admin_approval',
      createdAt: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setReferralConversions((prev) => [conv, ...prev]);
    setAppliedReferralCode(normalizedCode);
  };

  // Order handlers with auto-dispatch to in-app messaging inbox
  const handleOrderCompleted = (newOrder: TeslaOrder) => {
    setOrders((prev) => [newOrder, ...prev]);

    if (newOrder.referralCodeUsed) {
      logReferralConversion({
        orderId: newOrder.orderId,
        orderType: 'vehicle',
        itemTitle: newOrder.vehicleName,
        buyerName: newOrder.customerName,
        referrerCode: newOrder.referralCodeUsed,
        orderAmount: newOrder.totalPrice,
        pct: newOrder.referralCommissionPercent,
        earned: newOrder.referralCommissionAmount,
      });
    }

    // Dispatch in-app message notifying visitor that payment is directed to admin for approval
    const orderNoticeMsg: InAppInboxMessage = {
      id: `msg-order-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table',
      subject: `Order #${newOrder.orderId}: Sent to Official Management Table for Verification`,
      body: `Your reservation for ${newOrder.vehicleName} with deposit of $${newOrder.amountPaidToday.toLocaleString()} (${(newOrder.paymentMethod || 'wire').toUpperCase()}) has been received.\n\nPayment Status: PENDING OFFICIAL MANAGEMENT TABLE VERIFICATION\nPayment Reference: ${newOrder.paymentReference || 'N/A'}\nReservation VIN: ${newOrder.reservationVin}${newOrder.referralCodeUsed ? `\nReferral Code Applied: ${newOrder.referralCodeUsed} (${newOrder.referralCommissionPercent ?? commissionPercent}% · $${(newOrder.referralCommissionAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} referrer reward queued)` : ''}\n\nYour request has been sent to the Elon Musk Official Management Table for account provisioning and settlement verification. You will receive an instant in-app update here once approved. You can reply directly in this thread for any questions.`,
      category: 'payment_approval',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [orderNoticeMsg, ...prev]);
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Cancel this vehicle reservation and process refund?')) {
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    }
  };

  // Payment approval actions directed to admin
  const handleApprovePayment = (orderId: string, notes?: string) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (!targetOrder) return;

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              paymentStatus: 'approved',
              status: 'Payment Approved & VIN Allocated',
              approvedAt: now.toISOString(),
              approvalNotes: notes || 'Verified and approved by Elon Musk Official Management Table.',
              trackingHistory: [
                ...(o.trackingHistory || []),
                {
                  id: `trk-approve-${now.getTime()}`,
                  stage: 'Assembly',
                  title: 'Payment Approved & VIN Allocated',
                  details: notes || `Settlement verified ($${o.amountPaidToday.toLocaleString()}) and VIN ${o.reservationVin} scheduled into Gigafactory Assembly.`,
                  location: 'Elon Musk Official Management Table & Treasury',
                  timestamp: now.toISOString(),
                  dateStr,
                  statusType: 'approved',
                },
              ],
            }
          : o
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === orderId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'approved', approvedAt: now.toISOString() }
          : c
      )
    );

    // Auto-dispatch approval message directly to visitor's in-app inbox
    const approvalMsg: InAppInboxMessage = {
      id: `msg-approval-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table',
      subject: `Payment Approved: ${targetOrder.vehicleName} (VIN ${targetOrder.reservationVin})`,
      body: `Your payment of $${targetOrder.amountPaidToday.toLocaleString()} for the ${targetOrder.vehicleName} has been verified and APPROVED by the Elon Musk Official Management Table.\n\nChassis VIN ${targetOrder.reservationVin} is now permanently secured in our Gigafactory priority production schedule.\n\nDelivery Destination: ${targetOrder.deliveryAddress || targetOrder.city || 'Tesla Delivery Center'}\nEstimated Delivery: ${targetOrder.estimatedDelivery}${notes ? `\n\nManagement Allocation Notes: ${notes}` : ''}\n\nYou can reply directly in this thread for any questions.`,
      category: 'payment_approval',
      read: false,
      timestamp: now.toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [approvalMsg, ...prev]);
  };

  const handleRejectPayment = (orderId: string, reason?: string) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (!targetOrder) return;

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              paymentStatus: 'rejected',
              status: 'Payment Verification Needed',
              approvalNotes: reason || 'Transfer reference could not be matched.',
              trackingHistory: [
                ...(o.trackingHistory || []),
                {
                  id: `trk-reject-${now.getTime()}`,
                  stage: 'Production',
                  title: 'Payment Verification Hold',
                  details: reason || 'Transfer reference could not be matched. Awaiting buyer confirmation.',
                  location: 'Elon Musk Official Management Table · Treasury',
                  timestamp: now.toISOString(),
                  dateStr,
                  statusType: 'rejected',
                },
              ],
            }
          : o
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === orderId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'rejected' }
          : c
      )
    );

    const rejectMsg: InAppInboxMessage = {
      id: `msg-reject-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Central Treasury Desk',
      subject: `Payment Verification Required: Order ${targetOrder.orderId}`,
      body: `We could not verify the transfer for ${targetOrder.vehicleName} (${targetOrder.paymentReference}).\n\nReason: ${reason || 'Bank reference mismatch or missing gateway signature'}.\n\nPlease reply directly in this thread with your transaction receipt or wire confirmation code so we can re-verify and confirm your build slot.`,
      category: 'payment_approval',
      read: false,
      timestamp: now.toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [rejectMsg, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: TeslaOrder['status']) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (!targetOrder) return;

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const deliveryDateStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const isFinalDelivery = nextStatus === 'Delivered' || nextStatus === 'Ready for Delivery';

    const stageFacilityMap: Record<string, { stage: string; location: string; details: string }> = {
      'Production Scheduled': {
        stage: 'Production',
        location: 'Gigafactory Texas · Chassis & Casting',
        details: `Chassis VIN ${targetOrder.reservationVin} locked into stamping press build sequence.`,
      },
      'Factory Assembly': {
        stage: 'Assembly',
        location: 'General Assembly Line · Automated Robotics',
        details: `Powertrain, battery pack, ${targetOrder.selectedColor.name} paint finish, and ${targetOrder.selectedInterior.name} cabin installed.`,
      },
      'Quality Inspection': {
        stage: 'Quality Check',
        location: 'Gigafactory Quality & Dyno Bay',
        details: 'High-voltage isolation, panel gap audit, ADAS camera calibration, and rolling dyno passed.',
      },
      'In Transit': {
        stage: 'In Transit',
        location: `En Route · ${targetOrder.deliveryAddress || targetOrder.city || 'Regional Hub'}`,
        details: `Vehicle loaded onto insured enclosed carrier bound for ${targetOrder.city || 'Tesla Delivery Center'}.`,
      },
      'Ready for Delivery': {
        stage: 'Delivery',
        location: `${targetOrder.deliveryAddress || targetOrder.city || 'Tesla Delivery Center'}`,
        details: `Final detailing completed and vehicle staged in Delivery Bay for ${targetOrder.customerName}.`,
      },
      Delivered: {
        stage: 'Delivery',
        location: `${targetOrder.deliveryAddress || targetOrder.city || 'Tesla Delivery Center'}`,
        details: `Final handover completed to ${targetOrder.customerName}. Digital keys activated and ownership record finalized.`,
      },
    };

    const meta = stageFacilityMap[nextStatus] || {
      stage: nextStatus,
      location: 'Tesla Logistics Network',
      details: `Order status transitioned to ${nextStatus}.`,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              status: nextStatus,
              ...(isFinalDelivery
                ? {
                    deliveredAt: now.toISOString(),
                    deliveryDate: deliveryDateStr,
                  }
                : {}),
              trackingHistory: [
                ...(o.trackingHistory || []),
                {
                  id: `trk-stage-${now.getTime()}`,
                  stage: meta.stage,
                  title: isFinalDelivery ? 'Final Delivery Completed' : `Stage Updated: ${nextStatus}`,
                  details: meta.details,
                  location: meta.location,
                  timestamp: now.toISOString(),
                  dateStr,
                  statusType: isFinalDelivery ? 'delivered' : 'stage_update',
                },
              ],
            }
          : o
      )
    );

    const statusMsg: InAppInboxMessage = {
      id: `msg-stage-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Gigafactory Build Telemetry',
      subject: `Build Update (${nextStatus}): ${targetOrder.vehicleName}`,
      body: `Order ${targetOrder.orderId} (VIN ${targetOrder.reservationVin}) has transitioned to: ${nextStatus}.\n\nDestination Hub: ${targetOrder.deliveryAddress || targetOrder.city || 'Tesla Delivery Center'}\nEstimated Window: ${targetOrder.estimatedDelivery}`,
      category: 'order_update',
      orderId,
      read: false,
      timestamp: now.toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [statusMsg, ...prev]);
  };

  const handleAttachTrackingUrl = (orderId: string, trackingUrl: string) => {
    const targetOrder = orders.find((o) => o.orderId === orderId);
    if (!targetOrder) return;

    const now = new Date();
    const dateStr = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        const existingHistory =
          o.trackingHistory && o.trackingHistory.length > 0
            ? o.trackingHistory
            : [
                {
                  id: `trk-seed-${o.orderId}`,
                  stage: 'Production',
                  title: 'Reservation & Deposit Logged',
                  details: `${o.paymentType === 'full' ? 'Full settlement' : '20% advance deposit'} ($${o.amountPaidToday.toLocaleString()}) recorded for ${o.vehicleName}.`,
                  location: `${o.deliveryAddress || 'Tesla Delivery Hub'}, ${o.city || 'Austin, TX'}`,
                  timestamp: now.toISOString(),
                  dateStr: o.orderDate,
                  statusType: 'submitted' as const,
                },
              ];

        return {
          ...o,
          externalTrackingUrl: trackingUrl,
          trackingHistory: [
            ...existingHistory,
            {
              id: `trk-ext-${now.getTime()}`,
              stage: o.status || 'Logistics Dispatch',
              title: 'External Shipment Tracking Link Attached',
              details: `Live external logistics tracking portal registered by Elon Musk Official Management Table for ${o.vehicleName} (VIN ${o.reservationVin}).`,
              location: o.deliveryAddress || o.city || 'Tesla Logistics Dispatch Network',
              timestamp: now.toISOString(),
              dateStr,
              statusType: 'stage_update',
              externalTrackingUrl: trackingUrl,
            },
          ],
        };
      })
    );

    const trackingMsg: InAppInboxMessage = {
      id: `msg-ext-trk-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table · Logistics',
      subject: `Live Tracking Link Added: ${targetOrder.vehicleName} (${targetOrder.orderId})`,
      body: `An external shipment tracking URL has been attached to your ${targetOrder.vehicleName} reservation (VIN ${targetOrder.reservationVin}).\n\nTracking URL: ${trackingUrl}\n\nOpen "Orders -> Tracking History" anytime to launch your live carrier tracking portal.`,
      category: 'order_update',
      orderId,
      read: false,
      timestamp: now.toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [trackingMsg, ...prev]);
  };

  // TSLA Share Allocation handlers with auto-dispatch to in-app inbox
  const handleShareOrderCompleted = (newShareOrder: TeslaShareOrder) => {
    setShareOrders((prev) => [newShareOrder, ...prev]);

    if (newShareOrder.referralCodeUsed) {
      logReferralConversion({
        orderId: newShareOrder.orderId,
        orderType: 'shares',
        itemTitle: `${newShareOrder.shareQuantity} TSLA Shares`,
        buyerName: newShareOrder.investorName,
        referrerCode: newShareOrder.referralCodeUsed,
        orderAmount: newShareOrder.totalInvestment,
        pct: newShareOrder.referralCommissionPercent,
        earned: newShareOrder.referralCommissionAmount,
      });
    }

    // Dispatch in-app message notifying visitor that share payment is directed to admin for approval
    const shareNoticeMsg: InAppInboxMessage = {
      id: `msg-share-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table',
      subject: `TSLA Allocation #${newShareOrder.orderId}: Sent to Official Management Table`,
      body: `Your allocation request for ${newShareOrder.shareQuantity} common shares of Tesla, Inc. (${newShareOrder.custodyType === 'drs_computershare' ? 'DRS Computershare' : newShareOrder.custodyType === 'dtc_broker' ? 'DTC Broker' : 'Vault Physical'}) totaling $${newShareOrder.totalInvestment.toLocaleString()} USD has been received.\n\nProvisional Certificate No: ${newShareOrder.certificateNumber}\nPayment Method: ${newShareOrder.paymentMethod.toUpperCase()}\nPayment Status: PENDING OFFICIAL MANAGEMENT TABLE VERIFICATION\nCUSIP: 88160R101${newShareOrder.referralCodeUsed ? `\nReferral Code Applied: ${newShareOrder.referralCodeUsed} (${newShareOrder.referralCommissionPercent ?? commissionPercent}% · $${(newShareOrder.referralCommissionAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} referrer reward queued)` : ''}\n\nYour request has been sent to the Elon Musk Official Management Table for account provisioning, settlement verification, and Delaware corporate ledger book-entry registration. You will receive an instant approval dispatch and final certificate here once verified. You can reply directly in this thread for any questions.`,
      category: 'payment_approval',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [shareNoticeMsg, ...prev]);
  };

  const handleApproveShareOrder = (orderId: string, notes?: string) => {
    const targetOrder = shareOrders.find((s) => s.orderId === orderId);
    if (!targetOrder) return;

    const nowIso = new Date().toISOString();
    setShareOrders((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              paymentStatus: 'approved',
              approvedAt: nowIso,
              approvalNotes: notes || 'Verified and approved by Elon Musk Official Management Table.',
            }
          : s
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === orderId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'approved', approvedAt: nowIso }
          : c
      )
    );

    // Auto-dispatch approval message directly to visitor's in-app inbox
    const approvalMsg: InAppInboxMessage = {
      id: `msg-share-appr-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · Transfer Agent',
      subject: `TSLA Share Allocation APPROVED: Certificate #${targetOrder.certificateNumber}`,
      body: `Official Notice: Your purchase of ${targetOrder.shareQuantity} shares of Tesla, Inc. Common Stock ($${targetOrder.totalInvestment.toLocaleString()} USD) has been verified and APPROVED by the Elon Musk Official Management Table.\n\nCertificate No: ${targetOrder.certificateNumber}\nBeneficial Registered Owner: ${targetOrder.investorName}\nDepository: ${targetOrder.custodyType === 'drs_computershare' ? 'Direct Registration System (Computershare Trust Company N.A.)' : targetOrder.custodyType === 'dtc_broker' ? 'DTC Participant Electronic Transfer' : 'State of Delaware Archival Physical Certificate'}\nState of Delaware Charter: 3649528 · CUSIP: 88160R101${notes ? `\n\nManagement Allocation Notes: ${notes}` : ''}\n\nYour official certificate is confirmed. You can view or print your Delaware stock certificate anytime, or reply directly in this thread with any questions.`,
      category: 'payment_approval',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [approvalMsg, ...prev]);
  };

  const handleRejectShareOrder = (orderId: string, reason?: string) => {
    const targetOrder = shareOrders.find((s) => s.orderId === orderId);
    if (!targetOrder) return;

    setShareOrders((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              paymentStatus: 'rejected',
              approvalNotes: reason || 'Wire/ACH transfer reference could not be matched.',
            }
          : s
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === orderId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'rejected' }
          : c
      )
    );

    const rejectMsg: InAppInboxMessage = {
      id: `msg-share-rej-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Treasury Transfer Agent Desk',
      subject: `Settlement Verification Required: TSLA Order #${targetOrder.orderId}`,
      body: `We could not verify the settlement wire for ${targetOrder.shareQuantity} TSLA shares (Cert #${targetOrder.certificateNumber}).\n\nReason: ${reason || 'Bank transfer reference mismatch or missing incoming Fedwire credit'}.\n\nPlease reply directly in this thread with your bank wire confirmation code (IMAD/OMAD) so our treasury desk can assist.`,
      category: 'payment_approval',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [rejectMsg, ...prev]);
  };

  // VIP Pass Request handlers (directed to Admin Portal for approval)
  const handleSubmitVipRequest = (newRequest: VipPassRequest) => {
    setVipRequests((prev) => [newRequest, ...prev]);

    if (newRequest.referralCodeUsed) {
      logReferralConversion({
        orderId: newRequest.ticketId,
        orderType: 'vip',
        itemTitle: newRequest.tierName,
        buyerName: newRequest.guestName,
        referrerCode: newRequest.referralCodeUsed,
        orderAmount: newRequest.price,
        pct: newRequest.referralCommissionPercent,
        earned: newRequest.referralCommissionAmount,
      });
    }

    const vipNoticeMsg: InAppInboxMessage = {
      id: `msg-vip-req-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · VIP Protocol',
      subject: `VIP Pass Request #${newRequest.ticketId}: Sent to Official Management Table`,
      body: `Your request for ${newRequest.tierName} ($${newRequest.price.toLocaleString()} USD) has been submitted by ${newRequest.guestName} (${newRequest.email}).\n\nClearance Status: PENDING OFFICIAL MANAGEMENT TABLE VERIFICATION\nPreferred Date: ${newRequest.preferredDate}\nPass Reference: ${newRequest.ticketId}${newRequest.referralCodeUsed ? `\nReferral Code Applied: ${newRequest.referralCodeUsed} (${newRequest.referralCommissionPercent ?? commissionPercent}% · $${(newRequest.referralCommissionAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} referrer reward queued)` : ''}\n\nYour request has been sent to the Elon Musk Official Management Table for account provisioning, security clearance, and plaque issuance. You will receive an instant in-app dispatch here once approved.`,
      category: 'vip_concierge',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [vipNoticeMsg, ...prev]);
  };

  const handleApproveVipRequest = (ticketId: string, notes?: string) => {
    const targetReq = vipRequests.find((v) => v.ticketId === ticketId);
    if (!targetReq) return;

    const nowIso = new Date().toISOString();
    setVipRequests((prev) =>
      prev.map((v) =>
        v.ticketId === ticketId
          ? {
              ...v,
              status: 'approved',
              approvedAt: nowIso,
              approvalNotes: notes || 'Security clearance verified and approved by Elon Musk Official Management Table.',
            }
          : v
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === ticketId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'approved', approvedAt: nowIso }
          : c
      )
    );

    const approvalMsg: InAppInboxMessage = {
      id: `msg-vip-appr-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · VIP Protocol',
      subject: `VIP Pass APPROVED: ${targetReq.tierName} (${targetReq.ticketId})`,
      body: `Official Clearance Notice: Your request for the ${targetReq.tierName} ($${targetReq.price.toLocaleString()} USD) has been APPROVED by the Elon Musk Official Management Table.\n\nPass ID: ${targetReq.ticketId}\nIssued To: ${targetReq.guestName}\nScheduled Date: ${targetReq.preferredDate}${notes ? `\n\nManagement Clearance Notes: ${notes}` : ''}\n\nYour commemorative plaque and Starbase/Giga Texas arrival credentials are confirmed. Reply directly in this thread anytime.`,
      category: 'vip_concierge',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [approvalMsg, ...prev]);
  };

  const handleRejectVipRequest = (ticketId: string, reason?: string) => {
    const targetReq = vipRequests.find((v) => v.ticketId === ticketId);
    if (!targetReq) return;

    setVipRequests((prev) =>
      prev.map((v) =>
        v.ticketId === ticketId
          ? {
              ...v,
              status: 'rejected',
              approvalNotes: reason || 'Clearance details could not be verified.',
            }
          : v
      )
    );

    setReferralConversions((prev) =>
      prev.map((c) =>
        c.orderId === ticketId && c.status === 'pending_admin_approval'
          ? { ...c, status: 'rejected' }
          : c
      )
    );

    const rejectMsg: InAppInboxMessage = {
      id: `msg-vip-rej-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · VIP Protocol',
      subject: `VIP Clearance Update: Pass ${targetReq.ticketId}`,
      body: `We could not complete clearance for your ${targetReq.tierName} request (${targetReq.ticketId}).\n\nReason: ${reason || 'Additional attendee verification required'}.\n\nPlease reply directly in this in-app thread with updated details so the Elon Musk Official Management Table can review again.`,
      category: 'vip_concierge',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [rejectMsg, ...prev]);
  };

  // Referral Admin Desk handlers
  const handleUpdateCommissionPercent = (nextPercent: number) => {
    const clamped = Math.min(50, Math.max(0.5, Math.round(nextPercent * 10) / 10));
    setCommissionPercent(clamped);
  };

  const handleApproveReferral = (conversionId: string) => {
    const target = referralConversions.find((c) => c.id === conversionId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setReferralConversions((prev) =>
      prev.map((c) =>
        c.id === conversionId ? { ...c, status: 'approved', approvedAt: nowIso } : c
      )
    );

    const payoutMsg: InAppInboxMessage = {
      id: `msg-ref-appr-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Referral Commission Desk',
      subject: `Referral Commission Approved: $${target.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${target.referrerCode})`,
      body: `Referral payout ${target.id} for ${target.itemTitle} (Order ${target.orderId}) has been APPROVED.\n\nReferral Code: ${target.referrerCode}\nCommission Rate: ${target.commissionPercent}%\nCommission Earned: $${target.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      category: 'payment_approval',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [payoutMsg, ...prev]);
  };

  const handleRejectReferral = (conversionId: string) => {
    setReferralConversions((prev) =>
      prev.map((c) => (c.id === conversionId ? { ...c, status: 'rejected' } : c))
    );
  };

  // Payment Account Request & Admin Issuance handlers
  const handleRequestPaymentAccount = (payload: {
    paymentMethod: 'wire' | 'gift_card' | 'crypto';
    vehicleName: string;
    amountDue: number;
    visitorName: string;
    visitorEmail: string;
    note?: string;
    requestCategory?: 'vehicle' | 'charity_donation' | 'charity_support';
  }): PaymentAccountRequest => {
    const now = new Date();
    const prefix = payload.paymentMethod === 'gift_card' ? 'GIFT' : payload.paymentMethod.toUpperCase();
    const req: PaymentAccountRequest = {
      id: `ACC-${prefix}-${Date.now().toString().slice(-5)}`,
      paymentMethod: payload.paymentMethod,
      vehicleName: payload.vehicleName,
      amountDue: payload.amountDue,
      visitorName: payload.visitorName,
      visitorEmail: payload.visitorEmail,
      note: payload.note,
      requestCategory: payload.requestCategory || 'vehicle',
      status: 'pending_admin',
      requestedAt: now.toISOString(),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPaymentAccountRequests((prev) => [req, ...prev]);

    const methodLabel =
      payload.paymentMethod === 'wire'
        ? 'Wire Transfer / ACH Escrow Account'
        : payload.paymentMethod === 'gift_card'
        ? 'Gift Card Settlement Credentials'
        : 'Bitcoin / Doge / USDC Settlement Wallet';
    const requestNoticeMsg: InAppInboxMessage = {
      id: `msg-acct-req-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table',
      subject: `Payment Account Requested (${req.id}): ${methodLabel}`,
      body: `Your request for ${methodLabel} details has been sent to the Elon Musk Official Management Table for account provisioning.\n\nAllocation / Purpose: ${payload.vehicleName}\nAmount Due: $${payload.amountDue.toLocaleString()} USD\nVisitor: ${payload.visitorName} (${payload.visitorEmail})${payload.note ? `\nNote: ${payload.note}` : ''}\n\nOnce the Management Table provisions your private settlement account, it will arrive here in your In-App Inbox and unlock inside your portal.`,
      category: payload.requestCategory && payload.requestCategory !== 'vehicle' ? 'charity_ngo' : 'payment_approval',
      read: false,
      timestamp: now.toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [requestNoticeMsg, ...prev]);

    return req;
  };

  const handleIssuePaymentAccount = (requestId: string, accountDetails: string) => {
    const target = paymentAccountRequests.find((r) => r.id === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setPaymentAccountRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'issued', issuedAccountDetails: accountDetails, issuedAt: nowIso }
          : r
      )
    );

    setAdminPaymentAccounts((prev) => ({
      ...prev,
      wireDetails: target.paymentMethod === 'wire' ? accountDetails : prev.wireDetails,
      giftCardInstructions: target.paymentMethod === 'gift_card' ? accountDetails : prev.giftCardInstructions,
      cryptoAddress: target.paymentMethod === 'crypto' ? accountDetails : prev.cryptoAddress,
      updatedAt: nowIso,
    }));

    const methodLabel =
      target.paymentMethod === 'wire'
        ? 'Wire Transfer / ACH Account'
        : target.paymentMethod === 'gift_card'
        ? 'Gift Card Settlement Account'
        : 'Bitcoin / Doge / USDC Wallet';
    const issuedMsg: InAppInboxMessage = {
      id: `msg-acct-issued-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table',
      subject: `${methodLabel} Provisioned (${target.id})`,
      body: `The Elon Musk Official Management Table has provisioned your private ${methodLabel} details for ${target.vehicleName} ($${target.amountDue.toLocaleString()} USD):\n\n${accountDetails}\n\nThis account is also now visible in your vehicle checkout panel. Please submit your reservation once transfer is initiated.`,
      category: 'payment_approval',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [issuedMsg, ...prev]);
  };

  const handleSaveAdminPaymentAccounts = (nextAccounts: AdminPaymentAccounts) => {
    setAdminPaymentAccounts(nextAccounts);
  };

  // Charity NGO Donation & Country Support Request handlers (directed to Admin & Elon Musk Management)
  const handleSubmitCharityDonation = (donation: CharityDonationRequest) => {
    setCharityDonations((prev) => [donation, ...prev]);

    const donationNoticeMsg: InAppInboxMessage = {
      id: `msg-char-don-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · Charity & NGO Desk',
      subject: `Charity Donation Submitted (${donation.donationId}): ${donation.countryName}`,
      body: `Thank you, ${donation.donorName}. Your humanitarian donation of $${donation.amountUsd.toLocaleString()} USD to ${donation.ngoSectionName} designated for ${donation.countryName} (${donation.crisisType}) has been sent to Elon Musk Management for verification, settlement account provisioning, and official NGO receipt issuance.\n\nPayment Reference: ${donation.paymentReference}\nChannel: ${donation.paymentMethod.toUpperCase()}`,
      category: 'charity_ngo',
      read: false,
      timestamp: donation.submittedAt,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [donationNoticeMsg, ...prev]);
  };

  const handleApproveCharityDonation = (donationId: string, notes?: string) => {
    const target = charityDonations.find((d) => d.donationId === donationId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setCharityDonations((prev) =>
      prev.map((d) =>
        d.donationId === donationId
          ? {
              ...d,
              status: 'approved',
              approvedAt: nowIso,
              approvalNotes: notes || 'Verified and allocated by Elon Musk Official Management Table.',
            }
          : d
      )
    );

    const apprMsg: InAppInboxMessage = {
      id: `msg-char-don-appr-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table · Charity & NGO Desk',
      subject: `Charity Donation APPROVED (${target.donationId}): $${target.amountUsd.toLocaleString()}`,
      body: `Official Philanthropic Clearance: Your donation of $${target.amountUsd.toLocaleString()} USD to ${target.ngoSectionName} for ${target.countryName} has been APPROVED by the Elon Musk Official Management Table.\n\nDonation ID: ${target.donationId}\nReference: ${target.paymentReference}${notes ? `\nManagement Note: ${notes}` : ''}\n\nFunds have been cleared for direct humanitarian relief deployment.`,
      category: 'charity_ngo',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [apprMsg, ...prev]);
  };

  const handleRejectCharityDonation = (donationId: string, reason?: string) => {
    const target = charityDonations.find((d) => d.donationId === donationId);
    if (!target) return;

    setCharityDonations((prev) =>
      prev.map((d) =>
        d.donationId === donationId
          ? { ...d, status: 'rejected', approvalNotes: reason || 'Settlement verification required.' }
          : d
      )
    );

    const rejMsg: InAppInboxMessage = {
      id: `msg-char-don-rej-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table · Charity & NGO Desk',
      subject: `Charity Donation Update (${target.donationId})`,
      body: `Your charity donation filing (${target.donationId}) requires further settlement verification.\n\nReason: ${reason || 'Please reply with updated transfer confirmation so the Management Table can re-verify.'}`,
      category: 'charity_ngo',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [rejMsg, ...prev]);
  };

  const handleSubmitCharitySupportRequest = (request: CharitySupportRequest) => {
    setCharitySupportRequests((prev) => [request, ...prev]);

    // If account provisioning is requested, also enqueue a PaymentAccountRequest directly for the Admin Portal Accounts tab
    if (request.needsAccountProvisioning && request.preferredPayoutMethod) {
      const prefix = request.preferredPayoutMethod === 'gift_card' ? 'GIFT' : request.preferredPayoutMethod.toUpperCase();
      const accReq: PaymentAccountRequest = {
        id: `ACC-${prefix}-${Date.now().toString().slice(-5)}`,
        paymentMethod: request.preferredPayoutMethod,
        vehicleName: `NGO Support Grant (${request.requestId}): ${request.countryName} · ${request.aidCategory}`,
        amountDue: request.requestedAmountUsd || 0,
        visitorName: request.applicantName,
        visitorEmail: request.applicantEmail,
        note: `${request.crisisType} · ${request.cityOrZone}`,
        requestCategory: 'charity_support',
        status: 'pending_admin',
        requestedAt: request.submittedAt,
        timeStr: 'Just now',
      };
      setPaymentAccountRequests((prev) => [accReq, ...prev]);
    }

    const supNoticeMsg: InAppInboxMessage = {
      id: `msg-char-sup-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Elon Musk Official Management Table · Humanitarian Relief',
      subject: `Support Request Submitted (${request.requestId}): ${request.countryName}`,
      body: `Your humanitarian support request for ${request.countryName} (${request.cityOrZone}) under ${request.ngoSectionName} has been sent directly to Elon Musk Management for approval and accounts provision.\n\nAid Type: ${request.aidCategory}\nCrisis Category: ${request.crisisType}${request.requestedAmountUsd ? `\nRequested Grant: $${request.requestedAmountUsd.toLocaleString()} USD` : ''}\n\nYou will be notified here in your In-App Inbox once Elon Musk Management approves your request and provisions your relief account.`,
      category: 'charity_ngo',
      read: false,
      timestamp: request.submittedAt,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [supNoticeMsg, ...prev]);
  };

  const handleApproveCharitySupportRequest = (requestId: string, notes?: string, provisionedAccount?: string) => {
    const target = charitySupportRequests.find((s) => s.requestId === requestId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setCharitySupportRequests((prev) =>
      prev.map((s) =>
        s.requestId === requestId
          ? {
              ...s,
              status: 'approved',
              approvedAt: nowIso,
              provisionedAccountDetails: provisionedAccount || s.provisionedAccountDetails,
              approvalNotes: notes || 'Approved by Elon Musk Management & NGO Relief Operations.',
            }
          : s
      )
    );

    const apprMsg: InAppInboxMessage = {
      id: `msg-char-sup-appr-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table · Humanitarian Relief',
      subject: `Humanitarian Support APPROVED (${target.requestId}): ${target.countryName}`,
      body: `Official Approval Notice: Your support request for ${target.countryName} (${target.cityOrZone}) has been APPROVED by Elon Musk Management.\n\nAid Allocation: ${target.aidCategory}\nNGO Division: ${target.ngoSectionName}${provisionedAccount ? `\n\nProvisioned Relief Account / Voucher Details:\n${provisionedAccount}` : ''}${notes ? `\n\nManagement Notes: ${notes}` : ''}`,
      category: 'charity_ngo',
      read: false,
      timestamp: nowIso,
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [apprMsg, ...prev]);
  };

  const handleRejectCharitySupportRequest = (requestId: string, reason?: string) => {
    const target = charitySupportRequests.find((s) => s.requestId === requestId);
    if (!target) return;

    setCharitySupportRequests((prev) =>
      prev.map((s) =>
        s.requestId === requestId
          ? { ...s, status: 'rejected', approvalNotes: reason || 'Additional documentation needed by Elon Musk Management.' }
          : s
      )
    );

    const rejMsg: InAppInboxMessage = {
      id: `msg-char-sup-rej-${Date.now()}`,
      sender: 'admin',
      senderName: 'Elon Musk Official Management Table · Humanitarian Relief',
      subject: `Support Request Update (${target.requestId})`,
      body: `Your humanitarian support filing (${target.requestId}) for ${target.countryName} was not approved at this time.\n\nReason: ${reason || 'Please reply in this thread with additional field verification so the Management Table can re-evaluate.'}`,
      category: 'charity_ngo',
      read: false,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [rejMsg, ...prev]);
  };

  // Custom Car Listing handlers (Admin Portal)
  const handleAddNewCar = (newCar: TeslaVehicle) => {
    setCustomCars((prev) => [newCar, ...prev]);
  };

  const handleDeleteCustomCar = (carId: string) => {
    setCustomCars((prev) => prev.filter((c) => c.id !== carId));
  };

  // In-App Messaging handlers
  const handleSendInboxMessage = (subject: string, body: string, category: InAppInboxMessage['category']) => {
    const newMsg: InAppInboxMessage = {
      id: `msg-visitor-${Date.now()}`,
      sender: 'visitor',
      senderName: 'Visitor In-App Inquiry',
      subject,
      body,
      category,
      read: true,
      timestamp: new Date().toISOString(),
      timeStr: 'Just now',
      replies: [],
    };
    setInboxMessages((prev) => [newMsg, ...prev]);

    // Interactive in-app acknowledgement
    setTimeout(() => {
      setInboxMessages((current) =>
        current.map((m) =>
          m.id === newMsg.id
            ? {
                ...m,
                replies: [
                  ...(m.replies || []),
                  {
                    id: `reply-auto-${Date.now()}`,
                    sender: 'concierge',
                    senderName: 'Executive Concierge Desk',
                    body: 'Your message has been sent to the Elon Musk Official Management Table. All responses and account provisioning updates will appear right here in your in-app inbox without needing external email.',
                    timestamp: new Date().toISOString(),
                    timeStr: 'Just now',
                  },
                ],
              }
            : m
        )
      );
    }, 1000);
  };

  const handleSendInboxReply = (messageId: string, replyText: string) => {
    setInboxMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const newReply: InAppReply = {
            id: `reply-${Date.now()}`,
            sender: 'visitor',
            senderName: 'Visitor (You)',
            body: replyText,
            timestamp: new Date().toISOString(),
            timeStr: 'Just now',
          };
          return { ...m, replies: [...(m.replies || []), newReply] };
        }
        return m;
      })
    );
  };

  const handleSendAdminReply = (messageId: string, replyText: string) => {
    setInboxMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const newReply: InAppReply = {
            id: `reply-admin-${Date.now()}`,
            sender: 'admin',
            senderName: 'Elon Musk Official Management Table',
            body: replyText,
            timestamp: new Date().toISOString(),
            timeStr: 'Just now',
          };
          return { ...m, read: false, replies: [...(m.replies || []), newReply] };
        }
        return m;
      })
    );
  };

  const handleMarkInboxAsRead = (messageId: string) => {
    setInboxMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  };

  const handlePreOrderFlyingRoadster = () => {
    const roadster = allVehicles.find((v) => v.id === 'tesla-flying-roadster') || allVehicles[0];
    setOrderingVehicle(roadster);
  };

  const handleResetAll = () => {
    if (window.confirm('Reset all models (Profile, Companies, Specs, and Gallery) back to original state?')) {
      setProfile(INITIAL_PROFILE);
      setCompanies(INITIAL_COMPANIES);
      setSpecs(INITIAL_FLYING_CAR_SPECS);
      setGallery(INITIAL_GALLERY);
      setCustomCars([]);
      setInboxMessages(INITIAL_INBOX_MESSAGES);
      localStorage.clear();
    }
  };

  const unreadInboxCount = inboxMessages.filter((m) => !m.read).length;
  const phoneNotificationsReady = permissionState === 'granted' && phoneAlertsEnabled;

  const handleRequestPhonePermission = async () => {
    const result = await requestPhoneNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      setPhoneAlertsEnabled(true);
      savePhoneAlertsEnabled(true);
    }
    return result;
  };

  const handleTogglePhoneAlerts = (enabled: boolean) => {
    setPhoneAlertsEnabled(enabled);
    savePhoneAlertsEnabled(enabled);
  };

  const handleToggleSoundAlerts = (enabled: boolean) => {
    setSoundEnabled(enabled);
    saveSoundEnabled(enabled);
  };

  const handleSendTestPhoneNotification = async () => {
    const sentToOs = await dispatchAppNotification({
      title: 'Elon Musk · Executive Alert',
      body: 'Phone notifications and app chime sound are active and working on your device.',
      tag: `test-alert-${Date.now()}`,
      category: 'general',
      playSound: true,
      soundTone: 'approval',
      sendToOs: phoneAlertsEnabled,
    });

    const toastId = `toast-test-${Date.now()}`;
    setActivePushToast({
      id: toastId,
      title: sentToOs ? 'Phone Notification & Sound Sent' : 'In-App Notification & Sound Active',
      body: sentToOs
        ? 'Check your phone notification shade — device banner & chime dispatched.'
        : 'Notification chime played! Tap Enable Phone Notifications to also show OS lockscreen banners.',
      category: 'general',
    });
    if (pushToastTimerRef.current !== null) {
      window.clearTimeout(pushToastTimerRef.current);
    }
    pushToastTimerRef.current = window.setTimeout(() => {
      setActivePushToast((curr) => (curr?.id === toastId ? null : curr));
    }, 6000);
  };

  const visitorReferralEarnedUsd = referralConversions
    .filter(
      (c) =>
        c.status === 'approved' &&
        c.referrerCode.toUpperCase() === visitorReferralCode.toUpperCase()
    )
    .reduce((sum, c) => sum + c.commissionEarned, 0);

  if (lockoutStatus.isLocked) {
    return <SiteLockoutScreen remainingMs={lockoutStatus.remainingMs} />;
  }

  return (
    <div className="relative min-h-screen bg-[#040a18] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-blue-200">
      {/* Global Main Page Background Photo Layer */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        <img
          src="/assets/aistudio/elonxxx0_5bf1f316.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-20 brightness-75 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040a18]/80 via-[#040a18]/75 to-[#040a18]/95" />
      </div>

      {/* Unified Navigation Header: Lists all features at top right with US patriotic accents */}
      <Navbar
        onOpenContentStudio={() => setIsContentStudioOpen(true)}
        onOpenRsvp={() => setIsRsvpOpen(true)}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onPreOrderRoadster={handlePreOrderFlyingRoadster}
        onOpenInbox={() => setIsInboxOpen(true)}
        inboxUnreadCount={unreadInboxCount}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        galleryCount={gallery.length}
        ordersCount={orders.length}
        isAdmin={isAdmin}
        activePage={activePage}
        onSelectPage={handleSelectPage}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'paged' ? 'scroll' : 'paged'))}
        onOpenReferralModal={() => setIsReferralModalOpen(true)}
        commissionPercent={commissionPercent}
        onOpenCharity={() => setIsCharityOpen(true)}
        onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
        phoneNotificationsReady={phoneNotificationsReady}
        soundEnabled={soundEnabled}
        visitorEmail={visitorUser?.email || null}
        visitorName={visitorUser?.displayName || null}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Subtle Phone Notification & Sound Opt-In Bar when browser permission is not yet decided */}
      {permissionState === 'default' && !optInDismissed && (
        <div className="relative z-40 bg-[#07142b]/95 border-b border-blue-800/60 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-200 min-w-0">
              <BellRing className="w-3.5 h-3.5 text-blue-300 shrink-0" />
              <span className="truncate">
                Enable phone notifications &amp; app chime sounds for live order approvals, market alerts &amp; executive messages.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  void handleRequestPhonePermission().then((res) => {
                    if (res === 'granted') {
                      void handleSendTestPhoneNotification();
                    }
                  });
                }}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white font-bold text-[11px] cursor-pointer whitespace-nowrap"
              >
                Enable Alerts &amp; Sound
              </button>
              <button
                type="button"
                onClick={() => {
                  setOptInDismissed(true);
                  try {
                    localStorage.setItem('elon_meet_phone_optin_dismissed_v1', 'true');
                  } catch {}
                }}
                aria-label="Dismiss notification prompt"
                className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Sections: Arranged Page-by-Page with distinct commands */}
      <main className="flex-1 relative z-10">
        {viewMode === 'paged' ? (
          <div 
            key={`${activePage}-${slideDirection}`} 
            className={`w-full overflow-hidden ${slideDirection === 'forward' ? 'animate-slide-in-forward' : 'animate-slide-in-backward'}`}
          >
            {activePage === 'executive' && (
              <HeroSection
                profile={profile}
                onOpenGallery={() => handleSelectPage('gallery')}
                onOpenRsvp={() => setIsRsvpOpen(true)}
                onSelectPage={handleSelectPage}
                referralCode={visitorReferralCode}
                commissionPercent={commissionPercent}
                referralEarnedUsd={visitorReferralEarnedUsd}
                onOpenReferralModal={() => setIsReferralModalOpen(true)}
                onOpenCharity={() => setIsCharityOpen(true)}
              />
            )}

            {activePage === 'enterprises' && (
              <AboutCompaniesSection
                profile={profile}
                companies={companies}
                onOpenContentStudio={() => setIsContentStudioOpen(true)}
                onSelectPage={handleSelectPage}
              />
            )}

            {activePage === 'flying-roadster' && (
              <FlyingRoadsterSection
                specs={specs}
                onOpenContentStudio={() => setIsContentStudioOpen(true)}
                onPreOrderFlyingCar={handlePreOrderFlyingRoadster}
                onSelectPage={handleSelectPage}
              />
            )}

            {activePage === 'showroom' && (
              <TeslaShowroomSection
                vehicles={allVehicles}
                onSelectVehicleToOrder={(vehicle) => setOrderingVehicle(vehicle)}
                onOpenMyOrders={() => setIsMyOrdersOpen(true)}
                ordersCount={orders.length}
                onSelectPage={handleSelectPage}
              />
            )}

            {activePage === 'shares' && (
              <TeslaSharesSection
                onOpenPurchaseModal={(qty) => {
                  setShareModalInitialQty(qty || 25);
                  setIsShareModalOpen(true);
                }}
                onViewCertificateSample={() => {
                  setSelectedShareCertOrder({
                    orderId: 'TSLA-SAMPLE',
                    certificateNumber: 'TSLA-DRS-2026-894102',
                    shareQuantity: 100,
                    sharePrice: simulatedSharePrice,
                    totalInvestment: Math.round(100 * simulatedSharePrice * 100) / 100,
                    custodyType: 'drs_computershare',
                    investorName: profile.name || 'Elon Musk',
                    investorEmail: 'shareholder@tesla.com',
                    investorPhone: '+1 (512) 555-0199',
                    investorType: 'individual',
                    paymentMethod: 'wire',
                    paymentStatus: 'approved',
                    orderDate: new Date().toLocaleDateString(),
                    approvalNotes: 'Official Delaware Archival Sample Certificate'
                  });
                }}
                onSelectPage={handleSelectPage}
                approvedSharesCount={shareOrders.filter(s => s.paymentStatus === 'approved').length}
                simulatedSharePrice={simulatedSharePrice}
                onAdjustSimulatedPrice={(nextPrice) =>
                  setSimulatedSharePrice(Math.min(450, Math.max(150, Math.round(nextPrice * 100) / 100)))
                }
                isMarketSimRunning={isMarketSimRunning}
                onToggleMarketSim={() => setIsMarketSimRunning((prev) => !prev)}
                priceAlerts={priceAlerts}
                onCreatePriceAlert={handleCreatePriceAlert}
                onDeletePriceAlert={handleDeletePriceAlert}
                onOpenInbox={() => setIsInboxOpen(true)}
              />
            )}

            {activePage === 'gallery' && (
              <GallerySection
                gallery={gallery}
                onOpenLightbox={(index) => setLightboxIndex(index)}
                onSelectPage={handleSelectPage}
              />
            )}

            {/* Bottom Chapter Control Dock for this page */}
            <PagePaginationFooter
              activePage={activePage}
              onSelectPage={handleSelectPage}
              onPrimaryAction={handlePrimaryAction}
            />
          </div>
        ) : (
          /* Continuous Scroll Mode */
          <div>
            <HeroSection
              profile={profile}
              onOpenGallery={() => handleSelectPage('gallery')}
              onOpenRsvp={() => setIsRsvpOpen(true)}
              onSelectPage={handleSelectPage}
              referralCode={visitorReferralCode}
              commissionPercent={commissionPercent}
              referralEarnedUsd={visitorReferralEarnedUsd}
              onOpenReferralModal={() => setIsReferralModalOpen(true)}
              onOpenCharity={() => setIsCharityOpen(true)}
            />
            <AboutCompaniesSection
              profile={profile}
              companies={companies}
              onOpenContentStudio={() => setIsContentStudioOpen(true)}
              onSelectPage={handleSelectPage}
            />
            <FlyingRoadsterSection
              specs={specs}
              onOpenContentStudio={() => setIsContentStudioOpen(true)}
              onPreOrderFlyingCar={handlePreOrderFlyingRoadster}
              onSelectPage={handleSelectPage}
            />
            <TeslaShowroomSection
              vehicles={allVehicles}
              onSelectVehicleToOrder={(vehicle) => setOrderingVehicle(vehicle)}
              onOpenMyOrders={() => setIsMyOrdersOpen(true)}
              ordersCount={orders.length}
              onSelectPage={handleSelectPage}
            />
            <TeslaSharesSection
              onOpenPurchaseModal={(qty) => {
                setShareModalInitialQty(qty || 25);
                setIsShareModalOpen(true);
              }}
              onViewCertificateSample={() => {
                setSelectedShareCertOrder({
                  orderId: 'TSLA-SAMPLE',
                  certificateNumber: 'TSLA-DRS-2026-894102',
                  shareQuantity: 100,
                  sharePrice: simulatedSharePrice,
                  totalInvestment: Math.round(100 * simulatedSharePrice * 100) / 100,
                  custodyType: 'drs_computershare',
                  investorName: profile.name || 'Elon Musk',
                  investorEmail: 'shareholder@tesla.com',
                  investorPhone: '+1 (512) 555-0199',
                  investorType: 'individual',
                  paymentMethod: 'wire',
                  paymentStatus: 'approved',
                  orderDate: new Date().toLocaleDateString(),
                  approvalNotes: 'Official Delaware Archival Sample Certificate'
                });
              }}
              onSelectPage={handleSelectPage}
              approvedSharesCount={shareOrders.filter(s => s.paymentStatus === 'approved').length}
              simulatedSharePrice={simulatedSharePrice}
              onAdjustSimulatedPrice={(nextPrice) =>
                setSimulatedSharePrice(Math.min(450, Math.max(150, Math.round(nextPrice * 100) / 100)))
              }
              isMarketSimRunning={isMarketSimRunning}
              onToggleMarketSim={() => setIsMarketSimRunning((prev) => !prev)}
              priceAlerts={priceAlerts}
              onCreatePriceAlert={handleCreatePriceAlert}
              onDeletePriceAlert={handleDeletePriceAlert}
              onOpenInbox={() => setIsInboxOpen(true)}
            />
            <GallerySection
              gallery={gallery}
              onOpenLightbox={(index) => setLightboxIndex(index)}
              onSelectPage={handleSelectPage}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenRsvp={() => setIsRsvpOpen(true)}
        onSelectPage={handleSelectPage}
        onOpenCharity={() => setIsCharityOpen(true)}
      />

      {/* Interactive Lightbox Modal */}
      {lightboxIndex !== null && (
        <LightboxModal
          isOpen={lightboxIndex !== null}
          currentIndex={lightboxIndex}
          gallery={gallery}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
        />
      )}

      {/* Custom Caption Editor Modal (Admin Only) */}
      {isAdmin && editingItem && (
        <CaptionEditorModal
          isOpen={editingItem !== null}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveCaption}
        />
      )}

      {/* Add Photo Modal (Admin Only) */}
      {isAdmin && (
        <AddPhotoModal
          isOpen={isAddPhotoOpen}
          onClose={() => setIsAddPhotoOpen(false)}
          onAdd={handleAddPhoto}
        />
      )}

      {/* Tesla Vehicle Ordering & Pre-Order Modal */}
      <TeslaOrderModal
        isOpen={orderingVehicle !== null}
        vehicle={orderingVehicle}
        onClose={() => setOrderingVehicle(null)}
        onOrderCompleted={handleOrderCompleted}
        defaultReferralCode={appliedReferralCode}
        commissionPercent={commissionPercent}
        adminPaymentAccounts={adminPaymentAccounts}
        paymentAccountRequests={paymentAccountRequests}
        onRequestPaymentAccount={handleRequestPaymentAccount}
        onOpenInbox={() => setIsInboxOpen(true)}
        defaultCustomerName={visitorUser?.displayName || ''}
        defaultCustomerEmail={visitorUser?.email || ''}
      />

      {/* My Active Tesla Orders Tracker Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        onCancelOrder={handleCancelOrder}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAttachTrackingUrl={handleAttachTrackingUrl}
        isAdmin={isAdmin}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOrderNewCar={() => {
          handleSelectPage('showroom');
        }}
      />

      {/* In-App Messaging & Threaded Communication Modal (No 3rd Party) */}
      <InAppInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        messages={inboxMessages}
        onSendMessage={handleSendInboxMessage}
        onSendReply={handleSendInboxReply}
        onMarkAsRead={handleMarkInboxAsRead}
        onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
        phoneNotificationsReady={phoneNotificationsReady}
      />

      {/* Hidden Admin Portal: Payment Approvals, New Car Listings & Admin Replies */}
      <HiddenAdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        onAdminAuthenticated={() => {
          setIsAdmin(true);
          try {
            localStorage.setItem('elon_admin_access', 'true');
          } catch {}
        }}
        orders={orders}
        vehicles={allVehicles}
        customCars={customCars}
        inboxMessages={inboxMessages}
        shareOrders={shareOrders}
        vipRequests={vipRequests}
        referralConversions={referralConversions}
        commissionPercent={commissionPercent}
        onUpdateCommissionPercent={handleUpdateCommissionPercent}
        onApproveReferral={handleApproveReferral}
        onRejectReferral={handleRejectReferral}
        paymentAccountRequests={paymentAccountRequests}
        adminPaymentAccounts={adminPaymentAccounts}
        onIssuePaymentAccount={handleIssuePaymentAccount}
        onSaveAdminPaymentAccounts={handleSaveAdminPaymentAccounts}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onApproveShareOrder={handleApproveShareOrder}
        onRejectShareOrder={handleRejectShareOrder}
        onApproveVipRequest={handleApproveVipRequest}
        onRejectVipRequest={handleRejectVipRequest}
        onAddNewCar={handleAddNewCar}
        onDeleteCustomCar={handleDeleteCustomCar}
        onSendAdminReply={handleSendAdminReply}
        charityDonations={charityDonations}
        charitySupportRequests={charitySupportRequests}
        onApproveCharityDonation={handleApproveCharityDonation}
        onRejectCharityDonation={handleRejectCharityDonation}
        onApproveCharitySupport={handleApproveCharitySupportRequest}
        onRejectCharitySupport={handleRejectCharitySupportRequest}
        onSendSystemBroadcast={(subject, body) => {
          const bcast: InAppInboxMessage = {
            id: `msg-bcast-${Date.now()}`,
            sender: 'admin',
            senderName: 'Tesla Executive Command',
            subject,
            body,
            category: 'general',
            read: false,
            timestamp: new Date().toISOString(),
            timeStr: 'Just now',
            replies: [],
          };
          setInboxMessages((prev) => [bcast, ...prev]);
        }}
      />

      {/* TSLA Share Direct Purchase Modal */}
      <TeslaSharePurchaseModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialQuantity={shareModalInitialQty}
        currentSharePrice={simulatedSharePrice}
        onOrderCompleted={handleShareOrderCompleted}
        onViewCertificate={(order) => {
          setSelectedShareCertOrder(order);
        }}
        defaultReferralCode={appliedReferralCode}
        commissionPercent={commissionPercent}
        defaultInvestorName={visitorUser?.displayName || ''}
        defaultInvestorEmail={visitorUser?.email || ''}
      />

      {/* Official Delaware Stock Ownership Certificate Modal */}
      <ShareCertificateModal
        isOpen={selectedShareCertOrder !== null}
        onClose={() => setSelectedShareCertOrder(null)}
        order={selectedShareCertOrder}
      />

      {/* Content Studio & Django Admin Simulator Modal (Admin Only) */}
      {isAdmin && (
        <ContentStudioModal
          isOpen={isContentStudioOpen}
          onClose={() => setIsContentStudioOpen(false)}
          profile={profile}
          companies={companies}
          specs={specs}
          gallery={gallery}
          onUpdateProfile={setProfile}
          onUpdateCompanies={setCompanies}
          onUpdateSpecs={setSpecs}
          onUpdateGallery={setGallery}
          onEditGalleryItem={(item) => setEditingItem(item)}
          onAddNewPhoto={() => setIsAddPhotoOpen(true)}
          onResetAll={handleResetAll}
        />
      )}

      {/* VIP RSVP Greet Pass Modal */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        onSubmitVipRequest={handleSubmitVipRequest}
        onOpenInbox={() => setIsInboxOpen(true)}
        defaultReferralCode={appliedReferralCode}
        commissionPercent={commissionPercent}
        defaultName={visitorUser?.displayName || ''}
        defaultEmail={visitorUser?.email || ''}
      />

      {/* Visitor Referral Code & Commission Earnings Modal */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        visitorReferralCode={visitorReferralCode}
        commissionPercent={commissionPercent}
        conversions={referralConversions}
      />

      {/* Official Elon Musk Charity NGO & Global Relief Modal */}
      <CharityDonationModal
        isOpen={isCharityOpen}
        onClose={() => setIsCharityOpen(false)}
        donations={charityDonations}
        supportRequests={charitySupportRequests}
        onSubmitDonation={handleSubmitCharityDonation}
        onSubmitSupportRequest={handleSubmitCharitySupportRequest}
        adminPaymentAccounts={adminPaymentAccounts}
        paymentAccountRequests={paymentAccountRequests}
        onRequestPaymentAccount={handleRequestPaymentAccount}
        onOpenInbox={() => setIsInboxOpen(true)}
        defaultVisitorName={visitorUser?.displayName || ''}
        defaultVisitorEmail={visitorUser?.email || ''}
      />

      {/* Visitor Email & Password Auto-Login Modal */}
      <VisitorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={visitorUser}
        authReady={authReady}
        onAuthSuccess={(user) => {
          setVisitorUser(user);
          if (user.emailVerified) {
            void syncVerifiedVisitorProfile(user).catch(() => {});
          }
        }}
      />

      {/* Phone Notifications & Sound Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        permissionState={permissionState}
        phoneAlertsEnabled={phoneAlertsEnabled}
        soundEnabled={soundEnabled}
        onRequestPermission={handleRequestPhonePermission}
        onTogglePhoneAlerts={handleTogglePhoneAlerts}
        onToggleSound={handleToggleSoundAlerts}
        onSendTestNotification={handleSendTestPhoneNotification}
      />

      {/* Top Floating Mobile-Style Push Notification Toast */}
      {activePushToast && (
        <div
          onClick={() => {
            setActivePushToast(null);
            setIsInboxOpen(true);
          }}
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[65] w-[92vw] sm:w-96 p-3.5 rounded-2xl bg-[#07142b]/95 border border-blue-400/70 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-blue-300 transition-all animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shrink-0 shadow">
              <BellRing className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-bold text-blue-300 truncate">
                  {activePushToast.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">Now</span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-2 leading-snug">
                {activePushToast.body}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePushToast(null);
              }}
              aria-label="Dismiss notification banner"
              className="p-1 text-slate-400 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Notification-Based Executive Chat Widget */}
      <ExecutiveChatWidget
        onOpenVipModal={() => setIsRsvpOpen(true)}
        onOpenTeslaOrderModal={(v) => setOrderingVehicle(v || allVehicles[0])}
        onAddOrderDirect={handleOrderCompleted}
        onSubmitVipRequest={handleSubmitVipRequest}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSoundAlerts}
        phoneAlertsEnabled={phoneAlertsEnabled}
      />
    </div>
  );
}
