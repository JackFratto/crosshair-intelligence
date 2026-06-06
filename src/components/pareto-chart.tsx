"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  ArrowsHorizontalIcon,
  ArrowsVerticalIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "@/components/provider-logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Provider } from "@/lib/types";

export interface ParetoPoint {
  id: string;
  label: string;
  /** Blended cost, $/1M tokens. */
  cost: number;
  /** Crosshair Index, 0–100. */
  chi: number;
  /** Output throughput, tokens/sec. Optional — absent when unsourced. */
  speed?: number;
  provider: Provider;
  license: string;
}

const FRONTIER = "#40a02b";
const PRICE_TICKS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
const SPEED_TICKS = [10, 20, 50, 100, 150, 200, 300, 500, 800, 1200, 2000];
// Plot inset (percent) so markers/labels never sit on the chart edge.
const PAD = 6;

function fmtCost(v: number) {
  if (v >= 10) return `$${v.toFixed(0)}`;
  if (v >= 1) return `$${v.toFixed(v % 1 ? 1 : 0)}`;
  return `$${v.toFixed(2)}`;
}

function fmtSpeed(v: number) {
  return `${Math.round(v)}`;
}

export type MetricId = "chi" | "cost" | "speed";

interface MetricDef {
  id: MetricId;
  /** Toggle label. */
  label: string;
  /** Full axis title. */
  title: string;
  /** Adverb for the "good" direction (toward right / top). */
  good: string;
  higherIsBetter: boolean;
  log: boolean;
  get: (p: ParetoPoint) => number | undefined;
  fmt: (v: number) => string;
}

const METRICS: Record<MetricId, MetricDef> = {
  chi: {
    id: "chi",
    label: "Performance",
    title: "Crosshair Index",
    good: "higher",
    higherIsBetter: true,
    log: false,
    get: (p) => p.chi,
    fmt: (v) => v.toFixed(1),
  },
  cost: {
    id: "cost",
    label: "Cost",
    title: "Cost / 1M tokens",
    good: "cheaper",
    higherIsBetter: false,
    log: true,
    get: (p) => p.cost,
    fmt: fmtCost,
  },
  speed: {
    id: "speed",
    label: "Speed",
    title: "Output speed (tok/s)",
    good: "faster",
    higherIsBetter: true,
    log: true,
    get: (p) => p.speed,
    fmt: fmtSpeed,
  },
};
const METRIC_ORDER: MetricId[] = ["chi", "cost", "speed"];
/** Options for the global axis selector (id + label), in display order. */
export const PARETO_METRICS: { id: MetricId; label: string }[] = METRIC_ORDER.map(
  (id) => ({ id, label: METRICS[id].label }),
);
/** Default axis order [y, x] when the caller hasn't picked an explicit pair. */
const DEFAULT_PAIR: [MetricId, MetricId] = ["chi", "cost"];

const atLeast = (d: MetricDef, a: number, b: number) =>
  d.higherIsBetter ? a >= b : a <= b;
const strictly = (d: MetricDef, a: number, b: number) =>
  d.higherIsBetter ? a > b : a < b;

/** A value→[0,1] goodness map (1 = best), direction- and log-aware. */
function makeGoodness(def: MetricDef, values: number[]) {
  const s = def.log
    ? (v: number) => Math.log(Math.max(v, 1e-4))
    : (v: number) => v;
  const scaled = values.map(s);
  const lo = Math.min(...scaled);
  const span = Math.max(...scaled) - lo || 1;
  return (v: number) => {
    const t = (s(v) - lo) / span;
    return def.higherIsBetter ? t : 1 - t;
  };
}

