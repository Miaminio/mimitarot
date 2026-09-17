import type {
  AnswerShape,
  DivinationMethod,
  MethodScores,
  QuestionGoal,
  SemanticQuestionAnalysis,
} from './types';

const primaryGoalWeight = (actual: QuestionGoal, target: QuestionGoal) =>
  actual === target ? 1 : 0;

const secondaryGoalWeight = (
  actual: QuestionGoal | null,
  target: QuestionGoal,
) => (actual === target ? 0.45 : 0);

const goalWeight = (
  analysis: SemanticQuestionAnalysis,
  target: QuestionGoal,
) =>
  primaryGoalWeight(analysis.primary_goal, target) +
  secondaryGoalWeight(analysis.secondary_goal, target);

const answerShapeWeight = (
  actual: AnswerShape,
  targets: AnswerShape[],
) => (targets.includes(actual) ? 1 : 0);

const shortTermWeight = (analysis: SemanticQuestionAnalysis) => {
  switch (analysis.time_horizon) {
    case 'days':
      return 1;
    case 'weeks':
      return 0.95;
    case 'months':
      return 0.8;
    case 'current':
      return 0.65;
    case 'year':
      return 0.3;
    case 'multi_year':
      return 0.05;
    case 'unspecified':
    default:
      return 0.45;
  }
};

const longTermWeight = (analysis: SemanticQuestionAnalysis) => {
  switch (analysis.time_horizon) {
    case 'multi_year':
      return 1;
    case 'year':
      return 0.65;
    case 'months':
      return 0.25;
    case 'weeks':
      return 0.08;
    case 'days':
    case 'current':
      return 0;
    case 'unspecified':
    default:
      return 0.25;
  }
};

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export function scoreDivinationMethods(
  analysis: SemanticQuestionAnalysis,
): MethodScores {
  let tarot =
    30 * analysis.internal_focus +
    20 * goalWeight(analysis, 'inner_state') +
    18 * goalWeight(analysis, 'hidden_factor') +
    18 * goalWeight(analysis, 'advice') +
    14 * goalWeight(analysis, 'relationship_dynamic') +
    10 * (1 - analysis.binary_nature) +
    8 * answerShapeWeight(analysis.answer_shape, [
      'explanation',
      'reflection',
      'advice',
    ]);

  let lenormand =
    32 * goalWeight(analysis, 'event_forecast') +
    22 * analysis.external_event_focus +
    18 * shortTermWeight(analysis) +
    14 * (1 - analysis.binary_nature) +
    14 * analysis.specificity +
    10 * answerShapeWeight(analysis.answer_shape, ['prediction']);

  let liuyao =
    30 * goalWeight(analysis, 'event_outcome') +
    22 * analysis.binary_nature +
    16 * analysis.timing_need +
    14 * analysis.comparison_need +
    10 * analysis.external_event_focus +
    8 * analysis.specificity +
    10 * answerShapeWeight(analysis.answer_shape, ['yes_no']) +
    8 * answerShapeWeight(analysis.answer_shape, ['timing', 'comparison']);

  let astrology =
    32 * analysis.long_term_pattern +
    26 * goalWeight(analysis, 'long_term_pattern') +
    22 * goalWeight(analysis, 'life_cycle') +
    12 * longTermWeight(analysis) +
    8 * analysis.internal_focus +
    10 * answerShapeWeight(analysis.answer_shape, ['long_term_map']);

  if (
    analysis.internal_focus >= 0.75 &&
    analysis.primary_goal === 'advice'
  ) {
    tarot += 10;
  }

  if (
    analysis.primary_goal === 'event_forecast' &&
    analysis.binary_nature < 0.5
  ) {
    lenormand += 10;
  }

  if (
    analysis.binary_nature >= 0.8 &&
    analysis.specificity >= 0.7 &&
    analysis.external_event_focus >= 0.7
  ) {
    liuyao += 10;
  }

  if (analysis.long_term_pattern >= 0.8) {
    astrology += 12;
  }

  return {
    tarot: clampScore(tarot),
    lenormand: clampScore(lenormand),
    liuyao: clampScore(liuyao),
    astrology: clampScore(astrology),
  };
}

export function rankMethods(scores: MethodScores): DivinationMethod[] {
  return (Object.keys(scores) as DivinationMethod[]).sort(
    (a, b) => scores[b] - scores[a],
  );
}
