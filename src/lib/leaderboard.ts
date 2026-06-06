/**
 * Pure leaderboard computation. Joins models + benchmarks + scores into a
 * serializable structure that Server Components can compute at build time and
 * hand to Client Components for interactive sorting/filtering.
 */
import {
  DATASET_META,
  benchmarksFor,
  modelsFor,
  providersById,
  scoreFor,
} from "@/lib/data";
import type {
  Benchmark,
  Model,
  ModelCategory,
  Provider,
  ScoreSource,
} from "@/lib/types";

export interface LeaderboardCell {
  value: number;
  display: string;
  /** 0–100 absolute (value vs. the benchmark's max), used for in-cell bars. */
  normalized: number;
  /**
   * 0–100 standing *relative to the field* on this benchmark (direction-aware
   * min–max within the column). This — not {@link normalized} — feeds the
   * composite, so an easy benchmark where everyone clusters at ~90% can't
   * outweigh a brutal one where everyone clusters at ~40%: both span 0–100 by
   * how a model ranks against its peers. 50 when a benchmark has a single
   * reporter (no field to rank against).
   */
  relative: number;
  /** Best score in this benchmark column (respecting direction). */
  isBest: boolean;
  verified: boolean;
  source: ScoreSource;
  date?: string;
  notes?: string;
}

export interface LeaderboardRow {
  model: Model;
  provider: Provider;
  cells: Record<string, LeaderboardCell | null>;
  /** Composite "Crosshair Index" (0–100); null when coverage is too low. */
  index: number | null;
  /** Fraction of the category's benchmarks the model has data for. */
  coverage: number;
  measured: number;
}

export interface LeaderboardData {
  category: ModelCategory;
  benchmarks: Benchmark[];
  rows: LeaderboardRow[];
  meta: typeof DATASET_META;
}

/**
 * Minimum benchmark coverage before a model earns a composite index. Set at 0.4
 * because current frontier vendors publish only a handful of the classic
 * benchmarks each, so requiring half would leave several flagships uncomposited.
 */
