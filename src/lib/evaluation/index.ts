/**
 * Evaluation runner registry (phase 2).
 *
 * Register runners here; `getRunnerFor(category)` picks the first ready runner
 * that supports the category. Until a runner's `run()` is implemented, the
 * leaderboard continues to serve curated scores.
 */
import { GatewayRunner } from "@/lib/evaluation/gateway-runner";
import type { EvaluationRunner } from "@/lib/evaluation/types";
import type { ModelCategory } from "@/lib/types";

export const runners: EvaluationRunner[] = [new GatewayRunner()];

export function getRunnerFor(
  category: ModelCategory,
): EvaluationRunner | undefined {
  return runners.find((r) => r.isReady() && r.supports(category));
}

export * from "@/lib/evaluation/types";
export { GatewayRunner, gatewaySlug } from "@/lib/evaluation/gateway-runner";
