/**
 * Phase-2 live evaluation contracts.
 *
 * Today Crosshair ships *curated* scores (vendor-reported, `verified: false`).
 * The interfaces below define how Crosshair will run its *own* evaluations so
 * leaderboard cells can be sourced as `kind: "crosshair-eval"` with
 * `verified: true`. Nothing here runs yet — see `gateway-runner.ts`.
 */
import type { Benchmark, Model, Score } from "@/lib/types";

/** One scored unit of a benchmark (a question, task, or rollout). */
export interface EvalItem {
  id: string;
  input: string;
  /** Reference answer / rubric, when the benchmark is exact-match graded. */
  expected?: string;
  metadata?: Record<string, unknown>;
}

export interface EvalRunInput {
  model: Model;
  benchmark: Benchmark;
  items: EvalItem[];
  /** Sampling controls passed through to the provider. */
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    /** Stop after N items (useful for smoke tests). */
    limit?: number;
  };
}

export interface EvalItemResult {
  itemId: string;
  output: string;
  correct?: boolean;
  /** Per-item numeric score for graded-rubric benchmarks. */
  score?: number;
  latencyMs?: number;
  error?: string;
}

export interface EvalRunResult {
  modelId: string;
  benchmarkId: string;
  /** Aggregate in the benchmark's native metric (e.g. accuracy %). */
  aggregateValue: number;
  itemResults: EvalItemResult[];
  /** A `Score` ready to merge into the dataset. */
  producedScore: Score;
  startedAt: string;
  finishedAt: string;
}

/**
 * A pluggable evaluation backend. Implementations might call hosted model APIs
 * (via the Vercel AI Gateway), a local inference server, or a world-model
 * simulator — the leaderboard only cares about the resulting `Score`.
 */
export interface EvaluationRunner {
  readonly id: string;
  /** Whether this runner is configured to execute (keys/credentials present). */
  isReady(): boolean;
  /** Which model categories this runner can evaluate. */
  supports(category: Model["category"]): boolean;
  run(input: EvalRunInput): Promise<EvalRunResult>;
}
