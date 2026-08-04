import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getRandomCards } from "../../tarot-data";

const SPREADS = {
  timeline: { label: "时间流牌阵（过去·现在·未来）", positions: ["过去", "现在", "未来"] },
  choice: { label: "二选一牌阵", positions: ["选项A", "选项B"] },
  single: { label: "单张指引", positions: ["指引"] },
} as const;

export default defineTool({
  name: "draw_tarot_spread",
  title: "Draw a tarot spread",
  description:
    "Shuffle this app's tarot deck and draw a spread (timeline, choice, or single card) with random upright/reversed orientation. Returns each drawn card with its position and meanings so the caller can interpret the reading.",
  inputSchema: {
    question: z.string().optional().describe("The querent's question, echoed back in the result."),
    spread: z
      .enum(["timeline", "choice", "single"])
      .optional()
      .describe("Spread type. Defaults to timeline (past / present / future)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: ({ question, spread = "timeline" }) => {
    const config = SPREADS[spread];
    const cards = getRandomCards(config.positions.length);

    const drawn = cards.map((card, i) => {
      const isReversed = Math.random() < 0.5;
      return {
        position: config.positions[i],
        name: card.name,
        nameEn: card.nameEn,
        orientation: isReversed ? "逆位" : "正位",
        keywords: isReversed ? card.reversed : card.upright,
        meaning: isReversed ? card.reversedWarning : card.uprightDeep,
        description: card.description,
      };
    });

    const text = [
      question ? `问题：${question}` : null,
      `牌阵：${config.label}`,
      ...drawn.map(
        (d) =>
          `位置「${d.position}」：${d.name}（${d.nameEn}）— ${d.orientation}\n关键词：${d.keywords}\n解读：${d.meaning}`,
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      content: [{ type: "text" as const, text }],
      structuredContent: { spread, question: question ?? null, cards: drawn },
    };
  },
});