/** Build a positioned, direction-aware axis from the points that carry it. */
function makeAxis(def: MetricDef, values: number[], orient: "x" | "y") {
  const goodness = makeGoodness(def, values);
  const vmin = Math.min(...values);
  const vmax = Math.max(...values);
  // best → right (x) / top (y); always lands desirable models upper-right.
  const pos = (v: number) => {
    const g = Math.min(1, Math.max(0, goodness(v)));
    const inset = g * (100 - 2 * PAD);
    return orient === "x" ? PAD + inset : PAD + (100 - 2 * PAD) - inset;
  };
  const ticks = (() => {
    if (def.log) {
      const cand = def.id === "cost" ? PRICE_TICKS : SPEED_TICKS;
      const f = cand.filter((t) => t >= vmin * 0.92 && t <= vmax * 1.08);
      return f.length ? f : [vmin, vmax];
    }
    const lo = Math.floor(vmin);
    const hi = Math.ceil(vmax);
    const range = hi - lo || 1;
    return [0, 1, 2, 3].map((i) => Math.round(lo + (range * i) / 3));
  })();
  return { def, pos, ticks };
}

function tip(p: ParetoPoint) {
  return [
    p.label,
    `CHI ${p.chi.toFixed(1)}`,
    `${fmtCost(p.cost)}/M`,
    p.speed != null ? `${fmtSpeed(p.speed)} tok/s` : "speed n/a",
  ].join(" · ");
}

/**
 * Cost / performance / speed Pareto explorer. Pick any two or three of the
 * metrics: two metrics plot the familiar 2-D non-dominated frontier; all three
 * plot the rotatable isometric convex hull of the 3-D Pareto-optimal set.
 */
export function ParetoChart({
  points,
  axes,
  onPair,
  className,
}: {
  points: ParetoPoint[];
  /** Globally-selected metrics: two → frontier, three → convex hull. */
  axes: MetricId[];
  /** When provided (2-D frontier only), renders the axis pickers in the header. */
  onPair?: (next: [MetricId, MetricId]) => void;
  className?: string;
}) {
  const is3 = axes.length >= 3;

  // 2-D axis assignment honors the caller's explicit order: axes[0] → vertical
  // (Y), axes[1] → horizontal (X). The selector controls this directly.
  const [yMetric, xMetric] = useMemo(() => {
    const pair = (axes.length >= 2 ? axes : DEFAULT_PAIR).slice(0, 2);
    return [pair[0], pair[1]] as [MetricId, MetricId];
  }, [axes]);

  // Picking the metric already on the other axis swaps the two, so the axes
  // stay distinct.
  const setY = (m: MetricId) =>
    onPair?.(m === xMetric ? [m, yMetric] : [m, xMetric]);
  const setX = (m: MetricId) =>
    onPair?.(m === yMetric ? [xMetric, m] : [yMetric, m]);

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card/40", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h3 className="font-semibold tracking-tight">
            {is3 ? "Pareto Frontier Surface" : "Pareto Frontier"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {is3
              ? "The stepped non-dominated surface across all three metrics — drag to rotate"
              : "Non-dominated trade-off between the two selected metrics"}
          </p>
        </div>
        {!is3 && onPair && (
          <div className="flex shrink-0 items-center gap-1.5">
            <AxisSelect orient="y" value={yMetric} onChange={setY} />
            <span className="text-[11px] text-muted-foreground">vs</span>
            <AxisSelect orient="x" value={xMetric} onChange={setX} />
          </div>
        )}
      </div>

      {is3 ? (
        <HullView points={points} />
      ) : (
        <FrontView points={points} xMetric={xMetric} yMetric={yMetric} />
      )}
    </div>
  );
}

const METRIC_LABEL = (id: MetricId): string =>
  PARETO_METRICS.find((o) => o.id === id)?.label ?? id;

