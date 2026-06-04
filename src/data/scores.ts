import type { Score, ScoreSource } from "@/lib/types";

/**
 * Sourced benchmark data (as of June 2026).
 *
 * Every figure is cited to its source and marked `verified: false`: these are
 * vendor-reported or third-party numbers that Crosshair has NOT independently
 * reproduced. Benchmarks and harnesses differ between vendors (reasoning effort,
 * tool use, prompt format), so treat cross-model comparisons as directional.
 * Humanity's Last Exam is recorded WITHOUT external tools for comparability.
 * Where a provider doesn't publish a benchmark, the cell is simply absent —
 * nothing is filled in by guesswork.
 */

const REPORTED = "2026-06-04";

const vendor = (label: string, url?: string): ScoreSource => ({
  kind: "vendor",
  label,
  url,
});
const thirdParty = (label: string, url?: string): ScoreSource => ({
  kind: "third-party",
  label,
  url,
});

// Shared third-party sources used across many models.
const arena = thirdParty("LMArena (arena.ai)", "https://arena.ai/leaderboard/text");
const aa = thirdParty("Artificial Analysis", "https://artificialanalysis.ai/models");
// Vals AI — independent, in-house professional-domain evaluations.
const valsCorpfin = thirdParty("Vals AI — CorpFin v2", "https://www.vals.ai/benchmarks/corp_fin_v2");
const valsLegal = thirdParty("Vals AI — LegalBench", "https://www.vals.ai/benchmarks/legal_bench");
const valsTax = thirdParty("Vals AI — TaxEval v2", "https://www.vals.ai/benchmarks/tax_eval_v2");
const valsMed = thirdParty("Vals AI — MedCode", "https://www.vals.ai/benchmarks/medcode");

// Per-model vendor (or best-available) attribution for academic benchmarks.
const SRC = {
  opus48: vendor(
    "Anthropic — Claude Opus 4.8",
    "https://www.anthropic.com/news/claude-opus-4-8",
  ),
  sonnet46: vendor(
    "Anthropic — Claude Sonnet 4.6",
    "https://www.anthropic.com/news/claude-sonnet-4-6",
  ),
  haiku45: vendor(
    "Anthropic — Claude Haiku 4.5",
    "https://www.anthropic.com/news/claude-haiku-4-5",
  ),
  gpt55: vendor(
    "OpenAI — GPT-5.5",
    "https://openai.com/index/introducing-gpt-5-5/",
  ),
  gpt52: thirdParty(
    "llm-stats — GPT-5.2 (vendor-reported)",
    "https://llm-stats.com/models/gpt-5.2-2025-12-11",
  ),
  gemini31pro: vendor(
    "Google DeepMind — Gemini 3.1 Pro model card",
    "https://deepmind.google/models/model-cards/gemini-3-1-pro/",
  ),
  gemini3pro: vendor(
    "Google — Gemini 3 Pro",
    "https://blog.google/products-and-platforms/products/gemini/gemini-3/",
  ),
  gemini3flash: vendor(
    "Google — Gemini 3 Flash",
    "https://blog.google/products/gemini/gemini-3-flash/",
  ),
  dsv4pro: vendor(
    "DeepSeek — V4-Pro model card",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro",
  ),
  dsv4flash: vendor(
    "DeepSeek — V4-Flash model card",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro",
  ),
  kimi26: vendor(
    "Moonshot — Kimi K2.6 model card",
    "https://huggingface.co/moonshotai/Kimi-K2.6",
  ),
  glm51: vendor(
    "Zhipu / Z.ai — GLM-5.1 model card",
    "https://huggingface.co/zai-org/GLM-5.1",
  ),
  qwen36: vendor(
    "Alibaba — Qwen3.6-27B model card",
    "https://huggingface.co/Qwen/Qwen3.6-27B",
  ),
  llama4mav: vendor(
    "Meta — Llama 4",
    "https://ai.meta.com/blog/llama-4-multimodal-intelligence/",
  ),
  mistral3: thirdParty(
    "Artificial Analysis — Mistral Large 3",
    "https://artificialanalysis.ai/models/mistral-large-3",
  ),
};

