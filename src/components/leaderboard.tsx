"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BriefcaseIcon,
  BuildingsIcon,
  CaretUpDownIcon,
  ChartScatterIcon,
  CheckIcon,
  CoinsIcon,
  GlobeIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  SidebarSimpleIcon,
  TableIcon,
  TextAlignLeftIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tag, LICENSE_TAG } from "@/components/tag";
import { CrosshairLogo } from "@/components/crosshair-logo";
import { ProviderLogo } from "@/components/provider-logo";
import { ModelPreview } from "@/components/model-preview";
import { ParetoChart, type ParetoPoint } from "@/components/pareto-chart";
import { blendedPrice } from "@/lib/blended";
import { hueSweepFill } from "@/lib/gradient";
import { cn } from "@/lib/utils";
import type { LeaderboardData, LeaderboardRow } from "@/lib/leaderboard";
import type { ModelPreviewData } from "@/lib/skillweb";
import type {
  Industry,
  Model,
  ModelCategory,
  ModelCategoryInfo,
  Provider,
} from "@/lib/types";

type SortDir = "asc" | "desc";
interface SortState {
  key: string; // "model" | "index" | "price" | benchmarkId
  dir: SortDir;
}

type Range = [number, number];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function fmtCtx(tokens: number) {
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return `${m % 1 ? m.toFixed(1) : m}M`;
  }
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return `${Math.round(tokens)}`;
}

function fmtPrice(v: number) {
  return `$${v.toFixed(2)}`;
}

function previewStyle(x: number, y: number): React.CSSProperties {
  const W = 296;
  const H = 340;
  const pad = 14;
  let left = x + pad;
  let top = y + pad;
  if (typeof window !== "undefined") {
    if (left + W > window.innerWidth) left = x - pad - W;
    if (top + H > window.innerHeight) {
      top = Math.max(pad, window.innerHeight - H - pad);
    }
    if (left < pad) left = pad;
  }
  return { left, top };
}

