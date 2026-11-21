import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  FileImage,
  Gift,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GiftCardPhotoUpload } from '../types';

export interface GiftCardBrandOption {
  id: string;
  name: string;
  shortTag: string;
  badgeCode: string;
  accentClass: string;
}

export const ACCEPTED_GIFT_CARD_TYPES: GiftCardBrandOption[] = [
  {
    id: 'apple',
    name: 'Apple Store / iTunes',
    shortTag: 'Physical Card or e-Code · Fast Desk Clear',
    badgeCode: 'APL',
    accentClass: 'from-slate-600/35 to-blue-600/25 border-slate-400/50',
  },
  {
    id: 'amazon',
    name: 'Amazon Pay Gift Card',
    shortTag: 'Claim Code + Receipt Photo Recommended',
    badgeCode: 'AMZ',
    accentClass: 'from-amber-600/30 to-orange-700/25 border-amber-400/50',
  },
  {
    id: 'visa_vanilla',
    name: 'Visa / Mastercard Prepaid',
    shortTag: 'Front & Back + Receipt Verification',
    badgeCode: 'VSA',
    accentClass: 'from-blue-600/35 to-indigo-700/25 border-blue-400/50',
  },
  {
    id: 'amex',
    name: 'American Express Gift',
    shortTag: 'Executive USD Prepaid Settlement',
    badgeCode: 'AXP',
    accentClass: 'from-cyan-600/30 to-blue-700/25 border-cyan-400/50',
  },
  {
    id: 'razer_gold',
    name: 'Razer Gold Global PIN',
    shortTag: 'Instant Global Serial / PIN Desk',
    badgeCode: 'RZR',
    accentClass: 'from-emerald-600/30 to-teal-700/25 border-emerald-400/50',
  },
  {
    id: 'steam',
    name: 'Steam Global Wallet',
    shortTag: 'USD Physical or Digital Voucher',
    badgeCode: 'STM',
    accentClass: 'from-indigo-600/30 to-slate-700/25 border-indigo-400/50',
  },
  {
    id: 'google_play',
    name: 'Google Play USD',
    shortTag: 'Verified Store Card & Receipt',
    badgeCode: 'GPL',
    accentClass: 'from-emerald-500/25 to-blue-600/25 border-emerald-400/45',
  },
  {
    id: 'sephora_retail',
    name: 'Sephora / Luxury Retail',
    shortTag: 'Department & Specialty Retail Cards',
    badgeCode: 'LUX',
    accentClass: 'from-rose-600/30 to-red-700/25 border-rose-400/50',
  },
  {
    id: 'target_walmart',
    name: 'Target / Walmart Card',
    shortTag: 'US National Retail Settlement',
    badgeCode: 'RTL',
    accentClass: 'from-red-600/30 to-rose-700/25 border-red-400/50',
  },
];

interface GiftCardPaymentPanelProps {
  amountDueUsd: number;
  selectedBrandId: string;
  onSelectBrandId: (id: string) => void;
  cardFormat: 'physical' | 'ecode';
  onChangeCardFormat: (format: 'physical' | 'ecode') => void;
  cardValueUsd: string;
  onChangeCardValueUsd: (value: string) => void;
  cardCode: string;
  onChangeCardCode: (code: string) => void;
  photos: GiftCardPhotoUpload[];
  onChangePhotos: (photos: GiftCardPhotoUpload[]) => void;
  adminInstructions?: string;
}

