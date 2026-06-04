/**
 * Vercel AI Gateway evaluation runner — PHASE 2 STUB.
 *
 * This is intentionally not wired up yet: shipping a curated leaderboard first
 * keeps the project deployable with zero credentials. When you're ready to run
 * live evaluations, install the AI SDK and implement `run()` as sketched below.
 *
 * Why the gateway: a single `AI_GATEWAY_API_KEY` (or Vercel OIDC in prod) gives
 * access to every provider behind plain "provider/model" strings, with built-in
 * observability, fallbacks, and zero-data-retention routing. No per-provider
 * SDKs to juggle.
 *
 *   pnpm add ai
 *
 *   import { generateText } from "ai";
 *
 *   const { text } = await generateText({
 *     model: gatewaySlug(model),        // e.g. "anthropic/claude-opus-4-8"
 *     prompt: item.input,
 *     temperature: options?.temperature ?? 0,
 *     maxOutputTokens: options?.maxOutputTokens ?? 2048,
 *   });
 *
 * Grade `text` against `item.expected` (exact match, numeric tolerance, or an
 * LLM-as-judge pass), aggregate into the benchmark's native metric, and emit a
 * `Score` with `source.kind = "crosshair-eval"` and `verified: true`.
 */
import type {
  EvaluationRunner,
  EvalRunInput,
  EvalRunResult,
} from "@/lib/evaluation/types";
import type { Model } from "@/lib/types";

/**
 * Maps an internal model id to a Vercel AI Gateway slug. Replace with a real
 * field on `Model` (e.g. `gatewaySlug`) once live evals are introduced.
 */
export function gatewaySlug(model: Model): string {
  const byId: Record<string, string> = {
    "claude-opus-4-8": "anthropic/claude-opus-4-8",
    "claude-sonnet-4-6": "anthropic/claude-sonnet-4-6",
    "claude-haiku-4-5": "anthropic/claude-haiku-4-5",
    "gpt-5-5": "openai/gpt-5.5",
    "gpt-5-2": "openai/gpt-5.2",
    "gemini-3-1-pro": "google/gemini-3.1-pro",
    "gemini-3-pro": "google/gemini-3-pro",
    "gemini-3-flash": "google/gemini-3-flash",
    "deepseek-v4-pro": "deepseek/deepseek-v4-pro",
    "deepseek-v4-flash": "deepseek/deepseek-v4-flash",
    "kimi-k2-6": "moonshotai/kimi-k2.6",
    "glm-5-1": "zai/glm-5.1",
    "qwen3-6-27b": "alibaba/qwen3.6-27b",
    "llama-4-maverick": "meta/llama-4-maverick",
    "mistral-large-3": "mistral/mistral-large-3",
    "grok-4-3": "xai/grok-4.3",
  };
  return byId[model.id] ?? `${model.providerId}/${model.id}`;
}

export class GatewayRunner implements EvaluationRunner {
  readonly id = "vercel-ai-gateway";

  isReady(): boolean {
    // Locally an explicit key; in production Vercel OIDC injects credentials.
    return Boolean(
      process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
    );
  }

  supports(category: Model["category"]): boolean {
    // The text gateway covers LLMs. World models need a different backend
    // (a simulator / video harness) — a separate runner will implement those.
    return category === "llm";
  }

  async run(input: EvalRunInput): Promise<EvalRunResult> {
    throw new Error(
      `GatewayRunner.run() is not implemented yet (requested ${input.model.id} ` +
        `on ${input.benchmark.id}). This is the phase-2 extension point: ` +
        "install the `ai` package and implement live evaluation as documented " +
        "at the top of gateway-runner.ts.",
    );
  }
}
