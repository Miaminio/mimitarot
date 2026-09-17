import type { SemanticQuestionAnalysis } from './types';
import { normalizeSemanticAnalysis } from './normalization';

const ROUTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/divination-router`;

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
  return normalizeSemanticAnalysis(question, rawAnalysis);
}