async function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const rawResult = typeof reader.result === 'string' ? reader.result : '';
      if (!rawResult) {
        reject(new Error('Empty image data'));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(rawResult);
      img.onload = () => {
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawResult);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

export const GiftCardPaymentPanel: React.FC<GiftCardPaymentPanelProps> = ({
  amountDueUsd,
  selectedBrandId,
  onSelectBrandId,
  cardFormat,
  onChangeCardFormat,
  cardValueUsd,
  onChangeCardValueUsd,
  cardCode,
  onChangeCardCode,
  photos,
  onChangePhotos,
  adminInstructions,
}) => {
  const [innerTab, setInnerTab] = useState<'brand' | 'photos'>('brand');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewPhoto, setPreviewPhoto] = useState<GiftCardPhotoUpload | null>(null);
  const [pendingSlotLabel, setPendingSlotLabel] =
    useState<GiftCardPhotoUpload['label']>('Card Front');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedBrand =
    ACCEPTED_GIFT_CARD_TYPES.find((b) => b.id === selectedBrandId) ||
    ACCEPTED_GIFT_CARD_TYPES[0];

  const handleFilesSelected = async (
    fileList: FileList | null,
    explicitLabel?: GiftCardPhotoUpload['label']
  ) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const incoming = Array.from(fileList).slice(0, Math.max(1, 6 - photos.length));
    const added: GiftCardPhotoUpload[] = [];

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload image files (JPG, PNG, WEBP, HEIC).');
        continue;
      }
      if (file.size > 12 * 1024 * 1024) {
        setUploadError('Each gift card photo must be under 12 MB.');
        continue;
      }
      try {
        const dataUrl = await compressImageFileToDataUrl(file);
        const autoLabel: GiftCardPhotoUpload['label'] =
          explicitLabel ||
          (photos.length + added.length === 0
            ? 'Card Front'
            : photos.length + added.length === 1
            ? 'Back / PIN'
            : 'Purchase Receipt');
        added.push({
          id: `gc-photo-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          label: autoLabel,
          fileName: file.name,
          dataUrl,
        });
      } catch {
        setUploadError('Could not process one of the selected images. Please try another photo.');
      }
    }

    if (added.length > 0) {
      onChangePhotos([...photos, ...added].slice(0, 6));
      setInnerTab('photos');
    }
  };

  const triggerSlotUpload = (label: GiftCardPhotoUpload['label']) => {
    setPendingSlotLabel(label);
    fileInputRef.current?.click();
  };

  const removePhoto = (photoId: string) => {
    onChangePhotos(photos.filter((p) => p.id !== photoId));
  };

  const updatePhotoLabel = (photoId: string, label: GiftCardPhotoUpload['label']) => {
    onChangePhotos(photos.map((p) => (p.id === photoId ? { ...p, label } : p)));
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#091630] via-[#061024] to-[#170b1a] border border-amber-500/45 text-xs text-slate-200 space-y-4 shadow-xl">
      {/* Hidden Multi-Photo Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          void handleFilesSelected(e.target.files, pendingSlotLabel);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Executive Gift Card Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-red-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
              Executive Gift Card Settlement Vault
            </div>
            <div className="text-xs font-bold text-white">
              Select Card Brand &amp; Attach Card Photos (${amountDueUsd.toLocaleString()} USD Due)
            </div>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 self-start sm:self-auto flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>{photos.length} Photo{photos.length === 1 ? '' : 's'} Ready</span>
        </span>
      </div>

      {/* Optional Management Settlement Notice */}
      {adminInstructions && adminInstructions.trim().length > 0 && (
        <div className="p-3 rounded-xl bg-[#040a18] border border-emerald-500/40 text-[11px] font-mono text-emerald-200 whitespace-pre-wrap break-words">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
            Official Management Desk Instructions
          </span>
          {adminInstructions}
        </div>
      )}

      {/* Dual Interactive Tab Switcher: Card Type vs Upload Card Photos */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#040a18] border border-blue-900/70">
        <button
          type="button"
          onClick={() => setInnerTab('brand')}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            innerTab === 'brand'
              ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>1. Gift Card Type &amp; Code</span>
        </button>

        <button
          type="button"
          onClick={() => setInnerTab('photos')}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            innerTab === 'photos'
              ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>2. Upload Gift Card Photos</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              photos.length > 0
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                : 'bg-[#08142b] text-slate-300'
            }`}
          >
            {photos.length}
          </span>
        </button>
      </div>

      {/* TAB 1: GIFT CARD BRAND DIRECTORY & CARD DETAILS */}
      {innerTab === 'brand' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-bold">
                Choose Accepted Gift Card Brand
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {ACCEPTED_GIFT_CARD_TYPES.length} Verified Issuers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ACCEPTED_GIFT_CARD_TYPES.map((brand) => {
                const isSelected = selectedBrand.id === brand.id;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => onSelectBrandId(brand.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex items-start gap-2.5 ${
                      isSelected
                        ? `bg-gradient-to-br ${brand.accentClass} ring-1 ring-amber-300/70 shadow-md`
                        : 'bg-[#040a18]/90 border-blue-900/60 hover:border-blue-500/50'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#08142b] border border-blue-800/70 flex items-center justify-center font-mono text-[10px] font-black text-amber-300 shrink-0">
                      {brand.badgeCode}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold text-white truncate pr-4">
                        {brand.name}
                      </div>
                      <div className="text-[10px] text-slate-300/90 leading-tight line-clamp-2 mt-0.5">
                        {brand.shortTag}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 absolute top-2 right-2 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Format, Denomination & Code Entry */}
          <div className="p-3.5 rounded-xl bg-[#040a18] border border-blue-900/70 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Card Format
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChangeCardFormat('physical')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                      cardFormat === 'physical'
                        ? 'bg-blue-600/30 border-blue-400 text-white'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-400'
                    }`}
                  >
                    Physical Card
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCardFormat('ecode')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                      cardFormat === 'ecode'
                        ? 'bg-blue-600/30 border-blue-400 text-white'
                        : 'bg-[#08142b] border-blue-900/70 text-slate-400'
                    }`}
                  >
                    Digital e-Code
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Gift Card Value (USD $)
                </label>
                <input
                  type="number"
                  min={10}
                  step="1"
                  value={cardValueUsd}
                  onChange={(e) => onChangeCardValueUsd(e.target.value)}
                  placeholder={String(amountDueUsd)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-900/70 text-xs font-mono tabular-nums text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Claim Code / PIN (Optional)
                </label>
                <input
                  type="text"
                  value={cardCode}
                  onChange={(e) => onChangeCardCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#08142b] border border-blue-900/70 text-xs font-mono uppercase text-amber-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-blue-900/50">
              <span className="text-[11px] text-slate-400">
                Selected: <strong className="text-white">{selectedBrand.name}</strong> ({cardFormat === 'physical' ? 'Physical' : 'e-Code'})
              </span>
              <button
                type="button"
                onClick={() => setInnerTab('photos')}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:brightness-110 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Next: Upload Gift Card Photos →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD GIFT CARD PHOTOS */}
      {innerTab === 'photos' && (
        <div className="space-y-3.5">
          {/* Quick Preset Capture / Upload Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {(['Card Front', 'Back / PIN', 'Purchase Receipt'] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => triggerSlotUpload(slot)}
                className="p-2.5 rounded-xl bg-[#040a18] border border-blue-900/70 hover:border-amber-400/70 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors group"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">{slot}</div>
                  <div className="text-[10px] font-mono text-amber-300/90">Tap to upload</div>
                </div>
                <Plus className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
              </button>
            ))}
          </div>

          {/* Drag & Drop / Multi-Photo Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFilesSelected(e.dataTransfer.files);
            }}
            onClick={() => triggerSlotUpload('Gift Card Photo')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerSlotUpload('Gift Card Photo');
              }
            }}
            className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all space-y-2 ${
              isDragging
                ? 'border-amber-400 bg-amber-950/30'
                : 'border-blue-800/80 bg-[#040a18]/90 hover:border-amber-400/60 hover:bg-[#08142b]'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white">
              Tap or Drag &amp; Drop {selectedBrand.name} Photos
            </div>
            <p className="text-[11px] text-slate-400">
              Upload clear photos of the card front, scratched PIN/barcode, and store receipt (up to 6 images, JPG/PNG/WEBP).
            </p>
          </div>

          {uploadError && (
            <div className="p-2.5 rounded-lg bg-red-950/45 border border-red-500/50 text-[11px] text-red-200 font-mono">
              {uploadError}
            </div>
          )}

          {/* Uploaded Gift Card Photos Gallery */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5" />
                  <span>Attached Gift Card Photos ({photos.length}/6)</span>
                </span>
                <span className="text-slate-400">{selectedBrand.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="p-2.5 rounded-xl bg-[#040a18] border border-emerald-500/40 flex items-center gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      title="Preview uploaded gift card photo"
                      className="w-14 h-14 rounded-lg overflow-hidden border border-blue-800/70 shrink-0 relative group cursor-pointer"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      <span className="inset-0 absolute bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </span>
                    </button>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <select
                        value={photo.label}
                        onChange={(e) =>
                          updatePhotoLabel(
                            photo.id,
                            e.target.value as GiftCardPhotoUpload['label']
                          )
                        }
                        aria-label="Gift card photo category"
                        className="w-full px-2 py-1 rounded bg-[#08142b] border border-blue-900/70 text-[11px] font-semibold text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="Card Front">Card Front</option>
                        <option value="Back / PIN">Back / PIN</option>
                        <option value="Purchase Receipt">Purchase Receipt</option>
                        <option value="Gift Card Photo">Gift Card Photo</option>
                      </select>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {photo.fileName}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      aria-label={`Remove ${photo.label}`}
                      className="p-1.5 rounded-lg bg-[#08142b] border border-red-900/60 text-red-300 hover:text-white hover:border-red-500 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compact Live Settlement Summary Bar */}
      <div className="px-3 py-2 rounded-xl bg-[#040a18] border border-blue-900/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">{selectedBrand.name}</strong> ·{' '}
            {cardFormat === 'physical' ? 'Physical' : 'e-Code'} · $
            {(Number(cardValueUsd) || amountDueUsd).toLocaleString()}
          </span>
        </div>
        <span className={photos.length > 0 ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
          {photos.length > 0
            ? `${photos.length} card photo${photos.length === 1 ? '' : 's'} attached`
            : 'Photos optional / recommended'}
        </span>
      </div>

      {/* Fullscreen Preview Lightbox for Uploaded Gift Card Photo */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#061024] border border-blue-500/50 overflow-hidden shadow-2xl"
          >
            <div className="p-3 border-b border-blue-900/60 flex items-center justify-between">
              <div className="text-xs font-bold text-white">
                {selectedBrand.name} · {previewPhoto.label}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-full bg-[#08142b] text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-[#040a18] flex items-center justify-center">
              <img
                src={previewPhoto.dataUrl}
                alt={previewPhoto.label}
                className="max-h-[65vh] w-auto rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
