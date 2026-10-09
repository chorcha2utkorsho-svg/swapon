import React from 'react';
import { X, ExternalLink, Key, Smartphone, Rocket, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">স্বপন Setup & Deployment Guide</h2>
              <p className="text-xs text-slate-400">Step-by-step instructions to get keys and run on mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 py-4 text-sm text-slate-300">
          {/* Step 1: Google Gemini */}
          <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-sky-400 mb-2">
              <Key className="w-4 h-4" />
              <span>1. Google Gemini (Pre-Configured / Optional Custom Key)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Google Gemini is <strong>ready to use out-of-the-box</strong> via the built-in AI Studio environment! If you want to use your own personal API key:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
              <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">Google AI Studio <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Click <strong>&quot;Create API Key&quot;</strong> and copy your key.</li>
              <li>Open <strong>Settings</strong> in this app and paste it under <em>Google Gemini Key</em>.</li>
            </ol>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Supports Gemini 3.8 Flash & Gemini 3.1 Flash Lite</span>
            </div>
          </section>

          {/* Step 2: OpenAI Models */}
          <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-2">
              <Key className="w-4 h-4" />
              <span>2. OpenAI (GPT-4o, GPT-4o mini, o3-mini)</span>
            </div>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              To use OpenAI models directly within OmniAI:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
              <li>Go to the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">OpenAI Platform Keys <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Generate a new secret key (starts with <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">sk-...</code>).</li>
              <li>Paste it into <strong>Settings &gt; OpenAI API Key</strong>. Keys are stored locally on your device in secure browser storage.</li>
            </ol>
          </section>

          {/* Step 3: Anthropic Claude */}
          <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2">
              <Key className="w-4 h-4" />
              <span>3. Anthropic Claude (Claude 3.7 Sonnet, Claude 3.5 Haiku)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
              <li>Visit the <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">Anthropic Console <ExternalLink className="w-3 h-3 inline" /></a>.</li>
              <li>Create a key (starts with <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">sk-ant-...</code>).</li>
              <li>Paste it into <strong>Settings &gt; Anthropic Key</strong>.</li>
            </ol>
          </section>

          {/* Step 4: OpenRouter / DeepSeek */}
          <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-cyan-400 mb-2">
              <Key className="w-4 h-4" />
              <span>4. OpenRouter / DeepSeek (R1 & V3)</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Sign up at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">OpenRouter.ai <ExternalLink className="w-3 h-3 inline" /></a> to access DeepSeek V3, DeepSeek R1, Llama 3.3, and 100+ open-source models with a single unified key!
            </p>
          </section>

          {/* Step 5: Mobile PWA Testing */}
          <section className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-2 font-semibold text-indigo-400 mb-2">
              <Smartphone className="w-4 h-4" />
              <span>5. How to Test on Your Mobile Phone</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>Option A — Direct Phone Browser:</strong> Open the deployed preview URL directly on your phone&apos;s Safari or Chrome browser.
              </p>
              <p>
                <strong>Option B — Install as Native PWA:</strong>
              </p>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-400">
                <li><strong>Android (Chrome):</strong> Tap the <code className="text-sky-300">Install App</code> button at the top header, or tap Chrome menu (⋮) &gt; &quot;Install app&quot;.</li>
                <li><strong>iPhone / iPad (Safari):</strong> Tap the Safari Share button (<ShareIcon />), then select <em>&quot;Add to Home Screen&quot;</em>.</li>
              </ul>
              <p className="text-[11px] text-slate-400 pt-1">
                Once added, the app opens full-screen without browser address bars, maintains chat history offline, and supports voice dictation!
              </p>
            </div>
          </section>

          {/* Security & Privacy */}
          <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>
              <strong>Privacy Guarantee:</strong> Custom API keys entered in Settings are saved purely to your local browser storage (<code className="text-slate-300">localStorage</code>) and are never logged or stored on any external server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0 gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-semibold transition"
          >
            <Key className="w-3.5 h-3.5" />
            Configure API Keys Now
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

function ShareIcon() {
  return (
    <svg className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
