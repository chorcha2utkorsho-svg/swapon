import React from 'react';
import { Menu, Sliders, BookOpen, Sun, Moon, Swords, Share, Download, Sparkles, Compass, Calendar, TrendingUp } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { PWAInstallButton } from './PWAInstallButton';
import { AI_MODELS } from '../constants/models';

interface NavbarProps {
  onOpenSidebar: () => void;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  isArenaMode: boolean;
  onToggleArena: () => void;
  compareModelId: string;
  onSelectCompareModel: (id: string) => void;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenDirectory: () => void;
  onOpenPlanner: () => void;
  onOpenFinance: () => void;
  onExportCurrent: () => void;
  hasMessages: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSidebar,
  selectedModelId,
  onSelectModel,
  isArenaMode,
  onToggleArena,
  compareModelId,
  onSelectCompareModel,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenGuide,
  onOpenDirectory,
  onOpenPlanner,
  onOpenFinance,
  onExportCurrent,
  hasMessages,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
      {/* Left side: Drawer trigger & App Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenSidebar}
          title="Open chat history"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-sky-500/20">
            স্ব
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            স্বপন
          </span>
        </div>
      </div>

      {/* Center: Model Selector(s) */}
      <div className="flex items-center gap-2">
        <ModelSelector
          selectedModelId={selectedModelId}
          onSelectModel={onSelectModel}
          compact
        />

        {/* If Arena Mode is active, show the 2nd model selector */}
        {isArenaMode && (
          <>
            <span className="text-xs font-bold text-slate-500">vs</span>
            <ModelSelector
              selectedModelId={compareModelId}
              onSelectModel={onSelectCompareModel}
              compact
            />
          </>
        )}

        {/* Arena Toggle Pill */}
        <button
          onClick={onToggleArena}
          title="Toggle Multi-Model Arena (Compare 2 models side-by-side)"
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
            isArenaMode
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Arena</span>
        </button>
      </div>

      {/* Right side: Finance, Planner, Directory, Install, Export, Theme, Guide, Settings */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Cost Tracker & Prosperity Button */}
        <button
          onClick={onOpenFinance}
          title="খরচ ট্র্যাকার, বাজেট মেকার ও সমৃদ্ধি প্ল্যানার"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">বাজেট ও সমৃদ্ধি</span>
        </button>

        {/* Daily Planner Button */}
        <button
          onClick={onOpenPlanner}
          title="ডেইলি প্ল্যানার (আজকের রুটিন ও কাজ)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">ডেইলি প্ল্যানার</span>
        </button>

        {/* AI Models Directory Trigger */}
        <button
          onClick={onOpenDirectory}
          title="সেরা এআই মডেল তালিকা (গুগল ক্রোমে ওপেন করুন)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition active:scale-95 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xs:inline">সেরা AI তালিকা</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Export Chat */}
        {hasMessages && (
          <button
            onClick={onExportCurrent}
            title="Export conversation (.md / .txt)"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle theme"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Setup Guide */}
        <button
          onClick={onOpenGuide}
          title="Setup & Deployment Guide"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          title="Configure API Keys & Parameters"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