// Batch 2 (June 2026) — additional vendor / best-available sources.
const SRC2 = {
  opus47: vendor(
    "Anthropic — Claude Opus 4.7",
    "https://www.anthropic.com/news/claude-opus-4-7",
  ),
  opus46: vendor(
    "Anthropic — Claude Opus 4.6",
    "https://www.anthropic.com/news/claude-opus-4-6",
  ),
  gemini25pro: vendor(
    "Google DeepMind — Gemini 2.5 Pro model card",
    "https://deepmind.google/models/gemini/pro/",
  ),
  gemini35flash: vendor(
    "Google — Gemini 3.5 Flash",
    "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/",
  ),
  dsv32: vendor(
    "DeepSeek — V3.2 technical report",
    "https://arxiv.org/abs/2512.02556",
  ),
  kimik2t: vendor(
    "Moonshot — Kimi K2 Thinking model card",
    "https://huggingface.co/moonshotai/Kimi-K2-Thinking",
  ),
  qwen37max: vendor("Qwen — Qwen3.7 Max", "https://qwen.ai/blog"),
  qwen3635b: vendor(
    "Alibaba — Qwen3.6-35B-A3B model card",
    "https://huggingface.co/Qwen/Qwen3.6-35B-A3B",
  ),
  museSpark: thirdParty(
    "Artificial Analysis — Muse Spark",
    "https://artificialanalysis.ai/models/muse-spark",
  ),
  llama4scout: vendor(
    "Meta — Llama 4",
    "https://ai.meta.com/blog/llama-4-multimodal-intelligence/",
  ),
  nova2pro: vendor(
    "Amazon — Nova 2 technical report",
    "https://assets.amazon.science/c5/3d/84514a224666b5be6de4b43ef4aa/nova-2-0-technical-report2.pdf",
  ),
  nemotron3: vendor(
    "NVIDIA — Nemotron 3 Ultra model card",
    "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16",
  ),
  doubao: vendor(
    "ByteDance — Doubao Seed 2.0",
    "https://seed.bytedance.com/en/blog/seed-2-0-official-launch",
  ),
};

type Entry =
  | number
  | {
      value: number;
      source?: ScoreSource;
      verified?: boolean;
      date?: string;
      notes?: string;
    };

function buildScores(
  modelId: string,
  defaultSource: ScoreSource,
  entries: Record<string, Entry>,
  defaultDate: string = REPORTED,
): Score[] {
  return Object.entries(entries).map(([benchmarkId, entry]) => {
    const e = typeof entry === "number" ? { value: entry } : entry;
    return {
      modelId,
      benchmarkId,
      value: e.value,
      source: e.source ?? defaultSource,
      date: e.date ?? defaultDate,
      verified: e.verified ?? false,
      notes: e.notes,
    };
  });
}

