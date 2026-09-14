export type DivinationMethod = 'tarot' | 'lenormand' | 'liuyao' | 'astrology';

export type QuestionDomain =
  | 'relationship'
  | 'career'
  | 'education'
  | 'money'
  | 'family'
  | 'social'
  | 'self'
  | 'general';

export type QuestionGoal =
  | 'inner_state'
  | 'hidden_factor'
  | 'advice'
  | 'relationship_dynamic'
  | 'event_forecast'
  | 'event_outcome'
  | 'timing'
  | 'choice'
  | 'long_term_pattern'
  | 'life_cycle';

export type AnswerShape =
  | 'explanation'
  | 'reflection'
  | 'advice'
  | 'prediction'
  | 'yes_no'
  | 'timing'
  | 'comparison'
  | 'long_term_map';

export type TimeHorizon =
  | 'current'
  | 'days'
  | 'weeks'
  | 'months'
  | 'year'
  | 'multi_year'
  | 'unspecified';

export interface SemanticQuestionAnalysis {
  raw_question: string;
  normalized_question: string;
  domain: QuestionDomain;
  explicit_intent: string;
  underlying_intent: string;
  primary_goal: QuestionGoal;
  secondary_goal: QuestionGoal | null;
  answer_shape: AnswerShape;
  time_horizon: TimeHorizon;
  specificity: number;
  internal_focus: number;
  external_event_focus: number;
  binary_nature: number;
  timing_need: number;
  comparison_need: number;
  long_term_pattern: number;
  decision_required: boolean;
  question_clarity: number;
  core_information_missing: boolean;
}

export type MethodScores = Record<DivinationMethod, number>;

export type RouterReasonCode =
  | 'internal_reflection'
  | 'hidden_factors'
  | 'decision_support'
  | 'relationship_dynamics'
  | 'short_term_development'
  | 'event_sequence'
  | 'external_events'
  | 'specific_event'
  | 'binary_outcome'
  | 'timing_request'
  | 'comparison_decision'
  | 'long_term_pattern'
  | 'life_cycle'
  | 'fallback_general';

export interface RouterResult {
  recommendedMethod: DivinationMethod | null;
  secondaryMethod: DivinationMethod | null;
  routingConfidence: number;
  scores: MethodScores;
  reasonCodes: RouterReasonCode[];
  recommendationReason: string;
  clarificationRequired: boolean;
  clarificationQuestion: string | null;
  usedFallback: boolean;
}