export function Leaderboard({
  datasets,
  categories,
  previews,
  industries,
}: {
  datasets: Record<ModelCategory, LeaderboardData>;
  categories: ModelCategoryInfo[];
  previews: Record<string, ModelPreviewData>;
  industries: Record<ModelCategory, Industry[]>;
}) {
  // Range bounds derive from the LLM dataset (the only category that carries
  // context/price), so the sliders span exactly the data on first paint.
  const ctxBounds = useMemo<Range>(() => {
    const xs = datasets.llm.rows
      .map((r) => r.model.contextWindow)
      .filter((x): x is number => typeof x === "number" && x > 0);
    return xs.length ? [Math.min(...xs), Math.max(...xs)] : [1_000, 2_000_000];
  }, [datasets]);
  const priceBounds = useMemo<Range>(() => {
    const xs = datasets.llm.rows
      .map((r) => {
        const p = previews[r.model.id]?.pricing;
        return p ? blendedPrice(p) : null;
      })
      .filter((x): x is number => typeof x === "number");
    if (!xs.length) return [0, 30];
    return [
      Math.floor(Math.min(...xs) * 100) / 100,
      Math.ceil(Math.max(...xs) * 100) / 100,
    ];
  }, [datasets, previews]);

  const [category, setCategory] = useState<ModelCategory>("llm");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  const [sort, setSort] = useState<SortState>({ key: "index", dir: "desc" });
  // Industry is a single-select VIEW switcher (which table to show), kept
  // separate from the filters below — switching it preserves the filters.
  const [industry, setIndustry] = useState("");
  const [providerSel, setProviderSel] = useState<string[]>([]);
  const [providerQuery, setProviderQuery] = useState("");
  const [ctxRange, setCtxRange] = useState<Range>(ctxBounds);
  const [priceRange, setPriceRange] = useState<Range>(priceBounds);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"table" | "pareto">("table");
  const [hover, setHover] = useState<{
    model: Model;
    x: number;
    y: number;
  } | null>(null);

  const data = datasets[category];
  const info = categories.find((c) => c.id === category);
  const isLlm = category === "llm";
  const categoryIndustries = industries[category];

  const activeIndustry = industry
    ? (categoryIndustries.find((i) => i.id === industry) ?? null)
    : null;
  const selectedBenchmarkIds = activeIndustry ? activeIndustry.benchmarkIds : null;

  const visibleBenchmarks = selectedBenchmarkIds
    ? data.benchmarks.filter((b) => selectedBenchmarkIds.includes(b.id))
    : data.benchmarks;

  const providerOptions = useMemo(() => {
    const seen = new Map<string, Provider>();
    for (const r of data.rows)
      if (r.provider) seen.set(r.provider.id, r.provider);
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const providerQ = providerQuery.trim().toLowerCase();
  const filteredProviders = providerQ
    ? providerOptions.filter((p) => p.name.toLowerCase().includes(providerQ))
    : providerOptions;

  const ctxActive =
    isLlm && (ctxRange[0] > ctxBounds[0] || ctxRange[1] < ctxBounds[1]);
  const priceActive =
    isLlm && (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]);

  function blendedOf(row: LeaderboardRow): number | null {
    const p = previews[row.model.id]?.pricing;
    return p ? blendedPrice(p) : null;
  }

  function indexValueOf(row: LeaderboardRow): number | null {
    if (!selectedBenchmarkIds) return row.index;
    const vals = selectedBenchmarkIds
      .map((bid) => row.cells[bid]?.normalized)
      .filter((v): v is number => typeof v === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = data.rows;
    if (q)
      r = r.filter(
        (row) =>
          row.model.name.toLowerCase().includes(q) ||
          row.provider?.name.toLowerCase().includes(q),
      );
    if (providerSel.length)
      r = r.filter(
        (row) => row.provider != null && providerSel.includes(row.provider.id),
      );
    if (ctxActive)
      r = r.filter((row) => {
        const c = row.model.contextWindow;
        return c != null && c >= ctxRange[0] && c <= ctxRange[1];
      });
    if (priceActive)
      r = r.filter((row) => {
        const b = blendedOf(row);
        return b != null && b >= priceRange[0] && b <= priceRange[1];
      });

    const valueFor = (row: LeaderboardRow, key: string): number | null =>
      key === "index"
        ? indexValueOf(row)
        : key === "price"
          ? blendedOf(row)
          : (row.cells[key]?.normalized ?? null);

    return [...r].sort((a, b) => {
      if (sort.key === "model") {
        const c = a.model.name.localeCompare(b.model.name);
        return sort.dir === "asc" ? c : -c;
      }
      const av = valueFor(a, sort.key);
      const bv = valueFor(b, sort.key);
      if (av == null && bv == null)
        return a.model.name.localeCompare(b.model.name);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av === bv) return a.model.name.localeCompare(b.model.name);
      return sort.dir === "asc" ? av - bv : bv - av;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    query,
    providerSel,
    ctxActive,
    ctxRange,
    priceActive,
    priceRange,
    sort,
    selectedBenchmarkIds,
    previews,
  ]);

  function toggleSort(key: string) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: key === "model" || key === "price" ? "asc" : "desc" },
    );
  }

  function changeCategory(next: ModelCategory) {
    setCategory(next);
    setSort({ key: "index", dir: "desc" });
    setIndustry("");
    setProviderSel([]);
    setProviderQuery("");
    setCtxRange(ctxBounds);
    setPriceRange(priceBounds);
  }

  // Switch the table to an industry's view. Filters are deliberately left
  // untouched — they compose on top of whichever view is showing.
  function selectIndustry(id: string) {
    setIndustry(id);
    setSort({ key: "index", dir: "desc" });
  }

  function toggleProvider(id: string) {
    setProviderSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function resetFilters() {
    setProviderSel([]);
    setProviderQuery("");
    setCtxRange(ctxBounds);
    setPriceRange(priceBounds);
  }

  // Industry is a view, not a filter — the badge/reset cover the filters only.
  const activeCount =
    (providerSel.length ? 1 : 0) + (ctxActive ? 1 : 0) + (priceActive ? 1 : 0);

  const indexLabel = activeIndustry
    ? (activeIndustry.short ?? activeIndustry.label)
    : "CHI";
  const colCount = 3 + visibleBenchmarks.length;

  // Publish the fixed left rail/panel width so the global header can shift its
  // content right to clear it (the rail spans above the nav bar).
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sidebar-width", filtersOpen ? "16rem" : "3rem");
    return () => {
      root.style.removeProperty("--sidebar-width");
    };
  }, [filtersOpen]);

  const paretoPoints = useMemo<ParetoPoint[]>(() => {
    if (!isLlm) return [];
    const pts: ParetoPoint[] = [];
    for (const row of rows) {
      const cost = blendedOf(row);
      const chi = row.index;
      if (cost == null || chi == null) continue;
      pts.push({
        id: row.model.id,
        label: row.model.name,
        cost,
        chi,
        provider: row.provider,
        license: LICENSE_TAG[row.model.license].label,
      });
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, isLlm, previews]);

  return (
    <TooltipProvider delay={150}>
      <div>
        {!filtersOpen && (
          <aside className="fixed top-0 left-0 z-50 hidden h-[100dvh] w-12 flex-col items-center border-r border-border/60 bg-background lg:flex">
            <Link
              href="/"
              aria-label="Crosshair Intelligence — home"
              className="flex h-[57px] w-full shrink-0 items-center justify-center border-b border-border/60"
            >
              <CrosshairLogo className="size-5 text-primary" />
            </Link>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Open filters"
              title="Filters"
              className="relative mt-2 flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <SidebarSimpleIcon weight="thin" className="size-5" />
              {activeCount > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          </aside>
        )}
        {filtersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
              onClick={() => setFiltersOpen(false)}
              aria-hidden
            />
            <aside
              className={cn(
                "fixed top-0 left-0 z-50 flex h-[100dvh] w-80 max-w-[85vw] flex-col overflow-hidden bg-background shadow-xl",
                "lg:w-64 lg:max-w-none lg:shadow-none",
                "border-r border-border/60",
              )}
            >
              <div className="flex h-[57px] shrink-0 items-center gap-2 border-b border-border/60 px-3">
                <Link
                  href="/"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate font-semibold tracking-tight"
                >
                  <CrosshairLogo className="size-5 shrink-0 text-primary" />
                  <span className="truncate">
                    Crosshair{" "}
                    <span className="font-normal text-muted-foreground">
                      Intelligence
                    </span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Collapse filters"
                  className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <SidebarSimpleIcon weight="thin" className="size-5" />
                </button>
              </div>
              <div className="flex shrink-0 items-center border-b border-border/60 p-3">
                <CategoryToggle
                  category={category}
                  onChange={changeCategory}
                  className="w-full"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="divide-y divide-border/60 px-3">
                  {/* Industry / capability — single-select view switcher */}
                  <FilterField
                    Icon={BriefcaseIcon}
                    label={isLlm ? "Industry" : "Capability"}
                  >
                    <div className="space-y-0.5">
                      <IndustryItem
                        label="All benchmarks"
                        active={industry === ""}
                        onClick={() => selectIndustry("")}
                      />
                      {categoryIndustries.map((ind) => (
                        <IndustryItem
                          key={ind.id}
                          label={ind.label}
                          active={industry === ind.id}
                          onClick={() => selectIndustry(ind.id)}
                        />
                      ))}
                    </div>
                  </FilterField>

                  {/* Provider — searchable multi-select */}
                  <FilterField Icon={BuildingsIcon} label="Provider">
                    <div className="space-y-1.5">
                      <div className="relative">
                        <MagnifyingGlassIcon
                          weight="thin"
                          className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          value={providerQuery}
                          onChange={(e) => setProviderQuery(e.target.value)}
                          placeholder="Search providers…"
                          aria-label="Search providers"
                          className="h-8 w-full rounded-lg border border-border bg-background pr-2 pl-7 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                      </div>
                      <div className="max-h-44 space-y-0.5 overflow-y-auto">
                        {filteredProviders.map((p) => {
                          const on = providerSel.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              aria-pressed={on}
                              onClick={() => toggleProvider(p.id)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors",
                                on
                                  ? "text-foreground"
                                  : "text-muted-foreground hover:bg-muted/60",
                              )}
                            >
                              <CheckBox on={on} />
                              <ProviderLogo provider={p} />
                              <span className="truncate">{p.name}</span>
                            </button>
                          );
                        })}
                        {filteredProviders.length === 0 && (
                          <p className="px-1.5 py-1 text-xs text-muted-foreground">
                            No providers match.
                          </p>
                        )}
                      </div>
                    </div>
                  </FilterField>

                  {/* Context window — log-scaled min/max */}
                  {isLlm && (
                    <FilterField Icon={TextAlignLeftIcon} label="Context">
                      <RangeSlider
                        min={ctxBounds[0]}
                        max={ctxBounds[1]}
                        value={ctxRange}
                        onChange={setCtxRange}
                        scale="log"
                        format={fmtCtx}
                        accent="#179299"
                      />
                    </FilterField>
                  )}

                  {/* Blended price — min/max */}
                  {isLlm && (
                    <FilterField Icon={CoinsIcon} label="Price / 1M">
                      <RangeSlider
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        value={priceRange}
                        onChange={setPriceRange}
                        format={fmtPrice}
                        accent="#40a02b"
                      />
                    </FilterField>
                  )}
                </div>
              </div>

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="shrink-0 border-t border-border/60 px-3 py-3 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Reset filters
                </button>
              )}
            </aside>
          </>
        )}

        <div
          className={cn(
            "transition-[padding] duration-200 lg:pl-12",
            filtersOpen && "lg:pl-64",
          )}
        >
          <div className="mx-auto w-full max-w-[110rem] space-y-4 px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {activeIndustry && (
                <div className="min-w-0 sm:max-w-2xl">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h2 className="text-sm font-semibold tracking-tight">
                      {activeIndustry.label}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {isLlm ? "industry view" : "capability view"} · skill =
                      mean of the benchmarks below (normalized 0–100,
                      direction-aware)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeIndustry.description}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {visibleBenchmarks.map((b) => (
                      <Link
                        key={b.id}
                        href={`/benchmarks/${b.id}`}
                        className="transition-opacity hover:opacity-80"
                      >
                        <Tag variant="outline">{b.name}</Tag>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {!activeIndustry && (
                <div className="min-w-0 sm:max-w-2xl">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <h2 className="text-sm font-semibold tracking-tight">
                      All benchmarks
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {isLlm ? "leaderboard view" : "capability view"} ·{" "}
                      {indexLabel} = mean of the benchmarks below (normalized
                      0–100, direction-aware)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {info?.blurb}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {visibleBenchmarks.map((b) => (
                      <Link
                        key={b.id}
                        href={`/benchmarks/${b.id}`}
                        className="transition-opacity hover:opacity-80"
                      >
                        <Tag variant="outline">{b.name}</Tag>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 sm:ml-auto sm:shrink-0">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  aria-label="Open filters"
                  className="relative grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:hidden"
                >
                  <SidebarSimpleIcon weight="thin" className="size-5" />
                  {activeCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </button>
                <div
                  className={cn(
                    "relative flex h-9 shrink-0 items-center overflow-hidden rounded-lg transition-[width] duration-200 ease-out",
                    searchOpen || query
                      ? "w-44 border border-input sm:w-56"
                      : "w-9 border border-transparent",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search the leaderboard"
                    title="Search"
                    tabIndex={searchOpen || query ? -1 : 0}
                    className="grid size-9 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MagnifyingGlassIcon weight="thin" className="size-5" />
                  </button>
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => {
                      if (!query) setSearchOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search…"
                    aria-label="Search the leaderboard"
                    tabIndex={searchOpen || query ? 0 : -1}
                    className="h-full min-w-0 flex-1 bg-transparent pr-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <ViewToggle
                  view={view}
                  onToggle={() =>
                    setView((v) => (v === "table" ? "pareto" : "table"))
                  }
                />
              </div>
            </div>

            {info?.status === "emerging" && <EmergingNote />}

            {view === "pareto" ? (
              isLlm ? (
                <ParetoChart points={paretoPoints} className="w-full" />
              ) : (
                <div className="rounded-xl border border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
                  The cost–CHI Pareto is available for language models.
                </div>
              )
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="sticky left-0 z-20 bg-card text-center text-xs text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="sticky left-[36px] z-20 min-w-44 border-r border-border/60 bg-card">
                      <span className="text-xs font-medium text-muted-foreground">
                        Model
                      </span>
                    </TableHead>
                    <TableHead className="min-w-24 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <SortHeader
                          label={indexLabel}
                          sortKey="index"
                          sort={sort}
                          onClick={toggleSort}
                          align="right"
                        />
                        {!activeIndustry && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <button
                                  type="button"
                                  aria-label="About the Crosshair Index"
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  <InfoIcon weight="thin" className="size-3" />
                                </button>
                              }
                            />
                            <TooltipContent className="max-w-xs text-left">
                              <span className="font-medium">
                                CHI (Crosshair Index)
                              </span>{" "}
                              — the mean of each benchmark normalized to 0–100
                              (direction-aware). Shown only when a model covers
                              at least half of the category&rsquo;s benchmarks.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableHead>
                    {visibleBenchmarks.map((b) => (
                      <TableHead key={b.id} className="min-w-28 text-right">
                        <SortHeader
                          label={b.name}
                          sortKey={b.id}
                          sort={sort}
                          onClick={toggleSort}
                          align="right"
                          title={`${b.domain} · ${b.unit ?? b.metric}${b.higherIsBetter ? "" : " · lower is better"}`}
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow
                      key={row.model.id}
                      className="group hover:bg-muted"
                    >
                      <TableCell className="sticky left-0 z-10 bg-card text-center align-middle group-hover:bg-muted">
                        <RankPill n={i + 1} />
                      </TableCell>
                      <TableCell className="sticky left-[36px] z-10 border-r border-border/60 bg-card align-middle group-hover:bg-muted">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/models/${row.model.id}`}
                            className="font-medium tracking-tight transition-colors hover:text-primary"
                            onMouseEnter={(e) =>
                              setHover({
                                model: row.model,
                                x: e.clientX,
                                y: e.clientY,
                              })
                            }
                            onMouseMove={(e) =>
                              setHover({
                                model: row.model,
                                x: e.clientX,
                                y: e.clientY,
                              })
                            }
                            onMouseLeave={() => setHover(null)}
                          >
                            {row.model.name}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            {row.provider && (
                              <ProviderLogo provider={row.provider} />
                            )}
                            <Tag
                              variant={LICENSE_TAG[row.model.license].variant}
                            >
                              {LICENSE_TAG[row.model.license].label}
                            </Tag>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <IndexCell index={indexValueOf(row)} />
                      </TableCell>
                      {visibleBenchmarks.map((b) => (
                        <TableCell
                          key={b.id}
                          className="text-right align-middle"
                        >
                          <ScoreCell row={row} benchmarkId={b.id} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={colCount}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        No models match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

                <Legend />
              </>
            )}
          </div>
        </div>
      </div>

      {hover && (
        <div
          className="pointer-events-none fixed z-50"
          style={previewStyle(hover.x, hover.y)}
        >
          <div className="rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
            <ModelPreview
              model={hover.model}
              preview={previews[hover.model.id]}
            />
          </div>
        </div>
      )}
    </TooltipProvider>
  );
}

function ViewToggle({
  view,
  onToggle,
}: {
  view: "table" | "pareto";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={view === "table" ? "Show Pareto chart" : "Show table"}
      title={view === "table" ? "Pareto view" : "Table view"}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
    >
      <ChartScatterIcon
        weight="thin"
        className={cn(
          "col-start-1 row-start-1 size-5 transition-all duration-300",
          view === "table"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <TableIcon
        weight="thin"
        className={cn(
          "col-start-1 row-start-1 size-5 transition-all duration-300",
          view === "pareto"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}

function CategoryToggle({
  category,
  onChange,
  className,
}: {
  category: ModelCategory;
  onChange: (next: ModelCategory) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={category === "world-model"}
      aria-label="Toggle between Language Models and World Models"
      onClick={() => onChange(category === "llm" ? "world-model" : "llm")}
      className={cn(
        "relative grid h-9 grid-cols-2 items-center rounded-lg border border-border bg-muted/50 p-0.5 text-sm font-medium select-none",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-md bg-background shadow-sm ring-1 ring-border transition-transform duration-200 ease-out",
          category === "world-model" && "translate-x-full",
        )}
      />
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-1.5 transition-colors",
          category === "llm" ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <TreeStructureIcon weight="thin" className="size-4" />
        LLMs
      </span>
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-1.5 transition-colors",
          category === "world-model"
            ? "text-foreground"
            : "text-muted-foreground",
        )}
      >
        <GlobeIcon weight="thin" className="size-4" />
        World
      </span>
    </button>
  );
}

function FilterField({
  Icon,
  label,
  children,
}: {
  Icon: PhosphorIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 py-3.5">
      <span className="flex items-center gap-2 text-sm font-medium">
        <Icon weight="thin" className="size-4 text-muted-foreground" />
        {label}
      </span>
      {children}
    </div>
  );
}

function IndustryItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          active ? "bg-primary" : "bg-transparent",
        )}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

function CheckBox({ on, color }: { on: boolean; color?: string }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
        on ? "border-transparent text-white" : "border-border",
      )}
      style={on ? { backgroundColor: color ?? "var(--primary)" } : undefined}
    >
      {on && <CheckIcon weight="bold" className="size-2.5" />}
    </span>
  );
}

const RANGE_STEPS = 1000;
const RANGE_INPUT =
  "pointer-events-none absolute inset-0 h-4 w-full cursor-pointer appearance-none bg-transparent " +
  "[&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-sm " +
  "[&::-moz-range-track]:bg-transparent " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground";

/** Dual-thumb min/max slider. Log scale spaces values geometrically. */
function RangeSlider({
  min,
  max,
  value,
  onChange,
  scale = "linear",
  format,
  accent = "#6b7280",
}: {
  min: number;
  max: number;
  value: Range;
  onChange: (next: Range) => void;
  scale?: "linear" | "log";
  format: (v: number) => string;
  accent?: string;
}) {
  const logMin = Math.log(min);
  const logSpan = Math.log(max) - logMin || 1;
  const linSpan = max - min || 1;
  const toPos = (v: number) => {
    const t =
      scale === "log"
        ? (Math.log(clamp(v, min, max)) - logMin) / logSpan
        : (clamp(v, min, max) - min) / linSpan;
    return Math.round(t * RANGE_STEPS);
  };
  const fromPos = (p: number) => {
    if (p <= 0) return min;
    if (p >= RANGE_STEPS) return max;
    const t = p / RANGE_STEPS;
    return scale === "log" ? Math.exp(logMin + t * logSpan) : min + t * linSpan;
  };

  const [lo, hi] = value;
  const loPos = toPos(lo);
  const hiPos = toPos(hi);

  return (
    <div className="space-y-2">
      <div className="tabular flex items-center justify-between text-xs text-muted-foreground">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
      <div className="relative h-4">
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted-foreground/20" />
        <span
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{
            left: `${(loPos / RANGE_STEPS) * 100}%`,
            right: `${100 - (hiPos / RANGE_STEPS) * 100}%`,
            backgroundColor: accent,
            backgroundImage: hueSweepFill(accent),
          }}
        />
        <input
          type="range"
          min={0}
          max={RANGE_STEPS}
          value={loPos}
          aria-label="Minimum"
          onChange={(e) =>
            onChange([fromPos(Math.min(Number(e.target.value), hiPos)), hi])
          }
          className={RANGE_INPUT}
          style={{ zIndex: loPos >= hiPos ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={RANGE_STEPS}
          value={hiPos}
          aria-label="Maximum"
          onChange={(e) =>
            onChange([lo, fromPos(Math.max(Number(e.target.value), loPos))])
          }
          className={RANGE_INPUT}
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  sort,
  onClick,
  align = "left",
  title,
}: {
  label: string;
  sortKey: string;
  sort: SortState;
  onClick: (key: string) => void;
  align?: "left" | "right";
  title?: string;
}) {
  const active = sort.key === sortKey;
  const Icon = active
    ? sort.dir === "desc"
      ? ArrowDownIcon
      : ArrowUpIcon
    : CaretUpDownIcon;
  return (
    <button
      type="button"
      title={title}
      onClick={() => onClick(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
        align === "right" && "flex-row-reverse",
      )}
    >
      <span className="truncate">{label}</span>
      <Icon
        weight="thin"
        className={cn("size-3 shrink-0", active ? "opacity-100" : "opacity-40")}
      />
    </button>
  );
}

function RankPill({ n }: { n: number }) {
  return (
    <span className="tabular inline-flex size-6 items-center justify-center text-xs text-muted-foreground">
      {n}
    </span>
  );
}

function Bar({
  value,
  tone,
}: {
  value: number;
  tone: "best" | "muted" | "index";
}) {
  return (
    <span className="block h-1 w-14 overflow-hidden rounded-full bg-muted-foreground/20">
      <span
        className={cn(
          "block h-full rounded-full",
          tone === "best"
            ? "bg-primary"
            : tone === "index"
              ? "bg-primary/70"
              : "bg-muted-foreground/40",
        )}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </span>
  );
}

function IndexCell({ index }: { index: number | null }) {
  if (index == null) {
    return (
      <span
        className="text-muted-foreground/70"
        title="Insufficient benchmark coverage"
      >
        —
      </span>
    );
  }
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <span className="tabular text-sm font-semibold">{index.toFixed(1)}</span>
      <Bar value={index} tone="index" />
    </div>
  );
}

function ScoreCell({
  row,
  benchmarkId,
}: {
  row: LeaderboardRow;
  benchmarkId: string;
}) {
  const cell = row.cells[benchmarkId];
  if (!cell) return <span className="text-muted-foreground/50">—</span>;
  return (
    <div className="inline-flex flex-col items-end gap-1">
      <span
        className={cn(
          "tabular text-sm",
          cell.isBest ? "font-semibold text-primary" : "text-foreground",
        )}
      >
        {cell.display}
      </span>
      <Bar value={cell.normalized} tone={cell.isBest ? "best" : "muted"} />
    </div>
  );
}

function EmergingNote() {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
      World-model evaluation is still consolidating. Benchmark definitions here
      are <span className="text-foreground">proposals</span>, coverage is sparse
      by design, and many cells read &ldquo;—&rdquo; until results exist.{" "}
      <Link
        href="/about#roadmap"
        className="text-primary underline-offset-4 hover:underline"
      >
        See the roadmap →
      </Link>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-2 rounded-full bg-primary" />
        Category best
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-1 w-6 rounded-full bg-muted-foreground/40" />
        Normalized 0–100 (direction-aware)
      </span>
      <span>Click a column to sort. All figures are sourced but unverified.</span>
    </div>
  );
}
