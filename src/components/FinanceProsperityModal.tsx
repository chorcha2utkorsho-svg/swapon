import React, { useState, useEffect, useMemo } from 'react';
import {
  FinanceData,
  ExpenseItem,
  IncomeItem,
  ProsperityGoal,
  ExpenseCategory,
  PaymentMethod,
  AppSettings,
} from '../types';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  CreditCard,
  Wallet,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

interface FinanceProsperityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

const FINANCE_STORAGE_KEY = 'omniai_finance_prosperity_v1';

const DEFAULT_FINANCE_DATA: FinanceData = {
  currency: '৳',
  monthlyBudget: 30000,
  categoryBudgets: {
    food: 10000,
    transport: 4000,
    bills: 5000,
    shopping: 5000,
    health: 2500,
    education: 2000,
    other: 1500,
  },
  expenses: [],
  incomes: [],
  goals: [
    {
      id: 'goal-1',
      title: 'ইমার্জেন্সি সেভিংস ফান্ড',
      targetAmount: 50000,
      currentAmount: 18000,
      category: 'emergency',
    },
    {
      id: 'goal-2',
      title: 'নতুন ল্যাপটপ / ডিভাইস',
      targetAmount: 85000,
      currentAmount: 42000,
      category: 'asset',
    },
  ],
};

const CATEGORY_NAMES: Record<ExpenseCategory, { label: string; color: string; icon: string }> = {
  food: { label: 'খাবার ও মুদি', color: '#f59e0b', icon: '🍲' },
  transport: { label: 'যাতায়াত ও ভ্রমণ', color: '#38bdf8', icon: '🚌' },
  bills: { label: 'ইউটিলিটি ও বিল', color: '#ef4444', icon: '💡' },
  shopping: { label: 'কেনাকাটা ও বিনোদন', color: '#ec4899', icon: '🛍️' },
  health: { label: 'চিকিৎসা ও ঔষধ', color: '#10b981', icon: '💊' },
  education: { label: 'শিক্ষা ও বইপত্র', color: '#8b5cf6', icon: '📚' },
  other: { label: 'অন্যান্য খরচ', color: '#94a3b8', icon: '📦' },
};