export const scores: Score[] = [
  // -------------------------------------------------------------- Anthropic
  ...buildScores("claude-opus-4-8", SRC.opus48, {
    "gpqa-diamond": 93.6,
    "swe-bench-verified": 88.6,
    hle: { value: 49.8, notes: "No tools; 57.9 with tools." },
    "aa-intelligence-index": { value: 61, source: aa },
  }),
  ...buildScores("claude-sonnet-4-6", SRC.sonnet46, {
    "swe-bench-verified": 79.6,
    "arena-elo": { value: 1471, source: arena },
    "aa-intelligence-index": { value: 44, source: aa },
  }),
  ...buildScores("claude-haiku-4-5", SRC.haiku45, {
    "swe-bench-verified": 73.3,
    "arena-elo": { value: 1411, source: arena },
    "aa-intelligence-index": { value: 31, source: aa },
  }),

  // ----------------------------------------------------------------- OpenAI
  ...buildScores("gpt-5-5", SRC.gpt55, {
    "gpqa-diamond": 93.6,
    hle: { value: 41.4, notes: "No tools; 52.2 with tools (high reasoning)." },
    "arena-elo": { value: 1474, source: arena },
    "aa-intelligence-index": { value: 60, source: aa },
  }),
  ...buildScores("gpt-5-2", SRC.gpt52, {
    "gpqa-diamond": 92.4,
    "swe-bench-verified": {
      value: 80.0,
      notes: "Vendor-reported; independent SWE-bench leaderboard lists 72.8%.",
    },
    hle: 34.5,
    "arena-elo": { value: 1435, source: arena },
    "aa-intelligence-index": { value: 51, source: aa },
  }),

  // ---------------------------------------------------------------- Google
  ...buildScores("gemini-3-1-pro", SRC.gemini31pro, {
    "gpqa-diamond": 94.3,
    "swe-bench-verified": 80.6,
    hle: { value: 44.4, notes: "No tools; 51.4 with search + code." },
    "arena-elo": { value: 1488, source: arena },
    "aa-intelligence-index": { value: 57, source: aa },
  }),
  ...buildScores("gemini-3-pro", SRC.gemini3pro, {
    "gpqa-diamond": 91.9,
    "swe-bench-verified": 76.2,
    hle: { value: 37.5, notes: "No tools." },
    "arena-elo": { value: 1486, source: arena },
    "aa-intelligence-index": { value: 48, source: aa },
  }),
  ...buildScores("gemini-3-flash", SRC.gemini3flash, {
    "gpqa-diamond": 90.4,
    "swe-bench-verified": 78,
    hle: { value: 33.7, notes: "No tools." },
    "arena-elo": { value: 1473, source: arena },
    "aa-intelligence-index": { value: 35, source: aa },
  }),

  // -------------------------------------------------------------- DeepSeek
  ...buildScores("deepseek-v4-pro", SRC.dsv4pro, {
    "gpqa-diamond": 90.1,
    "swe-bench-verified": 80.6,
    livecodebench: 93.5,
    "mmlu-pro": 87.5,
    hle: { value: 37.7, notes: "No tools; 48.2 with tools." },
    "arena-elo": { value: 1457, source: arena },
    "aa-intelligence-index": { value: 52, source: aa },
  }),
  ...buildScores("deepseek-v4-flash", SRC.dsv4flash, {
    "gpqa-diamond": 88.1,
    "swe-bench-verified": 79.0,
    livecodebench: 91.6,
    "mmlu-pro": 86.2,
    hle: { value: 34.8, notes: "No tools." },
    "arena-elo": { value: 1433, source: arena },
    "aa-intelligence-index": { value: 47, source: aa },
  }),

  // -------------------------------------------------------- Moonshot (Kimi)
  ...buildScores("kimi-k2-6", SRC.kimi26, {
    "gpqa-diamond": 90.5,
    "swe-bench-verified": 80.2,
    livecodebench: 89.6,
    hle: { value: 34.7, notes: "No tools; 54.0 with tools." },
    "arena-elo": { value: 1462, source: arena },
    "aa-intelligence-index": { value: 54, source: aa },
  }),

  // -------------------------------------------------------- Z.ai (Zhipu)
  ...buildScores("glm-5-1", SRC.glm51, {
    "gpqa-diamond": 86.2,
    hle: { value: 31.0, notes: "No tools; 52.3 with tools." },
    "arena-elo": { value: 1475, source: arena },
    "aa-intelligence-index": { value: 51, source: aa },
  }),

  // ---------------------------------------------------------- Alibaba (Qwen)
  ...buildScores("qwen3-6-27b", SRC.qwen36, {
    "gpqa-diamond": 87.8,
    "swe-bench-verified": 77.2,
    livecodebench: 83.9,
    "mmlu-pro": 86.2,
    hle: { value: 24.0, notes: "No tools." },
    "aa-intelligence-index": { value: 46, source: aa },
  }),

  // ------------------------------------------------------------------- Meta
  ...buildScores("llama-4-maverick", SRC.llama4mav, {
    "gpqa-diamond": 69.8,
    livecodebench: 43.4,
    "mmlu-pro": 80.5,
    "aa-intelligence-index": { value: 18, source: aa },
  }),

  // ---------------------------------------------------------------- Mistral
  ...buildScores("mistral-large-3", SRC.mistral3, {
    "gpqa-diamond": {
      value: 43.9,
      notes: "Non-reasoning model; independently measured.",
    },
    "arena-elo": { value: 1418, source: arena },
    "aa-intelligence-index": { value: 23, source: aa },
  }),

  // ------------------------------------------------------------------- xAI
  // xAI publishes no classic academic benchmarks (GPQA/SWE-bench/HLE) for
  // current Grok models; Grok's cells come from independent evaluators — the
  // AA Index, LMArena, and the Vals AI domain benchmarks below.
  ...buildScores("grok-4-3", aa, {
    "arena-elo": { value: 1446, source: arena },
    "aa-intelligence-index": { value: 53, source: aa },
  }),

  // ------------------------------------------ Domain benchmarks (Vals AI) ---
  // Independent in-house evals from vals.ai: finance (CorpFin v2), law
  // (LegalBench), tax/accounting (TaxEval v2), medicine (MedCode). These back
  // the professional industry baskets. Reasoning models use their thinking
  // variant; models absent from a board are omitted, not guessed.
  ...buildScores("claude-opus-4-8", valsCorpfin, {
    corpfin: 66.7,
    legalbench: { value: 83.6, source: valsLegal },
    taxeval: { value: 75.6, source: valsTax },
    medcode: { value: 53.2, source: valsMed },
  }),
  ...buildScores("claude-sonnet-4-6", valsCorpfin, {
    corpfin: 65.3,
    legalbench: { value: 82.1, source: valsLegal },
    taxeval: { value: 77.1, source: valsTax },
  }),
  ...buildScores("claude-haiku-4-5", valsCorpfin, {
    corpfin: 60.6,
    legalbench: { value: 81.2, source: valsLegal },
    taxeval: { value: 67.5, source: valsTax },
    medcode: { value: 32.7, source: valsMed },
  }),
  ...buildScores("gpt-5-5", valsCorpfin, {
    corpfin: 68.4,
    legalbench: { value: 86.5, source: valsLegal },
    taxeval: { value: 75.0, source: valsTax },
    medcode: { value: 49.1, source: valsMed },
  }),
  ...buildScores("gpt-5-2", valsCorpfin, {
    corpfin: 65.9,
    legalbench: { value: 82.8, source: valsLegal },
    taxeval: { value: 75.8, source: valsTax },
    medcode: { value: 49.7, source: valsMed },
  }),
  ...buildScores("gemini-3-1-pro", valsCorpfin, {
    corpfin: 64.5,
    legalbench: { value: 87.4, source: valsLegal },
    taxeval: { value: 72.9, source: valsTax },
    medcode: { value: 59.1, source: valsMed },
  }),
  ...buildScores("gemini-3-pro", valsCorpfin, {
    corpfin: 63.7,
    legalbench: { value: 87.0, source: valsLegal },
    taxeval: { value: 72.6, source: valsTax },
    medcode: { value: 52.2, source: valsMed },
  }),
  ...buildScores("gemini-3-flash", valsCorpfin, {
    corpfin: 66.4,
    legalbench: { value: 86.9, source: valsLegal },
    taxeval: { value: 73.9, source: valsTax },
    medcode: { value: 55.9, source: valsMed },
  }),
  ...buildScores("deepseek-v4-pro", valsCorpfin, {
    corpfin: 61.4,
    legalbench: { value: 80.3, source: valsLegal },
    taxeval: { value: 72.1, source: valsTax },
    medcode: { value: 40.5, source: valsMed },
  }),
  // deepseek-v4-flash is absent from every Vals AI board — no domain scores.
  ...buildScores("kimi-k2-6", valsCorpfin, {
    corpfin: 66.7,
    legalbench: { value: 84.7, source: valsLegal },
    taxeval: { value: 74.7, source: valsTax },
    medcode: { value: 40.1, source: valsMed },
  }),
  ...buildScores("glm-5-1", valsCorpfin, {
    corpfin: 64.5,
    legalbench: { value: 84.4, source: valsLegal },
    taxeval: { value: 71.2, source: valsTax },
    medcode: { value: 41.6, source: valsMed },
  }),
  ...buildScores("qwen3-6-27b", valsCorpfin, {
    corpfin: 62.3,
    taxeval: { value: 71.3, source: valsTax },
  }),
  ...buildScores("llama-4-maverick", valsCorpfin, {
    corpfin: 49.7,
    legalbench: { value: 77.8, source: valsLegal },
    taxeval: { value: 66.6, source: valsTax },
    medcode: { value: 36.5, source: valsMed },
  }),
  ...buildScores("mistral-large-3", valsCorpfin, {
    corpfin: 61.0,
    legalbench: { value: 79.1, source: valsLegal },
    taxeval: { value: 73.1, source: valsTax },
  }),
  ...buildScores("grok-4-3", valsCorpfin, {
    corpfin: 68.5,
    legalbench: { value: 84.5, source: valsLegal },
    taxeval: { value: 70.8, source: valsTax },
    medcode: { value: 38.1, source: valsMed },
  }),

  // ====================== Batch 2 — broader roster (June 2026) =============
  // General benchmarks from vendor cards / Artificial Analysis; domain
  // benchmarks from Vals AI; Elo from LMArena. All verified:false.
  ...buildScores("claude-opus-4-7", SRC2.opus47, {
    "gpqa-diamond": 94.2,
    "swe-bench-verified": {
      value: 87.6,
      notes: "Vendor-reported; vals.ai independent run: 82.0%.",
    },
    hle: { value: 46.9, notes: "No tools." },
    "arena-elo": { value: 1493, source: arena },
    "aa-intelligence-index": { value: 57, source: aa },
    corpfin: { value: 66.1, source: valsCorpfin },
    legalbench: { value: 85.3, source: valsLegal },
    taxeval: { value: 75.3, source: valsTax },
    medcode: { value: 54.9, source: valsMed },
  }),
  ...buildScores("claude-opus-4-6", SRC2.opus46, {
    "gpqa-diamond": 91.3,
    "swe-bench-verified": {
      value: 80.8,
      notes: "Vendor-reported; vals.ai independent run: 78.2%.",
    },
    hle: { value: 40.0, notes: "No tools." },
    "arena-elo": { value: 1498, source: arena },
    "aa-intelligence-index": { value: 53, source: aa },
    corpfin: { value: 67.0, source: valsCorpfin },
    legalbench: { value: 85.3, source: valsLegal },
    taxeval: { value: 76.0, source: valsTax },
    medcode: { value: 49.1, source: valsMed },
  }),
  ...buildScores("gpt-5-4", aa, {
    "arena-elo": { value: 1467, source: arena },
    "aa-intelligence-index": { value: 57, source: aa },
    corpfin: { value: 65.3, source: valsCorpfin },
    legalbench: { value: 86.0, source: valsLegal },
    taxeval: { value: 74.0, source: valsTax },
    medcode: { value: 41.3, source: valsMed },
  }),
  ...buildScores("gemini-3-5-flash", SRC2.gemini35flash, {
    hle: { value: 40.2, notes: "No tools." },
    "arena-elo": { value: 1477, source: arena },
    "aa-intelligence-index": { value: 55, source: aa },
    corpfin: { value: 64.7, source: valsCorpfin },
    legalbench: { value: 83.6, source: valsLegal },
    taxeval: { value: 74.4, source: valsTax },
    medcode: { value: 55.8, source: valsMed },
  }),
  ...buildScores("gemini-2-5-pro", SRC2.gemini25pro, {
    "gpqa-diamond": 86.4,
    "swe-bench-verified": {
      value: 59.6,
      notes: "Single attempt; 67.2% with multiple attempts.",
    },
    hle: { value: 21.6, notes: "No tools." },
    livecodebench: 69.0,
    "arena-elo": { value: 1446, source: arena },
    "aa-intelligence-index": { value: 35, source: aa },
    corpfin: { value: 60.8, source: valsCorpfin },
    medcode: { value: 50.6, source: valsMed },
  }),
  ...buildScores("grok-4-20", aa, {
    "arena-elo": { value: 1473, source: arena },
    "aa-intelligence-index": { value: 49, source: aa },
    corpfin: { value: 63.7, source: valsCorpfin },
    legalbench: { value: 77.7, source: valsLegal },
    taxeval: { value: 74.1, source: valsTax },
    medcode: { value: 32.2, source: valsMed },
  }),
  ...buildScores("deepseek-v3-2", SRC2.dsv32, {
    "gpqa-diamond": 82.4,
    "swe-bench-verified": 73.1,
    hle: { value: 25.1, notes: "Text-only, no tools." },
    livecodebench: 83.3,
    "mmlu-pro": 85.0,
    "arena-elo": { value: 1437, source: arena },
    "aa-intelligence-index": { value: 32, source: aa },
    corpfin: { value: 51.0, source: valsCorpfin },
    legalbench: { value: 76.1, source: valsLegal },
    taxeval: { value: 68.2, source: valsTax },
  }),
  ...buildScores("kimi-k2-thinking", SRC2.kimik2t, {
    "gpqa-diamond": 84.5,
    "swe-bench-verified": 71.3,
    hle: { value: 23.9, notes: "No tools; 44.9% with tools." },
    livecodebench: 83.1,
    "mmlu-pro": 84.6,
    "arena-elo": { value: 1444, source: arena },
    "aa-intelligence-index": { value: 41, source: aa },
    corpfin: { value: 60.6, source: valsCorpfin },
    legalbench: { value: 80.2, source: valsLegal },
    taxeval: { value: 71.7, source: valsTax },
  }),
  ...buildScores("qwen3-7-max", SRC2.qwen37max, {
    "gpqa-diamond": 92.4,
    "swe-bench-verified": 80.4,
    hle: { value: 41.4, notes: "Tool setting not stated by source." },
    livecodebench: 91.6,
    "arena-elo": { value: 1474, source: arena },
    "aa-intelligence-index": { value: 57, source: aa },
    corpfin: { value: 63.7, source: valsCorpfin },
    legalbench: { value: 84.9, source: valsLegal },
    taxeval: { value: 75.3, source: valsTax },
    medcode: { value: 38.8, source: valsMed },
  }),
  ...buildScores("qwen3-6-35b-a3b", SRC2.qwen3635b, {
    "gpqa-diamond": 86.0,
    "swe-bench-verified": 73.4,
    hle: { value: 21.4, notes: "No tools." },
    livecodebench: 80.4,
    "mmlu-pro": 85.2,
    "aa-intelligence-index": { value: 43, source: aa },
  }),
  ...buildScores("muse-spark", SRC2.museSpark, {
    hle: { value: 39.9, notes: "Independently measured (AA)." },
    "aa-intelligence-index": { value: 52, source: aa },
    corpfin: { value: 65.1, source: valsCorpfin },
    legalbench: { value: 84.2, source: valsLegal },
    taxeval: { value: 77.7, source: valsTax },
    medcode: { value: 51.3, source: valsMed },
  }),
  ...buildScores("llama-4-scout", SRC2.llama4scout, {
    "gpqa-diamond": 57.2,
    livecodebench: 32.8,
    "mmlu-pro": 74.3,
    "aa-intelligence-index": { value: 14, source: aa },
    corpfin: { value: 46.8, source: valsCorpfin },
    legalbench: { value: 72.0, source: valsLegal },
    taxeval: { value: 55.2, source: valsTax },
    medcode: { value: 23.3, source: valsMed },
  }),
  ...buildScores("nova-2-pro", SRC2.nova2pro, {
    "gpqa-diamond": 81.4,
    "swe-bench-verified": {
      value: 61.5,
      notes: "70.0% with self-consistency.",
    },
    livecodebench: 74.6,
    "mmlu-pro": 81.6,
    "aa-intelligence-index": { value: 23, source: aa },
  }),
  ...buildScores("nemotron-3-ultra", SRC2.nemotron3, {
    "gpqa-diamond": 87.0,
    "swe-bench-verified": 71.9,
    hle: { value: 26.7, notes: "No tools; 37.4% with tools." },
    livecodebench: 89.0,
    "mmlu-pro": 86.8,
    "arena-elo": { value: 1422, source: arena },
    "aa-intelligence-index": { value: 48, source: aa },
  }),
  ...buildScores("minimax-m3", aa, {
    "arena-elo": { value: 1449, source: arena },
    "aa-intelligence-index": { value: 55, source: aa },
  }),
  ...buildScores("doubao-seed-2-pro", SRC2.doubao, {
    hle: { value: 54.2, notes: "HLE-text, vendor-reported." },
    "arena-elo": { value: 1455, source: arena },
  }),

  // ----------------------------------------------------------- World Models
  // Intentionally empty: standardized world-model evaluation is still emerging,
  // so these models render as "awaiting data" rather than carrying invented
  // numbers. See benchmarks.ts (world-model section) for the proposed suites.
];
