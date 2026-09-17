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

function compactQuestion(question: string): string {
  return question
    .replace(/\s+/g, '')
    .replace(/[？?！!。,.，、]/g, '');
}

function isBareVagueQuestion(question: string): boolean {
  const compact = compactQuestion(question);
  return [
    /^看看$/,
    /^帮我看看$/,
    /^看一下$/,
    /^帮我看一下$/,
    /^看看以后$/,
    /^看看未来$/,
    /^以后怎么样$/,
    /^以后会怎么样$/,
    /^未来怎么样$/,
    /^未来会怎么样$/,
    /^看看运势$/,
  ].some((pattern) => pattern.test(compact));
}

function hasRepeatedLongTermPatternEvidence(question: string): boolean {
  return /(每一?段|每次|总是|反复|一再|从小到大|多年|这些年|过去几年|长期以来|一直以来.*(?:每|不同))/u.test(
    question,
  );
}

function isSingleCurrentRelationshipQuestion(question: string): boolean {
  return /(这段关系|这段感情|当前这段|现在这段|我和他|我和她)/u.test(question);
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

  const bareVague = isBareVagueQuestion(question);
  const singleCurrentRelationship =
    isSingleCurrentRelationshipQuestion(question) &&
    !hasRepeatedLongTermPatternEvidence(question);

  let primaryGoal = rawAnalysis?.primary_goal;
  let answerShape = rawAnalysis?.answer_shape;
  let timeHorizon = rawAnalysis?.time_horizon;
  let longTermPattern = rawAnalysis?.long_term_pattern;

  // A phrase such as “一直舍不得离开这段关系” describes one current
  // relationship. “一直” alone is not evidence of a cross-relationship or
  // multi-year recurring life pattern. Correct occasional LLM over-routing
  // toward astrology at the semantic boundary.
  if (
    singleCurrentRelationship &&
    (primaryGoal === 'long_term_pattern' || primaryGoal === 'life_cycle')
  ) {
    primaryGoal =
      answerShape === 'advice' || coerceBoolean(rawAnalysis?.decision_required)
        ? 'advice'
        : 'hidden_factor';
    answerShape = answerShape === 'advice' ? 'advice' : 'explanation';
    if (timeHorizon === 'multi_year' || timeHorizon === 'year') {
      timeHorizon = 'current';
    }
    const numericLongTerm = Number(longTermPattern);
    longTermPattern = Number.isFinite(numericLongTerm)
      ? Math.min(0.35, Math.max(0, numericLongTerm))
      : 0.2;
  }

  // Bare prompts such as “看看以后” are intentionally forced into the
  // clarification path. Method scores must not decide the user's intent when
  // the user has not supplied a domain or question type at all.
  const normalizedAnalysis = {
    ...rawAnalysis,
    raw_question:
      typeof rawAnalysis?.raw_question === 'string' && rawAnalysis.raw_question.trim()
        ? rawAnalysis.raw_question
        : question,
    primary_goal: primaryGoal,
    answer_shape: answerShape,
    time_horizon: timeHorizon,
    long_term_pattern: bareVague ? 0 : longTermPattern,
    specificity: bareVague ? 0.05 : rawAnalysis?.specificity,
    question_clarity: bareVague ? 0.05 : rawAnalysis?.question_clarity,
    core_information_missing: bareVague
      ? true
      : coerceBoolean(rawAnalysis?.core_information_missing),
    decision_required: coerceBoolean(rawAnalysis?.decision_required),
  };

  return semanticQuestionAnalysisSchema.parse(normalizedAnalysis);
}
