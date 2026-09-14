import { decideClarification } from './clarification';
import { buildRecommendationReason, getReasonCodes } from './reasons';
import { rankMethods, scoreDivinationMethods } from './scoring';
import { semanticQuestionAnalysisSchema } from './schema';
import type { RouterResult, SemanticQuestionAnalysis } from './types';

function calculateConfidence(topScore: number, secondScore: number): number {
  const scoreStrength = Math.min(1, topScore / 100);
  const separation = Math.min(1, Math.max(0, topScore - secondScore) / 35);
  return Number((0.65 * scoreStrength + 0.35 * separation).toFixed(2));
}

export function routeDivinationMethod(
  rawAnalysis: SemanticQuestionAnalysis,
): RouterResult {
  const analysis = semanticQuestionAnalysisSchema.parse(rawAnalysis);
  const scores = scoreDivinationMethods(analysis);
  const ranking = rankMethods(scores);
  const clarification = decideClarification(analysis, scores);

  if (clarification.required) {
    return {
      recommendedMethod: null,
      secondaryMethod: null,
      routingConfidence: 0,
      scores,
      reasonCodes: [],
      recommendationReason: '',
      clarificationRequired: true,
      clarificationQuestion: clarification.question,
      usedFallback: false,
    };
  }

  const recommendedMethod = clarification.fallbackMethod ?? ranking[0];
  const secondaryMethod = ranking.find((method) => method !== recommendedMethod) ?? null;
  const reasonCodes = getReasonCodes(recommendedMethod, analysis);
  const recommendationReason = buildRecommendationReason(
    recommendedMethod,
    reasonCodes,
  );

  const topScore = scores[recommendedMethod];
  const secondScore = secondaryMethod ? scores[secondaryMethod] : 0;

  return {
    recommendedMethod,
    secondaryMethod,
    routingConfidence: clarification.usedFallback
      ? Math.min(0.59, calculateConfidence(topScore, secondScore))
      : calculateConfidence(topScore, secondScore),
    scores,
    reasonCodes,
    recommendationReason,
    clarificationRequired: false,
    clarificationQuestion: null,
    usedFallback: clarification.usedFallback,
  };
}
