import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  CATEGORIES,
  benchmarks,
  industries,
  scoresForBenchmark,
} from "@/lib/data";
import { buildIndustryDetail, type IndustryDetail } from "@/lib/skillweb";
import { Tag } from "@/components/tag";
import { IndustryLeaders } from "@/components/industry-leaders";

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "The evaluations behind the Crosshair leaderboard — what each one measures, and how to read it.",
};

export default function BenchmarksPage() {
  const industryCards = industries
    .map((ind) => buildIndustryDetail(ind.id))
    .filter((d): d is IndustryDetail => d !== null);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Benchmarks</h1>
        <p className="max-w-2xl text-muted-foreground">
          The tests behind the rankings. Each card explains what the benchmark
          measures and how scores are oriented.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">By industry</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Who leads each professional domain, scored across its benchmarks.
            Mappings are proposals (a benchmark can inform several industries) —
            open one for the full breakdown.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {industryCards.map((d) => (
            <Link
              key={d.industry.id}
              href={`/industries/${d.industry.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium tracking-tight group-hover:text-primary">
                  {d.industry.label}
                </h3>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {d.benchmarks.length} benchmarks
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {d.industry.description}
              </p>
              <div className="pt-1">
                <IndustryLeaders standings={d.standings} limit={5} />
              </div>
              <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                View industry &amp; benchmarks
                <ArrowRightIcon
                  weight="thin"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const list = benchmarks.filter((b) => b.category === cat.id);
        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {cat.label}
              </h2>
              {cat.status === "emerging" && (
                <Tag variant="emerging">emerging</Tag>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((b) => {
                const count = scoresForBenchmark(b.id).length;
                return (
                  <Link
                    key={b.id}
                    href={`/benchmarks/${b.id}`}
                    className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Tag variant="outline">{b.domain}</Tag>
                      <span className="text-xs text-muted-foreground">
                        {count} {count === 1 ? "result" : "results"}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-medium tracking-tight group-hover:text-primary">
                        {b.name}
                      </h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {b.description}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span className="tabular">
                        {b.unit ?? b.metric}
                        {" · "}
                        {b.higherIsBetter ? "higher is better" : "lower is better"}
                      </span>
                      <ArrowRightIcon
                        weight="thin"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
