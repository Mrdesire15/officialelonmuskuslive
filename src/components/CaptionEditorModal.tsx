import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Image, RefreshCw, Eye } from 'lucide-react';
import { GalleryImageData } from '../types';
import { handleImageFallback, normalizePhotoSrc } from '../utils/photoHelper';

interface CaptionEditorModalProps {
  isOpen: boolean;
  item: GalleryImageData | null;
  onClose: () => void;
  onSave: (updatedItem: GalleryImageData) => void;
}

export const CaptionEditorModal: React.FC<CaptionEditorModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<GalleryImageData | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const presetCaptions: Record<string, string[]> = {
    portraits: [
      "A defining portrait of executive leadership, balancing first-principles physics with industrial scale.",
      "Visionary clarity: architecting humanity's multi-planetary future from first principles.",
      "Capturing the relentless ambition behind renewable power and orbital transport."
    ],
    honors: [
      "Welcoming global pioneers of mathematics and fundamental physics at the Breakthrough Prize gala.",
      "Celebrating human curiosity and scientific exploration alongside the world's greatest thinkers.",
      "A triumphant red-carpet moment honoring breakthroughs that alter our understanding of the cosmos."
    ],
    spacex: [
      "Inspecting the stainless-steel Starship architecture designed to establish permanent human presence on Mars.",
      "Full reusability: the indispensable engineering threshold that transforms orbital spaceflight.",
      "Hands-on rocketry: refining the methane Raptor engine profile at Starbase, Texas."
    ],
    tesla: [
      "Standing with the groundbreaking electric roadster lineage that ignited the global EV transformation.",
      "Next-generation engineering: electric torque vectoring married to cold-gas rocket thruster acceleration.",
      "Challenging the boundaries of automotive performance with zero tailpipe emissions."
    ]
  };

  const applyPreset = (caption: string) => {
    setFormData((prev) => (prev ? { ...prev, caption } : null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Customize Image Caption & Metadata
              </h3>
              <p className="text-xs text-blue-200/80">
                Update the editorial caption and narrative details for this photo
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Thumbnail preview bar */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[#08142b] border border-blue-900/60">
            <img
              src={normalizePhotoSrc(formData.image)}
              alt={formData.title}
              loading="eager"
              decoding="async"
              onError={(e) => handleImageFallback(e)}
              className="w-16 h-16 object-cover rounded-lg shrink-0 border border-blue-800/70"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">
                {formData.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Asset: {formData.image}
              </div>
              <div className="text-[11px] text-blue-300 font-mono tabular-nums pt-0.5">
                Category: {formData.category.toUpperCase()} · Year: {formData.year}
              </div>
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Image Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="e.g. The Visionary Leader"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Subtitle / Event Tag
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="e.g. Official Executive Portrait"
              />
            </div>
          </div>

          {/* Primary Custom Caption */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <span>Custom Image Caption</span>
                <span className="text-[10px] text-slate-400 font-normal">(Display Caption)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                {formData.caption.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 text-xs bg-[#040a18] border border-blue-500/45 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors leading-relaxed"
              placeholder="Enter your custom caption describing the essence of this photograph..."
            />

            {/* Quick Caption Inspiration Presets */}
            <div className="pt-1">
              <div className="text-[11px] text-slate-400 mb-1.5">
                Suggested Presets for {formData.category.toUpperCase()}:
              </div>
              <div className="space-y-1">
                {(presetCaptions[formData.category] || []).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left text-[11px] p-2 rounded bg-[#08142b] hover:bg-[#0d1f44] text-slate-200 hover:text-blue-200 border border-blue-900/60 transition-colors cursor-pointer truncate"
                    title={preset}
                  >
                    &ldquo;{preset}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category, Location, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as GalleryImageData['category'],
                  })
                }
                className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
              >
                <option value="portraits">Portraits</option>
                <option value="honors">Honors & Red Carpet</option>
                <option value="spacex">SpaceX & Aerospace</option>
                <option value="tesla">Tesla & Mobility</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="e.g. Starbase, Texas"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Year
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors font-mono tabular-nums"
                placeholder="e.g. 2024"
              />
            </div>
          </div>

          {/* Context story */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Historical Context & Lore (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors leading-relaxed"
              placeholder="Detailed background story or engineering significance..."
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-blue-900/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Custom Caption</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
