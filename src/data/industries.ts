import type { Industry } from "@/lib/types";

/**
 * Industry → benchmark mapping. Each profession blends general-capability
 * benchmarks (reasoning, knowledge) with a domain-specific one where a credible
 * independent evaluation exists — finance, law, tax, and medicine come from
 * Vals AI. These mappings are judgment calls (proposals, like the world-model
 * axes) meant to be debated and refined. Management Consulting is intentionally
 * a broad-reasoning basket, since no single domain benchmark fits it.
 */
export const industries: Industry[] = [
  {
    id: "software-engineering",
    label: "Software Engineering",
    short: "Software",
    description:
      "Shipping working code against real repositories: bug fixes, feature patches, and competitive programming under tests.",
    benchmarkIds: ["swe-bench-verified", "livecodebench"],
  },
  {
    id: "investment-banking",
    label: "Investment Banking",
    short: "IB / Finance",
    description:
      "Financial analysis over filings and credit agreements — valuation math, document QA, and the quantitative reasoning behind deals.",
    benchmarkIds: ["corpfin", "mmlu-pro", "gpqa-diamond"],
  },
  {
    id: "corporate-law",
    label: "Corporate Law",
    short: "Law",
    description:
      "Legal reasoning — issue spotting, rule application, and contract analysis — plus the broad knowledge a generalist counsel needs.",
    benchmarkIds: ["legalbench", "mmlu-pro", "hle"],
  },
  {
    id: "medicine",
    label: "Medicine",
    short: "Medicine",
    description:
      "Clinical knowledge and diagnostic reasoning, including the medical coding accuracy and science depth that real practice demands.",
    benchmarkIds: ["medcode", "gpqa-diamond", "mmlu-pro"],
  },
  {
    id: "scientific-research",
    label: "Scientific Research",
    short: "Research",
    description:
      "Frontier problem solving — graduate-level science, the hardest multi-domain exams, and broad expert knowledge.",
    benchmarkIds: ["gpqa-diamond", "hle", "mmlu-pro"],
  },
  {
    id: "management-consulting",
    label: "Management Consulting",
    short: "Consulting",
    description:
      "Broad analytical reasoning across business domains — structured problem solving over wide-ranging knowledge.",
    benchmarkIds: ["mmlu-pro", "gpqa-diamond", "hle"],
  },
  {
    id: "accounting-audit",
    label: "Accounting & Audit",
    short: "Accounting",
    description:
      "Numerically exact work over tax and financial documents — reconciliation, controls, and the arithmetic discipline audits demand.",
    benchmarkIds: ["taxeval", "corpfin", "mmlu-pro"],
  },
];

export const industriesById: Record<string, Industry> = Object.fromEntries(
  industries.map((i) => [i.id, i]),
);

/**
 * World-model "capability" axes. Unlike LLM industries, each maps to a single
 * benchmark — world-model evaluation is fragmented across non-overlapping
 * suites, so coverage is intentionally sparse and only a few models have any
 * data (e.g. V-JEPA 2 on understanding/anticipation, Sora on Physics-IQ).
 */
export const worldModelCapabilities: Industry[] = [
  {
    id: "motion-understanding",
    label: "Motion Understanding",
    short: "Motion",
    description:
      "Recognizing fine-grained temporal dynamics in video — what is happening and how things move, beyond static appearance.",
    benchmarkIds: ["ssv2"],
  },
  {
    id: "action-anticipation",
    label: "Action Anticipation",
    short: "Anticipation",
    description:
      "Forecasting upcoming actions from egocentric video before they happen.",
    benchmarkIds: ["ek100-anticipation"],
  },
  {
    id: "generative-physics",
    label: "Generative Physics",
    short: "Gen. Physics",
    description:
      "Whether generated video continuations obey physical principles — mechanics, fluids, optics — rather than merely looking realistic.",
    benchmarkIds: ["physics-iq"],
  },
];
