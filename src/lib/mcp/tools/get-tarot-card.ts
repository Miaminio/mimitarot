import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { allTarotCards } from "../../tarot-data";

export default defineTool({
  name: "get_tarot_card",
  title: "Get tarot card meaning",
  description:
    "Look up one tarot card by Chinese or English name (or partial name) and return its full meaning: imagery, upright and reversed interpretations, and background.",
  inputSchema: {
    name: z
      .string()
      .min(1)
      .describe("Card name in Chinese or English, e.g. 愚者 or The Fool."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ name }) => {
    const q = name.trim().toLowerCase();
    const card =
      allTarotCards.find(
        (c) => c.name === name.trim() || c.nameEn.toLowerCase() === q,
      ) ??
      allTarotCards.find(
        (c) => c.name.includes(name.trim()) || c.nameEn.toLowerCase().includes(q),
      );

    if (!card) {
      throw new ToolError(`No tarot card matched "${name}".`);
    }

    const text = [
      `${card.name}（${card.nameEn}）${card.number ? `· ${card.number}` : ""}`,
      `牌组：${card.arcana === "major" ? "大阿尔卡纳" : `小阿尔卡纳${card.suit ? ` · ${card.suit}` : ""}`}`,
      `画面：${card.visualDescription}`,
      `正位关键词：${card.upright}`,
      `正位解读：${card.uprightDeep}`,
      `逆位关键词：${card.reversed}`,
      `逆位提醒：${card.reversedWarning}`,
      `背景：${card.description}`,
    ].join("\n");

    return { content: [{ type: "text" as const, text }], structuredContent: { card } };
  },
});
