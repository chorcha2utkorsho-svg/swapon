/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ChatSession,
  AppSettings,
  ServerStatus,
  AIModel,
} from './types';
import { AI_MODELS, DEFAULT_MODEL_ID, DEFAULT_COMPARE_MODEL_ID, QUICK_PROMPTS } from './constants/models';
import { sendChatMessage, fetchServerStatus } from './services/api';
import { Navbar } from './components/Navbar';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { SidebarDrawer } from './components/SidebarDrawer';
import { SettingsModal } from './components/SettingsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { ExportModal } from './components/ExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ArenaView } from './components/ArenaView';
import { AIModelDirectoryDrawer } from './components/AIModelDirectoryDrawer';
import { BEST_AI_MODELS } from './constants/aiDirectory';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { exportAllSessionsAsJSON } from './utils/export';
import { Sparkles, Swords, Plus, Bot, Layers, Zap, Compass, Globe, ExternalLink, MessageSquare } from 'lucide-react';

const STORAGE_KEYS = {
  SESSIONS: 'omniai_sessions_v1',
  CURRENT_SESSION: 'omniai_current_session_id_v1',
  SETTINGS: 'omniai_settings_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  apiKeys: {},
  systemInstruction: 'You are an intelligent, concise, and helpful AI assistant specialized in software development and reasoning. Provide clear, direct solutions with well-formatted code snippets.',
  temperature: 0.7,
  hapticFeedback: true,
  codeSyntaxHighlight: true,
  streamText: true,
  arenaMode: false,
  compareModelId: DEFAULT_COMPARE_MODEL_ID,
};

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat Thread',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: DEFAULT_MODEL_ID,
    };
    return [initialSession];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (saved && sessions.some((s) => s.id === saved)) return saved;
    } catch {
      // fallback
    }
    return sessions[0]?.id || `session-${Date.now()}`;
  });

  // Active Model
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const curr = sessions.find((s) => s.id === currentSessionId);
    return curr?.modelId || DEFAULT_MODEL_ID;
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);

  // Arena Mode specific state
  const [arenaResponseA, setArenaResponseA] = useState<ChatMessage | null>(null);
  const [arenaResponseB, setArenaResponseB] = useState<ChatMessage | null>(null);
  const [arenaLastPrompt, setArenaLastPrompt] = useState('');

  // Speech TTS Hook
  const { isSpeaking, speakingId, speak, stop: stopSpeech } = useSpeechSynthesis();

  // Scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch server status on initial mount
  useEffect(() => {
    fetchServerStatus().then((status) => {
      if (status) setServerStatus(status);
    });
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Save currentSessionId
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, currentSessionId);
    } catch (e) {
      console.warn('Failed to save current session ID:', e);
    }
  }, [currentSessionId]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }

    // Apply theme
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [settings]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isLoading, arenaResponseA, arenaResponseB]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
  const selectedModel = AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0];
  const compareModel = AI_MODELS.find((m) => m.id === settings.compareModelId) || AI_MODELS[1];

  // Handle Model Change
  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? { ...s, modelId } : s))
    );
  };

  // Create New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat Thread',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: selectedModelId,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setArenaResponseA(null);
    setArenaResponseB(null);
    setArenaLastPrompt('');
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now()}`,
          title: 'New Chat Thread',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          modelId: selectedModelId,
        };
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: s.messages.filter((m) => m.id !== messageId), updatedAt: Date.now() }
          : s
      )
    );
  };

  // Clear all history
  const handleClearAllHistory = () => {
    const fresh: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat Thread',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: selectedModelId,
    };
    setSessions([fresh]);
    setCurrentSessionId(fresh.id);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  };

  // Import sessions
  const handleImportSessions = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          alert('Chat sessions imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // Send Message Handler
  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
      modelId: selectedModelId,
      provider: selectedModel.provider,
    };

    // Auto-title thread from first prompt if title is default
    const isFirstMessage = currentSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? userPrompt.slice(0, 32).trim() + (userPrompt.length > 32 ? '...' : '')
      : currentSession.title;

    // Update session with user message immediately
    const updatedMessages = [...currentSession.messages, userMessage];
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: newTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    setIsLoading(true);

    // ARENA MODE: Dual simultaneous query
    if (settings.arenaMode) {
      setArenaLastPrompt(userPrompt);
      setArenaResponseA(null);
      setArenaResponseB(null);

      const apiHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call Model A
      const promiseA = sendChatMessage({
        messages: apiHistory,
        modelId: selectedModelId,
        settings,
      })
        .then((res) => {
          const msgA: ChatMessage = {
            id: `msg-${Date.now()}-a`,
            role: 'assistant',
            content: res.text,
            timestamp: Date.now(),
            modelId: selectedModelId,
            provider: res.provider,
            latencyMs: res.latencyMs,
          };
          setArenaResponseA(msgA);
          return msgA;
        })
        .catch((err) => {
          const errA: ChatMessage = {
            id: `msg-${Date.now()}-a`,
            role: 'assistant',
            content: err.message || 'Error occurred.',
            timestamp: Date.now(),
            modelId: selectedModelId,
            provider: selectedModel.provider,
            isError: true,
          };
          setArenaResponseA(errA);
          return errA;
        });

      // Call Model B
      const promiseB = sendChatMessage({
        messages: apiHistory,
        modelId: settings.compareModelId,
        settings,
      })
        .then((res) => {
          const msgB: ChatMessage = {
            id: `msg-${Date.now()}-b`,
            role: 'assistant',
            content: res.text,
            timestamp: Date.now(),
            modelId: settings.compareModelId,
            provider: res.provider,
            latencyMs: res.latencyMs,
          };
          setArenaResponseB(msgB);
          return msgB;
        })
        .catch((err) => {
          const errB: ChatMessage = {
            id: `msg-${Date.now()}-b`,
            role: 'assistant',
            content: err.message || 'Error occurred.',
            timestamp: Date.now(),
            modelId: settings.compareModelId,
            provider: compareModel.provider,
            isError: true,
          };
          setArenaResponseB(errB);
          return errB;
        });

      try {
        const [resA, resB] = await Promise.all([promiseA, promiseB]);
        // Also append both into session transcript
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  messages: [...updatedMessages, resA, resB],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // STANDARD SINGLE MODEL MODE
    try {
      const apiHistory = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        messages: apiHistory,
        modelId: selectedModelId,
        settings,
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: res.text,
        timestamp: Date.now(),
        modelId: selectedModelId,
        provider: res.provider,
        latencyMs: res.latencyMs,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: error.message || 'Error communicating with AI engine.',
        timestamp: Date.now(),
        modelId: selectedModelId,
        provider: selectedModel.provider,
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...updatedMessages, errorMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Top Navigation */}
      <Navbar
        onOpenSidebar={() => setIsSidebarOpen(true)}
        selectedModelId={selectedModelId}
        onSelectModel={handleSelectModel}
        isArenaMode={settings.arenaMode}
        onToggleArena={() =>
          setSettings((prev) => ({ ...prev, arenaMode: !prev.arenaMode }))
        }
        compareModelId={settings.compareModelId}
        onSelectCompareModel={(id) =>
          setSettings((prev) => ({ ...prev, compareModelId: id }))
        }
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onExportCurrent={() => setIsExportOpen(true)}
        hasMessages={currentSession.messages.length > 0}
      />

      {/* Main Chat Conversation Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 flex flex-col">
        {currentSession.messages.length === 0 ? (
          /* Welcome & Empty State Hero */
          <div className="my-auto py-8 px-4 flex flex-col items-center text-center animate-in fade-in duration-300">
            <div className="relative mb-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl relative z-10 transition-transform hover:scale-105"
                style={{ backgroundColor: selectedModel.color || '#38bdf8' }}
              >
                <Bot className="w-8 h-8" />
              </div>
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-50 -z-0"
                style={{ backgroundColor: selectedModel.color || '#38bdf8' }}
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
              স্বপন (Swapon) AI
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Vibe code and switch effortlessly across <strong className="text-sky-400">Gemini</strong>,{' '}
              <strong className="text-emerald-400">OpenAI GPT</strong>, and{' '}
              <strong className="text-amber-400">Claude</strong> from one unified mobile interface.
            </p>

            {/* Featured AI Models Directory Cards */}
            <div className="w-full max-w-3xl space-y-3 mb-6">
              <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    বিশ্বসেরা এআই মডেল ও প্ল্যাটফর্মসমূহ ({BEST_AI_MODELS.length} টি)
                  </span>
                </div>
                <button
                  onClick={() => setIsDirectoryOpen(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline flex items-center gap-1"
                >
                  <span>সবগুলো তালিকা দেখুন ({BEST_AI_MODELS.length})</span>
                  <span>→</span>
                </button>
              </div>

              {/* Cards Grid: Prominently displaying Google AI Studio, Claude, Gemini, ChatGPT, DeepSeek, NotebookLM, etc. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                {BEST_AI_MODELS.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-2.5 shadow-md hover:shadow-sky-500/5 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-xs text-white group-hover:text-sky-300 transition">{item.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium shrink-0">
                          {item.badge}
                        </span>
                      </div>

                      {/* Bangla Subtitle: এটি কোন কাজের এআই */}
                      <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-900/50 text-[11px] text-sky-200">
                        <strong className="text-sky-400 block text-[10px]">📌 এটি কোন কাজের এআই:</strong>
                        <span className="leading-snug block mt-0.5">{item.bestForBangla}</span>
                      </div>
                    </div>

                    {/* Action buttons: Open in Chrome & Chat in Swapon */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <a
                        href={item.webUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-[11px] border border-slate-700 transition active:scale-95 shadow-sm"
                      >
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>ক্রোমে খুলুন</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>

                      {item.internalModelId ? (
                        <button
                          onClick={() => handleSelectModel(item.internalModelId!)}
                          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-semibold text-[11px] border border-sky-500/30 transition active:scale-95 shadow-sm"
                        >
                          <MessageSquare className="w-3 h-3 text-sky-400" />
                          <span>স্বপন-এ চ্যাট</span>
                        </button>
                      ) : (
                        <span className="flex items-center justify-center text-[10px] text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800/80">
                          অফিসিয়াল সাইট
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-slate-800">
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block">আরও মডেল খুঁজছেন?</span>
                  <span className="text-[11px] text-slate-400">নোটবুক এলএম, বোল্ট ভাইব কোডিং, মিডজার্নি, সুনো মিউজিক, কার্সার সহ সব মডেল</span>
                </div>
                <button
                  onClick={() => setIsDirectoryOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition active:scale-95 shrink-0"
                >
                  সবগুলো খুলুন ({BEST_AI_MODELS.length})
                </button>
              </div>
            </div>

            {/* Quick Prompt Starters */}
            <div className="w-full max-w-2xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-left mb-1.5 pl-1">
                দ্রুত প্রম্পট দিয়ে শুরু করুন
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {QUKCK_PROMPTS_SLICED.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition group active:scale-98"
                  >
                    <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Feed */
          <div className="space-y-3 pb-4">
            {settings.arenaMode && arenaLastPrompt && (
              <ArenaView
                modelA={selectedModel}
                modelB={compareModel}
                responseA={arenaResponseA}
                responseB={arenaResponseB}
                isLoading={isLoading}
                prompt={arenaLastPrompt}
              />
            )}

            {!settings.arenaMode &&
              currentSession.messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onDelete={handleDeleteMessage}
                  onSpeak={speak}
                  isSpeaking={isSpeaking && speakingId === message.id}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              ))}

            {/* Loading Indicator for single model mode */}
            {isLoading && !settings.arenaMode && (
              <div className="py-4 px-4 flex items-center gap-3 bg-slate-900/30 rounded-2xl border border-slate-800/40 animate-pulse">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: selectedModel.color }}
                >
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
                  </div>
                  <span>{selectedModel.name} is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Sticky Chat Input Bar */}
      <footer className="w-full shrink-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-900">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStop={() => setIsLoading(false)}
          selectedModel={selectedModel}
          onOpenModelSelector={() => setIsSettingsOpen(true)}
        />
      </footer>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          const s = sessions.find((x) => x.id === id);
          if (s) setSelectedModelId(s.modelId);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onExportAll={() => exportAllSessionsAsJSON(sessions)}
        onImportSessions={handleImportSessions}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        serverStatus={serverStatus}
        onOpenGuide={() => {
          setIsSettingsOpen(false);
          setIsGuideOpen(true);
        }}
        onClearHistory={handleClearAllHistory}
      />

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSettings={() => {
          setIsGuideOpen(false);
          setIsSettingsOpen(true);
        }}
      />

      {/* Floating Fast Trigger for AI Model Directory */}
      <button
        onClick={() => setIsDirectoryOpen(true)}
        title="সেরা এআই মডেলের তালিকা (গুগল ক্রোমে ওপেন করুন)"
        className="fixed right-3 bottom-24 sm:bottom-28 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-sky-500/25 border border-sky-400/40 transition active:scale-95 group"
      >
        <Compass className="w-4 h-4 text-white animate-spin [animation-duration:8s]" />
        <span className="hidden xs:inline">এআই মডেল তালিকা</span>
      </button>

      {/* Export Conversation Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={currentSession}
      />

      {/* AI Models Directory Drawer */}
      <AIModelDirectoryDrawer
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectInAppModel={handleSelectModel}
      />
    </div>
  );
}

const QUKCK_PROMPTS_SLICED = QUICK_PROMPTS.slice(0, 4);
