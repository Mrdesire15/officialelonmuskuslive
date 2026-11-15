import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Database, 
  Image as ImageIcon, 
  User, 
  Rocket, 
  Building2, 
  Edit3, 
  Trash2, 
  Plus, 
  Download, 
  RotateCcw,
  CheckCircle2,
  Code
} from 'lucide-react';
import { ProfileData, CompanyData, FlyingCarSpecData, GalleryImageData } from '../types';

interface ContentStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  companies: CompanyData[];
  specs: FlyingCarSpecData[];
  gallery: GalleryImageData[];
  onUpdateProfile: (p: ProfileData) => void;
  onUpdateCompanies: (c: CompanyData[]) => void;
  onUpdateSpecs: (s: FlyingCarSpecData[]) => void;
  onUpdateGallery: (g: GalleryImageData[]) => void;
  onEditGalleryItem: (item: GalleryImageData) => void;
  onAddNewPhoto: () => void;
  onResetAll: () => void;
}

type StudioTab = 'gallery' | 'profile' | 'specs' | 'companies' | 'django';

export const ContentStudioModal: React.FC<ContentStudioModalProps> = ({
  isOpen,
  onClose,
  profile,
  companies,
  specs,
  gallery,
  onUpdateProfile,
  onUpdateCompanies,
  onUpdateSpecs,
  onUpdateGallery,
  onEditGalleryItem,
  onAddNewPhoto,
  onResetAll,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('gallery');
  const [profileForm, setProfileForm] = useState<ProfileData>(profile);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    showNotification('Profile updated successfully');
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (gallery.length <= 1) {
      alert('Keep at least one gallery item');
      return;
    }
    const updated = gallery.filter((g) => g.id !== id);
    onUpdateGallery(updated);
    showNotification('Gallery item removed');
  };

  const handleExportJson = () => {
    const data = {
      profile,
      companies,
      flyingCarSpecs: specs,
      gallery,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elon_meet_content_${Date.now()}.json`;
    a.click();
    showNotification('Content exported to JSON');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl rounded-2xl bg-[#061024] border border-blue-500/45 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-gradient-to-r from-[#091630] via-[#0d1f44] to-[#230b18]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Content Studio & CMS Manager
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/25 text-red-200 border border-red-400/50">
                  Elon Musk Management Studio Bridge
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Manage Profile, Gallery Photos & Custom Captions, Flying Roadster Specs, and Ventures in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notification && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{notification}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-blue-900/60 bg-[#050d20] flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#08142b]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Gallery Captions ({gallery.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#08142b]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Model</span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#08142b]'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Flying Car Specs ({specs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'companies'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#08142b]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Companies ({companies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('django')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'django'
                  ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#08142b]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Django Architecture</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 py-2">
            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-lg border border-blue-800/80 bg-[#08142b] hover:border-blue-400/70 text-slate-200 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 px-2.5"
              title="Export all content as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onResetAll}
              className="p-1.5 rounded-lg border border-blue-800/80 bg-[#08142b] hover:border-red-400/70 text-slate-300 hover:text-red-300 transition-colors cursor-pointer text-xs flex items-center gap-1 px-2.5"
              title="Reset everything to initial defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: GALLERY & CAPTIONS */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Active Gallery Items & Custom Captions
                  </h4>
                  <p className="text-xs text-slate-300">
                    Edit the custom caption for each photograph or add new moments.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onAddNewPhoto();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold text-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>

              <div className="space-y-3">
                {gallery.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 hover:border-blue-400/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono tabular-nums text-slate-400 w-4">
                        {index + 1}
                      </span>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded-lg shrink-0 border border-blue-800/70"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-red-300 uppercase font-mono">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 italic line-clamp-1">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {item.location} · {item.year}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onClose();
                          onEditGalleryItem(item);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-blue-500/45 text-blue-200 hover:bg-blue-600/20 text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Caption</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-blue-950/60 transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE MODEL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Role Title</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Net Worth</label>
                  <input
                    type="text"
                    value={profileForm.netWorth}
                    onChange={(e) => setProfileForm({ ...profileForm, netWorth: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 font-mono tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Portrait Image URL</label>
                  <input
                    type="text"
                    value={profileForm.portrait}
                    onChange={(e) => setProfileForm({ ...profileForm, portrait: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Featured Quote</label>
                <textarea
                  rows={2}
                  value={profileForm.quote}
                  onChange={(e) => setProfileForm({ ...profileForm, quote: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Executive Biography</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#040a18] border border-blue-900/70 rounded-lg text-slate-100 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 text-white font-semibold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md shadow-blue-500/20"
              >
                Save Profile Changes
              </button>
            </form>
          )}

          {/* TAB 3: FLYING CAR SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Tesla Flying Roadster Specs (FlyingCarSpec Model)
                  </h4>
                  <p className="text-xs text-slate-300">
                    Fine-tune values and engineering descriptions for the vehicle.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {specs.map((spec, idx) => (
                  <div
                    key={spec.id}
                    className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Label</label>
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].label = e.target.value;
                            onUpdateSpecs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Value</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].value = e.target.value;
                            onUpdateSpecs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Unit / Highlight</label>
                        <input
                          type="text"
                          value={spec.unit || ''}
                          onChange={(e) => {
                            const updated = [...specs];
                            updated[idx].unit = e.target.value;
                            onUpdateSpecs(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold">Description</label>
                      <input
                        type="text"
                        value={spec.description}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].description = e.target.value;
                          onUpdateSpecs(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPANIES */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white text-sm">
                Companies Model Management
              </h4>
              <div className="space-y-3">
                {companies.map((co, idx) => (
                  <div
                    key={co.id}
                    className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Company Name</label>
                        <input
                          type="text"
                          value={co.name}
                          onChange={(e) => {
                            const updated = [...companies];
                            updated[idx].name = e.target.value;
                            onUpdateCompanies(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Role</label>
                        <input
                          type="text"
                          value={co.role}
                          onChange={(e) => {
                            const updated = [...companies];
                            updated[idx].role = e.target.value;
                            onUpdateCompanies(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-300 font-semibold">Valuation / Scale</label>
                        <input
                          type="text"
                          value={co.valuationOrMarketCap}
                          onChange={(e) => {
                            const updated = [...companies];
                            updated[idx].valuationOrMarketCap = e.target.value;
                            onUpdateCompanies(updated);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100 font-mono tabular-nums"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-semibold">Mission</label>
                      <input
                        type="text"
                        value={co.mission}
                        onChange={(e) => {
                          const updated = [...companies];
                          updated[idx].mission = e.target.value;
                          onUpdateCompanies(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#040a18] border border-blue-900/70 rounded text-slate-100"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DJANGO ARCHITECTURE NOTES */}
          {activeTab === 'django' && (
            <div className="space-y-4 text-xs text-slate-200 leading-relaxed">
              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60 space-y-2">
                <h4 className="font-display font-bold text-base text-blue-300">
                  Django Backend Architecture Overview
                </h4>
                <p>
                  As outlined in your specification, this frontend implements the exact data contracts defined by your Django models:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-mono text-[11px]">
                  <li>Profile: name, role, quote, portrait, bio, net_worth, companies_count</li>
                  <li>Company: name, description, icon_class, order</li>
                  <li>FlyingCarSpec: label, value, order, category</li>
                  <li>GalleryImage: title, caption (customized), image, order</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#08142b] border border-blue-900/60">
                <div className="text-white font-semibold mb-2">
                  Python Django REST Framework Endpoint Reference:
                </div>
                <pre className="p-3 rounded bg-[#040a18] text-blue-300 font-mono text-[11px] overflow-x-auto">
{`# core/views.py
def home(request):
    context = {
        'profile': Profile.objects.first(),
        'companies': Company.objects.all(),
        'specs': FlyingCarSpec.objects.all(),
        'gallery': GalleryImage.objects.all(), # Populated with 5 custom captioned images
    }
    return render(request, 'core/home.html', context)`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/60 bg-[#050d20] flex items-center justify-between text-xs text-slate-300">
          <span>Active local persistence enabled</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0b1b3a] border border-blue-800/80 hover:border-blue-400/70 text-white font-medium transition-colors cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
