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
  // World-model evaluation is fragmented: there is no single cross-model
  // leaderboard. The benchmarks below are the ones roster models actually
  // publish — each populated by at least one cited result. Understanding and
  // anticipation (V-JEPA 2) and generative physical plausibility (Physics-IQ)
  // are measured by different models on non-overlapping suites, so the
  // world-model category shows per-benchmark cells only (no composite index).
  {
    id: "ssv2",
    name: "Something-Something v2",
    category: "world-model",
    domain: "Motion Understanding",
    description:
      "Action recognition over ~220k short clips of everyday object interactions; rewards genuine temporal/motion understanding over appearance. Reported as top-1 accuracy from an attentive probe on frozen features.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://arxiv.org/abs/1706.04261",
  },
  {
    id: "ek100-anticipation",
    name: "EPIC-Kitchens-100 Anticipation",
    category: "world-model",
    domain: "Action Anticipation",
    description:
      "Long-term action anticipation on egocentric kitchen video — forecast the (verb, noun) action one second before it happens. Reported as mean recall@5.",
    metric: "score",
    unit: "recall@5",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://epic-kitchens.github.io/",
  },
  {
    id: "perception-test",
    name: "Perception Test",
    category: "world-model",
    domain: "Video Understanding",
    description:
      "A diagnostic video-QA benchmark probing memory, abstraction, physics, and semantics across real-world videos. Reported as multiple-choice accuracy from a video model aligned with an LLM.",
    metric: "accuracy",
    unit: "%",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://github.com/google-deepmind/perception_test",
  },
  {
    id: "physics-iq",
    name: "Physics-IQ",
    category: "world-model",
    domain: "Generative Physics",
    description:
      "Tests whether generative video models predict physically plausible continuations (solid/fluid mechanics, optics, thermodynamics, magnetism). The Physics-IQ Score is normalized to 0–100, where 100 is the variance between two real videos; even the best model scores far below.",
    metric: "score",
    unit: "pts",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://physics-iq.github.io/",
  },
  {
    id: "pai-bench-g",
    name: "PAI-Bench-G",
    category: "world-model",
    domain: "Physical-AI Generation",
    description:
      "Physical-AI video-generation benchmark (CVPR 2026): an MLLM-judged 'Domain' physical-plausibility score blended with a 'Quality' visual-fidelity score. Real source videos cap the scale near 83.9; higher is better.",
    metric: "score",
    unit: "pts",
    higherIsBetter: true,
    maxScore: 100,
    url: "https://arxiv.org/abs/2512.01989",
  },
];

export const benchmarksById: Record<string, Benchmark> = Object.fromEntries(
  benchmarks.map((b) => [b.id, b]),
);

export function benchmarksFor(category: Benchmark["category"]): Benchmark[] {
  return benchmarks.filter((b) => b.category === category);
}
