import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, cards, spreadType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const spreadLabel = spreadType === 'choice' ? '二选一牌阵' : '时间流牌阵（过去·现在·未来）';
    const positionLabels = spreadType === 'choice' ? ['选项A', '选项B'] : ['过去', '现在', '未来'];

    const cardDescriptions = cards.map((card: any, i: number) => 
      `位置「${positionLabels[i]}」：${card.name}（${card.nameEn}）— 正位含义：${card.upright}；逆位含义：${card.reversed}。${card.description}`
    ).join('\n');

    const systemPrompt = `你是一位富有洞察力的塔罗牌解读师，擅长将塔罗牌的象征意义与提问者的实际情境相结合。你的解读风格温暖而深刻，既有神秘感又不失理性。

解读规则：
1. 先总览牌阵整体能量
2. 逐一解读每张牌在其位置上的含义，结合提问者的具体问题
3. 综合分析牌与牌之间的关联
4. 给出清晰、有建设性的建议
5. 语言优美，使用适当的比喻，但避免过于晦涩
6. 保持 400-600 字的长度
7. 使用 markdown 格式，用 **加粗** 突出关键词`;

    const userPrompt = `提问者的问题：${question}

牌阵类型：${spreadLabel}

抽到的牌：
${cardDescriptions}

请为提问者做一次深度解读。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tarot-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
