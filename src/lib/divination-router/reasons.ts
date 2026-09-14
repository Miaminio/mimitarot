import type {
  DivinationMethod,
  RouterReasonCode,
  SemanticQuestionAnalysis,
} from './types';

export function getReasonCodes(
  method: DivinationMethod,
  analysis: SemanticQuestionAnalysis,
): RouterReasonCode[] {
  const codes: RouterReasonCode[] = [];

  if (analysis.internal_focus >= 0.65) codes.push('internal_reflection');
  if (analysis.primary_goal === 'hidden_factor') codes.push('hidden_factors');
  if (analysis.primary_goal === 'advice' || analysis.decision_required) codes.push('decision_support');
  if (analysis.primary_goal === 'relationship_dynamic') codes.push('relationship_dynamics');
  if (analysis.primary_goal === 'event_forecast') {
    codes.push('short_term_development', 'event_sequence');
  }
  if (analysis.external_event_focus >= 0.7) codes.push('external_events');
  if (analysis.primary_goal === 'event_outcome') codes.push('specific_event');
  if (analysis.binary_nature >= 0.7) codes.push('binary_outcome');
  if (analysis.timing_need >= 0.6 || analysis.primary_goal === 'timing') codes.push('timing_request');
  if (analysis.comparison_need >= 0.6 || analysis.primary_goal === 'choice') codes.push('comparison_decision');
  if (analysis.long_term_pattern >= 0.65 || analysis.primary_goal === 'long_term_pattern') codes.push('long_term_pattern');
  if (analysis.primary_goal === 'life_cycle') codes.push('life_cycle');

  if (codes.length === 0) codes.push('fallback_general');

  return Array.from(new Set(codes));
}

export function buildRecommendationReason(
  method: DivinationMethod,
  codes: RouterReasonCode[],
): string {
  switch (method) {
    case 'tarot':
      if (codes.includes('decision_support')) {
        return '你的问题更需要梳理当前处境、内在动机与决策方向，因此更适合使用塔罗进行深入分析。';
      }
      return '你的问题重点在于理解当前状态、关系动力或隐藏因素，因此更适合使用塔罗。';
    case 'lenormand':
      return '你的问题更关注近期现实中会如何发展、可能出现哪些互动或事件，因此更适合使用雷诺曼。';
    case 'liuyao':
      if (codes.includes('timing_request')) {
        return '你的问题聚焦于一个具体事项的结果与时间判断，因此更适合使用六爻。';
      }
      return '你的问题聚焦于一个明确事件能否实现、结果是否成立，因此更适合使用六爻。';
    case 'astrology':
      return '你的问题关注长期重复模式、人生结构或较长周期的发展，因此更适合使用西方占星。';
  }
}
