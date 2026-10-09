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
