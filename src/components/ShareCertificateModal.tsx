import React from 'react';
import { X, Award, ShieldCheck, Printer, CheckCircle2, Download, Building, DollarSign } from 'lucide-react';
import { TeslaShareOrder } from '../types';

interface ShareCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: TeslaShareOrder | null;
}

export const ShareCertificateModal: React.FC<ShareCertificateModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen || !order) return null;

  const isApproved = order.paymentStatus === 'approved';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/92 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl bg-[#061024] border border-blue-500/50 shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Modal Top Control Bar */}
        <div className="p-4 bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18] border-b border-blue-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600/25 text-blue-200 border border-blue-400/50 font-bold uppercase tracking-wider">
              {isApproved ? 'OFFICIAL EQUITY CERTIFICATE' : 'PROVISIONAL ALLOCATION RECORD'}
            </span>
            <span className="text-xs font-mono text-slate-300">
              NASDAQ: TSLA · CUSIP 88160R101
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-800/80 text-xs text-slate-100 hover:text-white hover:border-blue-400/70 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#061024] via-[#050c1d] to-[#040a18] overflow-y-auto">
          
          <div className="relative p-6 sm:p-8 rounded-xl border-2 border-blue-400/60 bg-gradient-to-br from-[#0b1b3a] via-[#08142b] to-[#1a0b18] shadow-2xl space-y-6">
            
            {/* Corner Decorative Accents */}
            <div className="absolute top-2.5 left-2.5 text-[10px] font-serif text-blue-400/70">◆</div>
            <div className="absolute top-2.5 right-2.5 text-[10px] font-serif text-red-400/70">◆</div>
            <div className="absolute bottom-2.5 left-2.5 text-[10px] font-serif text-red-400/70">◆</div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-serif text-blue-400/70">◆</div>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-blue-500/35 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-400/50 text-[10px] font-mono text-red-200 font-bold uppercase tracking-widest mb-1">
                State of Delaware · Corporate Charter 3649528
              </div>
              
              <h2 className="font-serif text-2xl sm:text-3xl font-black us-text-gradient tracking-wider uppercase">
                TESLA, INC.
              </h2>
              
              <p className="text-xs sm:text-sm font-mono tracking-widest text-slate-200 uppercase">
                Common Stock · Par Value $0.001 Per Share
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] font-mono text-blue-300 pt-1">
                <span>Certificate No: <strong className="text-white tabular-nums">{order.certificateNumber}</strong></span>
                <span>•</span>
                <span>Shares: <strong className="text-white tabular-nums">{order.shareQuantity.toLocaleString()} Units</strong></span>
                <span>•</span>
                <span>CUSIP: <strong className="text-white tabular-nums">88160R101</strong></span>
              </div>
            </div>

            {/* Certificate Body Text */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-serif text-center sm:text-left px-2 sm:px-4">
              <p className="italic text-slate-300 text-center">
                This certifies that the undersigned investor is the registered and beneficial owner of:
              </p>
              
              <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 via-white/5 to-red-600/20 border border-blue-400/50 text-center space-y-1">
                <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-white">
                  {order.shareQuantity.toLocaleString()} SHARES OF TESLA, INC.
                </div>
                <div className="text-xs font-mono tabular-nums text-red-200">
                  Fully Paid and Non-Assessable Common Equity (Valued at ${order.totalInvestment.toLocaleString()} USD)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#040a18]/85 border border-blue-900/70 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Registered Beneficial Owner</span>
                  <div className="text-sm font-bold text-white font-sans">{order.investorName}</div>
                  <div className="text-[11px] text-slate-300">{order.investorEmail}</div>
                  {order.entityName && (
                    <div className="text-[11px] text-blue-300">Entity: {order.entityName}</div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-[#040a18]/85 border border-blue-900/70 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase block">Custody & Depository</span>
                  <div className="text-xs font-bold text-blue-300">
                    {order.custodyType === 'drs_computershare'
                      ? 'Direct Registration System (DRS Computershare)'
                      : order.custodyType === 'dtc_broker'
                      ? `DTC Participant Transfer (DTC #0785)`
                      : 'Delaware Vault Archival Certificate'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Transfer Agent: Computershare Trust Company N.A.
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-normal text-justify">
                Transferable only on the books of the Corporation by the holder hereof in person or by Attorney upon surrender of this Certificate properly endorsed. This Certificate is issued under and subject to the Laws of the State of Delaware and the Certificate of Incorporation and Bylaws of the Corporation.
              </p>
            </div>

            {/* Approval Status Stamp */}
            <div className="p-3 rounded-xl border border-blue-900/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono bg-[#040a18]/90">
              <div className="flex items-center gap-2">
                {isApproved ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Award className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-white">
                    {isApproved
                      ? 'VERIFIED & EXECUTED BY ELON MUSK MANAGEMENT'
                      : 'PENDING ELON MUSK MANAGEMENT WIRE / PAYMENT VERIFICATION'}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {order.approvalNotes || 'Direct Treasury Allocation Channel'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Settlement Date</div>
                <div className="text-red-300 font-bold tabular-nums">{order.orderDate}</div>
              </div>
            </div>

            {/* Signatures Row */}
            <div className="pt-4 border-t border-blue-500/35 grid grid-cols-2 gap-6 text-center font-serif text-xs">
              <div className="space-y-1">
                <div className="h-9 flex items-center justify-center font-serif italic text-base sm:text-lg text-blue-300 font-bold">
                  Elon Musk
                </div>
                <div className="border-t border-blue-900/70 pt-1 text-[10px] font-mono uppercase text-slate-300">
                  Chief Executive Officer & Technoking
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-9 flex items-center justify-center font-serif italic text-base sm:text-lg text-red-300 font-bold">
                  Computershare Trust N.A.
                </div>
                <div className="border-t border-blue-900/70 pt-1 text-[10px] font-mono uppercase text-slate-300">
                  SEC Transfer Agent Registrar
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
