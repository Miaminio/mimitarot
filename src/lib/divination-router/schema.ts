import { z } from 'zod';

export const semanticQuestionAnalysisSchema = z.object({
  raw_question: z.string().min(1),
  normalized_question: z.string().min(1),
  domain: z.enum([
    'relationship',
    'career',
    'education',
    'money',
    'family',
    'social',
    'self',
    'general',
  ]),
  explicit_intent: z.string().min(1),
  underlying_intent: z.string().min(1),
  primary_goal: z.enum([
    'inner_state',
    'hidden_factor',
    'advice',
    'relationship_dynamic',
    'event_forecast',
    'event_outcome',
    'timing',
    'choice',
    'long_term_pattern',
    'life_cycle',
  ]),
  secondary_goal: z
    .enum([
      'inner_state',
      'hidden_factor',
      'advice',
      'relationship_dynamic',
      'event_forecast',
      'event_outcome',
      'timing',
      'choice',
      'long_term_pattern',
      'life_cycle',
    ])
    .nullable(),
  answer_shape: z.enum([
    'explanation',
    'reflection',
    'advice',
    'prediction',
    'yes_no',
    'timing',
    'comparison',
    'long_term_map',
  ]),
  time_horizon: z.enum([
    'current',
    'days',
    'weeks',
    'months',
    'year',
    'multi_year',
    'unspecified',
  ]),
  specificity: z.number().min(0).max(1),
  internal_focus: z.number().min(0).max(1),
  external_event_focus: z.number().min(0).max(1),
  binary_nature: z.number().min(0).max(1),
  timing_need: z.number().min(0).max(1),
  comparison_need: z.number().min(0).max(1),
  long_term_pattern: z.number().min(0).max(1),
  decision_required: z.boolean(),
  question_clarity: z.number().min(0).max(1),
  core_information_missing: z.boolean(),
});

export type SemanticQuestionAnalysisInput = z.infer<
  typeof semanticQuestionAnalysisSchema
>;
