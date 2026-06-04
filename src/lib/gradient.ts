/**
 * Accent bar fill shared by the by-industry leader bars and the filter range
 * sliders. Ramps from a mid, saturated shade of the base color's hue to a
 * lighter one, interpolated in oklch with a hue sweep (relative-color
 * `oklch(from …)`) for high contrast and vivid color travel. Pair with a solid
 * `backgroundColor` fallback for engines without relative color.
 */
export function hueSweepFill(c: string): string {
  return `linear-gradient(90deg in oklch, oklch(from ${c} 0.62 calc(c + 0.05) calc(h - 18)), oklch(from ${c} 0.74 calc(c + 0.03) calc(h + 26)))`;
}
