import { semanticQuestionAnalysisSchema } from './schema';
import type { SemanticQuestionAnalysis } from './types';

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

  return semanticQuestionAnalysisSchema.parse(payload.analysis);
}
