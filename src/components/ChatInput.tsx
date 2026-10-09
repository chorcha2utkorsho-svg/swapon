import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, Sparkles, ArrowUp } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { AIModel } from '../types';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  selectedModel: AIModel;
  onOpenModelSelector?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  selectedModel,
  onOpenModelSelector,
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, isSupported, error: micError, toggleListening } = useSpeechRecognition({
    onTranscript: (transcript) => {
      setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    onSendMessage(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-3 pt-2">
      <div className="relative rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl focus-within:border-sky-500/80 focus-within:ring-1 focus-within:ring-sky-500/30 transition-all">
        {/* Model Indicator Pill Header inside Input Bar */}
        <div className="flex items-center justify-between px-3.5 pt-2 pb-1 border-b border-slate-800/60 text-[11px]">
          <button
            type="button"
            onClick={onOpenModelSelector}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium"
          >
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: selectedModel.color }}
            />
            <span className="font-semibold text-slate-200">{selectedModel.name}</span>
            <span className="text-slate-500 text-[10px]">({selectedModel.badge})</span>
          </button>

          {isListening && (
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold animate-pulse text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Listening... Speak into mic</span>
            </div>
          )}

          {micError && (
            <span className="text-[10px] text-amber-400 truncate max-w-[200px]">{micError}</span>
          )}
        </div>

        {/* Text Input Area */}
        <div className="flex items-end gap-2 p-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedModel.name}... (Shift+Enter for newline)`}
            className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none px-1.5 max-h-40 leading-relaxed"
          />

          {/* Action buttons (Mic + Send) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Voice Input Button */}
            {isSupported && (
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Start voice dictation'}
                className={`p-2 rounded-xl transition active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send / Stop Button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop generation"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 shadow transition active:scale-95"
              >
                <Square className="w-4 h-4 fill-current text-amber-400" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!prompt.trim()}
                onClick={() => handleSubmit()}
                title="Send message"
                className={`p-2 rounded-xl transition shadow-md active:scale-95 ${
                  prompt.trim()
                    ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
