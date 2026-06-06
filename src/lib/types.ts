/**
 * Core domain types for Crosshair Intelligence.
 *
 * The model is intentionally category-agnostic: today it carries Large
 * Language Models, but the same Model / Benchmark / Score shape is designed
 * to hold "world models" (V-JEPA, Genie, Cosmos, …) whose benchmarks measure
 * physical prediction, planning, and video coherence rather than text.
 */

export type ModelCategory = "llm" | "world-model";

export interface ModelCategoryInfo {
  id: ModelCategory;
  label: string;
  /** Short tagline shown under category tabs. */
  blurb: string;
  /** Emerging categories render a "data is still being collected" state. */
  status: "live" | "emerging";
}

export interface Provider {
  id: string;
  name: string;
  /** Compact name for dense table cells, defaults to `name`. */
  shortName?: string;
  website?: string;
  /** Path to a local logo SVG under /public, if one is available. */
  logo?: string;
  /** Brand color for the monogram fallback when there's no logo. */
  color?: string;
}

export type Modality =
  | "text"
  | "image"
  | "audio"
  | "video"
  | "code"
  | "3d"
  | "action"
  | "embodied";

export type License = "open-weights" | "proprietary" | "research" | "unknown";

export interface Model {
  id: string;
  name: string;
  providerId: string;
  category: ModelCategory;
  /** ISO-8601 date (YYYY-MM-DD) of public release, if known. */
  releaseDate?: string;
  /** Disclosed parameter count in billions; null when undisclosed. */
  paramsB?: number | null;
  /** Context window in tokens (LLMs only). */
  contextWindow?: number | null;
  modalities: Modality[];
  license: License;
  website?: string;
  description?: string;
}

/** The shape of a benchmark's score. */
export type MetricKind =
  | "accuracy" // 0–100 % correct
  | "percentage" // generic 0–100 %
  | "elo" // unbounded preference rating
  | "score" // arbitrary points
  | "rate" // 0–100 % (success/pass rate)
  | "distance"; // e.g. FVD — lower is better

export interface Benchmark {
  id: string;
  name: string;
  category: ModelCategory;
  /** Grouping such as "Reasoning", "Coding", "Physical Prediction". */
  domain: string;
  description: string;
  metric: MetricKind;
  unit?: string;
  higherIsBetter: boolean;
  /** Theoretical max used for normalization (e.g. 100 for %). */
  maxScore?: number | null;
  /** Practical worst-case used to normalize unbounded/distance metrics. */
  worstScore?: number | null;
  url?: string;
}

export type ScoreSourceKind =
  | "vendor" // self-reported by the model's creator
  | "paper" // peer-reviewed / arXiv publication
  | "third-party" // independent evaluator (e.g. an arena, an org)
  | "crosshair-eval"; // measured by Crosshair's own harness (phase 2)

export interface ScoreSource {
  kind: ScoreSourceKind;
  /** Human-readable label, e.g. "Anthropic model card". */
  label: string;
  url?: string;
}

export interface Score {
  modelId: string;
  benchmarkId: string;
  value: number;
  source: ScoreSource;
  /** ISO-8601 date the figure was reported or measured. */
  date?: string;
  /**
   * Whether a Crosshair maintainer has independently reproduced or
   * cross-checked the figure. Sourced vendor/third-party figures stay `false`
   * until reproduced.
   */
  verified: boolean;
  notes?: string;
}

/** Metadata describing the dataset as a whole (provenance + honesty). */
export interface DatasetMeta {
  /** True while the leaderboard ships illustrative seed figures; false once sourced & cited. */
  seed: boolean;
  /** ISO-8601 date of the last data refresh. */
  lastUpdated: string;
  note: string;
}

/**
 * A professional domain (à la APEX's profession verticals). Each industry is
 * a basket of benchmarks; a model's "skill" for the industry is the mean of
 * its normalized scores across them. Benchmarks may belong to many industries.
 */
export interface Industry {
  id: string;
  label: string;
  /** Compact label for tight UI (radar axes, chips). */
  short?: string;
  description: string;
  /** Benchmarks (by id) whose normalized scores compose this industry's skill. */
  benchmarkIds: string[];
}

/** Token pricing in USD per 1M tokens (LLMs). */
export interface Pricing {
  inputPerM: number;
  outputPerM: number;
  /** Cached-input read (cache hit). */
  cacheReadPerM?: number;
  /** Caching surcharge for writing to cache (e.g. Anthropic's write cost). */
  cacheWritePerM?: number;
}

/**
 * Output throughput (tokens/sec) with provenance, like a {@link Score}. Speed is
 * a deployment characteristic rather than a benchmark, so it lives beside
 * pricing — but it carries a per-datum source because it varies by provider and
 * reasoning effort and is third-party measured.
 */
export interface Speed {
  /** Median output tokens per second (Artificial Analysis "Output Speed"). */
  outputTps: number;
  source: ScoreSource;
  /** ISO-8601 date the figure was observed. */
  date?: string;
  /** Independently reproduced by a Crosshair maintainer (false until then). */
  verified: boolean;
  notes?: string;
}
