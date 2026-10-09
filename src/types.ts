export type Provider = 'google' | 'openai' | 'anthropic' | 'openrouter';

export interface AIModel {
  id: string;
  name: string;
  provider: Provider;
  providerName: string;
  badge: string;
  description: string;
  contextWindow: string;
  speedRating: 'Fast' | 'Ultra Fast' | 'Moderate';
  reasoningRating: 'Standard' | 'High' | 'Frontier';
  color: string;
  isDefault?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelId: string;
  provider: Provider;
  latencyMs?: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  modelId: string;
  compareModelId?: string;
  isArena?: boolean;
}

export interface ApiKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  customBaseUrl?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  apiKeys: ApiKeys;
  systemInstruction: string;
  temperature: number;
  hapticFeedback: boolean;
  codeSyntaxHighlight: boolean;
  streamText: boolean;
  arenaMode: boolean;
  compareModelId: string;
}

export interface ServerStatus {
  status: string;
  hasServerGeminiKey: boolean;
  hasServerOpenAIKey: boolean;
  hasServerAnthropicKey: boolean;
  defaultModel: string;
}

export type Priority = 'high' | 'medium' | 'low';
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PlannerTask {
  id: string;
  text: string;
  time?: string;
  priority: Priority;
  period: TimePeriod;
  completed: boolean;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  tasks: PlannerTask[];
  notes: string;
  waterGlasses: number;
  mood?: 'happy' | 'productive' | 'neutral' | 'tired';
}

export type ExpenseCategory = 'food' | 'transport' | 'bills' | 'shopping' | 'health' | 'education' | 'other';
export type PaymentMethod = 'cash' | 'mfs' | 'bank';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface IncomeItem {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  source: string;
}

export interface ProsperityGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: 'emergency' | 'investment' | 'asset' | 'dream';
}

export interface FinanceData {
  currency: string;
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  goals: ProsperityGoal[];
}
