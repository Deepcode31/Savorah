import { config } from '../config.js';

export type ModelKind = 'chat' | 'json' | 'fast' | 'vision' | 'fallback';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatCompletionOptions {
  model?: string;
  modelKind?: ModelKind;
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
}

const MODEL_CHAIN: Record<ModelKind, string[]> = {
  chat: [
    config.openRouter.models.chat,
    'meta-llama/llama-3.3-70b-instruct:free',
    'openai/gpt-oss-20b:free',
    config.openRouter.models.fallback,
  ],
  json: [
    config.openRouter.models.json,
    'openai/gpt-oss-20b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    config.openRouter.models.fallback,
  ],
  fast: [
    config.openRouter.models.fast,
    'meta-llama/llama-3.2-3b-instruct:free',
    'openai/gpt-oss-20b:free',
    config.openRouter.models.fallback,
  ],
  vision: [
    config.openRouter.models.vision,
    'google/gemma-4-26b-a4b-it:free',
    config.openRouter.models.fallback,
  ],
  fallback: [config.openRouter.models.fallback],
};

function uniqueModels(kind: ModelKind, explicit?: string): string[] {
  const list = explicit ? [explicit, ...MODEL_CHAIN[kind]] : MODEL_CHAIN[kind];
  return [...new Set(list.filter(Boolean))];
}

async function callOpenRouter(
  model: string,
  messages: ChatMessage[],
  temperature: number
): Promise<string> {
  if (!config.openRouter.apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured. Add your free key from https://openrouter.ai/keys to .env'
    );
  }

  // Avoid response_format — many free models mishandle it and return empty/garbage.
  const res = await fetch(config.openRouter.baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openRouter.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': config.appUrl,
      'X-Title': 'Savorah',
    },
    body: JSON.stringify({ model, messages, temperature }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content || !String(content).trim()) {
    throw new Error('Empty response from OpenRouter');
  }
  return String(content).trim();
}

export async function chatCompletion(options: ChatCompletionOptions): Promise<string> {
  const { messages, temperature = 0.3 } = options;
  const kind = options.modelKind || (options.json ? 'json' : 'chat');
  const models = uniqueModels(kind, options.model);

  let lastError: Error | null = null;
  for (const model of models) {
    try {
      return await callOpenRouter(model, messages, temperature);
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[OpenRouter] ${model} failed:`, lastError.message);
    }
  }
  throw lastError || new Error('All OpenRouter models failed');
}

/** Extract JSON object/array from model output that may include markdown fences. */
export function extractJson<T = any>(text: string): T {
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const startObj = cleaned.indexOf('{');
    const startArr = cleaned.indexOf('[');
    let start = -1;
    if (startObj === -1) start = startArr;
    else if (startArr === -1) start = startObj;
    else start = Math.min(startObj, startArr);
    if (start === -1) throw new Error('No JSON found in model response');
    const endObj = cleaned.lastIndexOf('}');
    const endArr = cleaned.lastIndexOf(']');
    const end = Math.max(endObj, endArr);
    if (end <= start) throw new Error('Incomplete JSON in model response');
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  }
}

export async function chatJson<T = any>(
  messages: ChatMessage[],
  modelKind: ModelKind = 'json'
): Promise<T> {
  const text = await chatCompletion({
    messages,
    json: true,
    modelKind,
    temperature: 0.2,
  });
  return extractJson<T>(text);
}

export async function chatText(
  messages: ChatMessage[],
  modelKind: ModelKind = 'chat'
): Promise<string> {
  return chatCompletion({ messages, json: false, modelKind, temperature: 0.4 });
}

/**
 * Stream a chat completion token-by-token.
 * Falls back through the model chain only if a model fails before emitting output.
 */
export async function chatStream(
  messages: ChatMessage[],
  onDelta: (delta: string) => void,
  modelKind: ModelKind = 'chat',
  temperature = 0.4
): Promise<string> {
  if (!config.openRouter.apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const models = uniqueModels(modelKind);
  let lastError: Error | null = null;

  for (const model of models) {
    let emitted = '';
    try {
      const res = await fetch(config.openRouter.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.openRouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.appUrl,
          'X-Title': 'Savorah',
        },
        body: JSON.stringify({ model, messages, temperature, stream: true }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        throw new Error(`OpenRouter ${res.status}: ${errText.slice(0, 300)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            const delta: string = parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              emitted += delta;
              onDelta(delta);
            }
          } catch {
            // partial JSON chunk — ignored, carried by buffer
          }
        }
      }

      if (emitted.trim()) return emitted;
      throw new Error('Empty streamed response');
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[OpenRouter stream] ${model} failed:`, lastError.message);
      // If we already streamed partial output to the client, do not retry with another model.
      if (emitted) return emitted;
    }
  }
  throw lastError || new Error('All OpenRouter models failed');
}
