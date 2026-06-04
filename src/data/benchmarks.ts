import type { Benchmark } from "@/lib/types";

/**
 * Benchmark catalogue.
 *
 * As of mid-2026 the classic LLM suite has shifted under the field: AIME and
 * MMMU saturated (vendors now report AIME 2026 / MMMU-Pro), so they're dropped
 * here in favour of the benchmarks current frontier models actually publish and
 * that still separate them — GPQA Diamond, SWE-bench Verified, Humanity's Last
 * Exam, LiveCodeBench, MMLU-Pro, and LMArena Elo. The Artificial Analysis
 * Intelligence Index is included as an independent composite reference.
 *
 * The world-model benchmarks below are deliberately framed as *proposals*:
 * standardized world-model evaluation is still emerging, which is precisely why
 * this leaderboard exists. They carry no scores yet — the category is "awaiting
 * data" by design.
 */
export const benchmarks: Benchmark[] = [
  // ---------------------------------------------------------------- LLM ----
  {
    id: "gpqa-diamond",
    name: "GPQA Diamond",
    category: "llm",
    domain: "Reasoning",
    description:
      "Graduate-level, Google-proof science questions (physics, chemistry, biology) written by domain experts to resist web lookup.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://github.com/idavidrein/gpqa",
  },
  {
    id: "hle",
    name: "Humanity's Last Exam",
    category: "llm",
    domain: "Frontier",
    description:
      "A broad, extremely difficult exam across math, humanities, and science designed to remain unsaturated by frontier models. Reported here without external tools.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://lastexam.ai",
  },
  {
    id: "swe-bench-verified",
    name: "SWE-bench Verified",
    category: "llm",
    domain: "Agentic Coding",
    description:
      "A human-validated subset of real GitHub issues; the model must produce a patch that passes the repository's tests. Figures are vendor-reported unless noted.",
    metric: "rate",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://www.swebench.com",
  },
  {
    id: "livecodebench",
    name: "LiveCodeBench",
    category: "llm",
    domain: "Coding",
    description:
      "Contamination-resistant competitive-programming problems collected over time to avoid training-set overlap.",
    metric: "rate",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://livecodebench.github.io",
  },
  {
    id: "mmlu-pro",
    name: "MMLU-Pro",
    category: "llm",
    domain: "Knowledge",
    description:
      "A harder, cleaned-up successor to MMLU spanning 57+ subjects with 10-way multiple choice and reasoning-heavy items.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://github.com/TIGER-AI-Lab/MMLU-Pro",
  },
  {
    id: "arena-elo",
    name: "LMArena Elo",
    category: "llm",
    domain: "Human Preference",
    description:
      "Crowd-sourced pairwise preference rating from blind head-to-head chats (LMArena, formerly LMSYS). Unbounded; ~1000 is the historical anchor.",
    metric: "elo",
    higherIsBetter: true,
    maxScore: null,
    worstScore: 1000,
    url: "https://lmarena.ai",
  },
  {
    id: "aa-intelligence-index",
    name: "AA Intelligence Index",
    category: "llm",
    domain: "Composite",
    description:
      "Artificial Analysis Intelligence Index (v4.0) — an independent composite across ~10 evaluations (incl. GPQA Diamond, HLE, Terminal-Bench, SciCode, GDPval, τ²-Bench). The de-facto cross-model standard; higher is better. Shown for reference and normalized relative to this set.",
    metric: "score",
    unit: "pts",
    higherIsBetter: true,
    maxScore: null,
    url: "https://artificialanalysis.ai/methodology/intelligence-benchmarking",
  },

  // ----------------------------------------- Professional domain (Vals AI) --
  // Independent, in-house evaluations from vals.ai — they back the per-industry
  // "skill" baskets (finance / law / tax / medicine).
  {
    id: "corpfin",
    name: "Corporate Finance",
    category: "llm",
    domain: "Finance",
    description:
      "Vals AI CorpFin v2 — expert-built questions over long-context corporate credit agreements; an independent, in-house-run finance benchmark.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://www.vals.ai/benchmarks/corp_fin_v2",
  },
  {
    id: "legalbench",
    name: "LegalBench",
    category: "llm",
    domain: "Law",
    description:
      "Legal-reasoning task suite (originated by Stanford CodeX), run independently by Vals AI and reported as overall accuracy across tasks.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://www.vals.ai/benchmarks/legal_bench",
  },
  {
    id: "taxeval",
    name: "TaxEval",
    category: "llm",
    domain: "Tax & Accounting",
    description:
      "Vals AI TaxEval v2 — 1,500+ expert-written tax questions, scored on overall accuracy. Independent, in-house-run.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://www.vals.ai/benchmarks/tax_eval_v2",
  },
  {
    id: "medcode",
    name: "Medical Coding",
    category: "llm",
    domain: "Medicine",
    description:
      "Vals AI MedCode — accuracy of ICD-10-CM diagnosis coding for the medical billing process. Independent, expert-built dataset.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://www.vals.ai/benchmarks/medcode",
  },

  // -------------------------------------------------------- World Model ----
  {
    id: "physion-pp",
    name: "Physion++",
    category: "world-model",
    domain: "Physical Prediction",
    description:
      "Predict whether physical scenarios resolve as expected (will objects collide, fall, or stay stable?). Probes intuitive physics.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://physion.net",
  },
  {
    id: "ek100-anticipation",
    name: "EK-100 Anticipation",
    category: "world-model",
    domain: "Action Anticipation",
    description:
      "EPIC-Kitchens-100 long-term action anticipation — forecast the next actions in egocentric video. Reported as mean top-5 recall.",
    metric: "score",
    unit: "recall",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://epic-kitchens.github.io/2025",
  },
  {
    id: "fvd-rollout",
    name: "Video Prediction (FVD)",
    category: "world-model",
    domain: "Generative Coherence",
    description:
      "Fréchet Video Distance between predicted and ground-truth future frames. Measures rollout realism — lower is better.",
    metric: "distance",
    unit: "FVD",
    higherIsBetter: false,
    maxScore: null,
    worstScore: 500,
    url: "https://arxiv.org/abs/1812.01717",
  },
  {
    id: "planning-success",
    name: "Embodied Planning",
    category: "world-model",
    domain: "Planning",
    description:
      "Success rate of model-based planning / imagined rollouts on embodied control and navigation tasks.",
    metric: "rate",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
  },
  {
    id: "world-consistency",
    name: "World Consistency",
    category: "world-model",
    domain: "Spatial Coherence",
    description:
      "Geometric and temporal consistency of generated/imagined worlds (object permanence, 3D coherence under camera motion).",
    metric: "score",
    unit: "pts",
    higherIsBetter: true,
    maxScore: 100,
  },
];

export const benchmarksById: Record<string, Benchmark> = Object.fromEntries(
  benchmarks.map((b) => [b.id, b]),
);

export function benchmarksFor(category: Benchmark["category"]): Benchmark[] {
  return benchmarks.filter((b) => b.category === category);
}