const INDEX_COVERAGE_THRESHOLD = 0.4;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Standing (on the 0–100 *relative* scale — see {@link LeaderboardCell.relative})
 * imputed for a benchmark a model has NOT disclosed. Undisclosed benchmarks are
 * folded into the composite at this slightly-below-median floor rather than
 * dropped from the mean.
 *
 * Two failure modes this guards against at once:
 *   1. Dropping missing benchmarks lets a model climb by omitting one it would
 *      score poorly on (e.g. Humanity's Last Exam) — the honest reporter of a
 *      mediocre figure gets punished while the one that reports nothing floats up.
 *   2. A flat *absolute* floor over-rewards sheer coverage: a model that happens
 *      to report an "easy" high-scoring benchmark (LiveCodeBench, ~90%) towers
 *      over peers who simply didn't, regardless of real capability.
 *
 * Imputing on the relative scale fixes (2) — 40 means "a touch below the median
 * model on that benchmark," a uniform, mild penalty across columns — while still
 * fixing (1), since the floor sits below median so omitting can never *help* a
 * front-runner. Tunable: raise toward 50 to make missing data neutral, lower to
 * sharpen the penalty.
 */
export const MISSING_PENALTY_FLOOR = 40;

/**
 * Composite of a model's relative standings across a set of `benchmarkCount`
 * benchmarks. Benchmarks the model is missing are imputed at
 * {@link MISSING_PENALTY_FLOOR} so incomplete coverage is mildly penalized rather
 * than silently ignored. Expects relative (not absolute) inputs so every
 * benchmark weighs the same. Returns null only for an empty benchmark set.
 */
export function compositeIndex(
  relativeStandings: number[],
  benchmarkCount: number,
): number | null {
  if (benchmarkCount <= 0) return null;
  const missing = Math.max(0, benchmarkCount - relativeStandings.length);
  const sum =
    relativeStandings.reduce((a, c) => a + c, 0) +
    MISSING_PENALTY_FLOOR * missing;
  return round1(sum / benchmarkCount);
}

export function formatValue(b: Benchmark, value: number): string {
  if (b.metric === "elo") {
    return Math.round(value).toLocaleString("en-US");
  }
  if (b.metric === "distance") {
    const rounded = Math.round(value).toLocaleString("en-US");
    return b.unit ? `${rounded} ${b.unit}` : rounded;
  }
  if (b.unit === "%") {
    return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
  }
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function normalizeValue(b: Benchmark, value: number, column: number[]): number {
  if (b.maxScore != null) {
    const t = clamp01(value / b.maxScore);
    return (b.higherIsBetter ? t : 1 - t) * 100;
  }
  // Lower-is-better distance metric (e.g. FVD): scale against a practical worst
  // case so the score is absolute (100 = perfect/0, 0 = worst) rather than just
  // "best among the few tracked models".
  if (!b.higherIsBetter && b.worstScore != null) {
    return clamp01(1 - value / b.worstScore) * 100;
  }
  // Unbounded higher-is-better metric (e.g. Elo) → relative min–max in column.
  const min = Math.min(...column);
  const max = Math.max(...column);
  if (!Number.isFinite(min) || max === min) return 100;
  const t = (value - min) / (max - min);
  return (b.higherIsBetter ? t : 1 - t) * 100;
}

/**
 * A model's standing on a benchmark *relative to the field*: direction-aware
 * min–max within the column, on 0–100. Unlike {@link normalizeValue} (which
 * scales against the benchmark's theoretical max), this scales against where
 * models actually land, so every benchmark contributes on the same footing to
 * the composite regardless of its absolute difficulty. Returns 50 when the
 * column has fewer than two distinct reporters — there's no field to rank in.
 */
function relativeValue(b: Benchmark, value: number, column: number[]): number {
  if (column.length < 2) return 50;
  const min = Math.min(...column);
  const max = Math.max(...column);
  if (max === min) return 50;
  const t = (value - min) / (max - min);
  return clamp01(b.higherIsBetter ? t : 1 - t) * 100;
}

export function buildLeaderboard(category: ModelCategory): LeaderboardData {
  const benchmarks = benchmarksFor(category);
  const models = modelsFor(category);

  // Column value arrays + per-column best (for normalization & highlights).
  const columns: Record<string, number[]> = {};
  const bestValue: Record<string, number | undefined> = {};
  for (const b of benchmarks) {
    const col = models
      .map((m) => scoreFor(m.id, b.id)?.value)
      .filter((v): v is number => typeof v === "number");
    columns[b.id] = col;
    bestValue[b.id] = col.length
      ? b.higherIsBetter
        ? Math.max(...col)
        : Math.min(...col)
      : undefined;
  }

  const rows: LeaderboardRow[] = models.map((model) => {
    const cells: Record<string, LeaderboardCell | null> = {};
    const relatives: number[] = [];
    let measured = 0;

    for (const b of benchmarks) {
      const sc = scoreFor(model.id, b.id);
      if (!sc) {
        cells[b.id] = null;
        continue;
      }
      measured += 1;
      const relative = relativeValue(b, sc.value, columns[b.id]);
      relatives.push(relative);
      cells[b.id] = {
        value: sc.value,
        display: formatValue(b, sc.value),
        normalized: normalizeValue(b, sc.value, columns[b.id]),
        relative,
        isBest: bestValue[b.id] !== undefined && sc.value === bestValue[b.id],
        verified: sc.verified,
        source: sc.source,
        date: sc.date,
        notes: sc.notes,
      };
    }

    const coverage = benchmarks.length ? measured / benchmarks.length : 0;
    // World models have no composite index: their benchmarks are fragmented
    // across non-overlapping suites (different models, measured under different
    // protocols), so averaging them would imply a head-to-head ranking the data
    // can't support. They show per-benchmark cells only.
    const suppressIndex = category === "world-model";
    const index =
      !suppressIndex && coverage >= INDEX_COVERAGE_THRESHOLD && relatives.length
        ? compositeIndex(relatives, benchmarks.length)
        : null;

    return {
      model,
      provider: providersById[model.providerId],
      cells,
      index,
      coverage,
      measured,
    };
  });

  rows.sort(defaultRowCompare);
  return { category, benchmarks, rows, meta: DATASET_META };
}

export function buildAllLeaderboards(): Record<ModelCategory, LeaderboardData> {
  return {
    llm: buildLeaderboard("llm"),
    "world-model": buildLeaderboard("world-model"),
  };
}

/** Default ordering: composite index desc (nulls last), then coverage, name. */
function defaultRowCompare(a: LeaderboardRow, b: LeaderboardRow): number {
  if (a.index == null && b.index == null) {
    if (b.measured !== a.measured) return b.measured - a.measured;
    return a.model.name.localeCompare(b.model.name);
  }
  if (a.index == null) return 1;
  if (b.index == null) return -1;
  if (b.index !== a.index) return b.index - a.index;
  return a.model.name.localeCompare(b.model.name);
}

/** 1-based rank of a model within its category's default ordering. */
export function rankOf(modelId: string, category: ModelCategory): number | null {
  const { rows } = buildLeaderboard(category);
  const i = rows.findIndex((r) => r.model.id === modelId);
  return i === -1 ? null : i + 1;
}
