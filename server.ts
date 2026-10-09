import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get Gemini client
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasServerGeminiKey: !!process.env.GEMINI_API_KEY,
    hasServerOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasServerAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    defaultModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// Gemini Chat Endpoint
app.post('/api/chat/gemini', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.8-flash', systemInstruction, temperature, apiKey } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGeminiClient(apiKey);

    // Format messages for @google/genai SDK
    // SDK expects contents: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    // Ensure model is valid as per gemini-api guidelines
    // Allowed: gemini-3.8-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview, etc.
    let targetModel = model;
    if (targetModel.includes('1.5') || targetModel.includes('2.0') || targetModel === 'gemini-pro') {
      targetModel = 'gemini-3.8-flash';
    }

    const config: Record<string, unknown> = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (typeof temperature === 'number') {
      config.temperature = temperature;
    }

    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });
    const latency = Date.now() - startTime;

    const replyText = response.text || '';

    return res.json({
      text: replyText,
      model: targetModel,
      provider: 'google',
      latencyMs: latency,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Error communicating with Google Gemini API.',
      provider: 'google',
    });
  }
});

// OpenAI Chat Proxy Endpoint
app.post('/api/chat/openai', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = 'gpt-4o',
      systemInstruction,
      temperature,
      apiKey: customKey,
      baseUrl = 'https://api.openai.com/v1',
    } = req.body;

    const apiKey = customKey?.trim() || process.env.OPENAI_API_KEY?.trim();

    if (!apiKey) {
      return res.status(401).json({
        error: 'OpenAI API key missing. Please enter your OpenAI API key in Settings.',
        code: 'MISSING_API_KEY',
        provider: 'openai',
      });
    }

    const formattedMessages = [];
    if (systemInstruction) {
      formattedMessages.push({ role: 'system', content: systemInstruction });
    }
    for (const m of messages) {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      });
    }

    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanBaseUrl}/chat/completions`;

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `OpenAI returned status ${response.status}: ${response.statusText}`;
      return res.status(response.status).json({
        error: message,
        provider: 'openai',
      });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || '';

    return res.json({
      text: replyText,
      model,
      provider: 'openai',
      latencyMs: latency,
      usage: data.usage,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('OpenAI Proxy Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to connect to OpenAI API.',
      provider: 'openai',
    });
  }
});

// Anthropic Claude Proxy Endpoint
app.post('/api/chat/anthropic', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = 'claude-3-7-sonnet-20250219',
      systemInstruction,
      temperature,
      apiKey: customKey,
    } = req.body;

    const apiKey = customKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim();

    if (!apiKey) {
      return res.status(401).json({
        error: 'Anthropic Claude API key missing. Please enter your API key in Settings.',
        code: 'MISSING_API_KEY',
        provider: 'anthropic',
      });
    }

    const formattedMessages = messages
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant' || m.role === 'model')
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
        content: m.content,
      }));

    const startTime = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemInstruction || undefined,
        messages: formattedMessages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Anthropic returned status ${response.status}: ${response.statusText}`;
      return res.status(response.status).json({
        error: message,
        provider: 'anthropic',
      });
    }

    const data = await response.json();
    const replyText = data.content?.[0]?.text || '';

    return res.json({
      text: replyText,
      model,
      provider: 'anthropic',
      latencyMs: latency,
      usage: data.usage,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Anthropic Proxy Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to connect to Anthropic API.',
      provider: 'anthropic',
    });
  }
});

// Generic / OpenRouter Proxy Endpoint (DeepSeek, Groq, etc.)
app.post('/api/chat/openrouter', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      model = 'deepseek/deepseek-chat',
      systemInstruction,
      temperature,
      apiKey: customKey,
      baseUrl = 'https://openrouter.ai/api/v1',
    } = req.body;

    const apiKey = customKey?.trim() || process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key missing. Enter your OpenRouter or Custom API key in Settings.',
        code: 'MISSING_API_KEY',
        provider: 'openrouter',
      });
    }

    const formattedMessages = [];
    if (systemInstruction) {
      formattedMessages.push({ role: 'system', content: systemInstruction });
    }
    for (const m of messages) {
      formattedMessages.push({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      });
    }

    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanBaseUrl}/chat/completions`;

    const startTime = Date.now();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://aistudio.google.com',
        'X-Title': 'OmniAI Hub',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Endpoint returned status ${response.status}: ${response.statusText}`;
      return res.status(response.status).json({
        error: message,
        provider: 'openrouter',
      });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || '';

    return res.json({
      text: replyText,
      model,
      provider: 'openrouter',
      latencyMs: latency,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('OpenRouter Proxy Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to connect to model endpoint.',
      provider: 'openrouter',
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmniAI Server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
