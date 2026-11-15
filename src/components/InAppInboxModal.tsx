import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCheck, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  User,
  Plus,
  Bell,
  BellRing,
} from 'lucide-react';
import { InAppInboxMessage, InAppReply } from '../types';

interface InAppInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: InAppInboxMessage[];
  onSendMessage: (subject: string, body: string, category: InAppInboxMessage['category']) => void;
  onSendReply: (messageId: string, replyText: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onOpenNotificationSettings?: () => void;
  phoneNotificationsReady?: boolean;
}

export const InAppInboxModal: React.FC<InAppInboxModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSendReply,
  onMarkAsRead,
  onOpenNotificationSettings,
  phoneNotificationsReady = false,
}) => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<InAppInboxMessage['category']>('general');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  const filteredMessages = messages.filter((m) => {
    if (filterCategory === 'all') return true;
    return m.category === filterCategory;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  const handleSelectMessage = (msg: InAppInboxMessage) => {
    setSelectedMessageId(msg.id);
    setIsComposing(false);
    if (!msg.read) {
      onMarkAsRead(msg.id);
    }
  };

  const handleSendReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessageId) return;
    onSendReply(selectedMessageId, replyText.trim());
    setReplyText('');
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;
    onSendMessage(newSubject.trim(), newBody.trim(), newCategory);
    setNewSubject('');
    setNewBody('');
    setIsComposing(false);
  };

  const getCategoryBadge = (category: InAppInboxMessage['category']) => {
    switch (category) {
      case 'payment_approval':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-600/25 text-blue-200 border border-blue-400/50">
            Payment Approval
          </span>
        );
      case 'order_update':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Order Update
          </span>
        );
      case 'vip_concierge':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/40">
            VIP Concierge
          </span>
        );
      case 'price_alert':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/25 text-red-200 border border-red-400/60">
            Price Alert
          </span>
        );
      case 'charity_ngo':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600/25 text-rose-200 border border-rose-400/60">
            Charity NGO
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0b1b3a] text-slate-200 border border-blue-800/70">
            General
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl h-[85vh] max-h-[750px] rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl flex flex-col overflow-hidden">
        
        {/* US Patriotic Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] border-b border-blue-500/35 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Executive In-App Messaging Inbox
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white font-mono tabular-nums whitespace-nowrap">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/80 font-mono">
                Direct communication with Executive Concierge &amp; Elon Musk Official Management Table
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotificationSettings && (
              <button
                type="button"
                onClick={onOpenNotificationSettings}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  phoneNotificationsReady
                    ? 'bg-emerald-500/15 border-emerald-500/45 text-emerald-200 hover:bg-emerald-500/25'
                    : 'bg-[#08142b] border-blue-500/45 text-blue-200 hover:text-white'
                }`}
                title="Configure Phone Notifications & Alert Sound"
              >
                {phoneNotificationsReady ? (
                  <BellRing className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-blue-300" />
                )}
                <span className="hidden sm:inline">
                  {phoneNotificationsReady ? 'Phone Alerts On' : 'Phone Alerts'}
                </span>
              </button>
            )}

            {!isComposing && (
              <button
                onClick={() => {
                  setIsComposing(true);
                  setSelectedMessageId(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Message</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Layout (Message List & Thread Detail) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Message Thread List */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-blue-900/60 flex flex-col bg-[#050d20] shrink-0 ${
            selectedMessageId || isComposing ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Category Filter Chips */}
            <div className="p-3 border-b border-blue-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === 'all'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white bg-[#08142b]'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilterCategory('payment_approval')}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === 'payment_approval'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white bg-[#08142b]'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setFilterCategory('order_update')}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === 'order_update'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white bg-[#08142b]'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setFilterCategory('price_alert')}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === 'price_alert'
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white bg-[#08142b]'
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setFilterCategory('charity_ngo')}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === 'charity_ngo'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white bg-[#08142b]'
                }`}
              >
                Charity NGO
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-blue-900/40">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Mail className="w-8 h-8 mx-auto text-blue-500/60 mb-2" />
                  No messages in this category yet.
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessageId === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-3.5 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-600/25 ring-1 ring-inset ring-blue-400/60'
                          : msg.read
                          ? 'hover:bg-blue-950/50 opacity-90'
                          : 'bg-red-950/25 ring-1 ring-inset ring-red-400/50 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-mono ${!msg.read ? 'text-red-300 font-bold' : 'text-blue-300'}`}>
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">{msg.timeStr}</span>
                      </div>

                      <div className="text-xs text-white font-medium truncate mb-1">
                        {msg.subject}
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {msg.body}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        {getCategoryBadge(msg.category)}
                        {msg.replies && msg.replies.length > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {msg.replies.length} replies
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Message Thread / Compose View */}
          <div className={`flex-1 flex flex-col bg-[#061024] overflow-hidden ${
            !selectedMessageId && !isComposing ? 'hidden md:flex items-center justify-center text-center p-8' : ''
          }`}>
            
            {/* When composing a new in-app message */}
            {isComposing ? (
              <div className="flex-1 flex flex-col p-5 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-blue-900/60 mb-4">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-400" />
                    <span>Compose Message to Official Management Table</span>
                  </h4>
                  <button
                    onClick={() => setIsComposing(false)}
                    className="text-xs text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleComposeSubmit} className="space-y-4 flex-1 flex flex-col">
                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1">Message Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="general">General In-App Inquiry</option>
                      <option value="payment_approval">Payment Verification & Approval</option>
                      <option value="order_update">Tesla Fleet Order Status</option>
                      <option value="vip_concierge">VIP Pass Concierge Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-200 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Payment Confirmation / Wire Sent / Specification Question"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400"
                      required
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-mono text-slate-200 mb-1">Message Body</label>
                    <textarea
                      placeholder="Type your message here. All replies and notifications stay directly inside your in-app inbox without requiring external email."
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      className="w-full flex-1 min-h-[140px] px-3.5 py-3 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 leading-relaxed resize-none"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send In-App Message</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedMessage ? (
              /* Selected Thread View */
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Thread Header */}
                <div className="p-4 border-b border-blue-900/60 bg-[#050d20] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedMessageId(null)}
                      className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{selectedMessage.subject}</h4>
                        {getCategoryBadge(selectedMessage.category)}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        From: <span className="text-blue-300 font-semibold">{selectedMessage.senderName}</span> · {selectedMessage.timestamp}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thread Conversation Messages */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                  {/* Root Message */}
                  <div className="p-4 rounded-2xl bg-[#08142b] border border-blue-900/60">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="font-bold text-blue-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        {selectedMessage.senderName}
                      </span>
                      <span>{selectedMessage.timeStr}</span>
                    </div>
                    <div className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed font-light">
                      {selectedMessage.body}
                    </div>
                  </div>

                  {/* Replies Chain */}
                  {selectedMessage.replies && selectedMessage.replies.map((reply) => {
                    const isFromVisitor = reply.sender === 'visitor';
                    return (
                      <div
                        key={reply.id}
                        className={`flex flex-col ${isFromVisitor ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isFromVisitor
                              ? 'bg-blue-600/25 border border-blue-400/50 text-white rounded-tr-none'
                              : 'bg-[#0b1b3a] border border-red-500/35 text-slate-100 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 mb-1">
                            <span className={isFromVisitor ? 'text-blue-300 font-bold' : 'text-red-300 font-bold'}>
                              {reply.senderName}
                            </span>
                            <span>{reply.timeStr}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{reply.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* In-App Reply Input Box */}
                <form
                  onSubmit={handleSendReplySubmit}
                  className="p-3 sm:p-4 border-t border-blue-900/60 bg-[#050d20] flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Type in-app reply directly (no external email needed)..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 text-xs text-white focus:outline-none focus:border-blue-400 placeholder:text-slate-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 hover:brightness-110 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                </form>

              </div>
            ) : (
              /* No selection empty state */
              <div className="p-8 text-center text-slate-300">
                <Inbox className="w-10 h-10 mx-auto text-blue-400/60 mb-3" />
                <h4 className="font-bold text-sm text-white mb-1">Select a Message</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Choose a conversation from the left or compose a new inquiry directly to the Elon Musk Official Management Table.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
