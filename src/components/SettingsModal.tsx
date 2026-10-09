import React, { useState } from 'react';
import { AppSettings, ServerStatus } from '../types';
import { X, Key, Sliders, Moon, Sun, Monitor, Eye, EyeOff, Check, Trash2, HelpCircle, Shield, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  serverStatus: ServerStatus | null;
  onOpenGuide: () => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  serverStatus,
  onOpenGuide,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'params' | 'appearance'>('keys');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleKeyChange = (provider: keyof AppSettings['apiKeys'], value: string) => {
    onUpdateSettings({
      apiKeys: {
        ...settings.apiKeys,
        [provider]: value,
      },
    });
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl text-slate-100 flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">স্বপন Settings</h2>
              <p className="text-xs text-slate-400">Configure model keys, prompts, and appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-950/40 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'keys'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'params'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Model Parameters
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'appearance'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Theme & Data
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'keys' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/40 border border-sky-900/60 text-sky-300">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Keys are stored in your device&apos;s localStorage.</span>
                </div>
                <button
                  onClick={onOpenGuide}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 text-[11px] font-medium transition"
                >
                  <HelpCircle className="w-3 h-3" />
                  Key Guide
                </button>
              </div>

              {/* Google Gemini */}
              <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                    Google Gemini API Key
                  </label>
                  {serverStatus?.hasServerGeminiKey ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      ✓ Active in AI Studio
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Optional Override</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-configured via server environment. Enter a custom key only if you wish to use your personal quota.
                </p>
                <div className="relative mt-1">
                  <input
                    type={showKeys['gemini'] ? 'text' : 'password'}
                    placeholder={serverStatus?.hasServerGeminiKey ? 'Using server key (type to override)' : 'AIzaSy...'}
                    value={settings.apiKeys.gemini || ''}
                    onChange={(e) => handleKeyChange('gemini', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    OpenAI API Key (GPT-4o, o3-mini)
                  </label>
                  {settings.apiKeys.openai ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      ✓ Key Saved
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[10px]">Required for GPT</span>
                  )}
                </div>
                <div className="relative mt-1">
                  <input
                    type={showKeys['openai'] ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={settings.apiKeys.openai || ''}
                    onChange={(e) => handleKeyChange('openai', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openai')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Anthropic Claude API Key */}
              <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Anthropic API Key (Claude 3.7 Sonnet)
                  </label>
                  {settings.apiKeys.anthropic ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      ✓ Key Saved
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Optional</span>
                  )}
                </div>
                <div className="relative mt-1">
                  <input
                    type={showKeys['anthropic'] ? 'text' : 'password'}
                    placeholder="sk-ant-api03-..."
                    value={settings.apiKeys.anthropic || ''}
                    onChange={(e) => handleKeyChange('anthropic', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('anthropic')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys['anthropic'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* OpenRouter / DeepSeek API Key */}
              <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    OpenRouter API Key (DeepSeek V3 / R1)
                  </label>
                  {settings.apiKeys.openrouter ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      ✓ Key Saved
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px]">Optional</span>
                  )}
                </div>
                <div className="relative mt-1">
                  <input
                    type={showKeys['openrouter'] ? 'text' : 'password'}
                    placeholder="sk-or-v1-..."
                    value={settings.apiKeys.openrouter || ''}
                    onChange={(e) => handleKeyChange('openrouter', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openrouter')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showKeys['openrouter'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'params' && (
            <div className="space-y-5">
              {/* System Instruction */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">System Instruction / Persona</label>
                <p className="text-[11px] text-slate-400">
                  Global directive applied to all model calls (e.g., coding preferences, brevity, tone).
                </p>
                <textarea
                  rows={4}
                  value={settings.systemInstruction}
                  onChange={(e) => {
                    onUpdateSettings({ systemInstruction: e.target.value });
                    triggerSaved();
                  }}
                  placeholder="You are an expert software engineer and vibe coder. Provide clean, production-ready code with concise explanations..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
                />
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-200">Creativity (Temperature): {settings.temperature}</label>
                  <span className="text-[10px] text-slate-400">
                    {settings.temperature < 0.4 ? 'Precise & Deterministic' : settings.temperature < 0.8 ? 'Balanced' : 'Creative & Novel'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => {
                    onUpdateSettings({ temperature: parseFloat(e.target.value) });
                    triggerSaved();
                  }}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.0 (Strict Code)</span>
                  <span>0.7 (Default)</span>
                  <span>1.5 (Brainstorming)</span>
                </div>
              </div>

              {/* Side-by-Side Arena Compare Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div>
                  <h4 className="font-semibold text-slate-200">Multi-Model Arena Mode</h4>
                  <p className="text-[11px] text-slate-400">
                    Query two models simultaneously to compare answers side-by-side
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.arenaMode}
                    onChange={(e) => {
                      onUpdateSettings({ arenaMode: e.target.checked });
                      triggerSaved();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-200">Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdateSettings({ theme: 'dark' });
                      triggerSaved();
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                      settings.theme === 'dark'
                        ? 'border-sky-500 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSettings({ theme: 'light' });
                      triggerSaved();
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                      settings.theme === 'light'
                        ? 'border-sky-500 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSettings({ theme: 'system' });
                      triggerSaved();
                    }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${
                      settings.theme === 'system'
                        ? 'border-sky-500 bg-sky-500/15 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </button>
                </div>
              </div>

              {/* Data & History Management */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="font-semibold text-slate-200">Local Data Storage</h4>
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
                  <p className="text-[11px] text-red-300">
                    Erase all saved chat threads and history stored on this device.
                  </p>
                  {!confirmClear ? (
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30 text-xs font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All Chats
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onClearHistory();
                          setConfirmClear(false);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                      >
                        Yes, delete all
                      </button>
                      <button
                        onClick={() => setConfirmClear(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Settings auto-saved
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
