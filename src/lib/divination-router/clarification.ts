import type { DivinationMethod, MethodScores, SemanticQuestionAnalysis } from './types';
import { rankMethods } from './scoring';

export interface ClarificationDecision {
  required: boolean;
  question: string | null;
  usedFallback: boolean;
  fallbackMethod: DivinationMethod | null;
}

function buildClarificationQuestion(analysis: SemanticQuestionAnalysis): string {
  if (analysis.domain === 'relationship') {
    return '你更想了解哪一类：现在的关系状态、接下来会发生什么、某件事能不能成，还是自己的长期感情模式？';
  }
  if (analysis.domain === 'career' || analysis.domain === 'education') {
    return '你更想了解哪一类：当前困境、近期变化、某个结果能不能实现，还是长期发展方向？';
  }
  return '你更想了解的是当前状态、接下来会发生什么、某件具体事情能不能成，还是长期人生方向？';
}

export function decideClarification(
  analysis: SemanticQuestionAnalysis,
  scores: MethodScores,
): ClarificationDecision {
  const [top1, top2] = rankMethods(scores);
  const gap = scores[top1] - scores[top2];

  const extremelyAmbiguous =
    analysis.question_clarity < 0.3 &&
    analysis.core_information_missing &&
    gap < 8;

  if (extremelyAmbiguous) {
    return {
      required: true,
      question: buildClarificationQuestion(analysis),
      usedFallback: false,
      fallbackMethod: null,
    };
  }

  const weakSignal = scores[top1] < 45;
  if (weakSignal) {
    const fallbackMethod: DivinationMethod =
      analysis.long_term_pattern >= 0.65 || analysis.time_horizon === 'multi_year'
        ? 'astrology'
        : analysis.primary_goal === 'event_forecast'
          ? 'lenormand'
          : analysis.primary_goal === 'event_outcome' ||
              analysis.primary_goal === 'timing' ||
              analysis.primary_goal === 'choice'
            ? 'liuyao'
            : 'tarot';

    return {
      required: false,
      question: null,
      usedFallback: true,
      fallbackMethod,
    };
  }

  return {
    required: false,
    question: null,
    usedFallback: false,
    fallbackMethod: null,
  };
}
