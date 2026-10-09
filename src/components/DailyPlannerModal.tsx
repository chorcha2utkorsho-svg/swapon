import React, { useState, useEffect, useMemo } from 'react';
import { PlannerTask, DayPlan, Priority, TimePeriod, AppSettings } from '../types';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  Droplets,
  Clock,
  ChevronLeft,
  ChevronRight,
  Smile,
  Zap,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

interface DailyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

const PLANNER_STORAGE_KEY = 'omniai_daily_planner_v1';

export const DailyPlannerModal: React.FC<DailyPlannerModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  // Current selected date string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // All plans indexed by date
  const [plans, setPlans] = useState<Record<string, DayPlan>>(() => {
    try {
      const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskPeriod, setNewTaskPeriod] = useState<TimePeriod>('morning');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');

  // AI Generator state
  const [aiGoalPrompt, setAiGoalPrompt] = useState('');
  const [isGeneratingAiPlan, setIsGeneratingAiPlan] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Copy feedback
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(plans));
    } catch (e) {
      console.warn('Failed to save planner data:', e);
    }
  }, [plans]);

  // Current Day Plan
  const currentPlan: DayPlan = useMemo(() => {
    if (plans[selectedDate]) {
      return plans[selectedDate];
    }
    return {
      date: selectedDate,
      tasks: [],
      notes: '',
      waterGlasses: 0,
    };
  }, [plans, selectedDate]);

  // Helper to update current day's plan
  const updateCurrentPlan = (updates: Partial<DayPlan>) => {
    setPlans((prev) => ({
      ...prev,
      [selectedDate]: {
        ...currentPlan,
        ...updates,
      },
    }));
  };

  // Date Navigation
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Task Actions
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskText.trim()) return;

    const task: PlannerTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      time: newTaskTime.trim() || undefined,
      period: newTaskPeriod,
      priority: newTaskPriority,
      completed: false,
    };

    updateCurrentPlan({
      tasks: [...currentPlan.tasks, task],
    });

    setNewTaskText('');
    setNewTaskTime('');
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = currentPlan.tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateCurrentPlan({ tasks: updatedTasks });
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = currentPlan.tasks.filter((t) => t.id !== id);
    updateCurrentPlan({ tasks: updatedTasks });
  };

  const handleClearCompleted = () => {
    const activeTasks = currentPlan.tasks.filter((t) => !t.completed);
    updateCurrentPlan({ tasks: activeTasks });
  };

  // AI Routine Generator using Gemini
  const handleGenerateAiSchedule = async () => {
    if (!aiGoalPrompt.trim() || isGeneratingAiPlan) return;
    setIsGeneratingAiPlan(true);
    setAiError(null);

    const promptMessage = `User's daily goals for today: "${aiGoalPrompt}".
Generate a realistic, productive daily routine for today as a JSON array of tasks.
Return ONLY a valid JSON array of objects with the following schema, and no extra markdown wrapping:
[
  {
    "text": "Task description in clear Bengali (or English if technical)",
    "time": "08:00 AM",
    "period": "morning", 
    "priority": "high"
  }
]
Note: "period" must be one of: "morning", "afternoon", "evening", "night".
Note: "priority" must be one of: "high", "medium", "low".
Generate 4 to 6 tasks.`;

    try {
      const response = await sendChatMessage({
        messages: [{ role: 'user', content: promptMessage }],
        modelId: 'gemini-3.8-flash',
        settings,
      });

      // Parse JSON from response
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```/g, '').trim();
      }

      const generatedTasks = JSON.parse(cleanText);
      if (Array.isArray(generatedTasks)) {
        const formatted: PlannerTask[] = generatedTasks.map((gt, idx) => ({
          id: `task-ai-${Date.now()}-${idx}`,
          text: gt.text || 'New Task',
          time: gt.time || undefined,
          period: (['morning', 'afternoon', 'evening', 'night'].includes(gt.period) ? gt.period : 'morning') as TimePeriod,
          priority: (['high', 'medium', 'low'].includes(gt.priority) ? gt.priority : 'medium') as Priority,
          completed: false,
        }));

        updateCurrentPlan({
          tasks: [...currentPlan.tasks, ...formatted],
        });
        setAiGoalPrompt('');
      } else {
        throw new Error('Could not parse task list.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAiError('AI দিয়ে রুটিন বানাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      console.error('AI Planner Error:', error);
    } finally {
      setIsGeneratingAiPlan(false);
    }
  };

  // Water Tracker
  const handleWaterChange = (delta: number) => {
    const current = currentPlan.waterGlasses || 0;
    const next = Math.max(0, Math.min(16, current + delta));
    updateCurrentPlan({ waterGlasses: next });
  };

  // Copy Plan to Clipboard
  const handleCopyPlan = async () => {
    let str = `📅 ডেইলি প্ল্যান (${selectedDate})\n=====================\n\n`;
    if (currentPlan.tasks.length === 0) {
      str += 'কোনো কাজ যোগ করা হয়নি।\n';
    } else {
      currentPlan.tasks.forEach((t) => {
        const status = t.completed ? '[✓]' : '[ ]';
        const time = t.time ? `(${t.time})` : '';
        str += `${status} ${t.text} ${time}\n`;
      });
    }

    if (currentPlan.waterGlasses > 0) {
      str += `\n💧 পানি পান: ${currentPlan.waterGlasses}/8 গ্লাস\n`;
    }
    if (currentPlan.notes) {
      str += `\n📝 নোট: ${currentPlan.notes}\n`;
    }

    await navigator.clipboard.writeText(str);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  // Stats
  const totalTasks = currentPlan.tasks.length;
  const completedTasks = currentPlan.tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by period
  const morningTasks = currentPlan.tasks.filter((t) => t.period === 'morning');
  const afternoonTasks = currentPlan.tasks.filter((t) => t.period === 'afternoon');
  const eveningTasks = currentPlan.tasks.filter((t) => t.period === 'evening');
  const nightTasks = currentPlan.tasks.filter((t) => t.period === 'night');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[94vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>ডেইলি প্ল্যানার (Daily Planner)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                  স্মার্ট রুটিন
                </span>
              </h2>
              <p className="text-xs text-slate-400">দৈনন্দিন লক্ষ্য, টাইম-ব্লকিং ও অভ্যাস ট্র্যাকার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeDateByDays(-1)}
              title="আগের দিন"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-white px-2">
              {new Date(selectedDate).toLocaleDateString('bn-BD', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
              <span className="text-[10px] text-slate-400 ml-1.5 font-mono">({selectedDate})</span>
            </span>
            <button
              onClick={() => changeDateByDays(1)}
              title="পরের দিন"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-semibold transition"
            >
              আজকে (Today)
            </button>
            <button
              onClick={handleCopyPlan}
              title="সম্পূর্ণ প্ল্যান কপি করুন"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              {copiedPlan ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* Progress & Quick Habits Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Task Progress Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">আজকের অগ্রগতি:</span>
                <span className="font-bold text-sky-400">
                  {completedTasks}/{totalTasks} সম্পন্ন ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {progressPercent === 100 && totalTasks > 0 && (
                <p className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                  🎉 অসাধারণ! আজকের সব কাজ সম্পন্ন হয়েছে!
                </p>
              )}
            </div>

            {/* Water Habit Counter */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  <span>পানি পান ট্র্যাকার</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">লক্ষ্য: ৮ গ্লাস (সুস্থ থাকুন)</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWaterChange(-1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="font-bold text-sky-300 text-sm w-8 text-center">
                  {currentPlan.waterGlasses || 0}/8
                </span>
                <button
                  onClick={() => handleWaterChange(1)}
                  className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold flex items-center justify-center text-sm shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* AI Daily Schedule Generator Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-sky-950/40 to-slate-900 border border-indigo-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>🤖 AI দিয়ে আজকের রুটিন বানান</span>
              </span>
              <span className="text-[10px] text-indigo-300">Gemini 3.8 Flash</span>
            </div>
            <p className="text-[11px] text-slate-300">
              আজকে আপনি কী করতে চান তা সংক্ষেপে লিখুন (যেমন: &quot;সকালে ২ ঘণ্টা রিঅ্যাক্ট কোডিং, দুপুরে মিটিং, বিকালে জিম ও বই পড়া&quot;)। AI আপনার জন্য সময় সহ সুন্দর শিডিউল বানিয়ে দেবে!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="আজকের মূল কাজ বা লক্ষ্যগুলো এখানে লিখুন..."
                value={aiGoalPrompt}
                onChange={(e) => setAiGoalPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateAiSchedule();
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                disabled={!aiGoalPrompt.trim() || isGeneratingAiPlan}
                onClick={handleGenerateAiSchedule}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shrink-0 ${
                  aiGoalPrompt.trim() && !isGeneratingAiPlan
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-md shadow-sky-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isGeneratingAiPlan ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>বানানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>রুটিন তৈরি করুন</span>
                  </>
                )}
              </button>
            </div>
            {aiError && <p className="text-[11px] text-red-400">{aiError}</p>}
          </div>

          {/* Add New Task Form */}
          <form
            onSubmit={handleAddTask}
            className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5"
          >
            <span className="font-semibold text-slate-200 block">নতুন কাজ যোগ করুন:</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="কাজের শিরোনাম (যেমন: প্রজেক্ট কোডিং শেষ করা)..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="সময় (09:00 AM)"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={!newTaskText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>যোগ</span>
                </button>
              </div>
            </div>

            {/* Time Period & Priority Pickers */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">সময়কাল:</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setNewTaskPeriod('morning')}
                    className={`px-2 py-1 rounded-md transition ${newTaskPeriod === 'morning' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400'}`}
                  >
                    সকাল
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskPeriod('afternoon')}
                    className={`px-2 py-1 rounded-md transition ${newTaskPeriod === 'afternoon' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'}`}
                  >
                    দুপুর
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskPeriod('evening')}
                    className={`px-2 py-1 rounded-md transition ${newTaskPeriod === 'evening' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400'}`}
                  >
                    সন্ধ্যা
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskPeriod('night')}
                    className={`px-2 py-1 rounded-md transition ${newTaskPeriod === 'night' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'}`}
                  >
                    রাত
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">অগ্রাধিকার:</span>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                >
                  <option value="high">জরুরি (High)</option>
                  <option value="medium">সাধারণ (Medium)</option>
                  <option value="low">ঐচ্ছিক (Low)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Task Lists Grouped By Period */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-white text-xs">আজকের কাজের তালিকা ({totalTasks} টি)</span>
              {completedTasks > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition"
                >
                  সম্পন্ন কাজ মুছুন ({completedTasks})
                </button>
              )}
            </div>

            {totalTasks === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/30 rounded-2xl border border-slate-850">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p>আজকের জন্য এখনো কোনো কাজ যোগ করা হয়নি।</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  উপরে কাজ লিখুন অথবা AI দিয়ে স্বয়ংক্রিয় রুটিন তৈরি করুন!
                </p>
              </div>
            ) : (
              <>
                {/* Morning Tasks */}
                {morningTasks.length > 0 && (
                  <TaskGroup
                    title="সকাল (Morning)"
                    icon={<Sun className="w-3.5 h-3.5 text-amber-400" />}
                    tasks={morningTasks}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                )}

                {/* Afternoon Tasks */}
                {afternoonTasks.length > 0 && (
                  <TaskGroup
                    title="দুপুর (Afternoon)"
                    icon={<Coffee className="w-3.5 h-3.5 text-sky-400" />}
                    tasks={afternoonTasks}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                )}

                {/* Evening Tasks */}
                {eveningTasks.length > 0 && (
                  <TaskGroup
                    title="সন্ধ্যা (Evening)"
                    icon={<Sunset className="w-3.5 h-3.5 text-indigo-400" />}
                    tasks={eveningTasks}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                )}

                {/* Night Tasks */}
                {nightTasks.length > 0 && (
                  <TaskGroup
                    title="রাত (Night)"
                    icon={<Moon className="w-3.5 h-3.5 text-purple-400" />}
                    tasks={nightTasks}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                  />
                )}
              </>
            )}
          </div>

          {/* Daily Scratchpad Notes */}
          <div className="space-y-1.5 pt-2">
            <span className="font-semibold text-slate-300 block">আজকের জরুরি নোট ও স্মরণিকা:</span>
            <textarea
              rows={2}
              value={currentPlan.notes || ''}
              onChange={(e) => updateCurrentPlan({ notes: e.target.value })}
              placeholder="আজকের বিশেষ কোনো নোট, কোডিং আইডিয়া বা চিন্তা এখানে লিখে রাখুন..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            স্বয়ংক্রিয়ভাবে ডিভাইসে সেভ থাকে
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition active:scale-95"
          >
            সম্পন্ন
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskGroupProps {
  title: string;
  icon: React.ReactNode;
  tasks: PlannerTask[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskGroup: React.FC<TaskGroupProps> = ({ title, icon, tasks, onToggle, onDelete }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
        {icon}
        <span>{title}</span>
      </div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-2.5 rounded-xl border transition group ${
              task.completed
                ? 'bg-slate-950/40 border-slate-850 text-slate-500'
                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                className="shrink-0 transition active:scale-90"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                )}
              </button>

              <div className="truncate flex-1">
                <span className={`block truncate ${task.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                  {task.text}
                </span>
              </div>

              {task.time && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono shrink-0 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {task.time}
                </span>
              )}

              {task.priority === 'high' && !task.completed && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0">
                  জরুরি
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="p-1 rounded text-slate-500 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