export const FinanceProsperityModal: React.FC<FinanceProsperityModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [data, setData] = useState<FinanceData>(() => {
    try {
      const saved = localStorage.getItem(FINANCE_STORAGE_KEY);
      return saved ? { ...DEFAULT_FINANCE_DATA, ...JSON.parse(saved) } : DEFAULT_FINANCE_DATA;
    } catch {
      return DEFAULT_FINANCE_DATA;
    }
  });

  const [activeTab, setActiveTab] = useState<'tracker' | 'budget' | 'prosperity' | 'ai'>('tracker');

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('food');
  const [expensePayment, setExpensePayment] = useState<PaymentMethod>('cash');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Income form state
  const [incomeTitle, setIncomeTitle] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('বেতন (Salary)');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalInitial, setGoalInitial] = useState('');
  const [goalCategory, setGoalCategory] = useState<'emergency' | 'investment' | 'asset' | 'dream'>('emergency');

  // AI Advisor state
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save finance data:', e);
    }
  }, [data]);

  // Computed Totals
  const totalIncome = useMemo(() => {
    return data.incomes.reduce((sum, item) => sum + item.amount, 0);
  }, [data.incomes]);

  const totalExpense = useMemo(() => {
    return data.expenses.reduce((sum, item) => sum + item.amount, 0);
  }, [data.expenses]);

  const netSavings = totalIncome - totalExpense;

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of data.expenses) {
      map[item.category] = (map[item.category] || 0) + item.amount;
    }
    return map;
  }, [data.expenses]);

  const budgetUsedPercent = data.monthlyBudget > 0
    ? Math.round((totalExpense / data.monthlyBudget) * 100)
    : 0;

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: amt,
      category: expenseCategory,
      paymentMethod: expensePayment,
      date: expenseDate || new Date().toISOString().split('T')[0],
    };

    setData((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incomeAmount);
    if (!incomeTitle.trim() || isNaN(amt) || amt <= 0) return;

    const newIncome: IncomeItem = {
      id: `inc-${Date.now()}`,
      title: incomeTitle.trim(),
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      source: incomeSource,
    };

    setData((prev) => ({
      ...prev,
      incomes: [newIncome, ...prev.incomes],
    }));

    setIncomeTitle('');
    setIncomeAmount('');
  };

  const handleDeleteIncome = (id: string) => {
    setData((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((i) => i.id !== id),
    }));
  };

  const handleUpdateMonthlyBudget = (newLimit: number) => {
    setData((prev) => ({ ...prev, monthlyBudget: newLimit }));
  };

  const handleUpdateCategoryBudget = (cat: string, limit: number) => {
    setData((prev) => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [cat]: limit,
      },
    }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const initial = parseFloat(goalInitial) || 0;
    if (!goalTitle.trim() || isNaN(target) || target <= 0) return;

    const newGoal: ProsperityGoal = {
      id: `goal-${Date.now()}`,
      title: goalTitle.trim(),
      targetAmount: target,
      currentAmount: initial,
      category: goalCategory,
    };

    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));

    setGoalTitle('');
    setGoalTarget('');
    setGoalInitial('');
  };

  const handleDepositToGoal = (goalId: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g
      ),
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Generate AI Prosperity Advice
  const handleGenerateAiProsperityAdvice = async () => {
    setIsGeneratingAdvice(true);
    setAiAdvice(null);

    const summaryData = {
      totalIncome,
      totalExpense,
      monthlyBudget: data.monthlyBudget,
      expensesByCategory,
      goals: data.goals.map((g) => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })),
    };

    const promptMessage = `You are a warm, wise financial advisor and prosperity coach.
Analyze this user's current finances and provide concrete, actionable advice in Bengali:
${JSON.stringify(summaryData, null, 2)}

Structure your response with:
1. 💡 বর্তমান আর্থিক পর্যালোচনা (Current Health Assessment)
2. 🎯 ৫০/৩০/২০ নিয়মে বাজেট পুনর্বিন্যাস (50/30/20 Rule recommendations)
3. ✂️ অপচয় রোধ ও দ্রুত সঞ্চয় বাড়ানোর ৩টি কৌশল (Top 3 Cost-cutting & Savings boosts)
4. 🚀 সমৃদ্ধি লক্ষ্য পূরণের রোডম্যাপ (Roadmap to reach wealth/prosperity goals)
Write in clear, friendly Bengali with bullet points.`;

    try {
      const response = await sendChatMessage({
        messages: [{ role: 'user', content: promptMessage }],
        modelId: 'gemini-3.8-flash',
        settings,
      });
      setAiAdvice(response.text);
    } catch (err) {
      setAiAdvice('পরামর্শ তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[94vh] rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>খরচ ট্র্যাকার, বাজেট ও সমৃদ্ধি প্ল্যানার</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  আর্থিক উন্নতি
                </span>
              </h2>
              <p className="text-xs text-slate-400">দৈনিক খরচ ট্র্যাকিং, মাসিক বাজেট নিয়ন্ত্রণ ও সঞ্চয় লক্ষ্য</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Highlights Top Banner */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-slate-950/50 border-b border-slate-800 shrink-0 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">মোট আয় (Income)</span>
            <span className="font-bold text-emerald-400 text-sm">
              {data.currency}{totalIncome.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">মোট ব্যয় (Expense)</span>
            <span className="font-bold text-rose-400 text-sm">
              {data.currency}{totalExpense.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">ব্যালেন্স / সঞ্চয়</span>
            <span className={`font-bold text-sm ${netSavings >= 0 ? 'text-sky-400' : 'text-red-400'}`}>
              {data.currency}{netSavings.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 pt-2 bg-slate-950/30 shrink-0 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'tracker'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>খরচ ট্র্যাকার (Cost Tracker)</span>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'budget'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>বাজেট মেকার (Budget)</span>
          </button>
          <button
            onClick={() => setActiveTab('prosperity')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'prosperity'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>সমৃদ্ধি প্ল্যানার (Prosperity)</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>🤖 AI সমৃদ্ধি পরামর্শক</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs">
          {/* TAB 1: COST TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-5">
              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">নতুন খরচ যোগ করুন:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="খরচের বিবরণ (যেমন: দুপুরের খাবার, বাসের ভাড়া)..."
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="পরিমাণ (৳)"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none shrink-0"
                    >
                      {Object.entries(CATEGORY_NAMES).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {meta.icon} {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">পেমেন্ট মেথড:</span>
                    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setExpensePayment('cash')}
                        className={`px-2 py-1 rounded-md transition ${expensePayment === 'cash' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'}`}
                      >
                        ক্যাশ
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpensePayment('mfs')}
                        className={`px-2 py-1 rounded-md transition ${expensePayment === 'mfs' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        বিকাশ/নগদ
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpensePayment('bank')}
                        className={`px-2 py-1 rounded-md transition ${expensePayment === 'bank' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        ব্যাংক/কার্ড
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-[11px] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!expenseTitle.trim() || !expenseAmount}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>খরচ সংরক্ষণ</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Income Add Toggle Form */}
              <details className="rounded-2xl bg-slate-950/40 border border-slate-800/80 p-3 text-xs group">
                <summary className="font-semibold text-slate-300 cursor-pointer flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>নতুন আয় (Income) যোগ করুন</span>
                  </span>
                  <span className="text-[10px] text-slate-500 group-open:rotate-90 transition-transform">▸</span>
                </summary>
                <form onSubmit={handleAddIncome} className="pt-3 space-y-2 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="আয়ের বিবরণ (বেতন / ফ্রিল্যান্সিং)..."
                    value={incomeTitle}
                    onChange={(e) => setIncomeTitle(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="আয়ের পরিমাণ (৳)"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                  >
                    আয় যোগ
                  </button>
                </form>
              </details>

              {/* Expenses List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-bold text-white text-xs">সাম্প্রতিক খরচের তালিকা ({data.expenses.length} টি)</span>
                  <span className="text-[11px] text-slate-400">সর্বমোট: {data.currency}{totalExpense.toLocaleString()}</span>
                </div>

                {data.expenses.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-850">
                    <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p>এখনো কোনো খরচ রেকর্ড করা হয়নি।</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">উপরে আপনার দৈনন্দিন খরচের তথ্য লিখে সংরক্ষণ করুন।</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {data.expenses.map((item) => {
                      const cat = CATEGORY_NAMES[item.category] || CATEGORY_NAMES.other;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <span className="text-base shrink-0">{cat.icon}</span>
                            <div className="truncate">
                              <span className="font-semibold text-white block truncate">{item.title}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                <span>{item.date}</span>
                                <span>•</span>
                                <span>{cat.label}</span>
                                <span>•</span>
                                <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                                  {item.paymentMethod}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-rose-400 text-xs">
                              -{data.currency}{item.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleDeleteExpense(item.id)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUDGET MAKER */}
          {activeTab === 'budget' && (
            <div className="space-y-5">
              {/* Monthly Budget Setting Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-white text-xs block">মাসিক মোট বাজেট লক্ষ্য (Monthly Budget)</span>
                    <p className="text-[11px] text-slate-400">এই মাসে আপনার খরচের সর্বোচ্চ সীমা</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{data.currency}</span>
                    <input
                      type="number"
                      value={data.monthlyBudget}
                      onChange={(e) => handleUpdateMonthlyBudget(parseFloat(e.target.value) || 0)}
                      className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold text-right"
                    />
                  </div>
                </div>

                {/* Overall Budget Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">
                      খরচ হয়েছে: <strong className="text-white">{data.currency}{totalExpense.toLocaleString()}</strong> ({budgetUsedPercent}%)
                    </span>
                    <span className={data.monthlyBudget >= totalExpense ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                      {data.monthlyBudget >= totalExpense ? `বাকি আছে: ${data.currency}${(data.monthlyBudget - totalExpense).toLocaleString()}` : `বাজেট ছাড়িয়েছে!`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        budgetUsedPercent > 100
                          ? 'bg-rose-500'
                          : budgetUsedPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsedPercent)}%` }}
                    />
                  </div>
                  {budgetUsedPercent > 80 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>সতর্কতা: আপনি মাসিক বাজেটের ৮০% এর বেশি খরচ করে ফেলেছেন!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category-wise Budget Allocations */}
              <div className="space-y-3">
                <span className="font-bold text-white text-xs block">খাতভিত্তিক বাজেট ও খরচ বিশ্লেষণ:</span>

                <div className="space-y-2">
                  {Object.entries(CATEGORY_NAMES).map(([key, meta]) => {
                    const spent = expensesByCategory[key] || 0;
                    const catLimit = data.categoryBudgets[key] || 0;
                    const pct = catLimit > 0 ? Math.round((spent / catLimit) * 100) : 0;
                    const isOver = catLimit > 0 && spent > catLimit;

                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span>{meta.icon}</span>
                            <span className="font-semibold text-white">{meta.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">
                              খরচ: <strong className={isOver ? 'text-red-400' : 'text-slate-200'}>{data.currency}{spent.toLocaleString()}</strong> /
                            </span>
                            <input
                              type="number"
                              value={catLimit}
                              onChange={(e) => handleUpdateCategoryBudget(key, parseFloat(e.target.value) || 0)}
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-0.5 text-[11px] text-white text-right"
                            />
                          </div>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 75 ? 'bg-amber-400' : 'bg-sky-400'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROSPERITY PLANNER (সমৃদ্ধি প্ল্যানার) */}
          {activeTab === 'prosperity' && (
            <div className="space-y-5">
              {/* 50/30/20 Prosperity Formula Helper */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>৫০/৩০/২০ সমৃদ্ধি ফর্মুলা (The Wealth Rule)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    সোনালী নিয়ম
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  আর্থিক প্রাচুর্য ও সমৃদ্ধির জন্য আয়ের ৫০% মৌলিক প্রয়োজন, ৩০% ব্যক্তিগত জীবনযাত্রা এবং <strong>২০% সঞ্চয় ও বিনিয়োগে</strong> রাখা উচিত।
                </p>

                {totalIncome > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">৫০% মৌলিক প্রয়োজন</span>
                      <strong className="text-white">{data.currency}{Math.round(totalIncome * 0.5).toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">৩০% ইচ্ছা ও শখ</span>
                      <strong className="text-white">{data.currency}{Math.round(totalIncome * 0.3).toLocaleString()}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-amber-400 block font-bold">২০% সমৃদ্ধি সঞ্চয়</span>
                      <strong className="text-amber-400 font-bold">{data.currency}{Math.round(totalIncome * 0.2).toLocaleString()}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Prosperity Goal */}
              <form onSubmit={handleAddGoal} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="font-bold text-white text-xs block">নতুন সমৃদ্ধি লক্ষ্য যোগ করুন:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="লক্ষ্যের নাম (যেমন: বাড়ি নির্মাণ, ফ্ল্যাট, স্টক)..."
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="sm:col-span-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="টার্গেট পরিমাণ (৳)"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="বর্তমান জমানো (৳)"
                      value={goalInitial}
                      onChange={(e) => setGoalInitial(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={!goalTitle.trim() || !goalTarget}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shrink-0 disabled:opacity-50"
                    >
                      লক্ষ্য যোগ
                    </button>
                  </div>
                </div>
              </form>

              {/* Prosperity Goals List */}
              <div className="space-y-3">
                <span className="font-bold text-white text-xs block">আপনার সক্রিয় সমৃদ্ধি লক্ষ্যসমূহ ({data.goals.length} টি):</span>

                <div className="space-y-3">
                  {data.goals.map((goal) => {
                    const percent = goal.targetAmount > 0
                      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                      : 0;

                    return (
                      <div
                        key={goal.id}
                        className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>🎯 {goal.title}</span>
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              জমানো হয়েছে: <strong className="text-amber-400">{data.currency}{goal.currentAmount.toLocaleString()}</strong> / লক্ষ্য: {data.currency}{goal.targetAmount.toLocaleString()} ({percent}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDepositToGoal(goal.id, 1000)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[11px] border border-emerald-500/30"
                            >
                              +১,০০০৳ যোগ
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="p-1 rounded text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI WEALTH & PROSPERITY ADVISOR */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-sky-950/40 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>🤖 AI সমৃদ্ধি পরামর্শক (Gemini 3.8 Flash)</span>
                  </span>
                  <span className="text-[10px] text-indigo-300 font-semibold">আর্থিক বুদ্ধিমত্তা</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  আপনার আয়, ব্যয়, বাজেট এবং সমৃদ্ধি লক্ষ্যগুলোর ওপর ভিত্তি করে কৃত্রিম বুদ্ধিমত্তা আপনাকে ব্যক্তিগত অর্থনৈতিক পরামর্শ ও সঞ্চয় বৃদ্ধির কৌশল তৈরি করে দেবে।
                </p>

                <button
                  onClick={handleGenerateAiProsperityAdvice}
                  disabled={isGeneratingAdvice}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {isGeneratingAdvice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>বিশ্লেষণ করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>আমার সমৃদ্ধি পরামর্শ তৈরি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {aiAdvice && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                  {aiAdvice}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            আর্থিক তথ্যসমূহ আপনার ডিভাইসে সম্পূর্ণ গোপন ও নিরাপদ
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
