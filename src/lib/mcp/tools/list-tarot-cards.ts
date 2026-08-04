import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { allTarotCards } from "../../tarot-data";

export default defineTool({
  name: "list_tarot_cards",
  title: "List tarot cards",
  description:
    "List the tarot deck used by this app (78 cards). Optionally filter to major or minor arcana. Returns names and short upright/reversed keywords.",
  inputSchema: {
    arcana: z
      .enum(["all", "major", "minor"])
      .optional()
      .describe("Which arcana to list. Defaults to all."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ arcana = "all" }) => {
    const cards = allTarotCards.filter(
      (c) => arcana === "all" || c.arcana === arcana,
    );
    const rows = cards.map((c) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      arcana: c.arcana,
      suit: c.suit,
      number: c.number,
      upright: c.upright,
      reversed: c.reversed,
    }));
    return {
      content: [
        {
          type: "text" as const,
          text: rows
            .map(
              (r) =>
                `${r.name} (${r.nameEn}) — 正位: ${r.upright} / 逆位: ${r.reversed}`,
            )
            .join("\n"),
        },
      ],
      structuredContent: { count: rows.length, cards: rows },
    };
  },
});
