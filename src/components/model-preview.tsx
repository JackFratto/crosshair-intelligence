import { memo } from "react";
import { AXIS_COLORS, AXIS_FALLBACK } from "@/lib/skill-colors";
import type { Model } from "@/lib/types";
import type { ModelPreviewData } from "@/lib/skillweb";

function fmtCtx(tokens?: number | null) {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  if (tokens >= 1_000) return `${tokens / 1_000}K`;
  return `${tokens}`;
}

function fmtPrice(v: number) {
  return `$${parseFloat(v.toFixed(3))}`;
}

const SIZE = 150;
const C = SIZE / 2;
const R = 52;

/** Compact, static preview shown when hovering a model name in the leaderboard. */
export const ModelPreview = memo(function ModelPreview({
  model,
  preview,
}: {
  model: Model;
  preview: ModelPreviewData;
}) {
  const axes = preview.axes;
  const n = axes.length;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, r: number): [number, number] => [
    C + r * Math.cos(angle(i)),
    C + r * Math.sin(angle(i)),
  ];
  const fmt = (xy: [number, number]) => `${xy[0].toFixed(1)},${xy[1].toFixed(1)}`;
  const center: [number, number] = [C, C];
  const points = axes.map((a, i) =>
    a.score == null ? null : pt(i, (a.score / 100) * R),
  );
  const polygon = axes.map((_, i) => fmt(points[i] ?? center)).join(" ");
  const colorOf = (id: string) => AXIS_COLORS[id] ?? AXIS_FALLBACK;

  const p = preview.pricing;
  const priceItems = p
    ? [
        { label: "Input", value: p.inputPerM },
        { label: "Output", value: p.outputPerM },
        ...(p.cacheReadPerM != null
          ? [{ label: "Cache", value: p.cacheReadPerM }]
          : []),
      ]
    : [];

  const meta = [
    {
      label: "Context",
      value: model.contextWindow ? fmtCtx(model.contextWindow) : "—",
    },
    { label: "Params", value: model.paramsB ? `${model.paramsB}B` : "—" },
    { label: "Released", value: model.releaseDate ?? "—" },
  ];

  return (
    <div className="w-72 space-y-3 p-4">
      <div className="font-semibold tracking-tight">{model.name}</div>

      {n > 0 && (
        <div className="flex items-center gap-3">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="block h-auto w-24 shrink-0"
            aria-hidden
          >
            {[0.5, 1].map((lvl) => (
              <polygon
                key={lvl}
                points={axes.map((_, i) => fmt(pt(i, lvl * R))).join(" ")}
                className="fill-none stroke-border"
                strokeWidth={1}
              />
            ))}
            {axes.map((_, i) => {
              const [x, y] = pt(i, R);
              return (
                <line
                  key={i}
                  x1={C}
                  y1={C}
                  x2={x}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={0.75}
                />
              );
            })}
            <polygon
              points={polygon}
              className="fill-foreground/10 stroke-foreground/40"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {axes.map((a, i) => {
              const pp = points[i];
              return pp ? (
                <circle
                  key={a.id}
                  cx={pp[0]}
                  cy={pp[1]}
                  r={2.5}
                  fill={colorOf(a.id)}
                />
              ) : null;
            })}
          </svg>

          <ul className="min-w-0 flex-1 space-y-1 text-[11px]">
            {axes.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colorOf(a.id) }}
                  />
                  <span className="truncate text-muted-foreground">
                    {a.short}
                  </span>
                </span>
                <span className="tabular shrink-0 font-medium">
                  {a.score != null ? Math.round(a.score) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {priceItems.length > 0 && (
        <div className="space-y-1 border-t border-border/60 pt-2.5">
          <div className="text-xs text-muted-foreground">
            Token cost{" "}
            <span className="text-muted-foreground/70">($ / 1M)</span>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-xs">
            {priceItems.map((it) => (
              <div key={it.label}>
                <dt className="text-muted-foreground">{it.label}</dt>
                <dd className="tabular mt-0.5 font-medium">
                  {fmtPrice(it.value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {preview.speed && (
        <div className="flex items-baseline justify-between border-t border-border/60 pt-2.5 text-xs">
          <span className="text-muted-foreground">
            Output speed{" "}
            <span className="text-muted-foreground/70">(tok/s)</span>
          </span>
          <span className="tabular font-medium">
            {Math.round(preview.speed.outputTps)}
          </span>
        </div>
      )}

      <dl className="grid grid-cols-3 gap-2 border-t border-border/60 pt-2.5 text-xs">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="text-muted-foreground">{m.label}</dt>
            <dd className="tabular mt-0.5 font-medium">{m.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
});
