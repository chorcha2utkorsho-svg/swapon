import { ChatMessage, Provider, AppSettings } from '../types';
import { AI_MODELS } from '../constants/models';

export interface SendMessageParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  modelId: string;
  settings: AppSettings;
}

export interface ChatResponseResult {
  text: string;
  latencyMs: number;
  model: string;
  provider: Provider;
  isSimulated?: boolean;
}

export async function sendChatMessage({
  messages,
  modelId,
  settings,
}: SendMessageParams): Promise<ChatResponseResult> {
  const modelMeta = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
  const provider = modelMeta.provider;

  let endpoint = '/api/chat/gemini';
  const payload: Record<string, unknown> = {
    messages,
    model: modelId,
    systemInstruction: settings.systemInstruction,
    temperature: settings.temperature,
  };

  if (provider === 'google') {
    endpoint = '/api/chat/gemini';
    if (settings.apiKeys.gemini) {
      payload.apiKey = settings.apiKeys.gemini;
    }
  } else if (provider === 'openai') {
    endpoint = '/api/chat/openai';
    payload.apiKey = settings.apiKeys.openai;
    if (settings.apiKeys.customBaseUrl) {
      payload.baseUrl = settings.apiKeys.customBaseUrl;
    }
  } else if (provider === 'anthropic') {
    endpoint = '/api/chat/anthropic';
    payload.apiKey = settings.apiKeys.anthropic;
  } else if (provider === 'openrouter') {
    endpoint = '/api/chat/openrouter';
    payload.apiKey = settings.apiKeys.openrouter;
    if (settings.apiKeys.customBaseUrl) {
      payload.baseUrl = settings.apiKeys.customBaseUrl;
    }
  }

  const startTime = Date.now();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      // If error is missing API key and user doesn't have one configured yet
      if (res.status === 401 || data.code === 'MISSING_API_KEY') {
        throw new Error(
          data.error ||
            `API key missing for ${modelMeta.providerName}. Please add your API key in Settings or switch to Gemini 3.8 Flash (pre-configured).`
        );
      }
      throw new Error(data.error || `Server responded with status ${res.status}`);
    }

    return {
      text: data.text || '(No text output received)',
      latencyMs: data.latencyMs || Date.now() - startTime,
      model: data.model || modelId,
      provider,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Request error for ${modelId}:`, err);
    throw err;
  }
}

export async function fetchServerStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