/** A single axis picker: an orientation icon plus a metric dropdown. */
function AxisSelect({
  orient,
  value,
  onChange,
}: {
  orient: "x" | "y";
  value: MetricId;
  onChange: (m: MetricId) => void;
}) {
  const Icon = orient === "y" ? ArrowsVerticalIcon : ArrowsHorizontalIcon;
  const label = orient === "y" ? "Vertical axis" : "Horizontal axis";
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MetricId)}>
      <SelectTrigger
        size="sm"
        aria-label={label}
        title={label}
        className="gap-1.5"
      >
        <Icon weight="thin" className="size-3.5 text-muted-foreground" />
        <SelectValue>{(v) => METRIC_LABEL(v as MetricId)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PARETO_METRICS.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Shared sidebar: the Pareto-optimal models, best first. */
function OptimalList({
  models,
  caption,
}: {
  models: ParetoPoint[];
  caption: string;
}) {
  return (
    <div className="min-w-0 lg:border-l lg:border-border/60 lg:pl-4">
      <h4 className="text-sm font-semibold tracking-tight">
        Pareto Optimal Models
      </h4>
      <p className="mb-2 text-[11px] text-muted-foreground">{caption}</p>
      <ul className="space-y-2">
        {models.map((p) => (
          <li key={p.id}>
            <Link
              href={`/models/${p.id}`}
              className="-mx-1 flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-muted/50"
            >
              <ProviderLogo provider={p.provider} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium">{p.label}</div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {p.provider.name}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="tabular text-xs font-semibold">
                  {p.chi.toFixed(1)}
                </div>
                <div className="tabular text-[10px] text-muted-foreground">
                  {fmtCost(p.cost)}/M
                  {p.speed != null && <> · {fmtSpeed(p.speed)} tok/s</>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------- 2-D frontier ---

/**
 * rAF position tween. Each id glides from its current displayed [x, y] toward
 * the new target whenever `sig` changes — so markers and the frontier line move
 * together when filters update, rather than snapping.
 */
function useGlide(
  targets: Map<string, [number, number]>,
  sig: string,
): Map<string, [number, number]> {
  const [display, setDisplay] = useState<Map<string, [number, number]>>(
    () => new Map(targets),
  );
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    if (raf.current) cancelAnimationFrame(raf.current);
    let from: Map<string, [number, number]> | null = null;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 300);
      const e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay((cur) => {
        if (!from) {
          const f = new Map<string, [number, number]>();
          targets.forEach((tg, id) => f.set(id, cur.get(id) ?? tg));
          from = f;
        }
        const d = new Map<string, [number, number]>();
        targets.forEach((tg, id) => {
          const fr = from!.get(id) ?? tg;
          d.set(id, [fr[0] + (tg[0] - fr[0]) * e, fr[1] + (tg[1] - fr[1]) * e]);
        });
        return d;
      });
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  return display;
}

function FrontView({
  points,
  xMetric,
  yMetric,
}: {
  points: ParetoPoint[];
  xMetric: MetricId;
  yMetric: MetricId;
}) {
  const xDef = METRICS[xMetric];
  const yDef = METRICS[yMetric];

  const view = useMemo(() => {
    // A point is plottable only if it has BOTH selected metrics.
    const plotted = points.filter(
      (p) => xDef.get(p) != null && yDef.get(p) != null,
    );
    if (plotted.length < 2) return null;

    const xAxis = makeAxis(xDef, plotted.map((p) => xDef.get(p)!), "x");
    const yAxis = makeAxis(yDef, plotted.map((p) => yDef.get(p)!), "y");

    // Frontier: non-dominated on the two selected axes.
    const frontier = plotted.filter(
      (p) =>
        !plotted.some((q) => {
          if (q === p) return false;
          const qx = xDef.get(q)!;
          const qy = yDef.get(q)!;
          const px = xDef.get(p)!;
          const py = yDef.get(p)!;
          return (
            atLeast(xDef, qx, px) &&
            atLeast(yDef, qy, py) &&
            (strictly(xDef, qx, px) || strictly(yDef, qy, py))
          );
        }),
    );
    const frontierIds = new Set(frontier.map((p) => p.id));
    const optimal = [...frontier].sort(
      (a, b) => yAxis.pos(yDef.get(a)!) - yAxis.pos(yDef.get(b)!),
    );

    return { plotted, xAxis, yAxis, frontier, frontierIds, optimal };
  }, [points, xDef, yDef]);

  // Glide markers + line to their new spots whenever the filtered set changes.
  const targets = useMemo(() => {
    const m = new Map<string, [number, number]>();
    if (view)
      view.plotted.forEach((p) =>
        m.set(p.id, [
          view.xAxis.pos(xDef.get(p)!),
          view.yAxis.pos(yDef.get(p)!),
        ]),
      );
    return m;
  }, [view, xDef, yDef]);
  const sig = [...targets]
    .map(([id, [x, y]]) => `${id}:${Math.round(x)},${Math.round(y)}`)
    .join("|");
  const glide = useGlide(targets, sig);

  if (!view) {
    return (
      <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Not enough models have both {xDef.label.toLowerCase()} and{" "}
        {yDef.label.toLowerCase()} data to plot. Try a different metric.
      </div>
    );
  }

  const gp = (p: ParetoPoint): [number, number] =>
    glide.get(p.id) ?? [
      view.xAxis.pos(xDef.get(p)!),
      view.yAxis.pos(yDef.get(p)!),
    ];
  // Frontier line from the glided positions (ordered by target x so it never
  // tangles mid-glide), extended flat to the left and right edges.
  const fr = [...view.frontier].sort(
    (a, b) => view.xAxis.pos(xDef.get(a)!) - view.xAxis.pos(xDef.get(b)!),
  );
  const fpts = fr.map(gp);
  const linePts = fpts.length
    ? [
        [0, fpts[0][1]] as [number, number],
        ...fpts,
        [100, fpts[fpts.length - 1][1]] as [number, number],
      ]
        .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
        .join(" ")
    : "";

  return (
    <div className="grid gap-5 p-4 lg:grid-cols-[1fr_14rem]">
      <div className="min-w-0">
        <div className="flex h-80">
          {/* y axis */}
          <div className="flex w-12 shrink-0">
            <span className="flex w-4 items-center justify-center">
              <span className="rotate-180 text-[10px] whitespace-nowrap text-muted-foreground [writing-mode:vertical-rl]">
                {yDef.title} — {yDef.good} ↑
              </span>
            </span>
            <div className="relative flex-1">
              {view.yAxis.ticks.map((t) => (
                <span
                  key={t}
                  className="tabular absolute right-1 -translate-y-1/2 text-[10px] text-muted-foreground"
                  style={{ top: `${view.yAxis.pos(t)}%` }}
                >
                  {yDef.fmt(t)}
                </span>
              ))}
            </div>
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
                {view.xAxis.ticks.map((t) => (
                  <line
                    key={`x${t}`}
                    x1={view.xAxis.pos(t)}
                    x2={view.xAxis.pos(t)}
                    y1={0}
                    y2={100}
                    className="stroke-border/60"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {view.yAxis.ticks.map((t) => (
                  <line
                    key={`y${t}`}
                    x1={0}
                    x2={100}
                    y1={view.yAxis.pos(t)}
                    y2={view.yAxis.pos(t)}
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

              {/* cloud (dominated) */}
              {view.plotted.map(
                (p) =>
                  !view.frontierIds.has(p.id) && (
                    <span
                      key={p.id}
                      title={tip(p)}
                      className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${gp(p)[0]}%`,
                        top: `${gp(p)[1]}%`,
                        backgroundColor: p.provider.color ?? "#6b7280",
                        opacity: 0.55,
                      }}
                    />
                  ),
              )}

              {/* frontier markers + labels */}
              {view.frontier.map((p) => (
                <div
                  key={p.id}
                  title={tip(p)}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${gp(p)[0]}%`,
                    top: `${gp(p)[1]}%`,
                  }}
                >
                  <div className="relative">
                    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded border border-border bg-background px-1 py-0.5 text-[9px] font-medium whitespace-nowrap shadow-sm">
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
              {view.xAxis.ticks.map((t) => (
                <span
                  key={t}
                  className="tabular absolute top-1 -translate-x-1/2 text-[10px] text-muted-foreground"
                  style={{ left: `${view.xAxis.pos(t)}%` }}
                >
                  {xDef.fmt(t)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-1 text-center text-[10px] text-muted-foreground">
          {xDef.title}
          {xDef.log ? " (log)" : ""} — {xDef.good} →
        </p>
      </div>

      <OptimalList
        models={view.optimal}
        caption={`Non-dominated on ${xDef.label.toLowerCase()} × ${yDef.label.toLowerCase()}`}
      />
    </div>
  );
}

// ----------------------------------------------- 3-D Pareto frontier surface -

interface Vec3 {
  x: number;
  y: number;
  z: number;
}
interface Quad {
  quad: Vec3[];
  /** Approximate outward normal, for shading. */
  normal: Vec3;
}

/**
 * The good-facing boundary of the dominated region is the height field
 * z_max(x, y) = max{ cost_i : perf_i ≥ x, speed_i ≥ y } — a stepped terrain.
 * We emit its top faces plus the risers between adjacent steps: this is the
 * exact Pareto frontier surface, attached to the axes by construction, with no
 * convex hull and no intersecting faces.
 */
function frontierSurface(P: Vec3[]): Quad[] {
  const eq = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  const uniq = (vs: number[]) => [...new Set(vs)].sort((a, b) => a - b);
  const X = uniq(P.map((p) => p.x));
  const Y = uniq(P.map((p) => p.y));
  const m = X.length;
  const n = Y.length;
  const heightAt = (xr: number, yr: number) => {
    let h = 0;
    for (const p of P)
      if (p.x >= xr - 1e-9 && p.y >= yr - 1e-9) h = Math.max(h, p.z);
    return h;
  };
  const H = X.map((xr) => Y.map((yr) => heightAt(xr, yr)));
  const xL = (a: number) => (a > 0 ? X[a - 1] : 0);
  const yL = (b: number) => (b > 0 ? Y[b - 1] : 0);
  const hAt = (a: number, b: number) =>
    a >= 0 && a < m && b >= 0 && b < n ? H[a][b] : 0;
  const faces: Quad[] = [];

  // Top faces — greedy maximal rectangles of equal height, so a flat region is
  // one polygon (one outline) instead of a grid of cells.
  const used = X.map(() => Y.map(() => false));
  for (let a = 0; a < m; a++) {
    for (let b = 0; b < n; b++) {
      if (used[a][b]) continue;
      const h = H[a][b];
      if (h <= 1e-9) {
        used[a][b] = true;
        continue;
      }
      let a2 = a;
      while (a2 + 1 < m && !used[a2 + 1][b] && eq(H[a2 + 1][b], h)) a2++;
      let b2 = b;
      let grow = true;
      while (grow && b2 + 1 < n) {
        for (let aa = a; aa <= a2; aa++)
          if (used[aa][b2 + 1] || !eq(H[aa][b2 + 1], h)) {
            grow = false;
            break;
          }
        if (grow) b2++;
      }
      for (let aa = a; aa <= a2; aa++)
        for (let bb = b; bb <= b2; bb++) used[aa][bb] = true;
      const x0 = xL(a);
      const x1 = X[a2];
      const y0 = yL(b);
      const y1 = Y[b2];
      faces.push({
        quad: [
          { x: x0, y: y0, z: h },
          { x: x1, y: y0, z: h },
          { x: x1, y: y1, z: h },
          { x: x0, y: y1, z: h },
        ],
        normal: { x: 0, y: 0, z: 1 },
      });
    }
  }

  // Risers at the +perf edges (x = X[a]), run-length-merged along y.
  for (let a = 0; a < m; a++) {
    let b = 0;
    while (b < n) {
      const lo = Math.min(hAt(a, b), hAt(a + 1, b));
      const hi = Math.max(hAt(a, b), hAt(a + 1, b));
      if (eq(lo, hi)) {
        b++;
        continue;
      }
      let b2 = b;
      while (
        b2 + 1 < n &&
        eq(Math.min(hAt(a, b2 + 1), hAt(a + 1, b2 + 1)), lo) &&
        eq(Math.max(hAt(a, b2 + 1), hAt(a + 1, b2 + 1)), hi)
      )
        b2++;
      const x1 = X[a];
      faces.push({
        quad: [
          { x: x1, y: yL(b), z: lo },
          { x: x1, y: Y[b2], z: lo },
          { x: x1, y: Y[b2], z: hi },
          { x: x1, y: yL(b), z: hi },
        ],
        normal: { x: 1, y: 0, z: 0 },
      });
      b = b2 + 1;
    }
  }

  // Risers at the +speed edges (y = Y[b]), run-length-merged along x.
  for (let b = 0; b < n; b++) {
    let a = 0;
    while (a < m) {
      const lo = Math.min(hAt(a, b), hAt(a, b + 1));
      const hi = Math.max(hAt(a, b), hAt(a, b + 1));
      if (eq(lo, hi)) {
        a++;
        continue;
      }
      let a2 = a;
      while (
        a2 + 1 < m &&
        eq(Math.min(hAt(a2 + 1, b), hAt(a2 + 1, b + 1)), lo) &&
        eq(Math.max(hAt(a2 + 1, b), hAt(a2 + 1, b + 1)), hi)
      )
        a2++;
      const y1 = Y[b];
      faces.push({
        quad: [
          { x: xL(a), y: y1, z: lo },
          { x: X[a2], y: y1, z: lo },
          { x: X[a2], y: y1, z: hi },
          { x: xL(a), y: y1, z: hi },
        ],
        normal: { x: 0, y: 1, z: 0 },
      });
      a = a2 + 1;
    }
  }

  return faces;
}

const EL = 0.5; // fixed elevation tilt (~29°)
const HULL_SIZE = 320;
const HULL_C = HULL_SIZE / 2;
const HULL_SCALE = 140;

/** Rotate a point around the vertical (up) axis by az, then tilt by EL. */
function rotate(v: Vec3, az: number): Vec3 {
  const ca = Math.cos(az);
  const sa = Math.sin(az);
  const ce = Math.cos(EL);
  const se = Math.sin(EL);
  const rx = v.x * ca + v.z * sa;
  const rz = -v.x * sa + v.z * ca;
  const ry = v.y;
  return { x: rx, y: ry * ce - rz * se, z: ry * se + rz * ce };
}
function project(v: Vec3, az: number, zoom = 1) {
  const r = rotate({ x: v.x - 0.5, y: v.y - 0.5, z: v.z - 0.5 }, az);
  const s = HULL_SCALE * zoom;
  return { sx: HULL_C + r.x * s, sy: HULL_C - r.y * s, depth: r.z };
}

// World mapping: x = performance, y (up) = speed, z = cost.
const CUBE_CORNERS: Vec3[] = [
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 1, z: 0 },
  { x: 1, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
  { x: 1, y: 1, z: 1 },
];
const CUBE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 4],
  [2, 6], [3, 5], [3, 6], [4, 7], [5, 7], [6, 7],
];
// World mapping: x = performance, y (up) = speed, z = cost. Each axis runs from
// the "worst" corner outward; the fixed legend below the chart names the colors.
const AXES_3D: { to: Vec3; color: string; label: string; hint: string }[] = [
  { to: { x: 1, y: 0, z: 0 }, color: "#1e66f5", label: "Performance", hint: "higher" },
  { to: { x: 0, y: 0, z: 1 }, color: "#d97706", label: "Cost", hint: "cheaper" },
  { to: { x: 0, y: 1, z: 0 }, color: "#8b5cf6", label: "Speed", hint: "faster" },
];

// Default azimuth: looks straight down the diagonal toward the optimal corner
// (best performance + speed + cost), so the frontier surface faces the user
// head-on and the three axes splay out as a symmetric tripod. -π/4 maximizes the
// surface-toward-camera projection at the fixed elevation tilt.
const DEFAULT_AZ = -Math.PI / 4;

function HullView({ points }: { points: ParetoPoint[] }) {
  const [az, setAz] = useState(DEFAULT_AZ);
  const [hover, setHover] = useState<{
    p: ParetoPoint;
    sx: number;
    sy: number;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const drag = useRef<{ x: number; az: number } | null>(null);

  // Geometry (independent of rotation): normalize, find the 3-D Pareto set,
  // build the stepped frontier surface.
  const geom = useMemo(() => {
    const plotted = points.filter(
      (p) => p.chi != null && p.cost != null && p.speed != null,
    );
    if (plotted.length < 3) return null;
    const gx = makeGoodness(METRICS.chi, plotted.map((p) => p.chi));
    const gy = makeGoodness(METRICS.speed, plotted.map((p) => p.speed!));
    const gz = makeGoodness(METRICS.cost, plotted.map((p) => p.cost));
    const nodes = plotted.map((p) => ({
      p,
      pos: { x: gx(p.chi), y: gy(p.speed!), z: gz(p.cost) } as Vec3,
    }));
    const optimal = nodes.filter(
      (a) =>
        !nodes.some(
          (b) =>
            b !== a &&
            b.pos.x >= a.pos.x &&
            b.pos.y >= a.pos.y &&
            b.pos.z >= a.pos.z &&
            (b.pos.x > a.pos.x || b.pos.y > a.pos.y || b.pos.z > a.pos.z),
        ),
    );
    const optimalIds = new Set(optimal.map((d) => d.p.id));
    const faces = frontierSurface(optimal.map((d) => d.pos));
    const ranked = [...optimal].sort(
      (a, b) =>
        b.pos.x + b.pos.y + b.pos.z - (a.pos.x + a.pos.y + a.pos.z),
    );
    return { nodes, optimal, optimalIds, faces, ranked };
  }, [points]);

  function onDown(e: ReactPointerEvent) {
    drag.current = { x: e.clientX, az };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e: ReactPointerEvent) {
    if (!drag.current) return;
    setAz(drag.current.az + (e.clientX - drag.current.x) * 0.01);
  }
  function onUp(e: ReactPointerEvent) {
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  if (!geom) {
    return (
      <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Not enough models have performance, cost, and speed data to build the
        frontier surface. Deselect one metric.
      </div>
    );
  }

  // Project everything at the current azimuth.
  const cubePts = CUBE_CORNERS.map((c) => project(c, az, zoom));
  const faceItems = geom.faces
    .map((f) => {
      const vs = f.quad.map((p) => project(p, az, zoom));
      const depth = vs.reduce((s, v) => s + v.depth, 0) / vs.length;
      const facing = Math.abs(rotate(f.normal, az).z); // 0 edge-on … 1 head-on
      const riser = f.normal.z < 0.5; // tops face +z; risers are the level changes
      return { depth, vs, facing, riser };
    })
    .sort((a, b) => a.depth - b.depth);
  // Markers are an overlay ABOVE the surface — always visible, never occluded —
  // each with a hover detail.
  const markerPts = geom.nodes
    .map((n) => {
      const pr = project(n.pos, az, zoom);
      return {
        p: n.p,
        sx: pr.sx,
        sy: pr.sy,
        onHull: geom.optimalIds.has(n.p.id),
      };
    })
    // dots first, logos last → on-frontier logos always paint above the dots
    .sort((a, b) => Number(a.onHull) - Number(b.onHull));
  const pct = (v: number) => `${(v / HULL_SIZE) * 100}%`;

  return (
    <div className="grid gap-5 p-4 lg:grid-cols-[1fr_14rem]">
      <div className="min-w-0">
        <div
          className="relative mx-auto aspect-square w-full max-w-[560px] cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${HULL_SIZE} ${HULL_SIZE}`}
            aria-label="Rotatable isometric Pareto frontier surface"
          >
            {/* reference cube */}
            {CUBE_EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={cubePts[a].sx}
                y1={cubePts[a].sy}
                x2={cubePts[b].sx}
                y2={cubePts[b].sy}
                className="stroke-border/50"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* colored axes from the worst corner outward, labelled at the tip */}
            {AXES_3D.map((ax) => {
              const o = project({ x: 0, y: 0, z: 0 }, az, zoom);
              const t = project(ax.to, az, zoom);
              const dx = t.sx - HULL_C;
              const dy = t.sy - HULL_C;
              const d = Math.hypot(dx, dy) || 1;
              const lx = t.sx + (dx / d) * 13;
              const ly = t.sy + (dy / d) * 13;
              return (
                <g key={ax.label}>
                  <line
                    x1={o.sx}
                    y1={o.sy}
                    x2={t.sx}
                    y2={t.sy}
                    stroke={ax.color}
                    strokeOpacity={0.85}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill={ax.color}
                  >
                    {ax.label}
                  </text>
                  <text
                    x={lx}
                    y={ly + 8}
                    textAnchor="middle"
                    fontSize={7}
                    className="fill-muted-foreground"
                  >
                    {ax.hint}
                  </text>
                </g>
              );
            })}

            {/* frontier faces (depth-sorted); only risers are stroked, so flat
                tops show no spurious lines — just the actual level changes */}
            {faceItems.map((f, i) => (
              <polygon
                key={i}
                points={f.vs.map((v) => `${v.sx},${v.sy}`).join(" ")}
                fill={FRONTIER}
                fillOpacity={0.07 + 0.14 * f.facing}
                stroke={f.riser ? FRONTIER : "none"}
                strokeOpacity={0.55}
                strokeWidth={1.25}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* zoom controls */}
          <div
            className="absolute top-1.5 right-1.5 z-10 flex flex-col overflow-hidden rounded-md border border-border bg-background"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(2.4, z * 1.2))}
              className="flex size-6 items-center justify-center text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(0.6, z / 1.2))}
              className="flex size-6 items-center justify-center border-t border-border text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            >
              −
            </button>
          </div>

          {/* model markers — always on top, never occluded by the surface */}
          {markerPts.map((m) => (
            <div
              key={m.p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pct(m.sx), top: pct(m.sy) }}
              onMouseEnter={() => setHover({ p: m.p, sx: m.sx, sy: m.sy })}
              onMouseLeave={() => setHover(null)}
            >
              <div style={{ transform: `scale(${zoom})` }}>
                {m.onHull ? (
                  <span className="flex size-6 items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-black/10">
                    <ProviderLogo provider={m.p.provider} />
                  </span>
                ) : (
                  <span
                    className="block size-2.5 rounded-full ring-1 ring-white"
                    style={{ backgroundColor: m.p.provider.color ?? "#6b7280" }}
                  />
                )}
              </div>
            </div>
          ))}

          {/* hover detail — for both dots and logos */}
          {hover && (
            <div
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-2"
              style={{ left: pct(hover.sx), top: pct(hover.sy) }}
            >
              <div className="rounded-lg border border-border bg-background px-2.5 py-1.5 shadow-md">
                <div className="flex items-center gap-1.5">
                  <ProviderLogo provider={hover.p.provider} />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {hover.p.label}
                  </span>
                </div>
                <div className="tabular mt-0.5 text-[10px] whitespace-nowrap text-muted-foreground">
                  CHI {hover.p.chi.toFixed(1)} · {fmtCost(hover.p.cost)}/M
                  {hover.p.speed != null && (
                    <> · {fmtSpeed(hover.p.speed)} tok/s</>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Drag to rotate · the stepped surface is the Pareto frontier
        </p>
      </div>

      <OptimalList
        models={geom.ranked.map((d) => d.p)}
        caption="Non-dominated on performance × cost × speed"
      />
    </div>
  );
}
