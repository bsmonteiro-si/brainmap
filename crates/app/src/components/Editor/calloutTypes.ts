import { Bot, BookOpen, HelpCircle, Lightbulb, FlaskConical, BookA, Sigma, TriangleAlert, type LucideIcon } from "lucide-react";

export interface CalloutTypeDef {
  color: string;
  label: string;
  Icon: LucideIcon;
}

export const CALLOUT_TYPES: Record<string, CalloutTypeDef> = {
  "ai-answer": { color: "#4a9eff", label: "AI Answer", Icon: Bot },
  source: { color: "#f39c12", label: "Source", Icon: BookOpen },
  question: { color: "#9b59b6", label: "Question", Icon: HelpCircle },
  "key-insight": { color: "#27ae60", label: "Key Insight", Icon: Lightbulb },
  example: { color: "#17a2b8", label: "Example", Icon: FlaskConical },
  definition: { color: "#e67e22", label: "Definition", Icon: BookA },
  math: { color: "#e74c3c", label: "Math", Icon: Sigma },
  attention: { color: "#ff6b35", label: "Attention", Icon: TriangleAlert },
};

/** Ordered list for UI (toolbar picker, etc.) */
export const CALLOUT_TYPE_ENTRIES = Object.entries(CALLOUT_TYPES) as [
  string,
  CalloutTypeDef,
][];

/** Default styling for callout types not in CALLOUT_TYPES */
export const CALLOUT_FALLBACK: Pick<CalloutTypeDef, "color" | "label"> = {
  color: "#8e8e93",
  label: "",
};

/**
 * Matches the callout syntax on the first line of a blockquote paragraph's
 * leading text node. Group 1 = type slug, Group 2 = optional title.
 * Uses multiline flag so `$` matches end-of-line (react-markdown merges
 * consecutive blockquote lines into one <p> with \n separators).
 */
export const CALLOUT_RE = /^\[!(\w[\w-]*)\][ \t]*(.*)$/m;
