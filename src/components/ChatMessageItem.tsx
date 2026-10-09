import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { AI_MODELS } from '../constants/models';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Copy, Check, Share2, Volume2, VolumeX, Trash2, AlertCircle, Bot, User, Zap } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onDelete: (id: string) => void;
  onRetry?: (message: ChatMessage) => void;
  onSpeak: (text: string, id: string) => void;
  isSpeaking: boolean;
  onOpenSettings?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onDelete,
  onRetry,
  onSpeak,
  isSpeaking,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const isUser = message.role === 'user';
  const modelMeta = AI_MODELS.find((m) => m.id === message.modelId) || AI_MODELS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy message:', e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OmniAI Response (${modelMeta.name})`,
          text: message.content,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to copy
      await handleCopy();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className={`py-3 px-3 sm:px-4 flex gap-3 ${isUser ? 'bg-transparent' : 'bg-slate-900/40 rounded-2xl border border-slate-800/60'}`}>
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md relative overflow-hidden"
            style={{ backgroundColor: modelMeta.color || '#38bdf8' }}
          >
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-white">
              {isUser ? 'You' : modelMeta.name}
            </span>
            {!isUser && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium border border-slate-700/60">
                {modelMeta.providerName}
              </span>
            )}
            {message.latencyMs && !isUser && (
              <span className="text-[10px] text-sky-400/90 flex items-center gap-0.5 font-mono">
                <Zap className="w-2.5 h-2.5" />
                {message.latencyMs}ms
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Content */}
        {message.isError ? (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{message.content}</p>
                {message.content.includes('API key missing') && onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-semibold transition"
                  >
                    Open Settings to Enter Key →
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : isUser ? (
          <div className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Action Toolbar */}
        {!message.isError && (
          <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800/40 text-slate-400">
            <button
              onClick={handleCopy}
              title="Copy response"
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/70 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleShare}
              title="Share or export text"
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:text-white hover:bg-slate-800/70 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shared ? 'Copied Link' : 'Share'}</span>
            </button>

            {!isUser && (
              <button
                onClick={() => onSpeak(message.content, message.id)}
                title={isSpeaking ? 'Stop voice reading' : 'Read message aloud'}
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition ${
                  isSpeaking ? 'text-sky-400 bg-sky-500/15' : 'hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>
            )}

            <button
              onClick={() => onDelete(message.id)}
              title="Delete message"
              className="ml-auto p-1 rounded-lg hover:text-red-400 hover:bg-slate-800/70 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
