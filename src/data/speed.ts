import type { ScoreSource, Speed } from "@/lib/types";

/**
 * Output speed — median output tokens/sec, from Artificial Analysis
 * (https://artificialanalysis.ai/models), observed 2026-06-05.
 *
 * Each figure is AA's headline "Output Speed" (throughput, NOT latency / time to
 * first token) for that model's PRIMARY listing; the reasoning-effort or
 * provider variant AA defaults to is recorded in `notes`. Speeds vary by
 * provider and effort and are third-party-reported, so every entry is
 * `verified: false` and cross-model comparisons are directional — exactly the
 * caveat the leaderboard already applies to benchmark scores.
 *
 * Where AA publishes no consolidated median (e.g. DeepSeek V3.2, which lists only
 * widely-varying per-provider numbers), the model is omitted rather than guessed.
 * Open-weights models show the throughput of AA's reference endpoint; self-hosted
 * speed can differ substantially.
 */
const OBSERVED = "2026-06-05";

const aa = (path: string): ScoreSource => ({
  kind: "third-party",
  label: "Artificial Analysis",
  url: `https://artificialanalysis.ai/models/${path}`,
});

export const speed: Record<string, Speed> = {
  // Anthropic
  "claude-opus-4-8": {
    outputTps: 57.4,
    source: aa("claude-opus-4-8"),
    date: OBSERVED,
    verified: false,
    notes: "Adaptive reasoning, max effort (AA default listing).",
  },
  "claude-sonnet-4-6": {
    outputTps: 43.6,
    source: aa("claude-sonnet-4-6"),
    date: OBSERVED,
    verified: false,
    notes:
      "Non-reasoning variant (AA default); the adaptive-reasoning variant lists ~57.6 t/s.",
  },
  "claude-haiku-4-5": {
    outputTps: 91.2,
    source: aa("claude-4-5-haiku"),
    date: OBSERVED,
    verified: false,
    notes: "Non-reasoning, Anthropic API. AA slug: claude-4-5-haiku.",
  },
  "claude-opus-4-7": {
    outputTps: 49.0,
    source: aa("claude-opus-4-7"),
    date: OBSERVED,
    verified: false,
    notes: "Adaptive reasoning, max effort (AA default listing).",
  },
  "claude-opus-4-6": {
    outputTps: 41.1,
    source: aa("claude-opus-4-6-adaptive"),
    date: OBSERVED,
    verified: false,
    notes: "Adaptive reasoning, max effort. AA slug: claude-opus-4-6-adaptive.",
  },

  // OpenAI — default slugs resolve to the (xhigh) reasoning-effort variant.
  "gpt-5-5": {
    outputTps: 63.4,
    source: aa("gpt-5-5"),
    date: OBSERVED,
    verified: false,
    notes: "xhigh reasoning effort (AA default); lower efforts list ~57–61 t/s.",
  },
  "gpt-5-4": {
    outputTps: 79.4,
    source: aa("gpt-5-4"),
    date: OBSERVED,
    verified: false,
    notes: "xhigh reasoning effort (AA default listing).",
  },
  "gpt-5-2": {
    outputTps: 73.3,
    source: aa("gpt-5-2"),
    date: OBSERVED,
    verified: false,
    notes: "xhigh reasoning effort (AA default listing).",
  },

  // Google DeepMind
  "gemini-3-1-pro": {
    outputTps: 139.7,
    source: aa("gemini-3-1-pro-preview"),
    date: OBSERVED,
    verified: false,
    notes: "Gemini 3.1 Pro Preview (reasoning), AA default listing.",
  },
  "gemini-3-pro": {
    outputTps: 123.8,
    source: aa("gemini-3-pro/providers"),
    date: OBSERVED,
    verified: false,
    notes:
      "(high) variant; AA model tile read N/A, providers page lists one provider (Databricks) at 123.8 t/s.",
  },
  "gemini-3-flash": {
    outputTps: 175.3,
    source: aa("gemini-3-flash"),
    date: OBSERVED,
    verified: false,
    notes: "Gemini 3 Flash Preview (non-reasoning), AA default listing.",
  },
  "gemini-3-5-flash": {
    outputTps: 190.1,
    source: aa("gemini-3-5-flash"),
    date: OBSERVED,
    verified: false,
    notes: "(high) variant (AA default); Google API.",
  },
  "gemini-2-5-pro": {
    outputTps: 142.2,
    source: aa("gemini-2-5-pro"),
    date: OBSERVED,
    verified: false,
    notes: "AA headline Output Speed.",
  },

  // DeepSeek (V3.2 omitted — AA publishes no consolidated median for it)
  "deepseek-v4-pro": {
    outputTps: 53.2,
    source: aa("deepseek-v4-pro"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning, max effort (AA default); varies widely by provider.",
  },
  "deepseek-v4-flash": {
    outputTps: 132.2,
    source: aa("deepseek-v4-flash"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning, max effort (AA default); DeepSeek API.",
  },

  // Moonshot (Kimi)
  "kimi-k2-6": {
    outputTps: 44.1,
    source: aa("kimi-k2-6"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning (AA default); median across providers.",
  },
  "kimi-k2-thinking": {
    outputTps: 119.0,
    source: aa("kimi-k2-thinking"),
    date: OBSERVED,
    verified: false,
    notes: "Median across providers; speed varies widely by provider.",
  },

  // Z.ai (Zhipu)
  "glm-5-1": {
    outputTps: 57.0,
    source: aa("glm-5-1"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning variant (AA default); median across providers.",
  },

  // Alibaba (Qwen) — AA default listings are the reasoning variants.
  "qwen3-6-27b": {
    outputTps: 60.0,
    source: aa("qwen3-6-27b"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning variant (AA default); Alibaba API.",
  },
  "qwen3-7-max": {
    outputTps: 105.8,
    source: aa("qwen3-7-max"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning (AA default); Alibaba API.",
  },
  "qwen3-6-35b-a3b": {
    outputTps: 185.6,
    source: aa("qwen3-6-35b-a3b"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning variant (AA default); non-reasoning can be faster.",
  },

  // Meta — median across providers (varies hugely; some hosts much faster).
  "llama-4-maverick": {
    outputTps: 104.7,
    source: aa("llama-4-maverick"),
    date: OBSERVED,
    verified: false,
    notes: "Non-reasoning; median across providers.",
  },
  "llama-4-scout": {
    outputTps: 102.9,
    source: aa("llama-4-scout"),
    date: OBSERVED,
    verified: false,
    notes: "Non-reasoning; median across providers.",
  },

  // Mistral
  "mistral-large-3": {
    outputTps: 49.8,
    source: aa("mistral-large-3"),
    date: OBSERVED,
    verified: false,
    notes: "Non-reasoning; Mistral API (faster hosts exist on the providers tab).",
  },

  // xAI
  "grok-4-3": {
    outputTps: 186.9,
    source: aa("grok-4-3"),
    date: OBSERVED,
    verified: false,
    notes: "(high) reasoning effort (AA primary listing).",
  },
  "grok-4-20": {
    outputTps: 182.1,
    source: aa("grok-4-20"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning variant (AA primary listing); xAI API.",
  },

  // Amazon
  "nova-2-pro": {
    outputTps: 114.5,
    source: aa("nova-2-0-pro"),
    date: OBSERVED,
    verified: false,
    notes: "Nova 2.0 Pro Preview (non-reasoning), Amazon API. AA slug: nova-2-0-pro.",
  },

  // NVIDIA
  "nemotron-3-ultra": {
    outputTps: 140.3,
    source: aa("nvidia-nemotron-3-ultra-550b-a55b"),
    date: OBSERVED,
    verified: false,
    notes:
      "Reasoning (AA default); headline median (one provider serves it >400 t/s).",
  },

  // MiniMax
  "minimax-m3": {
    outputTps: 38.8,
    source: aa("minimax-m3"),
    date: OBSERVED,
    verified: false,
    notes: "Reasoning (AA default); MiniMax API.",
  },
};
