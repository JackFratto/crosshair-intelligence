import { cn } from "@/lib/utils";
import { ProviderLogo } from "@/components/provider-logo";
import type { Provider } from "@/lib/types";

export interface ParetoPoint {
  id: string;
  label: string;
  /** Blended cost, $/1M tokens. */
  cost: number;
  /** Crosshair Index, 0–100. */
  chi: number;
  provider: Provider;
  license: string;
}

const FRONTIER = "#40a02b";
const PRICE_TICKS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];

function fmtCost(v: number) {
  if (v >= 10) return `$${v.toFixed(0)}`;
  if (v >= 1) return `$${v.toFixed(v % 1 ? 1 : 0)}`;
  return `$${v.toFixed(2)}`;
}

/**
 * Cost-vs-CHI Pareto. The cloud is squares tinted by provider; the green
 * frontier (cheaper AND higher-CHI = non-dominated) is drawn through logo
 * markers, and the optimal set is listed alongside. x is log(cost), REVERSED
 * so cheaper is on the right (desirable models land upper-right).
 */
export function ParetoChart({
  points,
  className,
}: {
  points: ParetoPoint[];
  className?: string;
}) {
  if (points.length < 2) {
    return (
      <div
        className={cn(
          "flex h-48 items-center justify-center rounded-xl border border-border/70 bg-card/40 px-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Not enough priced models to plot a cost–CHI Pareto.
      </div>
    );
  }

  const costs = points.map((p) => p.cost);
  const chis = points.map((p) => p.chi);
  const lx = (v: number) => Math.log(Math.max(v, 1e-4));
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const lxMin = lx(minCost);
  const lxSpan = lx(maxCost) - lxMin || 1;
  const yLo = Math.floor(Math.min(...chis) - 4);
  const yHi = Math.ceil(Math.max(...chis) + 4);
  const ySpan = yHi - yLo || 1;

  // Reversed x: cheap → right. y inverted: high CHI → top.
  const xPct = (cost: number) => 5 + (1 - (lx(cost) - lxMin) / lxSpan) * 90;
  const yPct = (chi: number) => 6 + (1 - (chi - yLo) / ySpan) * 88;

  const frontier = points.filter(
    (p) =>
      !points.some(
        (q) =>
          q !== p &&
          q.cost <= p.cost &&
          q.chi >= p.chi &&
          (q.cost < p.cost || q.chi > p.chi),
      ),
  );
  const frontierIds = new Set(frontier.map((p) => p.id));
  const linePts = [...frontier]
    .sort((a, b) => xPct(a.cost) - xPct(b.cost))
    .map((p) => `${xPct(p.cost).toFixed(2)},${yPct(p.chi).toFixed(2)}`)
    .join(" ");
  const optimal = [...frontier].sort((a, b) => b.chi - a.chi);

  const xTicks = PRICE_TICKS.filter((t) => t >= minCost * 0.92 && t <= maxCost * 1.08);
  const yTicks = [0, 1, 2, 3].map((i) => Math.round(yLo + (ySpan * i) / 3));

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/40", className)}>
      <div className="border-b border-border/60 px-4 py-3">
        <h3 className="font-semibold tracking-tight">Pareto Frontier</h3>
        <p className="text-xs text-muted-foreground">
          Model performance at each price point
        </p>
      </div>

      <div className="grid gap-5 p-4 lg:grid-cols-[1fr_14rem]">
        {/* Chart */}
        <div className="min-w-0">
          <div className="flex h-80">
            {/* y axis */}
            <div className="flex w-8 shrink-0 flex-col">
              <div className="relative flex-1">
                {yTicks.map((t) => (
                  <span
                    key={t}
                    className="tabular absolute right-1 -translate-y-1/2 text-[10px] text-muted-foreground"
                    style={{ top: `${yPct(t)}%` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="h-5" />
            </div>

            {/* plot + x axis */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="relative flex-1">
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  {xTicks.map((t) => (
                    <line
                      key={`x${t}`}
                      x1={xPct(t)}
                      x2={xPct(t)}
                      y1={0}
                      y2={100}
                      className="stroke-border/60"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {yTicks.map((t) => (
                    <line
                      key={`y${t}`}
                      x1={0}
                      x2={100}
                      y1={yPct(t)}
                      y2={yPct(t)}
                      className="stroke-border/60"
                      strokeWidth={1}
                      strokeDasharray="2 3"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  <polyline
                    points={linePts}
                    fill="none"
                    stroke={FRONTIER}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* cloud (non-frontier) */}
                {points.map(
                  (p) =>
                    !frontierIds.has(p.id) && (
                      <span
                        key={p.id}
                        title={`${p.label} · ${p.chi.toFixed(1)} · ${fmtCost(p.cost)}/M`}
                        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-[2px]"
                        style={{
                          left: `${xPct(p.cost)}%`,
                          top: `${yPct(p.chi)}%`,
                          backgroundColor: p.provider.color ?? "#6b7280",
                          opacity: 0.6,
                        }}
                      />
                    ),
                )}

                {/* frontier markers + labels */}
                {frontier.map((p) => (
                  <div
                    key={p.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${xPct(p.cost)}%`, top: `${yPct(p.chi)}%` }}
                  >
                    <div className="relative">
                      <span
                        className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium whitespace-nowrap shadow-sm"
                      >
                        {p.label}
                      </span>
                      <span
                        className="flex size-6 items-center justify-center rounded-md border-2 bg-background shadow-sm"
                        style={{ borderColor: FRONTIER }}
                      >
                        <ProviderLogo provider={p.provider} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* x axis */}
              <div className="relative h-5">
                {xTicks.map((t) => (
                  <span
                    key={t}
                    className="tabular absolute top-1 -translate-x-1/2 text-[10px] text-muted-foreground"
                    style={{ left: `${xPct(t)}%` }}
                  >
                    {fmtCost(t)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-1 text-center text-[10px] text-muted-foreground">
            Cost / 1M tokens (log) — cheaper →
          </p>
        </div>

        {/* Pareto-optimal list */}
        <div className="min-w-0 lg:border-l lg:border-border/60 lg:pl-4">
          <h4 className="text-sm font-semibold tracking-tight">
            Pareto Optimal Models
          </h4>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Top performers for their cost
          </p>
          <ul className="space-y-2">
            {optimal.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <ProviderLogo provider={p.provider} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{p.label}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {p.provider.name} · {p.license}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tabular text-xs font-semibold">
                    {p.chi.toFixed(1)}
                  </div>
                  <div className="tabular text-[10px] text-muted-foreground">
                    {fmtCost(p.cost)}/M
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
