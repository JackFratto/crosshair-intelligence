import type { Model } from "@/lib/types";

/**
 * Curated model roster (June 2026). Limited to current, publicly-released models
 * that have authoritative, citable benchmark data — see scores.ts for sources.
 * Identity metadata (params, context, dates) is taken from vendor cards; MoE
 * `paramsB` is the total parameter count, with active params noted in the
 * description.
 */
export const models: Model[] = [
  // ----------------------------------------------------------- LLMs --------

  // Anthropic
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    providerId: "anthropic",
    category: "llm",
    releaseDate: "2026-05-28",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://www.anthropic.com/claude/opus",
    description:
      "Anthropic's frontier model and the current intelligence leader; excels at agentic coding and long-horizon reasoning.",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    providerId: "anthropic",
    category: "llm",
    releaseDate: "2026-02-17",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://www.anthropic.com/claude/sonnet",
    description: "Balanced speed/quality workhorse of the Claude 4 family.",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    providerId: "anthropic",
    category: "llm",
    releaseDate: "2025-10-15",
    paramsB: null,
    contextWindow: 200_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://www.anthropic.com/claude/haiku",
    description: "Fast, low-cost Claude tier with near-frontier coding.",
  },

  // OpenAI
  {
    id: "gpt-5-5",
    name: "GPT-5.5",
    providerId: "openai",
    category: "llm",
    releaseDate: "2026-04-23",
    paramsB: null,
    contextWindow: 400_000,
    modalities: ["text", "image", "audio", "code"],
    license: "proprietary",
    website: "https://openai.com",
    description:
      "OpenAI's flagship multimodal reasoning model (figures shown for the high reasoning-effort config).",
  },
  {
    id: "gpt-5-2",
    name: "GPT-5.2",
    providerId: "openai",
    category: "llm",
    releaseDate: "2025-12-11",
    paramsB: null,
    contextWindow: 400_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://openai.com",
    description:
      "Prior OpenAI flagship; still available but scheduled for API retirement in Aug 2026.",
  },

  // Google DeepMind
  {
    id: "gemini-3-1-pro",
    name: "Gemini 3.1 Pro",
    providerId: "google-deepmind",
    category: "llm",
    releaseDate: "2026-02-19",
    paramsB: null,
    contextWindow: 1_048_576,
    modalities: ["text", "image", "audio", "video", "code"],
    license: "proprietary",
    website: "https://deepmind.google/models/gemini/",
    description:
      "Google's most capable Gemini (preview); tops several reasoning benchmarks.",
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    providerId: "google-deepmind",
    category: "llm",
    releaseDate: "2025-11-18",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "audio", "video", "code"],
    license: "proprietary",
    website: "https://deepmind.google/models/gemini/",
    description: "Google DeepMind's frontier multimodal, long-context model.",
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    providerId: "google-deepmind",
    category: "llm",
    releaseDate: "2025-12-17",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "audio", "video", "code"],
    license: "proprietary",
    website: "https://deepmind.google/models/gemini/",
    description: "Fast, low-cost tier of the Gemini 3 line (preview).",
  },

  // DeepSeek
  {
    id: "deepseek-v4-pro",
    name: "DeepSeek V4-Pro",
    providerId: "deepseek",
    category: "llm",
    releaseDate: "2026-04-24",
    paramsB: 1600,
    contextWindow: 1_000_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.deepseek.com",
    description:
      "Open-weights MoE flagship (1.6T total / 49B active) with built-in reasoning modes (MIT).",
  },
  {
    id: "deepseek-v4-flash",
    name: "DeepSeek V4-Flash",
    providerId: "deepseek",
    category: "llm",
    releaseDate: "2026-04-24",
    paramsB: 284,
    contextWindow: 1_000_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.deepseek.com",
    description:
      "Efficient open-weights V4 tier (284B total / 13B active), MIT-licensed.",
  },

  // Moonshot (Kimi)
  {
    id: "kimi-k2-6",
    name: "Kimi K2.6",
    providerId: "moonshot",
    category: "llm",
    releaseDate: "2026-04-20",
    paramsB: 1000,
    contextWindow: 262_144,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.moonshot.ai",
    description:
      "Moonshot's trillion-param MoE (32B active); strong agentic coding (Modified MIT).",
  },

  // Z.ai (Zhipu)
  {
    id: "glm-5-1",
    name: "GLM-5.1",
    providerId: "zhipu",
    category: "llm",
    releaseDate: "2026-04-07",
    paramsB: 754,
    contextWindow: 200_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://z.ai",
    description: "Zhipu/Z.ai open-weights flagship (754B total / 40B active), MIT.",
  },

  // Alibaba (Qwen)
  {
    id: "qwen3-6-27b",
    name: "Qwen3.6-27B",
    providerId: "alibaba",
    category: "llm",
    releaseDate: "2026-04-22",
    paramsB: 27,
    contextWindow: 262_144,
    modalities: ["text", "image", "code"],
    license: "open-weights",
    website: "https://qwen.ai",
    description: "Alibaba's dense open-weights Qwen3.6 (Apache-2.0); multimodal.",
  },

  // Meta
  {
    id: "llama-4-maverick",
    name: "Llama 4 Maverick",
    providerId: "meta",
    category: "llm",
    releaseDate: "2025-04-05",
    paramsB: 400,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "open-weights",
    website: "https://ai.meta.com/llama/",
    description:
      "Meta's open-weights MoE (~17B active); the current open Llama flagship.",
  },

  // Mistral
  {
    id: "mistral-large-3",
    name: "Mistral Large 3",
    providerId: "mistral",
    category: "llm",
    releaseDate: "2025-12-02",
    paramsB: 675,
    contextWindow: 256_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://mistral.ai",
    description:
      "Mistral's open-weights MoE flagship (41B active, Apache-2.0); a non-reasoning model.",
  },

  // xAI
  {
    id: "grok-4-3",
    name: "Grok 4.3",
    providerId: "xai",
    category: "llm",
    releaseDate: "2026-04-30",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://x.ai",
    description:
      "xAI's current flagship; ranks high on the Artificial Analysis Index (xAI publishes few classic benchmarks).",
  },

  // ============================ Batch 2 — broader roster (June 2026) =======

  // Anthropic (recent legacy flagships, still available)
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    providerId: "anthropic",
    category: "llm",
    releaseDate: "2026-04-16",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://www.anthropic.com/news/claude-opus-4-7",
    description:
      "Anthropic's prior Opus flagship (superseded by 4.8); still strong on agentic coding.",
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    providerId: "anthropic",
    category: "llm",
    releaseDate: "2026-02-05",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://www.anthropic.com/news/claude-opus-4-6",
    description: "Earlier Opus 4.6 frontier model; still generally available.",
  },

  // OpenAI
  {
    id: "gpt-5-4",
    name: "GPT-5.4",
    providerId: "openai",
    category: "llm",
    releaseDate: "2026-03-05",
    paramsB: null,
    contextWindow: 400_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://openai.com",
    description:
      "OpenAI's GPT-5.4 — the tier between GPT-5.2 and GPT-5.5; reasoning + tool use.",
  },

  // Google DeepMind
  {
    id: "gemini-3-5-flash",
    name: "Gemini 3.5 Flash",
    providerId: "google-deepmind",
    category: "llm",
    releaseDate: "2026-05-19",
    paramsB: null,
    contextWindow: 1_048_576,
    modalities: ["text", "image", "audio", "video", "code"],
    license: "proprietary",
    website: "https://deepmind.google/models/gemini/",
    description: "Google's current fast/default Gemini (GA); strong agentic performance.",
  },
  {
    id: "gemini-2-5-pro",
    name: "Gemini 2.5 Pro",
    providerId: "google-deepmind",
    category: "llm",
    releaseDate: "2025-06-05",
    paramsB: null,
    contextWindow: 1_048_576,
    modalities: ["text", "image", "audio", "video", "code"],
    license: "proprietary",
    website: "https://deepmind.google/models/gemini/",
    description: "Prior-generation Gemini flagship; widely used, slated for deprecation.",
  },

  // xAI
  {
    id: "grok-4-20",
    name: "Grok 4.20",
    providerId: "xai",
    category: "llm",
    releaseDate: "2026-03-10",
    paramsB: null,
    contextWindow: 2_000_000,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://x.ai",
    description:
      "xAI Grok 4.20 (reasoning); multi-agent 'council' architecture, very long context.",
  },

  // DeepSeek
  {
    id: "deepseek-v3-2",
    name: "DeepSeek V3.2",
    providerId: "deepseek",
    category: "llm",
    releaseDate: "2025-12-01",
    paramsB: 671,
    contextWindow: 128_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.deepseek.com",
    description: "Open-weights MoE (671B total / 37B active), MIT; predecessor to V4.",
  },

  // Moonshot (Kimi)
  {
    id: "kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    providerId: "moonshot",
    category: "llm",
    releaseDate: "2025-11-06",
    paramsB: 1000,
    contextWindow: 262_144,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.moonshot.ai",
    description:
      "Moonshot's Nov-2025 long-horizon reasoning MoE (1T total / 32B active), Modified MIT.",
  },

  // Alibaba (Qwen)
  {
    id: "qwen3-7-max",
    name: "Qwen3.7 Max",
    providerId: "alibaba",
    category: "llm",
    releaseDate: "2026-05-19",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "code"],
    license: "proprietary",
    website: "https://qwen.ai",
    description: "Alibaba's proprietary Qwen3.7 Max flagship; agentic-focused.",
  },
  {
    id: "qwen3-6-35b-a3b",
    name: "Qwen3.6-35B-A3B",
    providerId: "alibaba",
    category: "llm",
    releaseDate: "2026-04-16",
    paramsB: 35,
    contextWindow: 262_144,
    modalities: ["text", "image", "video", "code"],
    license: "open-weights",
    website: "https://qwen.ai",
    description: "Open-weights hybrid-MoE Qwen3.6 (35B total / 3B active), Apache-2.0.",
  },

  // Meta
  {
    id: "muse-spark",
    name: "Muse Spark",
    providerId: "meta",
    category: "llm",
    releaseDate: "2026-04-08",
    paramsB: null,
    contextWindow: 262_144,
    modalities: ["text", "image", "code"],
    license: "proprietary",
    website: "https://ai.meta.com/blog/introducing-muse-spark-msl/",
    description:
      "Meta Superintelligence Labs' first proprietary frontier model (free via Meta AI).",
  },
  {
    id: "llama-4-scout",
    name: "Llama 4 Scout",
    providerId: "meta",
    category: "llm",
    releaseDate: "2025-04-05",
    paramsB: 109,
    contextWindow: 10_000_000,
    modalities: ["text", "image", "code"],
    license: "open-weights",
    website: "https://ai.meta.com/llama/",
    description: "Open-weights MoE (~17B active / 109B total) with very long context.",
  },

  // Amazon
  {
    id: "nova-2-pro",
    name: "Nova 2 Pro",
    providerId: "amazon",
    category: "llm",
    releaseDate: "2025-12-02",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "audio", "code"],
    license: "proprietary",
    website: "https://aws.amazon.com/ai/",
    description: "Amazon's Nova 2 Pro flagship on Bedrock; hybrid reasoning, multimodal.",
  },

  // NVIDIA
  {
    id: "nemotron-3-ultra",
    name: "Nemotron 3 Ultra",
    providerId: "nvidia",
    category: "llm",
    releaseDate: "2026-06-04",
    paramsB: 550,
    contextWindow: 1_000_000,
    modalities: ["text", "code"],
    license: "open-weights",
    website: "https://www.nvidia.com/en-us/ai/",
    description:
      "NVIDIA's open-weights hybrid Mamba-MoE (550B total / 55B active), OpenMDW license.",
  },

  // MiniMax
  {
    id: "minimax-m3",
    name: "MiniMax M3",
    providerId: "minimax",
    category: "llm",
    releaseDate: "2026-06-01",
    paramsB: null,
    contextWindow: 1_000_000,
    modalities: ["text", "image", "video", "code"],
    license: "proprietary",
    website: "https://www.minimax.io",
    description:
      "MiniMax's M3 flagship; tops the Artificial Analysis Intelligence Index (open weights pending).",
  },

  // ByteDance
  {
    id: "doubao-seed-2-pro",
    name: "Doubao Seed 2.0 Pro",
    providerId: "bytedance",
    category: "llm",
    releaseDate: "2026-02-14",
    paramsB: null,
    contextWindow: 262_144,
    modalities: ["text", "image", "video", "code"],
    license: "proprietary",
    website: "https://seed.bytedance.com",
    description: "ByteDance's Doubao Seed 2.0 Pro; multimodal flagship served via Volcano Engine.",
  },

  // -------------------------------------------------- World Models ---------
  // World-model benchmarking is fragmented in 2026 — there is no single
  // cross-model leaderboard, and many flagship systems (Genie 3, Marble, Sora,
  // Veo, Ray 3) ship demos rather than standardized numbers. Models that DO
  // publish citable results carry sparse, per-benchmark scores (see scores.ts);
  // the rest are tracked as cited "awaiting data" entries.
  {
    id: "vjepa-2",
    name: "V-JEPA 2",
    providerId: "meta",
    category: "world-model",
    releaseDate: "2025-06-11",
    paramsB: 1.2,
    contextWindow: null,
    modalities: ["video", "action", "embodied"],
    license: "open-weights",
    website: "https://ai.meta.com/vjepa/",
    description:
      "Self-supervised video joint-embedding predictive architecture; learns world dynamics for motion understanding, action anticipation, and zero-shot robot planning.",
  },
  {
    id: "genie-3",
    name: "Genie 3",
    providerId: "google-deepmind",
    category: "world-model",
    releaseDate: "2025-08-01",
    paramsB: null,
    contextWindow: null,
    modalities: ["video", "action", "3d"],
    license: "research",
    website: "https://deepmind.google/models/genie/",
    description:
      "Foundation world model that generates interactive, controllable environments in real time. Shown qualitatively — DeepMind publishes no standardized cross-model benchmark numbers.",
  },
  {
    id: "cosmos-predict",
    name: "Cosmos Predict",
    providerId: "nvidia",
    category: "world-model",
    releaseDate: "2025-01-06",
    paramsB: 14,
    contextWindow: null,
    modalities: ["video", "3d", "action"],
    license: "open-weights",
    website: "https://www.nvidia.com/en-us/ai/cosmos/",
    description:
      "World Foundation Models for physical AI — future-frame prediction for robotics and autonomous systems.",
  },
  {
    id: "worldlabs-marble",
    name: "Marble",
    providerId: "world-labs",
    category: "world-model",
    releaseDate: "2025-11-12",
    paramsB: null,
    contextWindow: null,
    modalities: ["image", "video", "3d"],
    license: "proprietary",
    website: "https://www.worldlabs.ai",
    description:
      "World Labs' spatially-grounded generative model — persistent, editable 3D scenes from text, images, or video. Marketed on persistence/editability; no standardized benchmarks published.",
  },
  {
    id: "sora",
    name: "Sora",
    providerId: "openai",
    category: "world-model",
    releaseDate: "2024-12-09",
    paramsB: null,
    contextWindow: null,
    modalities: ["video"],
    license: "proprietary",
    website: "https://openai.com/sora/",
    description:
      "OpenAI's text/image-to-video model — the system that popularized 'video as world simulator'. The original Sora was independently scored on Physics-IQ (generative physical understanding is severely limited); Sora 2 (2025) is the current iteration.",
  },
  {
    id: "veo-3",
    name: "Veo 3",
    providerId: "google-deepmind",
    category: "world-model",
    releaseDate: "2025-05-20",
    paramsB: null,
    contextWindow: null,
    modalities: ["video", "audio"],
    license: "proprietary",
    website: "https://deepmind.google/models/veo/",
    description:
      "Google DeepMind's text/image-to-video model with native audio and real-world physics. Strong generation quality, but no standardized world-model benchmark numbers are published.",
  },
  {
    id: "luma-ray-3",
    name: "Ray 3",
    providerId: "luma",
    category: "world-model",
    releaseDate: "2026-01-26",
    paramsB: null,
    contextWindow: null,
    modalities: ["video"],
    license: "proprietary",
    website: "https://lumalabs.ai/ray",
    description:
      "Luma's reasoning-driven video model with 3D-aware generation and native HDR. Demos only — no standardized cross-model benchmark results published.",
  },
];

export const modelsById: Record<string, Model> = Object.fromEntries(
  models.map((m) => [m.id, m]),
);

export function modelsFor(category: Model["category"]): Model[] {
  return models.filter((m) => m.category === category);
}
