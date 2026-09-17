import { useMemo, useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { analyzeQuestion } from '@/lib/divination-router/api';
import { routeDivinationMethod } from '@/lib/divination-router/router';
import type {
  DivinationMethod,
  QuestionDomain,
  RouterResult,
  SemanticQuestionAnalysis,
} from '@/lib/divination-router/types';

const methodLabels: Record<DivinationMethod, string> = {
  tarot: '塔罗 Tarot',
  lenormand: '雷诺曼 Lenormand',
  liuyao: '六爻 Liu Yao',
  astrology: '西方占星 Astrology',
};

const examples = [
  '为什么我一直舍不得离开这段关系？',
  '未来一个月我和他会怎么发展？',
  '三个月内我们到底能不能复合？',
  '为什么我每段恋爱都会重复同样的问题？',
  '看看以后',
];

interface ClarificationOption {
  label: string;
  detail: string;
}

function getClarificationOptions(domain: QuestionDomain): ClarificationOption[] {
  if (domain === 'relationship') {
    return [
      { label: '现在的关系与内心状态', detail: '我主要想了解现在这段关系的状态、双方感受以及我需要关注什么。' },
      { label: '近期会怎么发展', detail: '我主要想了解接下来一段时间这段关系会发生什么、如何发展。' },
      { label: '某件具体事情能不能成', detail: '我主要想判断这段关系里一件明确的事情最终能不能实现。' },
      { label: '长期感情模式', detail: '我主要想了解自己跨越多段关系反复出现的长期感情模式。' },
    ];
  }

  if (domain === 'career' || domain === 'education') {
    return [
      { label: '当前困境与建议', detail: '我主要想了解当前遇到的困境、原因以及应该如何应对。' },
      { label: '近期会有什么变化', detail: '我主要想了解接下来一段时间会发生哪些现实变化。' },
      { label: '某个结果能不能实现', detail: '我主要想判断一个明确目标或结果最终能不能实现。' },
      { label: '长期发展方向', detail: '我主要想了解未来几年长期的发展模式与人生周期。' },
    ];
  }

  return [
    { label: '当前状态与建议', detail: '我主要想了解自己现在的状态、原因以及需要关注什么。' },
    { label: '近期会发生什么', detail: '我主要想了解接下来一段时间会发生什么以及事情如何发展。' },
    { label: '具体事情能不能成', detail: '我主要想判断一件明确的事情最终能不能实现。' },
    { label: '长期人生方向', detail: '我主要想了解未来几年长期的人生模式、方向和周期。' },
  ];
}

const RouterDemo = () => {
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState<SemanticQuestionAnalysis | null>(null);
  const [result, setResult] = useState<RouterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  const rankedScores = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.scores).sort((a, b) => b[1] - a[1]);
  }, [result]);

  const clarificationOptions = useMemo(
    () => (analysis ? getClarificationOptions(analysis.domain) : []),
    [analysis],
  );

  const runAnalysis = async (value?: string) => {
    const q = (value ?? question).trim();
    if (!q || loading) return;

    setQuestion(q);
    setLoading(true);
    setError('');
    setAnalysis(null);
    setResult(null);
    setShowDebug(false);

    try {
      const semanticAnalysis = await analyzeQuestion(q);
      const routingResult = routeDivinationMethod(semanticAnalysis);
      setAnalysis(semanticAnalysis);
      setResult(routingResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const runClarification = (detail: string) => {
    const original = question.trim();
    if (!original) return;
    runAnalysis(`${original}\n补充说明：${detail}`);
  };

  return (
    <main className="min-h-screen bg-cosmic-gradient text-foreground px-4 py-10 md:py-16">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-gold/80 text-xs tracking-[0.2em] uppercase font-display">
            <Sparkles size={14} />
            Router Demo V1
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-gold-gradient">
            AI 占法推荐测试
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            输入一个真实问题。AI 只负责理解语义，最终占法由确定性 Router 规则计算。
          </p>
        </header>

        <section className="rounded-2xl border border-gold/15 bg-secondary/35 backdrop-blur-md p-4 md:p-6 space-y-4">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：我和前任未来一个月会不会复合？"
            className="w-full min-h-32 rounded-xl bg-background/60 border border-gold/20 px-4 py-3 resize-y focus:outline-none focus:border-gold/50 text-sm md:text-base"
          />

          <div className="flex flex-wrap gap-2">
            {examples.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => runAnalysis(item)}
                className="text-xs px-3 py-1.5 rounded-full border border-gold/15 bg-gold/5 hover:bg-gold/10 text-gold/75 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => runAnalysis()}
            disabled={!question.trim() || loading}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/30 text-gold px-5 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? '正在理解问题...' : '分析问题'}
          </button>

          {error && (
            <p className="text-sm text-red-300 border border-red-400/20 bg-red-400/5 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </section>

        {analysis && result && (
          <>
            <section className="rounded-2xl border border-gold/15 bg-background/40 p-5 md:p-6 space-y-4">
              <h2 className="font-display text-gold text-lg">AI 对问题的理解</h2>
              <div>
                <p className="text-xs text-muted-foreground mb-1">规范化后的核心问题</p>
                <p className="text-base leading-relaxed">{analysis.normalized_question}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <Info label="领域" value={analysis.domain} />
                <Info label="核心目标" value={analysis.primary_goal} />
                <Info label="答案形式" value={analysis.answer_shape} />
                <Info label="时间范围" value={analysis.time_horizon} />
              </div>
            </section>

            <section className="rounded-2xl border border-gold/25 bg-gold/5 p-5 md:p-7 text-center space-y-4">
              {result.clarificationRequired ? (
                <>
                  <p className="text-xs text-gold/60 tracking-widest font-display">需要确认一点</p>
                  <h2 className="text-xl md:text-2xl font-display text-gold">
                    当前问题过于模糊
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {result.clarificationQuestion}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto pt-2">
                    {clarificationOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        disabled={loading}
                        onClick={() => runClarification(option.detail)}
                        className="rounded-xl border border-gold/20 bg-background/35 px-4 py-3 text-sm text-gold/85 hover:bg-gold/10 hover:border-gold/35 transition-colors disabled:opacity-40"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    选择一项后会自动补充你的意图并重新推荐，不需要再填写一轮问卷。
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gold/60 tracking-widest font-display">推荐占法</p>
                  <h2 className="text-2xl md:text-4xl font-display text-gold-gradient">
                    {result.recommendedMethod
                      ? methodLabels[result.recommendedMethod]
                      : '暂无推荐'}
                  </h2>
                  <p className="text-sm md:text-base text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                    {result.recommendationReason}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Router confidence: {Math.round(result.routingConfidence * 100)}%
                    {result.usedFallback ? ' · 使用默认回退策略' : ''}
                  </div>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-gold/10 bg-secondary/25 overflow-hidden">
              <button
                onClick={() => setShowDebug((value) => !value)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm text-gold/80 hover:bg-gold/5 transition-colors"
              >
                <span>开发者详情</span>
                <span>{showDebug ? '收起' : '展开'}</span>
              </button>

              {showDebug && (
                <div className="border-t border-gold/10 p-5 grid lg:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <DebugRow label="explicit_intent" value={analysis.explicit_intent} />
                    <DebugRow label="underlying_intent" value={analysis.underlying_intent} />
                    <DebugRow label="secondary_goal" value={analysis.secondary_goal ?? 'null'} />
                    <DebugRow label="specificity" value={analysis.specificity} />
                    <DebugRow label="internal_focus" value={analysis.internal_focus} />
                    <DebugRow label="external_event_focus" value={analysis.external_event_focus} />
                    <DebugRow label="binary_nature" value={analysis.binary_nature} />
                    <DebugRow label="timing_need" value={analysis.timing_need} />
                    <DebugRow label="comparison_need" value={analysis.comparison_need} />
                    <DebugRow label="long_term_pattern" value={analysis.long_term_pattern} />
                    <DebugRow label="question_clarity" value={analysis.question_clarity} />
                    <DebugRow
                      label="core_information_missing"
                      value={String(analysis.core_information_missing)}
                    />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-3">Router Scores</p>
                    <div className="space-y-2">
                      {rankedScores.map(([method, score]) => (
                        <div
                          key={method}
                          className="flex items-center justify-between rounded-lg bg-background/40 px-3 py-2"
                        >
                          <span>{methodLabels[method as DivinationMethod]}</span>
                          <span className="font-mono text-gold">{Number(score).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    {result.reasonCodes.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs text-muted-foreground mb-2">reason_codes</p>
                        <div className="flex flex-wrap gap-2">
                          {result.reasonCodes.map((code) => (
                            <span
                              key={code}
                              className="rounded-full border border-gold/15 bg-gold/5 px-2.5 py-1 text-xs text-gold/70"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-secondary/40 border border-gold/10 px-3 py-3">
    <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
    <p className="font-mono text-xs text-foreground/90 break-words">{value}</p>
  </div>
);

const DebugRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex gap-3 items-start justify-between border-b border-gold/5 pb-2">
    <span className="text-muted-foreground font-mono text-xs">{label}</span>
    <span className="text-foreground/90 text-right break-words max-w-[60%]">
      {String(value)}
    </span>
  </div>
);

export default RouterDemo;
