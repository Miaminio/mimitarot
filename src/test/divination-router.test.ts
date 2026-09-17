import { describe, expect, it } from 'vitest';
import { normalizeSemanticAnalysis } from '@/lib/divination-router/normalization';
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

function rawAnalysis(overrides: Partial<SemanticQuestionAnalysis>) {
  const value = analysis(overrides);
  const { raw_question: _rawQuestion, ...withoutRawQuestion } = value;
  return withoutRawQuestion;
}

describe('divination router v1.1', () => {
  it('routes internal reflection and advice to tarot', () => {
    const result = routeDivinationMethod(analysis({
      raw_question: '我为什么一直舍不得离开这段关系？',
      normalized_question: '我舍不得离开这段关系的内在原因是什么？',
      domain: 'relationship', primary_goal: 'advice', secondary_goal: 'inner_state',
      answer_shape: 'reflection', internal_focus: 0.95, external_event_focus: 0.2,
      binary_nature: 0.15, decision_required: true,
    }));
    expect(result.recommendedMethod).toBe('tarot');
    expect(result.clarificationRequired).toBe(false);
  });

  it('routes short-term event development to lenormand', () => {
    const result = routeDivinationMethod(analysis({
      raw_question: '未来一个月我们会怎么发展？', domain: 'relationship',
      primary_goal: 'event_forecast', answer_shape: 'prediction', time_horizon: 'months',
      internal_focus: 0.15, external_event_focus: 0.95, binary_nature: 0.2, specificity: 0.8,
    }));
    expect(result.recommendedMethod).toBe('lenormand');
  });

  it('routes a concrete yes/no outcome to liuyao', () => {
    const result = routeDivinationMethod(analysis({
      raw_question: '三个月内我们能不能复合？', domain: 'relationship',
      primary_goal: 'event_outcome', answer_shape: 'yes_no', time_horizon: 'months',
      specificity: 0.95, internal_focus: 0.1, external_event_focus: 0.95,
      binary_nature: 0.98, timing_need: 0.35,
    }));
    expect(result.recommendedMethod).toBe('liuyao');
  });

  it('routes long-term repeated patterns to astrology', () => {
    const result = routeDivinationMethod(analysis({
      raw_question: '为什么我每段恋爱都会重复同样的问题？', domain: 'relationship',
      primary_goal: 'long_term_pattern', answer_shape: 'long_term_map', time_horizon: 'multi_year',
      specificity: 0.8, internal_focus: 0.85, external_event_focus: 0.1,
      binary_nature: 0.05, long_term_pattern: 0.98,
    }));
    expect(result.recommendedMethod).toBe('astrology');
  });

  it('defaults a broad relationship-domain question to tarot without clarification', () => {
    const normalized = normalizeSemanticAnalysis('看看我的感情。', rawAnalysis({
      domain: 'relationship', primary_goal: 'relationship_dynamic', secondary_goal: 'event_forecast',
      answer_shape: 'long_term_map', time_horizon: 'unspecified', specificity: 0.25,
      internal_focus: 0.45, external_event_focus: 0.6, long_term_pattern: 0.4,
      question_clarity: 0.4, core_information_missing: true,
    }));
    const result = routeDivinationMethod(normalized);
    expect(normalized.core_information_missing).toBe(false);
    expect(normalized.answer_shape).toBe('reflection');
    expect(result.clarificationRequired).toBe(false);
    expect(result.recommendedMethod).toBe('tarot');
  });

  it('clarifies a vague future question even if AI invents a life cycle', () => {
    const normalized = normalizeSemanticAnalysis('我的未来怎么样？', rawAnalysis({
      domain: 'general', primary_goal: 'life_cycle', secondary_goal: 'long_term_pattern',
      answer_shape: 'long_term_map', time_horizon: 'multi_year', specificity: 0.4,
      internal_focus: 0.5, external_event_focus: 0.3, long_term_pattern: 0.8,
      question_clarity: 0.3, core_information_missing: false,
    }));
    const result = routeDivinationMethod(normalized);
    expect(normalized.core_information_missing).toBe(true);
    expect(normalized.question_clarity).toBe(0.05);
    expect(result.clarificationRequired).toBe(true);
    expect(result.recommendedMethod).toBeNull();
  });

  it('prioritizes process over a surface yes/no phrase', () => {
    const normalized = normalizeSemanticAnalysis(
      '他这个月会不会联系我我当然想知道，但我更想看我们会先冷着、再联系还是直接断掉。',
      rawAnalysis({
        domain: 'relationship', primary_goal: 'relationship_dynamic', secondary_goal: 'event_outcome',
        answer_shape: 'prediction', time_horizon: 'months', specificity: 0.8,
        internal_focus: 0.25, external_event_focus: 0.8, binary_nature: 0.8,
        long_term_pattern: 0.2, question_clarity: 0.9,
      }),
    );
    const result = routeDivinationMethod(normalized);
    expect(normalized.primary_goal).toBe('event_forecast');
    expect(normalized.binary_nature).toBeLessThanOrEqual(0.55);
    expect(result.recommendedMethod).toBe('lenormand');
  });

  it('does not treat persistence in one current relationship as a long-term life pattern', () => {
    const normalized = normalizeSemanticAnalysis('为什么我一直舍不得离开这段关系？', rawAnalysis({
      domain: 'relationship', primary_goal: 'long_term_pattern', secondary_goal: 'inner_state',
      answer_shape: 'reflection', time_horizon: 'multi_year', specificity: 0.75,
      internal_focus: 0.9, external_event_focus: 0.15, binary_nature: 0.1,
      long_term_pattern: 0.9, question_clarity: 0.9,
    }));
    const result = routeDivinationMethod(normalized);
    expect(normalized.primary_goal).not.toBe('long_term_pattern');
    expect(normalized.long_term_pattern).toBeLessThanOrEqual(0.35);
    expect(result.recommendedMethod).toBe('tarot');
  });

  it('clarifies when the question is extremely ambiguous', () => {
    const result = routeDivinationMethod(analysis({
      raw_question: '看看以后', domain: 'general', primary_goal: 'advice', secondary_goal: null,
      answer_shape: 'reflection', time_horizon: 'unspecified', specificity: 0.05,
      internal_focus: 0.25, external_event_focus: 0.25, binary_nature: 0.1,
      question_clarity: 0.1, core_information_missing: true,
    }));
    expect(result.clarificationRequired).toBe(true);
    expect(result.recommendedMethod).toBeNull();
  });
});
