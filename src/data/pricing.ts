import type { Pricing } from "@/lib/types";

/**
 * API pricing — USD per 1M tokens, from each provider's official pricing page
 * (June 2026). World models aren't token-priced (omitted). Open-weights models
 * show a representative hosted price; the real cost depends on the host.
 *
 * cacheReadPerM = cached-input (cache hit). cacheWritePerM = caching surcharge.
 */
export const pricing: Record<string, Pricing> = {
  "claude-opus-4-8": {
    inputPerM: 5,
    outputPerM: 25,
    cacheReadPerM: 0.5,
    cacheWritePerM: 6.25,
  },
  "claude-sonnet-4-6": {
    inputPerM: 3,
    outputPerM: 15,
    cacheReadPerM: 0.3,
    cacheWritePerM: 3.75,
  },
  "claude-haiku-4-5": {
    inputPerM: 1,
    outputPerM: 5,
    cacheReadPerM: 0.1,
    cacheWritePerM: 1.25,
  },
  "gpt-5-5": { inputPerM: 5, outputPerM: 30, cacheReadPerM: 0.5 },
  "gpt-5-2": { inputPerM: 1.75, outputPerM: 14, cacheReadPerM: 0.175 },
  "gemini-3-1-pro": { inputPerM: 2, outputPerM: 12, cacheReadPerM: 0.2 },
  "gemini-3-pro": { inputPerM: 2, outputPerM: 12, cacheReadPerM: 0.2 },
  "gemini-3-flash": { inputPerM: 0.5, outputPerM: 3, cacheReadPerM: 0.05 },
  "deepseek-v4-pro": {
    inputPerM: 0.435,
    outputPerM: 0.87,
    cacheReadPerM: 0.0036,
  },
  "deepseek-v4-flash": {
    inputPerM: 0.14,
    outputPerM: 0.28,
    cacheReadPerM: 0.0028,
  },
  "kimi-k2-6": { inputPerM: 0.95, outputPerM: 4, cacheReadPerM: 0.16 },
  "glm-5-1": { inputPerM: 1.4, outputPerM: 4.4, cacheReadPerM: 0.26 },
  "qwen3-6-27b": { inputPerM: 0.25, outputPerM: 1.49 },
  "llama-4-maverick": { inputPerM: 0.35, outputPerM: 0.85, cacheReadPerM: 0.27 },
  "mistral-large-3": { inputPerM: 0.5, outputPerM: 1.5 },
  "grok-4-3": { inputPerM: 1.25, outputPerM: 2.5, cacheReadPerM: 0.2 },

  // --- Batch 2 (June 2026) ---
  "claude-opus-4-7": {
    inputPerM: 5,
    outputPerM: 25,
    cacheReadPerM: 0.5,
    cacheWritePerM: 6.25,
  },
  "claude-opus-4-6": {
    inputPerM: 5,
    outputPerM: 25,
    cacheReadPerM: 0.5,
    cacheWritePerM: 6.25,
  },
  "gpt-5-4": { inputPerM: 2.5, outputPerM: 15, cacheReadPerM: 0.25 },
  "gemini-3-5-flash": { inputPerM: 1.5, outputPerM: 9, cacheReadPerM: 0.15 },
  "gemini-2-5-pro": { inputPerM: 1.25, outputPerM: 10, cacheReadPerM: 0.125 },
  "grok-4-20": { inputPerM: 2, outputPerM: 6, cacheReadPerM: 0.2 },
  "deepseek-v3-2": { inputPerM: 0.28, outputPerM: 0.42, cacheReadPerM: 0.18 },
  "kimi-k2-thinking": { inputPerM: 0.6, outputPerM: 2.5, cacheReadPerM: 0.15 },
  "qwen3-7-max": { inputPerM: 2.5, outputPerM: 7.5, cacheReadPerM: 0.25 },
  "qwen3-6-35b-a3b": { inputPerM: 0.25, outputPerM: 1.49 },
  "llama-4-scout": { inputPerM: 0.17, outputPerM: 0.66 },
  "nova-2-pro": { inputPerM: 1.25, outputPerM: 10, cacheReadPerM: 1.25 },
  "nemotron-3-ultra": { inputPerM: 0.37, outputPerM: 1.08 },
  "minimax-m3": { inputPerM: 0.6, outputPerM: 2.4, cacheReadPerM: 0.12 },
  // muse-spark (free via Meta AI) and doubao-seed-2-pro (no public token price)
  // are intentionally omitted — no citable per-token pricing.
};
