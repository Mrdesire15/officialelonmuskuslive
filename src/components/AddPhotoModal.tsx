import React, { useState } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GalleryImageData } from '../types';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newPhoto: GalleryImageData) => void;
}

export const AddPhotoModal: React.FC<AddPhotoModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('/assets/aistudio/elo_e882ff2e.webp');
  const [category, setCategory] = useState<GalleryImageData['category']>('portraits');
  const [location, setLocation] = useState('Austin, Texas');
  const [year, setYear] = useState('2024');
  const [context, setContext] = useState('');

  if (!isOpen) return null;

  const defaultAssetChoices = [
    { label: 'Executive Background Display Portrait (JPG)', path: '/assets/aistudio/elonxxx0_5bf1f316.jpg' },
    { label: 'Tuxedo Gala Portrait (WebP)', path: '/assets/aistudio/elo_e882ff2e.webp' },
    { label: 'Breakthrough Prize Red Carpet (JPG)', path: '/assets/aistudio/elonxx_44d23abe.jpg' },
    { label: 'Tesla Supercar Roadster (JPG)', path: '/assets/aistudio/elonxx0_53270167.jpg' },
    { label: 'Starship Rocket Prototype (JPG)', path: '/assets/aistudio/elonx_59952dc2.jpg' },
    { label: 'Formal Executive Portrait (JPG)', path: '/assets/aistudio/elon_befc0007.jpg' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !caption || !image) return;

    const newPhoto: GalleryImageData = {
      id: `gal-${Date.now()}`,
      title,
      subtitle: subtitle || 'Curated Executive Capture',
      caption,
      image,
      category,
      location: location || 'Global',
      year: year || '2024',
      dateStr: `${year}`,
      context: context || 'Added via Gallery Studio.',
      order: Date.now(),
      isFeatured: false,
    };

    onAdd(newPhoto);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Add Photo with Custom Caption
              </h3>
              <p className="text-xs text-blue-200/80">
                Populate a new entry into the dynamic gallery archive
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Image Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Select Asset Image or Enter Path / URL
            </label>
            <select
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors cursor-pointer mb-2"
            >
              {defaultAssetChoices.map((c) => (
                <option key={c.path} value={c.path}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Or enter custom image URL: https://..."
              className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Starbase Tower Launch Review"
                className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Flight Test 5 Chopstick Catch"
                className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Custom Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-blue-300">
              Custom Image Caption
            </label>
            <textarea
              rows={3}
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a custom caption for this moment..."
              className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-500/45 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 transition-colors leading-relaxed"
            />
          </div>

          {/* Category, Location, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GalleryImageData['category'])}
                className="w-full px-2.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="portraits">Portraits</option>
                <option value="honors">Honors & Gala</option>
                <option value="spacex">SpaceX</option>
                <option value="tesla">Tesla</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Context lore */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              Context Notes (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Key technical or historical insight..."
              className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Add to Gallery
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
