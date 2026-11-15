import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Award, 
  Car, 
  Wind, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Bell, 
  QrCode, 
  User, 
  CornerDownRight, 
  Volume2, 
  VolumeX, 
  ChevronUp, 
  ChevronDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ChatMessage, NotificationItem, TeslaVehicle, VipPassRequest } from '../types';
import { TESLA_VEHICLES } from '../data/teslaVehicles';
import { dispatchAppNotification } from '../utils/deviceNotifications';

interface ExecutiveChatWidgetProps {
  onOpenVipModal: () => void;
  onOpenTeslaOrderModal: (vehicle?: TeslaVehicle) => void;
  onAddOrderDirect: (orderData: any) => void;
  onSubmitVipRequest?: (request: VipPassRequest) => void;
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
  phoneAlertsEnabled?: boolean;
}

// Initial welcoming chat messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'concierge',
    senderName: 'Tesla Executive Desk',
    senderAvatar: '/assets/aistudio/elo_e882ff2e.webp',
    text: 'Welcome to the official Elon Musk Executive Concierge. You can inquire about ventures, send VIP Greet & Meet requests ($1,000–$10,000), or pre-order the Tesla Flying Roadster ($10,000 deposit to full price) directly here. All requests and payment confirmations are sent directly to the Elon Musk Official Management Table for account provisioning and verification.',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    timeStr: 'Just now',
    type: 'text',
    read: true,
  },
];

