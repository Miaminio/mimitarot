import { semanticQuestionAnalysisSchema } from './schema';
import type { SemanticQuestionAnalysis } from './types';

const ROUTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/divination-router`;

function coerceBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

export async function analyzeQuestion(
  question: string,
): Promise<SemanticQuestionAnalysis> {
  const response = await fetch(ROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ question }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.error === 'string'
      ? payload.error
      : '问题理解服务暂时不可用';
    throw new Error(message);
  }

  // GitHub reference implementation returns { analysis: {...} },
  // while Lovable Cloud may return the analysis object directly.
  const rawAnalysis = payload?.analysis ?? payload;

  // Keep the frontend contract stable even when the cloud implementation
  // omits raw_question or serializes booleans as 0/1.
  const normalizedAnalysis = {
    ...rawAnalysis,
    raw_question:
      typeof rawAnalysis?.raw_question === 'string' && rawAnalysis.raw_question.trim()
        ? rawAnalysis.raw_question
        : question,
    decision_required: coerceBoolean(rawAnalysis?.decision_required),
    core_information_missing: coerceBoolean(rawAnalysis?.core_information_missing),
  };

  return semanticQuestionAnalysisSchema.parse(normalizedAnalysis);
}
