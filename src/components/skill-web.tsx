"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AtomIcon,
  BankIcon,
  BriefcaseIcon,
  CalculatorIcon,
  CodeIcon,
  CubeIcon,
  FastForwardIcon,
  FilmStripIcon,
  FlaskIcon,
  ScalesIcon,
  StethoscopeIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AXIS_COLORS as COLORS,
  AXIS_FALLBACK as FALLBACK,
} from "@/lib/skill-colors";
import type { SkillWebData } from "@/lib/skillweb";

const ICONS: Record<string, PhosphorIcon> = {
  "software-engineering": CodeIcon,
  "investment-banking": BankIcon,
  "corporate-law": ScalesIcon,
  medicine: StethoscopeIcon,
  "scientific-research": FlaskIcon,
  "management-consulting": BriefcaseIcon,
  "accounting-audit": CalculatorIcon,
  // world-model capabilities
  "video-understanding": FilmStripIcon,
  "action-anticipation": FastForwardIcon,
  "generative-physics": AtomIcon,
  "physical-ai-generation": CubeIcon,
};

const SIZE = 300;
const C = SIZE / 2;
const MAXR = 104;
const RINGS = [0.25, 0.5, 0.75, 1];

export function SkillWeb({
  data,
  modelName,
}: {
  data: SkillWebData;
  modelName: string;
}) {
  const profiles = data.industries;
  const N = profiles.length;

  const [active, setActive] = useState(() => {
    let best = 0;
    let bestScore = -1;
    profiles.forEach((p, i) => {
      if (p.score != null && p.score > bestScore) {
        bestScore = p.score;
        best = i;
      }
    });
    return best;
  });

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;
  const pt = (i: number, r: number): [number, number] => [
    C + r * Math.cos(angle(i)),
    C + r * Math.sin(angle(i)),
  ];
  const fmt = (xy: [number, number]) => `${xy[0].toFixed(1)},${xy[1].toFixed(1)}`;
  const colorOf = (i: number) => COLORS[profiles[i].industry.id] ?? FALLBACK;

  // null = the model has no score on this axis.
  const dataPoints = profiles.map((p, i) =>
    p.score == null ? null : pt(i, (p.score / 100) * MAXR),
  );
  // The polygon includes every axis; missing axes collapse to the center, where
  // a hollow "ghost" node marks the gap (rather than skipping the axis).
  const center: [number, number] = [C, C];
  const dataPolygon = profiles
    .map((_, i) => fmt(dataPoints[i] ?? center))
    .join(" ");

  const activeProfile = profiles[active];
  const activeColor = colorOf(active);
  const activePoint = dataPoints[active];
  const ActiveIcon = ICONS[activeProfile.industry.id];

  return (
    <div className="grid gap-6 md:grid-cols-[300px_1fr] md:items-start">
      <div className="mx-auto w-full max-w-[300px] px-4 py-2">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`${modelName} skill web`}
        >
          {RINGS.map((lvl) => (
            <polygon
              key={lvl}
              points={profiles.map((_, i) => fmt(pt(i, lvl * MAXR))).join(" ")}
              className="fill-none stroke-border"
              strokeWidth={1}
            />
          ))}

          {profiles.map((_, i) => {
            const [x, y] = pt(i, MAXR);
            return (
              <line
                key={i}
                x1={C}
                y1={C}
                x2={x}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
              />
            );
          })}

          <polygon
            points={dataPolygon}
            fill={activeColor}
            fillOpacity={0.12}
            stroke={activeColor}
            strokeOpacity={0.6}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ transition: "fill 150ms, stroke 150ms" }}
          />

          {/* Highlight line: center → the active data point (stops at the vertex). */}
          {activePoint && (
            <line
              x1={C}
              y1={C}
              x2={activePoint[0]}
              y2={activePoint[1]}
              stroke={activeColor}
              strokeWidth={2}
              strokeLinecap="round"
              style={{ transition: "stroke 150ms ease" }}
            />
          )}

          {profiles.map((p, i) => {
            const point = dataPoints[i];
            const [lx, ly] = pt(i, MAXR + 20);
            const cos = Math.cos(angle(i));
            const sin = Math.sin(angle(i));
            const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
            const dy = sin > 0.3 ? 9 : sin < -0.3 ? -3 : 4;
            const isActive = i === active;
            const color = colorOf(i);
            // Triangular sector hit area: hover anywhere in this slice to activate.
            const half = Math.PI / N;
            const aL = angle(i) - half;
            const aR = angle(i) + half;
            const HR = MAXR + 30;
            const hit = `${C},${C} ${(C + HR * Math.cos(aL)).toFixed(1)},${(C + HR * Math.sin(aL)).toFixed(1)} ${(C + HR * Math.cos(aR)).toFixed(1)},${(C + HR * Math.sin(aR)).toFixed(1)}`;
            return (
              <g
                key={p.industry.id}
                role="button"
                tabIndex={0}
                aria-label={`${p.industry.label}: ${
                  p.score != null ? Math.round(p.score) : "no data"
                } skill`}
                aria-pressed={isActive}
                className="cursor-pointer outline-none [&:focus-visible_text]:underline"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
              >
                <polygon points={hit} fill="transparent" />
                {point && (
                  <circle
                    cx={point[0]}
                    cy={point[1]}
                    r={isActive ? 5.5 : 3.5}
                    fill={isActive ? color : undefined}
                    className={cn(
                      "stroke-background",
                      !isActive && "fill-muted-foreground/40",
                    )}
                    strokeWidth={1.5}
                  />
                )}
                <text
                  x={lx}
                  y={ly}
                  dy={dy}
                  textAnchor={anchor}
                  fill={isActive ? color : undefined}
                  fontWeight={isActive ? 700 : 500}
                  className={cn(
                    "text-[10px]",
                    !isActive && "fill-muted-foreground",
                  )}
                >
                  {p.industry.short ?? p.industry.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="flex h-80 flex-col rounded-xl border bg-card/40 p-5 transition-colors duration-200"
        style={{ borderColor: `color-mix(in oklch, ${activeColor} 35%, transparent)` }}
      >
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {ActiveIcon && (
              <ActiveIcon
                weight="thin"
                className="size-5 transition-colors duration-200"
                style={{ color: activeColor }}
              />
            )}
            <h3 className="font-semibold tracking-tight">
              {activeProfile.industry.label}
            </h3>
          </div>
          <TooltipProvider delay={150}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div
                    tabIndex={0}
                    className="cursor-help rounded-md text-right outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <div
                      className="tabular text-2xl font-semibold leading-none transition-colors duration-200"
                      style={{ color: activeColor }}
                    >
                      {activeProfile.score != null
                        ? Math.round(activeProfile.score)
                        : "—"}
                    </div>
                    <div className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                      skill
                    </div>
                  </div>
                }
              />
              <TooltipContent side="left" className="max-w-[16rem] text-left">
                <span className="font-medium">Skill score</span> — the mean of
                this model&rsquo;s normalized 0–100 scores (direction-aware, so
                lower-is-better metrics are inverted) across this
                field&rsquo;s benchmarks below.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="mt-3 line-clamp-2 shrink-0 text-sm text-muted-foreground">
          {activeProfile.industry.description}
        </p>

        <div
          key={`list-${active}`}
          className="mt-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1"
        >
          {activeProfile.measured === 0 && (
            <p className="text-sm text-muted-foreground">
              No published results yet — this capability is tracked and will
              populate as evaluations mature.
            </p>
          )}
          {activeProfile.benchmarks.map(({ benchmark, cell }) => (
            <div key={benchmark.id} className="flex items-center gap-3">
              <Link
                href={`/benchmarks/${benchmark.id}`}
                className="w-36 shrink-0 truncate text-sm transition-colors hover:text-primary"
                title={benchmark.name}
              >
                {benchmark.name}
              </Link>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted-foreground/20">
                <span
                  className="block h-full origin-left animate-bar-grow rounded-full"
                  style={{
                    width: `${cell ? Math.max(2, Math.min(100, cell.normalized)) : 0}%`,
                    backgroundColor: cell ? activeColor : "transparent",
                  }}
                />
              </span>
              <span
                className={cn(
                  "tabular w-12 shrink-0 text-right text-sm",
                  !cell && "text-muted-foreground/50",
                )}
              >
                {cell ? cell.display : "—"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
