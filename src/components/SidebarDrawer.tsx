import React, { useState, useMemo } from 'react';
import { ChatSession } from '../types';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Search, Download, Upload, Sliders, BookOpen, ChevronRight, Compass, Calendar, TrendingUp } from 'lucide-react';
import { AI_MODELS } from '../constants/models';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onExportAll: () => void;
  onImportSessions: (file: File) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenDirectory?: () => void;
  onOpenPlanner?: () => void;
  onOpenFinance?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onExportAll,
  onImportSessions,
  onOpenSettings,
  onOpenGuide,
  onOpenDirectory,
  onOpenPlanner,
  onOpenFinance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  // Group sessions by Today, Yesterday, Earlier
  const groupedSessions = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const earlier: ChatSession[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    for (const session of filteredSessions) {
      if (session.updatedAt >= todayStart) {
        today.push(session);
      } else if (session.updatedAt >= yesterdayStart) {
        yesterday.push(session);
      } else {
        earlier.push(session);
      }
    }

    return { today, yesterday, earlier };
  }, [filteredSessions]);

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportSessions(file);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] h-full bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
              স্ব
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">স্বপন AI</h2>
              <p className="text-[10px] text-slate-400">Multi-Model Chat History</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/10 transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Thread</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p>No conversations yet.</p>
              <p className="text-[11px] mt-1 text-slate-600">Start a new thread to begin chatting!</p>
            </div>
          ) : (
            <>
              {groupedSessions.today.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Today
                  </div>
                  {groupedSessions.today.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === currentSessionId}
                      isEditing={editingSessionId === s.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectSession(s.id);
                        onClose();
                      }}
                      onStartRename={(e) => handleStartRename(s, e)}
                      onSaveRename={(e) => handleSaveRename(s.id, e)}
                      onCancelRename={() => setEditingSessionId(null)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                    />
                  ))}
                </div>
              )}

              {groupedSessions.yesterday.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Yesterday
                  </div>
                  {groupedSessions.yesterday.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === currentSessionId}
                      isEditing={editingSessionId === s.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectSession(s.id);
                        onClose();
                      }}
                      onStartRename={(e) => handleStartRename(s, e)}
                      onSaveRename={(e) => handleSaveRename(s.id, e)}
                      onCancelRename={() => setEditingSessionId(null)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                    />
                  ))}
                </div>
              )}

              {groupedSessions.earlier.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Earlier
                  </div>
                  {groupedSessions.earlier.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === currentSessionId}
                      isEditing={editingSessionId === s.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      onSelect={() => {
                        onSelectSession(s.id);
                        onClose();
                      }}
                      onStartRename={(e) => handleStartRename(s, e)}
                      onSaveRename={(e) => handleSaveRename(s.id, e)}
                      onCancelRename={() => setEditingSessionId(null)}
                      onDelete={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions (Backup, Settings, Guide) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800/80">
            <button
              onClick={onExportAll}
              title="Download all chats as JSON"
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition"
            >
              <Download className="w-3 h-3 text-sky-400" />
              <span>Export Chats</span>
            </button>
            <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-[11px] font-medium transition cursor-pointer">
              <Upload className="w-3 h-3 text-emerald-400" />
              <span>Import Chats</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {onOpenFinance && (
            <button
              onClick={() => {
                onClose();
                onOpenFinance();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition text-[11px] font-semibold border border-emerald-500/30"
            >
              <span className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>💰 খরচ, বাজেট ও সমৃদ্ধি প্ল্যানার</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {onOpenPlanner && (
            <button
              onClick={() => {
                onClose();
                onOpenPlanner();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition text-[11px] font-semibold border border-amber-500/30"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>📅 ডেইলি প্ল্যানার (স্মার্ট রুটিন)</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {onOpenDirectory && (
            <button
              onClick={() => {
                onClose();
                onOpenDirectory();
              }}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 transition text-[11px] font-semibold border border-sky-500/30"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>🌐 সেরা AI মডেল তালিকা (ক্রোম)</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenGuide();
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition text-[11px]"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Setup & Mobile Guide</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition text-[11px]"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>App Settings & Keys</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: (e: React.MouseEvent | React.FormEvent) => void;
  onCancelRename: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onDelete,
}) => {
  const modelMeta = AI_MODELS.find((m) => m.id === session.modelId);

  if (isEditing) {
    return (
      <div className="p-1.5 my-1 rounded-xl bg-slate-800 flex items-center gap-1.5">
        <input
          type="text"
          value={editTitle}
          autoFocus
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveRename(e);
            if (e.key === 'Escape') onCancelRename();
          }}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={onSaveRename}
          className="p-1 rounded text-emerald-400 hover:bg-slate-700"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCancelRename}
          className="p-1 rounded text-slate-400 hover:bg-slate-700"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group w-full flex items-center justify-between p-2.5 my-1 rounded-xl cursor-pointer transition ${
        isActive
          ? 'bg-sky-500/15 text-white border border-sky-500/30'
          : 'hover:bg-slate-800/80 text-slate-300'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
        <MessageSquare
          className={`w-3.5 h-3.5 shrink-0 ${
            isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-400'
          }`}
        />
        <div className="truncate">
          <span className="truncate block font-medium text-xs">{session.title}</span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: modelMeta?.color || '#38bdf8' }}
            />
            {modelMeta?.name || 'Gemini'} · {session.messages.length} msgs
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onStartRename}
          title="Rename thread"
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          title="Delete thread"
          className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700/60"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
