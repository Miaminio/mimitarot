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
    const { question, cards, spreadType, persona } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const spreadLabel = spreadType === 'choice' ? '二选一牌阵' : '时间流牌阵（过去·现在·未来）';
    const positionLabels = spreadType === 'choice' ? ['选项A', '选项B'] : ['过去', '现在', '未来'];

    const cardDescriptions = cards.map((card: any, i: number) => {
      const orientation = card.isReversed ? '逆位' : '正位';
      return `位置「${positionLabels[i]}」：${card.name}（${card.nameEn}）— ${orientation} — 正位含义：${card.upright}；逆位含义：${card.reversed}。${card.description}`;
    }).join('\n');

    const personaPrompts: Record<string, string> = {
      seer: `你是一位毒舌但精准的塔罗预言家。你的风格犀利直接、一针见血，不绕弯子。你会用略带戏谑的语气指出问题的核心，但最终依然给出有建设性的方向。你的话虽然扎心，但句句属实。偶尔用反问句刺激思考。`,
      healer: `你是一位富有洞察力的塔罗牌解读师，擅长将塔罗牌的象征意义与提问者的实际情境相结合。你的解读风格温暖而深刻，既有神秘感又不失理性。你像一位慈爱的导师，用柔和的话语抚慰人心，给予力量和希望。`,
    };

    const systemPrompt = `${personaPrompts[persona] || personaPrompts.healer}

解读规则：
1. 先总览牌阵整体能量
2. 逐一解读每张牌在其位置上的含义，结合提问者的具体问题
3. 综合分析牌与牌之间的关联
4. 给出清晰、有建设性的建议
5. 语言${persona === 'seer' ? '犀利直率，偶尔带点幽默的毒舌' : '优美温暖，使用适当的比喻，充满关怀'}
6. 保持 400-600 字的长度
7. 使用 markdown 格式，用 **加粗** 突出关键词
8. 注意每张牌的正逆位状态，逆位时侧重解读逆位含义
9. 在解读末尾，以"---"分隔后附加一段"☯ 紫微简评"，结合当前月份（2026年2月），用东方哲学与紫微斗数的语言给出50字左右的运势提示`;

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
