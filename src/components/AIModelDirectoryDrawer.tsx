import React, { useState, useMemo } from 'react';
import { BEST_AI_MODELS, ExternalAIModel } from '../constants/aiDirectory';
import { X, ExternalLink, Globe, Sparkles, MessageSquare, Compass, ShieldCheck, Search } from 'lucide-react';

interface AIModelDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInAppModel: (modelId: string) => void;
}

export const AIModelDirectoryDrawer: React.FC<AIModelDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectInAppModel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'সকল মডেল (All)' },
    { id: 'platform', label: '🛠️ গুগল এআই স্টুডিও ও প্ল্যাটফর্ম' },
    { id: 'text-code', label: '💻 কোডিং ও চ্যাট (Claude, GPT, Gemini)' },
    { id: 'reasoning', label: '🧠 গণিত ও রিজনিং (DeepSeek)' },
    { id: 'search', label: '🔍 লাইভ সার্চ (Perplexity)' },
    { id: 'creative', label: '🎨 ছবি ও ডিজাইন (Midjourney)' },
    { id: 'media', label: '🎬 ভিডিও ও মিউজিক (Kling, Suno)' },
  ];

  const filteredModels = useMemo(() => {
    return BEST_AI_MODELS.filter((m) => {
      const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        m.banglaName.toLowerCase().includes(q) ||
        m.bestForBangla.toLowerCase().includes(q) ||
        m.banglaDescription.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 shrink-0 bg-slate-950/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  সেরা এআই মডেল ডিরেক্টরি ({BEST_AI_MODELS.length} টি)
                </h2>
                <p className="text-[11px] text-slate-400">
                  ক্লড, গুগল এআই স্টুডিও, জেমিনাই সহ সকল বিশ্বসেরা এআই
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="মডেল বা কাজের নাম খুঁজুন (যেমন: ক্লড, স্টুডিও, কোডিং, ছবি)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {filteredModels.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Compass className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p>কোনো এআই মডেল পাওয়া যায়নি।</p>
              <p className="text-[11px] mt-1 text-slate-600">অন্য শব্দ দিয়ে সার্চ করে দেখুন।</p>
            </div>
          ) : (
            filteredModels.map((model) => (
              <div
                key={model.id}
                className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-4 transition hover:border-slate-750 hover:bg-slate-950 space-y-3"
              >
                {/* Top Row: Name, Badge, Dot */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: model.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-white">{model.name}</h3>
                        <span className="text-[11px] font-medium text-slate-400">({model.banglaName})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">ক্যাটাগরি: {model.categoryBangla}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium shrink-0">
                    {model.badge}
                  </span>
                </div>

                {/* Bangla Subtitle: এটি কোন কাজের এআই মডেল */}
                <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-900/40 text-slate-200">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wide block mb-0.5">
                    📌 এটি কোন কাজের এআই মডেল:
                  </span>
                  <p className="text-xs text-sky-200 font-medium leading-relaxed">
                    {model.bestForBangla}
                  </p>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {model.banglaDescription}
                </p>

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                  {/* 1. Open directly in Android Google Chrome / External Browser */}
                  <a
                    href={model.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 transition active:scale-98"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>গুগল ক্রোমে ওপেন করুন</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                  </a>

                  {/* 2. Switch inside Swapon app if supported */}
                  {model.internalModelId ? (
                    <button
                      onClick={() => {
                        onSelectInAppModel(model.internalModelId!);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-semibold text-xs border border-sky-500/30 transition active:scale-98"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      <span>স্বপন এআই-তে চ্যাট করুন</span>
                    </button>
                  ) : (
                    <span className="flex items-center justify-center text-[10px] text-slate-500 py-1 italic">
                      (ওয়েবসাইটে ব্যবহারের জন্য প্রস্তুত)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>সরাসরি অফিসিয়াল লিঙ্কে প্রবেশ করুন</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
