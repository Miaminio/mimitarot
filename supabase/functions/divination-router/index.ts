import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOMAINS = new Set([
  "relationship",
  "career",
  "education",
  "money",
  "family",
  "social",
  "self",
  "general",
]);

const GOALS = new Set([
  "inner_state",
  "hidden_factor",
  "advice",
  "relationship_dynamic",
  "event_forecast",
  "event_outcome",
  "timing",
  "choice",
  "long_term_pattern",
  "life_cycle",
]);

const ANSWER_SHAPES = new Set([
  "explanation",
  "reflection",
  "advice",
  "prediction",
  "yes_no",
  "timing",
  "comparison",
  "long_term_map",
]);

const TIME_HORIZONS = new Set([
  "current",
  "days",
  "weeks",
  "months",
  "year",
  "multi_year",
  "unspecified",
]);

function clamp01(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(1, Math.max(0, n));
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function enumValue(value: unknown, allowed: Set<string>, fallback: string): string {
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf("{");
    const last = trimmed.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(trimmed.slice(first, last + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

function normalizeAnalysis(raw: any, question: string) {
  const primaryGoal = enumValue(raw?.primary_goal, GOALS, "advice");
  const secondaryGoal =
    raw?.secondary_goal === null || raw?.secondary_goal === undefined
      ? null
      : enumValue(raw.secondary_goal, GOALS, "advice");

  return {
    raw_question: question,
    normalized_question: stringValue(raw?.normalized_question, question),
    domain: enumValue(raw?.domain, DOMAINS, "general"),
    explicit_intent: stringValue(raw?.explicit_intent, "理解当前问题"),
    underlying_intent: stringValue(raw?.underlying_intent, "获得更清晰的判断"),
    primary_goal: primaryGoal,
    secondary_goal: secondaryGoal,
    answer_shape: enumValue(raw?.answer_shape, ANSWER_SHAPES, "reflection"),
    time_horizon: enumValue(raw?.time_horizon, TIME_HORIZONS, "unspecified"),
    specificity: clamp01(raw?.specificity, 0.5),
    internal_focus: clamp01(raw?.internal_focus, 0.5),
    external_event_focus: clamp01(raw?.external_event_focus, 0.5),
    binary_nature: clamp01(raw?.binary_nature, 0.2),
    timing_need: clamp01(raw?.timing_need, 0),
    comparison_need: clamp01(raw?.comparison_need, 0),
    long_term_pattern: clamp01(raw?.long_term_pattern, 0),
    decision_required: Boolean(raw?.decision_required),
    question_clarity: clamp01(raw?.question_clarity, 0.5),
    core_information_missing: Boolean(raw?.core_information_missing),
  };
}

const systemPrompt = `你是一个“用户问题语义解析器”。你的唯一任务是理解用户真正想问什么，并输出严格 JSON。

重要限制：
- 不要推荐任何占卜方法。
- 不要提到塔罗、雷诺曼、六爻、占星或任何其他占卜体系。
- 不要回答用户的问题本身，不做预测，不给建议。
- 不要仅靠关键词分类；要判断整句话的核心诉求。
- “复杂”不等于“模糊”。只要能合理理解核心诉求，就不要把问题标为缺少核心信息。
- 只有极度模糊、连领域或核心目标都无法合理推断时，core_information_missing 才设为 true。
- 对“看看我的感情”“最近事业怎么样”这类虽简短但仍可合理理解的问题，core_information_missing 应为 false。
- 对“看看以后”“帮我看看”“未来怎么样”且没有任何上下文的问题，可以设为 true。

必须输出以下字段，禁止增加字段：
{
  "normalized_question": string,
  "domain": "relationship" | "career" | "education" | "money" | "family" | "social" | "self" | "general",
  "explicit_intent": string,
  "underlying_intent": string,
  "primary_goal": "inner_state" | "hidden_factor" | "advice" | "relationship_dynamic" | "event_forecast" | "event_outcome" | "timing" | "choice" | "long_term_pattern" | "life_cycle",
  "secondary_goal": 上述 goal 之一或 null,
  "answer_shape": "explanation" | "reflection" | "advice" | "prediction" | "yes_no" | "timing" | "comparison" | "long_term_map",
  "time_horizon": "current" | "days" | "weeks" | "months" | "year" | "multi_year" | "unspecified",
  "specificity": 0到1,
  "internal_focus": 0到1,
  "external_event_focus": 0到1,
  "binary_nature": 0到1,
  "timing_need": 0到1,
  "comparison_need": 0到1,
  "long_term_pattern": 0到1,
  "decision_required": boolean,
  "question_clarity": 0到1,
  "core_information_missing": boolean
}

Goal 判断规则：
- inner_state：当前感受、动机、内在状态、自我理解。
- hidden_factor：为什么会这样、当前局势背后的原因或隐藏因素。
- advice：核心诉求是“我该怎么办/要不要继续/如何应对”，尤其是复杂现实或关系决策。
- relationship_dynamic：关注双方当前互动、关系状态和彼此动力，而非一个明确未来事件的成败。
- event_forecast：关注接下来会发生什么、事件如何展开、现实发展过程或事件序列。
- event_outcome：关注一个具体事件最终是否发生、是否成功、能否实现。
- timing：核心诉求是何时发生。
- choice：明确比较 A/B、两个方案或两条路径的结果。
- long_term_pattern：跨较长时间反复出现的人格、关系或人生模式。
- life_cycle：半年到多年的人生阶段、周期和长期趋势。

特别注意：
- “我会不会只是因为害怕孤独才舍不得他？”虽然有“会不会”，核心是自我理解，不是事件成败。
- “未来一个月我们会怎么发展？”核心是发展过程，应标 event_forecast。
- “未来一个月我们能不能复合？”核心是一个具体结果，应标 event_outcome。
- “为什么我最近在感情里没安全感？”偏当前原因/状态。
- “为什么我每段恋爱都会没有安全感？”是长期重复模式。
- 如果用户表面在问“为什么他还没联系我”，但整段话真正想确认的是“他之后还会不会联系”，underlying_intent 和 primary_goal 应体现真正诉求。

数值字段不是概率，只表示语义特征强度。请尽量拉开明显特征，不要所有值都集中在 0.5。
只输出 JSON，不要 Markdown，不要解释。`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";

    if (!question) {
      return new Response(JSON.stringify({ error: "请输入一个问题" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (question.length > 1500) {
      return new Response(JSON.stringify({ error: "问题过长，请精简到 1500 字以内" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `请解析这个用户问题：\n\n${question}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("divination-router AI gateway error:", aiResponse.status, errorText);

      const status = aiResponse.status === 429 || aiResponse.status === 402
        ? aiResponse.status
        : 500;
      const message = aiResponse.status === 429
        ? "请求过于频繁，请稍后再试"
        : aiResponse.status === 402
        ? "AI 额度不足"
        : "AI 问题理解服务暂时不可用";

      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await aiResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("AI returned empty semantic analysis");
    }

    const rawAnalysis = extractJson(content);
    const analysis = normalizeAnalysis(rawAnalysis, question);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("divination-router error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
