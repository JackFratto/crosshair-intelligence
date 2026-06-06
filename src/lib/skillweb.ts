/**
 * Per-model "skill web": aggregate a model's normalized benchmark scores into
 * an industry profile. Reuses the leaderboard's direction-aware normalization,
 * so each industry score is the mean of the model's 0–100 normalized scores on
 * that industry's benchmarks.
 */
import {
  buildLeaderboard,
  compositeIndex,
  type LeaderboardCell,
} from "@/lib/leaderboard";
import {
  benchmarksById,
  industries,
  industriesById,
  modelsById,
  pricing,
  speed,
  worldModelCapabilities,
} from "@/lib/data";
import type {
  Benchmark,
  Industry,
  Model,
  ModelCategory,
  Pricing,
  Provider,
  Speed,
} from "@/lib/types";

export interface SkillWebBenchmark {
  benchmark: Benchmark;
  /** The model's cell for this benchmark, or null if it has no score. */
  cell: LeaderboardCell | null;
}

export interface IndustryProfile {
  industry: Industry;
  /** 0–100 aggregate; null if the model has no scores in the industry. */
  score: number | null;
  measured: number;
  total: number;
  benchmarks: SkillWebBenchmark[];
}

export interface SkillWebData {
  modelId: string;
  industries: IndustryProfile[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildSkillWeb(modelId: string): SkillWebData | null {
  const model = modelsById[modelId];
  if (!model) return null;

  // LLMs use profession industries; world models use capability axes.
  const axes =
    model.category === "llm" ? industries : worldModelCapabilities;

  const { rows } = buildLeaderboard(model.category);
  const row = rows.find((r) => r.model.id === modelId);
  if (!row) return null;

  const profiles: IndustryProfile[] = axes.map((industry) => {
    const benchmarks: SkillWebBenchmark[] = industry.benchmarkIds.map((bid) => ({
      benchmark: benchmarksById[bid],
      cell: row.cells[bid] ?? null,
    }));
    const present = benchmarks.filter((b) => b.cell);
    // LLM baskets aggregate field-relative standings (so an easy benchmark can't
    // dominate a hard one) and impute a mild floor for missing benchmarks, so a
    // model covering only 2 of a 3-benchmark basket (e.g. omitting Humanity's
    // Last Exam) can't outrank one that disclosed all three. World-model axes
    // keep a plain absolute mean — their suites are non-overlapping, so a missing
    // cell is expected and there's rarely a field to rank within.
    const score = present.length
      ? model.category === "llm"
        ? compositeIndex(
            present.map((b) => b.cell!.relative),
            benchmarks.length,
          )
        : round1(
            present.reduce((acc, b) => acc + b.cell!.normalized, 0) /
              present.length,
          )
      : null;
    return {
      industry,
      score,
      measured: present.length,
      total: benchmarks.length,
      benchmarks,
    };
  });

  return { modelId, industries: profiles };
}

export interface PreviewAxis {
  id: string;
  short: string;
  score: number | null;
}

export interface ModelPreviewData {
  axes: PreviewAxis[];
  pricing: Pricing | null;
  speed: Speed | null;
}

/** Slim per-model payload for the leaderboard hover preview. */
export function buildModelPreview(modelId: string): ModelPreviewData {
  const web = buildSkillWeb(modelId);
  return {
    axes: web
      ? web.industries.map((p) => ({
          id: p.industry.id,
          short: p.industry.short ?? p.industry.label,
          score: p.score,
        }))
      : [],
    pricing: pricing[modelId] ?? null,
    speed: speed[modelId] ?? null,
  };
}

export interface IndustryStanding {
  model: Model;
  provider: Provider;
  /** 0–100 industry score (mean of the model's normalized benchmark scores). */
  score: number;
  /** How many of the industry's benchmarks the model has data for. */
  measured: number;
}

export interface IndustryDetail {
  industry: Industry;
  category: ModelCategory;
  /** The benchmarks (resolved) that compose this industry's score. */
  benchmarks: Benchmark[];
  /** Every model with data, ranked by industry score (desc). */
  standings: IndustryStanding[];
}

/**
 * Rank every model in an industry by its mean normalized score across the
 * industry's benchmarks — the same aggregation the leaderboard's industry view
 * uses, surfaced here for the per-industry detail page and the "By industry"
 * leader bars.
 */
export function buildIndustryDetail(industryId: string): IndustryDetail | null {
  const industry = industriesById[industryId];
  if (!industry) return null;

  const benchmarks = industry.benchmarkIds
    .map((bid) => benchmarksById[bid])
    .filter((b): b is Benchmark => Boolean(b));
  if (!benchmarks.length) return null;

  const category = benchmarks[0].category;
  const { rows } = buildLeaderboard(category);

  const standings = rows
    .map((row) => {
      const present = industry.benchmarkIds
        .map((bid) => row.cells[bid])
        .filter((c): c is LeaderboardCell => Boolean(c));
      if (!present.length) return null;
      // Rank on field-relative standings with a mild floor for missing
      // benchmarks (LLM baskets): a model missing one of the industry's
      // benchmarks (e.g. Humanity's Last Exam) can't outrank a model that
      // disclosed the whole basket, and no single easy benchmark dominates.
      // World-model suites are non-overlapping by design — keep a plain mean.
      const score =
        category === "llm"
          ? compositeIndex(
              present.map((c) => c.relative),
              benchmarks.length,
            )!
          : round1(
              present.reduce((acc, c) => acc + c.normalized, 0) / present.length,
            );
      return {
        model: row.model,
        provider: row.provider,
        score,
        measured: present.length,
      } satisfies IndustryStanding;
    })
    .filter((s): s is IndustryStanding => s !== null)
    .sort(
      (a, b) => b.score - a.score || a.model.name.localeCompare(b.model.name),
    );

  return { industry, category, benchmarks, standings };
}
