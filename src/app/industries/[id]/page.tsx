import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { industries } from "@/lib/data";
import { buildIndustryDetail } from "@/lib/skillweb";
import { Tag } from "@/components/tag";
import { IndustryLeaders } from "@/components/industry-leaders";

export function generateStaticParams() {
  return industries.map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = buildIndustryDetail(id);
  if (!detail) return { title: "Industry not found" };
  return {
    title: `${detail.industry.label} — industry score`,
    description: detail.industry.description,
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = buildIndustryDetail(id);
  if (!detail) notFound();

  const { industry, benchmarks, standings } = detail;
  const leader = standings[0];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Link
        href="/benchmarks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon weight="thin" className="size-4" />
        Benchmarks
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant="outline">Industry</Tag>
          <Tag variant="outline">
            {benchmarks.length} {benchmarks.length === 1 ? "benchmark" : "benchmarks"}
          </Tag>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {industry.label}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{industry.description}</p>
      </header>

      <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        The <span className="text-foreground">{industry.label}</span> score is
        the mean of a model&rsquo;s normalized 0–100 scores (direction-aware,
        so lower-is-better metrics are inverted) across the {benchmarks.length}{" "}
        benchmarks below — the same figure the leaderboard&rsquo;s industry view
        ranks by.
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Leaders</h2>
        {leader && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {leader.model.name}
            </span>{" "}
            leads this industry with a score of{" "}
            <span className="tabular font-medium text-foreground">
              {leader.score.toFixed(1)}
            </span>
            .
          </p>
        )}
        <div className="rounded-xl border border-border/70 bg-card/40 p-5">
          <IndustryLeaders standings={standings} linkModels />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Benchmarks in this score
          </h2>
          <p className="text-sm text-muted-foreground">
            Each model&rsquo;s scores on these are normalized and averaged to
            produce the industry score above.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {benchmarks.map((b) => (
            <Link
              key={b.id}
              href={`/benchmarks/${b.id}`}
              className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
            >
              <div className="flex items-center justify-between gap-2">
                <Tag variant="outline">{b.domain}</Tag>
                <span className="tabular text-xs text-muted-foreground">
                  {b.unit ?? b.metric}
                  {b.higherIsBetter ? "" : " · lower better"}
                </span>
              </div>
              <h3 className="font-medium tracking-tight group-hover:text-primary">
                {b.name}
              </h3>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {b.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
