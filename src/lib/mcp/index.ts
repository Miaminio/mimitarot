import { defineMcp } from "@lovable.dev/mcp-js";
import listTarotCardsTool from "./tools/list-tarot-cards";
import getTarotCardTool from "./tools/get-tarot-card";
import drawTarotSpreadTool from "./tools/draw-tarot-spread";

export default defineMcp({
  name: "cosmic-card-oracle",
  title: "Cosmic Card Oracle",
  version: "0.1.0",
  instructions:
    "Tarot tools for Cosmic Card Oracle (星光塔罗). Use `list_tarot_cards` to browse the 78-card deck, `get_tarot_card` for one card's full upright/reversed meaning, and `draw_tarot_spread` to shuffle and draw a reading (timeline, choice, or single card) that you then interpret for the user. All data is the app's public tarot encyclopedia; readings are for entertainment and self-reflection only.",
  tools: [listTarotCardsTool, getTarotCardTool, drawTarotSpreadTool],
});
