import { describe, expect, it } from 'vitest';
import { routeDivinationMethod } from '@/lib/divination-router/router';
import type { SemanticQuestionAnalysis } from '@/lib/divination-router/types';

const base: SemanticQuestionAnalysis = {
  raw_question: '测试问题',
  normalized_question: '测试问题',
  domain: 'general',
  explicit_intent: '测试',
  underlying_intent: '测试',
  primary_goal: 'advice',
  secondary_goal: null,
  answer_shape: 'advice',
  time_horizon: 'current',
  specificity: 0.7,
  internal_focus: 0.5,
  external_event_focus: 0.5,
  binary_nature: 0.3,
  timing_need: 0,
  comparison_need: 0,
  long_term_pattern: 0,
  decision_required: false,
  question_clarity: 0.9,
  core_information_missing: false,
};

function analysis(overrides: Partial<SemanticQuestionAnalysis>): SemanticQuestionAnalysis {
  return { ...base, ...overrides };
}

describe('divination router v1', () => {
  it('routes internal reflection and advice to tarot', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '我为什么一直舍不得离开这段关系？',
        normalized_question: '我舍不得离开这段关系的内在原因是什么？',
        domain: 'relationship',
        primary_goal: 'advice',
        secondary_goal: 'inner_state',
        answer_shape: 'reflection',
        internal_focus: 0.95,
        external_event_focus: 0.2,
        binary_nature: 0.15,
        decision_required: true,
      }),
    );
    expect(result.recommendedMethod).toBe('tarot');
    expect(result.clarificationRequired).toBe(false);
  });

  it('routes short-term event development to lenormand', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '未来一个月我们会怎么发展？',
        normalized_question: '未来一个月这段关系会出现哪些现实变化？',
        domain: 'relationship',
        primary_goal: 'event_forecast',
        answer_shape: 'prediction',
        time_horizon: 'months',
        internal_focus: 0.15,
        external_event_focus: 0.95,
        binary_nature: 0.2,
        specificity: 0.8,
      }),
    );
    expect(result.recommendedMethod).toBe('lenormand');
  });

  it('routes a concrete yes/no outcome to liuyao', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '三个月内我们能不能复合？',
        normalized_question: '未来三个月内是否能够复合？',
        domain: 'relationship',
        primary_goal: 'event_outcome',
        answer_shape: 'yes_no',
        time_horizon: 'months',
        specificity: 0.95,
        internal_focus: 0.1,
        external_event_focus: 0.95,
        binary_nature: 0.98,
        timing_need: 0.35,
      }),
    );
    expect(result.recommendedMethod).toBe('liuyao');
  });

  it('routes long-term repeated patterns to astrology', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '为什么我每段恋爱都会重复同样的问题？',
        normalized_question: '我长期重复出现的亲密关系模式是什么？',
        domain: 'relationship',
        primary_goal: 'long_term_pattern',
        answer_shape: 'long_term_map',
        time_horizon: 'multi_year',
        specificity: 0.8,
        internal_focus: 0.85,
        external_event_focus: 0.1,
        binary_nature: 0.05,
        long_term_pattern: 0.98,
      }),
    );
    expect(result.recommendedMethod).toBe('astrology');
  });

  it('does not over-clarify a somewhat vague relationship question', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '看看我的感情',
        normalized_question: '了解目前的感情状态与需要关注的方向',
        domain: 'relationship',
        primary_goal: 'relationship_dynamic',
        answer_shape: 'reflection',
        time_horizon: 'current',
        specificity: 0.35,
        internal_focus: 0.6,
        external_event_focus: 0.35,
        binary_nature: 0.05,
        question_clarity: 0.45,
        core_information_missing: false,
      }),
    );
    expect(result.clarificationRequired).toBe(false);
    expect(result.recommendedMethod).toBe('tarot');
  });

  it('clarifies only when the question is extremely ambiguous', () => {
    const result = routeDivinationMethod(
      analysis({
        raw_question: '看看以后',
        normalized_question: '想了解未来，但领域和目标都不明确',
        domain: 'general',
        primary_goal: 'advice',
        secondary_goal: null,
        answer_shape: 'reflection',
        time_horizon: 'unspecified',
        specificity: 0.05,
        internal_focus: 0.25,
        external_event_focus: 0.25,
        binary_nature: 0.1,
        question_clarity: 0.1,
        core_information_missing: true,
      }),
    );
    expect(result.clarificationRequired).toBe(true);
    expect(result.recommendedMethod).toBeNull();
  });
});
