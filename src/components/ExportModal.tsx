import React from 'react';
import { ChatSession } from '../types';
import { X, FileText, Code2, Download, Copy, Check } from 'lucide-react';
import { exportChatAsMarkdown, exportChatAsText } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, session }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !session) return null;

  const handleCopyRaw = async () => {
    const raw = session.messages
      .map((m) => `${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n---\n\n');
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Export Conversation</h3>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">{session.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <button
            onClick={() => {
              exportChatAsMarkdown(session);
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-white block">Markdown (.md)</span>
                <span className="text-[11px] text-slate-400">Preserves headings, code blocks & formatting</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition" />
          </button>

          <button
            onClick={() => {
              exportChatAsText(session);
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-white block">Plain Text (.txt)</span>
                <span className="text-[11px] text-slate-400">Simple readable format for notes or emails</span>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
          </button>

          <button
            onClick={handleCopyRaw}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <span className="font-semibold text-white block">{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                <span className="text-[11px] text-slate-400">Quick copy the entire chat transcript</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{copied ? 'Done' : 'Copy'}</span>
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
