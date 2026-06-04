/**
 * Single entry point for the curated dataset. Components and route handlers
 * import from here rather than reaching into `@/data/*` directly, so the
 * backing store (static files today, a database later) can change in one place.
 */
import { providers, providersById } from "@/data/providers";
import { models, modelsById, modelsFor } from "@/data/models";
import { benchmarks, benchmarksById, benchmarksFor } from "@/data/benchmarks";
import {
  industries,
  industriesById,
  worldModelCapabilities,
} from "@/data/industries";
import { scores } from "@/data/scores";
import { pricing } from "@/data/pricing";
import type {
  DatasetMeta,
  ModelCategory,
  ModelCategoryInfo,
  Score,
} from "@/lib/types";

export {
  providers,
  providersById,
  models,
  modelsById,
  modelsFor,
  benchmarks,
  benchmarksById,
  benchmarksFor,
  industries,
  industriesById,
  worldModelCapabilities,
  scores,
  pricing,
};

export const DATASET_META: DatasetMeta = {
  seed: false,
  lastUpdated: "2026-06-04",
  note: "Figures are sourced from vendor model cards, Artificial Analysis, and the LMArena (arena.ai) & SWE-bench leaderboards as of June 2026, and are cited per cell. They are vendor- or third-party-reported and have NOT been independently reproduced by Crosshair (every score is marked unverified). Benchmarks and harnesses differ between vendors, so treat cross-model comparisons as directional.",
};

export const CATEGORIES: ModelCategoryInfo[] = [
  {
    id: "llm",
    label: "Language Models",
    blurb: "Reasoning, coding, knowledge, and multimodal understanding.",
    status: "live",
  },
  {
    id: "world-model",
    label: "World Models",
    blurb: "Physical prediction, planning, and generative world coherence.",
    status: "emerging",
  },
];

export const categoryById = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<ModelCategory, ModelCategoryInfo>;

// ----------------------------------------------------------------- indexes ---
const pairKey = (modelId: string, benchmarkId: string) =>
  `${modelId}::${benchmarkId}`;

const scoresByModel = new Map<string, Score[]>();
const scoresByBenchmark = new Map<string, Score[]>();
const scoreByPair = new Map<string, Score>();

for (const s of scores) {
  (scoresByModel.get(s.modelId) ?? scoresByModel.set(s.modelId, []).get(s.modelId)!).push(s);
  (
    scoresByBenchmark.get(s.benchmarkId) ??
    scoresByBenchmark.set(s.benchmarkId, []).get(s.benchmarkId)!
  ).push(s);
  scoreByPair.set(pairKey(s.modelId, s.benchmarkId), s);
}

export function scoresForModel(modelId: string): Score[] {
  return scoresByModel.get(modelId) ?? [];
}

export function scoresForBenchmark(benchmarkId: string): Score[] {
  return scoresByBenchmark.get(benchmarkId) ?? [];
}

export function scoreFor(
  modelId: string,
  benchmarkId: string,
): Score | undefined {
  return scoreByPair.get(pairKey(modelId, benchmarkId));
}

export function getModel(id: string) {
  return modelsById[id];
}

export function getProvider(id: string) {
  return providersById[id];
}

export function getBenchmark(id: string) {
  return benchmarksById[id];
}
