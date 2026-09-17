import { semanticQuestionAnalysisSchema } from './schema';
import type { QuestionDomain, SemanticQuestionAnalysis } from './types';

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

function clamp01(value: unknown, fallback: number): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
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
    /^(?:我|我的)?未来(?:会)?怎么样$/,
    /^(?:我|我的)?以后(?:会)?怎么样$/,
    /^(?:我|我的)?未来呢$/,
    /^(?:我|我的)?以后呢$/,
    /^(?:我|我的)?未来$/,
    /^(?:我|我的)?以后$/,
    /^未来怎么样$/,
    /^未来会怎么样$/,
    /^以后怎么样$/,
    /^以后会怎么样$/,
  ].some((pattern) => pattern.test(compact));
}

function broadDomainOnlyQuestion(question: string): QuestionDomain | null {
  const compact = compactQuestion(question);
  const match = compact.match(
    /^(?:帮我)?看看(?:我的)?(感情|爱情|恋爱|事业|工作|学业|学习|财运|财富|金钱|家庭)$/,
  );
  if (!match) return null;

  switch (match[1]) {
    case '感情':
    case '爱情':
    case '恋爱':
      return 'relationship';
    case '事业':
    case '工作':
      return 'career';
    case '学业':
    case '学习':
      return 'education';
    case '财运':
    case '财富':
    case '金钱':
      return 'money';
    case '家庭':
      return 'family';
    default:
      return null;
  }
}

function hasRepeatedLongTermPatternEvidence(question: string): boolean {
  return /(每一?段|每次|总是|反复|一再|从小到大|多年|这些年|过去几年|长期以来|一直以来.*(?:每|不同))/u.test(
    question,
  );
}

function isSingleCurrentRelationshipQuestion(question: string): boolean {
  return /(这段关系|这段感情|当前这段|现在这段|我和他|我和她)/u.test(question);
}

function hasExplicitProcessPreference(question: string): boolean {
  return /(?:更想|主要想|重点想|想重点|我想看|想知道).*(?:怎么发展|如何发展|怎么走|如何走|会先.+再|先.+再|发生哪些|哪些互动|过程|接下来.*(?:怎么|如何|发生))|(?:不想只问|不只是问).*(?:能不能|会不会).*(?:想看|想知道).*(?:怎么|如何|发展|过程)|(?:先.+再.+(?:还是|然后|最后))/u.test(
    question,
  );
}

export function normalizeSemanticAnalysis(
  question: string,
  rawAnalysis: any,
): SemanticQuestionAnalysis {
  const bareVague = isBareVagueQuestion(question);
  const broadDomain = broadDomainOnlyQuestion(question);

  let normalized = {
    ...rawAnalysis,
    raw_question:
      typeof rawAnalysis?.raw_question === 'string' && rawAnalysis.raw_question.trim()
        ? rawAnalysis.raw_question
        : question,
    decision_required: coerceBoolean(rawAnalysis?.decision_required),
    core_information_missing: coerceBoolean(rawAnalysis?.core_information_missing),
  };

  if (bareVague) {
    normalized = {
      ...normalized,
      domain: 'general',
      primary_goal: 'advice',
      secondary_goal: null,
      answer_shape: 'reflection',
      time_horizon: 'unspecified',
      specificity: 0.05,
      internal_focus: 0.25,
      external_event_focus: 0.25,
      binary_nature: 0.1,
      timing_need: 0,
      comparison_need: 0,
      long_term_pattern: 0,
      decision_required: false,
      question_clarity: 0.05,
      core_information_missing: true,
    };

    return semanticQuestionAnalysisSchema.parse(normalized);
  }

  // A broad question with a clear domain is deliberately handled without a
  // clarification round. This is the product fallback: broad current-domain
  // questions default to reflective exploration rather than inventing a
  // specific future event or long-term life cycle.
  if (broadDomain) {
    normalized = {
      ...normalized,
      domain: broadDomain,
      primary_goal: broadDomain === 'relationship' ? 'relationship_dynamic' : 'advice',
      secondary_goal: null,
      answer_shape: 'reflection',
      time_horizon: 'current',
      specificity: 0.3,
      internal_focus: Math.max(0.65, clamp01(rawAnalysis?.internal_focus, 0.65)),
      external_event_focus: Math.min(0.4, clamp01(rawAnalysis?.external_event_focus, 0.3)),
      binary_nature: Math.min(0.15, clamp01(rawAnalysis?.binary_nature, 0.05)),
      timing_need: 0,
      comparison_need: 0,
      long_term_pattern: Math.min(0.25, clamp01(rawAnalysis?.long_term_pattern, 0.1)),
      decision_required: false,
      question_clarity: 0.45,
      core_information_missing: false,
    };
  }

  const singleCurrentRelationship =
    isSingleCurrentRelationshipQuestion(question) &&
    !hasRepeatedLongTermPatternEvidence(question);

  if (
    singleCurrentRelationship &&
    (normalized.primary_goal === 'long_term_pattern' ||
      normalized.primary_goal === 'life_cycle')
  ) {
    normalized = {
      ...normalized,
      primary_goal:
        normalized.answer_shape === 'advice' || normalized.decision_required
          ? 'advice'
          : 'hidden_factor',
      answer_shape: normalized.answer_shape === 'advice' ? 'advice' : 'explanation',
      time_horizon:
        normalized.time_horizon === 'multi_year' || normalized.time_horizon === 'year'
          ? 'current'
          : normalized.time_horizon,
      long_term_pattern: Math.min(
        0.35,
        clamp01(normalized.long_term_pattern, 0.2),
      ),
    };
  }

  // Explicit user preference for an event sequence/process outranks a surface
  // yes/no phrase. This is the key Lenormand-vs-Liuyao boundary.
  if (hasExplicitProcessPreference(question)) {
    const previousPrimary = normalized.primary_goal;
    normalized = {
      ...normalized,
      primary_goal: 'event_forecast',
      secondary_goal:
        previousPrimary === 'event_forecast'
          ? normalized.secondary_goal
          : previousPrimary,
      answer_shape: 'prediction',
      external_event_focus: Math.max(
        0.75,
        clamp01(normalized.external_event_focus, 0.75),
      ),
      specificity: Math.max(0.7, clamp01(normalized.specificity, 0.7)),
      binary_nature: Math.min(0.55, clamp01(normalized.binary_nature, 0.4)),
    };
  }

  return semanticQuestionAnalysisSchema.parse(normalized);
}
