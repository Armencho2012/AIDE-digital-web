import { supabase } from '@/integrations/supabase/client';

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
  const asDate = Date.parse(value);
  if (!Number.isFinite(asDate)) return undefined;
  const seconds = Math.ceil((asDate - Date.now()) / 1000);
  return seconds > 0 ? seconds : undefined;
};

const tryParseJson = (value: string): unknown | null => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const extractErrorText = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  for (const key of ['message', 'error', 'details']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = extractErrorText(candidate);
      if (nested) return nested;
    }
  }

  return null;
};

const normalizeMessage = (rawMessage: string, status?: number): string => {
  const parsed = tryParseJson(rawMessage);
  const extracted = parsed ? extractErrorText(parsed) : null;
  const message = (extracted || rawMessage || 'Failed to analyze content').trim();
  const lower = message.toLowerCase();

  if (lower.includes('daily limit reached')) {
    return 'Daily limit reached. Upgrade for more analyses.';
  }
  if (status === 429 && !lower.includes('daily limit')) {
    return 'The analysis service is busy right now. Please try again shortly.';
  }
  if (status === 503 || lower.includes('high demand') || lower.includes('unavailable')) {
    return 'The analysis model is experiencing high demand. Please try again in a moment.';
  }
  if (status === 502 || status === 504 || lower.includes('timeout') || lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Temporary network issue while generating analysis. Please retry.';
  }

  return message;
};

const isRetryable = (status: number | undefined, message: string): boolean => {
  const lower = message.toLowerCase();
  if (status && RETRYABLE_STATUS_CODES.has(status)) {
    if (status === 429 && lower.includes('daily limit')) return false;
    return true;
  }
  return /timeout|failed to fetch|network|temporar|unavailable|high demand|rate limit/.test(lower);
};

const readErrorContext = async (context: unknown): Promise<{
  status?: number;
  retryAfterSeconds?: number;
  payload?: unknown;
}> => {
  if (!context || typeof context !== 'object') return {};

  const maybeResponse = context as Partial<Response>;
  const status = typeof maybeResponse.status === 'number' ? maybeResponse.status : undefined;
  const retryAfterSeconds = parseRetryAfter(maybeResponse.headers?.get?.('retry-after') ?? null);

  if (typeof maybeResponse.clone !== 'function') {
    return { status, retryAfterSeconds };
  }

  const cloned = maybeResponse.clone();
  const payload = await cloned.json().catch(async () => {
    const text = await cloned.text().catch(() => '');
    return text ? { error: text } : undefined;
  });

  return { status, retryAfterSeconds, payload };
};

type AnalyzeTextPayload = Record<string, unknown>;

export const invokeAnalyzeText = async <T = unknown>(
  body: AnalyzeTextPayload,
  options?: { maxRetries?: number },
): Promise<T> => {
  const maxRetries = Math.max(0, options?.maxRetries ?? 2);
  let lastMessage = 'Failed to analyze content';

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const { data, error } = await supabase.functions.invoke('analyze-text', { body });

    if (!error) {
      if (!data) throw new Error('No data returned from analysis');
      return data as T;
    }

    const { status, retryAfterSeconds, payload } = await readErrorContext((error as { context?: unknown }).context);
    const payloadMessage = extractErrorText(payload);
    const rawMessage = payloadMessage || error.message || 'Failed to analyze content';
    const normalizedMessage = normalizeMessage(rawMessage, status);

    lastMessage = normalizedMessage;
    const shouldRetry = attempt < maxRetries && isRetryable(status, rawMessage);
    if (!shouldRetry) {
      throw new Error(lastMessage);
    }

    const backoffMs = retryAfterSeconds
      ? Math.max(retryAfterSeconds * 1000, 600)
      : 700 * Math.pow(2, attempt);
    const jitterMs = Math.floor(Math.random() * 200);
    await sleep(backoffMs + jitterMs);
  }

  throw new Error(lastMessage);
};
