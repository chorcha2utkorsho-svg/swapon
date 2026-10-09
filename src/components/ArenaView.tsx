import React from 'react';
import { ChatMessage, AIModel } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Zap, Bot, Copy, Check, Share2, AlertCircle } from 'lucide-react';

interface ArenaViewProps {
  modelA: AIModel;
  modelB: AIModel;
  responseA: ChatMessage | null;
  responseB: ChatMessage | null;
  isLoading: boolean;
  prompt: string;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  modelA,
  modelB,
  responseA,
  responseB,
  isLoading,
  prompt,
}) => {
  const [copiedA, setCopiedA] = React.useState(false);
  const [copiedB, setCopiedB] = React.useState(false);

  const handleCopy = async (text: string, isA: boolean) => {
    await navigator.clipboard.writeText(text);
    if (isA) {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    } else {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    }
  };

  return (
    <div className="w-full space-y-4 my-2">
      {/* Prompt Card */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Synchronized Prompt</span>
        <p className="text-sm text-white font-medium">{prompt}</p>
      </div>

      {/* Side-by-Side Model Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model A Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: modelA.color }} />
                <h4 className="font-bold text-sm text-white">{modelA.name}</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                  {modelA.badge}
                </span>
              </div>
              {responseA?.latencyMs && (
                <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {responseA.latencyMs}ms
                </span>
              )}
            </div>

            {isLoading && !responseA ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Generating response...</span>
              </div>
            ) : responseA?.isError ? (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{responseA.content}</span>
              </div>
            ) : responseA ? (
              <MarkdownRenderer content={responseA.content} />
            ) : (
              <p className="text-xs text-slate-500 italic py-4">Waiting for run...</p>
            )}
          </div>

          {responseA && !responseA.isError && (
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => handleCopy(responseA.content, true)}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedA ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Model B Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: modelB.color }} />
                <h4 className="font-bold text-sm text-white">{modelB.name}</h4>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                  {modelB.badge}
                </span>
              </div>
              {responseB?.latencyMs && (
                <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {responseB.latencyMs}ms
                </span>
              )}
            </div>

            {isLoading && !responseB ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Generating response...</span>
              </div>
            ) : responseB?.isError ? (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{responseB.content}</span>
              </div>
            ) : responseB ? (
              <MarkdownRenderer content={responseB.content} />
            ) : (
              <p className="text-xs text-slate-500 italic py-4">Waiting for run...</p>
            )}
          </div>

          {responseB && !responseB.isError && (
            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => handleCopy(responseB.content, false)}
                className="flex items-center gap-1 hover:text-white transition"
              >
                {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedB ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