export const ExecutiveChatWidget: React.FC<ExecutiveChatWidgetProps> = ({
  onOpenVipModal,
  onOpenTeslaOrderModal,
  onAddOrderDirect,
  onSubmitVipRequest,
  soundEnabled: externalSoundEnabled,
  onToggleSound,
  phoneAlertsEnabled = true,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('elon_chat_messages_v1');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [inputVal, setInputVal] = useState<string>('');
  const [localSoundEnabled, setLocalSoundEnabled] = useState<boolean>(true);
  const soundEnabled = externalSoundEnabled !== undefined ? externalSoundEnabled : localSoundEnabled;
  const setSoundEnabled = (next: boolean) => {
    if (onToggleSound) {
      onToggleSound(next);
    } else {
      setLocalSoundEnabled(next);
    }
  };
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeBannerNotification, setActiveBannerNotification] = useState<NotificationItem | null>(null);
  const [activeMode, setActiveMode] = useState<'visitor' | 'admin'>('visitor');
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'vip' | 'order'>('none');

  // VIP Quick Form State inside Chat
  const [vipTier, setVipTier] = useState<'silver' | 'platinum' | 'gold'>('gold');
  const [vipName, setVipName] = useState('');
  const [vipEmail, setVipEmail] = useState('');
  const [vipDate, setVipDate] = useState('2026-11-25');

  // Tesla Order Quick Form State inside Chat
  const [selectedCarId, setSelectedCarId] = useState('tesla-flying-roadster');
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(10000);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elon_chat_messages_v1', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat messages', e);
    }
  }, [messages]);

  // Push incoming notification (to in-app banner, sound chime, and visitor's phone)
  const pushNotification = (title: string, message: string, type: 'chat' | 'vip' | 'order') => {
    void dispatchAppNotification({
      title,
      body: message,
      category: type,
      playSound: soundEnabled,
      soundTone: type === 'vip' || type === 'order' ? 'approval' : 'message',
      sendToOs: phoneAlertsEnabled,
    });
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timeStr: 'Just now',
      type,
      read: false,
    };
    setActiveBannerNotification(notif);
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }
    setTimeout(() => {
      setActiveBannerNotification((curr) => (curr?.id === notif.id ? null : curr));
    }, 5500);
  };

  // Automated intelligent reply engine
  const handleAutoReply = (userText: string, contextType?: 'vip' | 'order') => {
    setTimeout(() => {
      let replyText = '';
      const lower = userText.toLowerCase();

      if (contextType === 'vip' || lower.includes('vip') || lower.includes('pass') || lower.includes('meet') || lower.includes('greet')) {
        replyText = "Your VIP Executive Pass request has been sent to the Elon Musk Official Management Table for account provisioning and clearance review. You will receive your verification notice in your In-App Inbox.";
      } else if (contextType === 'order' || lower.includes('flying') || lower.includes('roadster') || lower.includes('car') || lower.includes('deposit') || lower.includes('tesla')) {
        replyText = "Your Tesla vehicle reservation and payment request have been sent to the Elon Musk Official Management Table for account provisioning and VIN allocation. Updates will arrive in your In-App Inbox.";
      } else if (lower.includes('starship') || lower.includes('spacex') || lower.includes('launch') || lower.includes('mars')) {
        replyText = "Starship Flight Test operations at Starbase Boca Chica are on an accelerated cadence with full tower catch reusability. VIP ticket holders receive launch observation credentials 48 hours prior to T-0.";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        replyText = "VIP Greet & Meet passes are priced at $1,000 (Silver), $5,000 (Platinum), and $10,000 (Gold Founders Plaque). The Tesla Flying Roadster can be reserved starting from a $10,000 deposit up to the real sold price ($200,000 – $250,000).";
      } else {
        replyText = `Thank you for reaching out to Elon Musk's Executive Desk. We've logged your message: "${userText.slice(0, 45)}...". Our team actively reviews briefings, vehicle allocations, and partnership proposals here in real time.`;
      }

      const replyMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'concierge',
        senderName: 'Tesla Executive Desk',
        senderAvatar: '/assets/aistudio/elo_e882ff2e.webp',
        text: replyText,
        timestamp: new Date().toISOString(),
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        read: isOpen,
      };

      setMessages((prev) => [...prev, replyMsg]);
      pushNotification('Tesla Executive Desk', replyText.slice(0, 80) + '...', 'chat');
    }, 1200);
  };

  // Send a regular text message (as visitor or admin)
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');

    const isSendingAsAdmin = activeMode === 'admin';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: isSendingAsAdmin ? 'elon_admin' : 'visitor',
      senderName: isSendingAsAdmin ? 'Elon Musk (Verified)' : 'Guest Attendee',
      senderAvatar: isSendingAsAdmin ? '/assets/aistudio/elo_e882ff2e.webp' : undefined,
      text: userText,
      timestamp: new Date().toISOString(),
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    // If sent by visitor, concierge automatically formulates an intelligent response!
    if (!isSendingAsAdmin) {
      handleAutoReply(userText);
    } else {
      pushNotification('Elon Musk Replied', userText.slice(0, 75) + '...', 'chat');
    }
  };

  // Send VIP Request in Chat
  const handleSubmitVipInChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName || !vipEmail) return;

    const tierObj = {
      silver: { name: 'Silver Experience Plaque', price: 1000 },
      platinum: { name: 'Platinum Experience Plaque', price: 5000 },
      gold: { name: 'Gold Founders Plaque', price: 10000 },
    }[vipTier];

    const ticketId = `EM-${vipTier.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const vipMsg: ChatMessage = {
      id: `msg-vip-${Date.now()}`,
      sender: 'visitor',
      senderName: vipName,
      text: `Submitted official request for ${tierObj.name} ($${tierObj.price.toLocaleString()})`,
      timestamp: new Date().toISOString(),
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'vip_request',
      vipData: {
        tier: vipTier,
        tierName: tierObj.name,
        price: tierObj.price,
        guestName: vipName,
        email: vipEmail,
        preferredDate: vipDate,
        ticketId,
        status: 'pending',
      },
      read: true,
    };

    const now = new Date();
    onSubmitVipRequest?.({
      ticketId,
      tier: vipTier,
      tierName: tierObj.name,
      price: tierObj.price,
      guestName: vipName.trim(),
      email: vipEmail.trim(),
      purpose: 'executive-briefing',
      preferredDate: vipDate,
      requestedAt: now.toISOString(),
      orderDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending_admin_approval',
    });

    setMessages((prev) => [...prev, vipMsg]);
    setActiveDrawer('none');
    pushNotification('VIP Pass Sent to Management Table', `VIP ${tierObj.name} ($${tierObj.price.toLocaleString()}) sent to Elon Musk Official Management Table for ${vipName}.`, 'vip');

    // Auto reply
    handleAutoReply(`VIP request ${tierObj.name}`, 'vip');
  };

  // Send Tesla Pre-Order in Chat
  const handleSubmitTeslaOrderInChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName || !orderEmail) return;

    const car = TESLA_VEHICLES.find((v) => v.id === selectedCarId) || TESLA_VEHICLES[0];
    const reservationVin = `${car.isFlyingCar ? '5YJSA-FLY' : '5YJSA-TSL'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderMsg: ChatMessage = {
      id: `msg-order-${Date.now()}`,
      sender: 'visitor',
      senderName: orderName,
      text: `Submitted pre-order reservation for ${car.name} with deposit of $${depositAmount.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'tesla_order',
      teslaOrderData: {
        vehicleId: car.id,
        vehicleName: car.name,
        isFlyingCar: !!car.isFlyingCar,
        depositAmount,
        totalPrice: car.basePrice,
        reservationVin,
        customerName: orderName,
        color: car.colors[0]?.name || 'Ultra Red',
        status: 'pending',
      },
      read: true,
    };

    setMessages((prev) => [...prev, orderMsg]);
    setActiveDrawer('none');
    pushNotification('Tesla Pre-Order Sent to Management Table', `Reservation ${reservationVin} for ${car.name} sent to Elon Musk Official Management Table for account provisioning.`, 'order');

    // Also push to active fleet orders in parent (Pending Admin Approval)
    onAddOrderDirect({
      orderId: `TSLA-CHAT-${Date.now().toString().slice(-6)}`,
      reservationVin,
      vehicleId: car.id,
      vehicleName: car.name,
      isFlyingCar: !!car.isFlyingCar,
      paymentType: depositAmount >= car.basePrice ? 'full' : 'deposit',
      depositAmount,
      totalPrice: car.basePrice,
      amountPaidToday: depositAmount,
      balanceDue: Math.max(0, car.basePrice - depositAmount),
      selectedColor: car.colors[0],
      selectedInterior: car.interiorColors[0],
      selectedWheels: car.wheels[0],
      selectedPackages: car.isFlyingCar ? [car.packages[0]] : [],
      customerName: orderName,
      customerEmail: orderEmail,
      customerPhone: '+1 (555) 019-2834',
      deliveryAddress: 'Tesla Delivery Hub / Starbase',
      city: 'Austin, TX',
      postalCode: '78701',
      orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending Elon Musk Management Approval',
      paymentStatus: 'pending_admin_approval',
      paymentMethod: 'concierge',
      paymentReference: `CONCIERGE-${Date.now().toString().slice(-6)}`,
      estimatedDelivery: car.deliveryEstimate,
      flightModeCertified: car.isFlyingCar,
      trackingHistory: [
        {
          id: `trk-chat-${Date.now()}`,
          stage: 'Production',
          title: 'Concierge Reservation Sent to Management Table',
          details: `Order registered via Executive Concierge Terminal with $${depositAmount.toLocaleString()} deposit and sent to the Elon Musk Official Management Table for account provisioning & verification.`,
          location: 'Tesla Delivery Hub / Starbase, Austin, TX',
          timestamp: new Date().toISOString(),
          dateStr: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
          statusType: 'submitted',
        },
      ],
    });

    handleAutoReply(`Tesla Order ${car.name}`, 'order');
  };

  return (
    <>
      {/* 1. FLOATING TOAST BANNER NOTIFICATION */}
      {activeBannerNotification && (
        <div 
          onClick={() => {
            setIsOpen(true);
            setActiveBannerNotification(null);
          }}
          className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-sm p-4 rounded-xl bg-[#061024]/95 border border-blue-400/70 shadow-2xl backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
              {activeBannerNotification.type === 'vip' ? (
                <Award className="w-4 h-4 text-red-400" />
              ) : activeBannerNotification.type === 'order' ? (
                <Car className="w-4 h-4 text-blue-300" />
              ) : (
                <MessageSquare className="w-4 h-4 text-blue-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                <span>{activeBannerNotification.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">{activeBannerNotification.timeStr}</span>
              </div>
              <p className="text-xs text-slate-200 pt-0.5 line-clamp-2 leading-snug">
                {activeBannerNotification.message}
              </p>
              <div className="text-[10px] text-red-300 font-medium pt-1 flex items-center gap-1">
                <span>Click to open live chat</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveBannerNotification(null);
              }}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-blue-900/40 flex items-center gap-2.5 cursor-pointer border border-blue-300/60"
          title="Open Tesla & VIP Executive Desk Chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#061024]" />
          </div>

          <span className="hidden sm:inline font-sans whitespace-nowrap">
            Executive Desk & Orders
          </span>

          {/* Unread badge count */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-red-600 border border-white/40 text-white font-mono tabular-nums font-black text-[11px] shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. EXPANDED CONCIERGE CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 border-b border-blue-900/60 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="/assets/aistudio/elo_e882ff2e.webp"
                  alt="Elon Musk Executive Desk"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/80 shadow"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#061024]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-bold text-sm text-white">
                    Elon Musk Executive Desk
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-black uppercase">
                    Official
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-medium">Online</span>
                  <span>·</span>
                  <span>Austin & Starbase</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={soundEnabled ? 'Mute notification sound' : 'Enable notification sound'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-300" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Desk Routing Banner */}
          <div className="px-3.5 py-1.5 bg-blue-950/60 border-b border-blue-500/30 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-300 font-medium truncate">
                All VIP &amp; payment requests route to Elon Musk Official Management Table
              </span>
            </div>
            <span className="text-[10px] text-blue-300 font-mono shrink-0 hidden sm:inline">Official Table</span>
          </div>

          {/* Mode Switcher Banner: Visitor vs Executive Desk Reply */}
          <div className="px-4 py-2 bg-[#050d20] border-b border-blue-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span>Active Sender Role:</span>
              <span className="font-bold text-blue-300">
                {activeMode === 'visitor' ? 'Guest Visitor' : 'Elon Musk Management Desk'}
              </span>
            </div>

            <button
              onClick={() => setActiveMode(activeMode === 'visitor' ? 'admin' : 'visitor')}
              className="text-[10px] font-semibold px-2.5 py-1 rounded border border-blue-800/80 bg-[#08142b] hover:bg-blue-900/40 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              title="Toggle to reply as Elon Musk Management"
            >
              Switch to {activeMode === 'visitor' ? 'Elon Reply Mode' : 'Visitor Mode'}
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isVisitor = msg.sender === 'visitor';
              const isAdmin = msg.sender === 'elon_admin';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span>{msg.senderName}</span>
                    <span>·</span>
                    <span className="font-mono-num">{msg.timeStr}</span>
                  </div>

                  {/* Regular Text Bubble */}
                  {msg.type === 'text' && (
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isVisitor
                          ? 'bg-blue-600 text-white font-medium rounded-br-sm shadow-md'
                          : isAdmin
                          ? 'bg-gradient-to-r from-[#0b1b3a] via-[#13112b] to-[#230b18] border border-red-500/50 text-slate-100 rounded-bl-sm shadow-md'
                          : 'bg-[#08142b] border border-blue-900/60 text-slate-200 rounded-bl-sm'
                      }`}
                    >
                      {isAdmin && (
                        <div className="text-[10px] font-bold text-red-300 uppercase tracking-widest pb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Direct Reply from Elon Musk</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  )}

                  {/* Rich VIP Request Message Card */}
                  {msg.type === 'vip_request' && msg.vipData && (
                    <div className="max-w-[90%] p-4 rounded-xl bg-gradient-to-br from-[#0b1b3a] via-[#08142b] to-[#230b18] border border-blue-400/60 shadow-lg text-left space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono-num font-black text-red-300 uppercase tracking-widest">
                            VIP PASS RESERVATION
                          </div>
                          <h5 className="font-display font-bold text-white text-sm">
                            {msg.vipData.tierName}
                          </h5>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-black text-xs font-mono-num">
                          ${msg.vipData.price.toLocaleString()}
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-[#040a18]/80 border border-blue-900/60 text-xs space-y-1 font-mono-num">
                        <div className="text-slate-200">
                          <strong className="text-blue-300">Guest:</strong> {msg.vipData.guestName}
                        </div>
                        <div className="text-slate-200">
                          <strong className="text-blue-300">Email:</strong> {msg.vipData.email}
                        </div>
                        <div className="text-slate-200">
                          <strong className="text-blue-300">Target Date:</strong> {msg.vipData.preferredDate}
                        </div>
                        <div className="text-red-300 text-[11px] pt-1">
                          Code: {msg.vipData.ticketId} · Status: Security Clearance Scheduled
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rich Tesla Order Message Card */}
                  {msg.type === 'tesla_order' && msg.teslaOrderData && (
                    <div className="max-w-[90%] p-4 rounded-xl bg-gradient-to-br from-[#0b1b3a] via-[#08142b] to-[#1a0b18] border border-blue-400/60 shadow-lg text-left space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono-num font-black text-blue-300 uppercase tracking-widest">
                            TESLA VEHICLE PRE-ORDER
                          </div>
                          <h5 className="font-display font-bold text-white text-sm">
                            {msg.teslaOrderData.vehicleName}
                          </h5>
                        </div>
                        {msg.teslaOrderData.isFlyingCar && (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase">
                            Flying Car
                          </span>
                        )}
                      </div>

                      <div className="p-2.5 rounded bg-[#040a18]/80 border border-blue-900/60 text-xs space-y-1 font-mono-num">
                        <div className="text-slate-200">
                          <strong className="text-white">Customer:</strong> {msg.teslaOrderData.customerName}
                        </div>
                        <div className="text-slate-200">
                          <strong className="text-white">Deposit Paid:</strong> ${msg.teslaOrderData.depositAmount.toLocaleString()}
                        </div>
                        <div className="text-slate-200">
                          <strong className="text-white">Total Price:</strong> ${msg.teslaOrderData.totalPrice.toLocaleString()}
                        </div>
                        <div className="text-blue-300 text-[11px] pt-1">
                          VIN: {msg.teslaOrderData.reservationVin}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Drawer for VIP Pass */}
          {activeDrawer === 'vip' && (
            <form onSubmit={handleSubmitVipInChat} className="p-3.5 bg-[#08142b] border-t border-blue-500/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-red-400" />
                  <span>Send VIP Plaque Request ($1k–$10k)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Tiers */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['silver', 'platinum', 'gold'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setVipTier(t)}
                    className={`p-1.5 rounded border text-center transition-all cursor-pointer ${
                      vipTier === t
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold border-blue-400'
                        : 'bg-[#040a18] border-blue-900/60 text-slate-300'
                    }`}
                  >
                    <div className="uppercase text-[10px] font-bold">{t}</div>
                    <div className="font-mono-num text-[11px]">
                      {t === 'silver' ? '$1,000' : t === 'platinum' ? '$5,000' : '$10,000'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={vipName}
                  onChange={(e) => setVipName(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#040a18] border border-blue-900/70 rounded text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={vipEmail}
                  onChange={(e) => setVipEmail(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#040a18] border border-blue-900/70 rounded text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Submit VIP Request in Chat
              </button>
            </form>
          )}

          {/* Quick Action Drawer for Tesla Order */}
          {activeDrawer === 'order' && (
            <form onSubmit={handleSubmitTeslaOrderInChat} className="p-3.5 bg-[#08142b] border-t border-blue-500/40 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-red-400" />
                  <span>Send Tesla Vehicle Pre-Order</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <select
                value={selectedCarId}
                onChange={(e) => {
                  setSelectedCarId(e.target.value);
                  if (e.target.value === 'tesla-flying-roadster') {
                    setDepositAmount(10000);
                  } else {
                    setDepositAmount(1000);
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-[#040a18] border border-blue-900/70 rounded text-slate-100 text-xs cursor-pointer focus:outline-none focus:border-blue-400"
              >
                {TESLA_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (${v.basePrice.toLocaleString()})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Buyer Name"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#040a18] border border-blue-900/70 rounded text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
                <input
                  type="email"
                  required
                  placeholder="Buyer Email"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#040a18] border border-blue-900/70 rounded text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Deposit selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pre-Order Deposit:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDepositAmount(selectedCarId === 'tesla-flying-roadster' ? 10000 : 1000)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      depositAmount < 50000 ? 'bg-blue-600 text-white' : 'bg-[#040a18] border border-blue-900/60 text-slate-300'
                    }`}
                  >
                    {selectedCarId === 'tesla-flying-roadster' ? '$10,000' : '$1,000'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount(selectedCarId === 'tesla-flying-roadster' ? 250000 : 99990)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      depositAmount >= 50000 ? 'bg-red-600 text-white' : 'bg-[#040a18] border border-blue-900/60 text-slate-300'
                    }`}
                  >
                    Full Price
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Submit Tesla Pre-Order in Chat (${depositAmount.toLocaleString()})
              </button>
            </form>
          )}

          {/* Quick Actions Action Chips */}
          {activeDrawer === 'none' && (
            <div className="px-3 py-2 bg-[#050d20] border-t border-blue-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveDrawer('vip')}
                className="px-2.5 py-1 rounded-full bg-[#08142b] hover:bg-blue-900/40 text-blue-300 border border-blue-500/40 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3 h-3 text-red-400" />
                <span>Request VIP ($1k–$10k)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDrawer('order')}
                className="px-2.5 py-1 rounded-full bg-[#08142b] hover:bg-blue-900/40 text-slate-200 border border-blue-800/70 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Car className="w-3 h-3 text-blue-400" />
                <span>Pre-Order Tesla</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputVal('Can I visit Starbase Texas for the next Starship launch?');
                }}
                className="px-2.5 py-1 rounded-full bg-[#08142b] hover:bg-blue-900/40 text-slate-300 border border-blue-900/60 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
              >
                Starship Launch?
              </button>
            </div>
          )}

          {/* Chat Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-900/60 bg-[#050d20] flex items-center gap-2">
            <input
              type="text"
              placeholder={activeMode === 'admin' ? "Type direct reply as Elon Musk / Executive Desk..." : "Ask questions, request VIP, or pre-order..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
