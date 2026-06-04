import type { Pricing } from "@/lib/types";

/**
 * Blended cost per 1M tokens using a 3:1 input:output weighting — the common
 * industry convention (e.g. Artificial Analysis) for a single comparable price.
 */
export function blendedPrice(p: Pricing): number {
  return (3 * p.inputPerM + p.outputPerM) / 4;
}
