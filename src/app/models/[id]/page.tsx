import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  categoryById,
  models,
  modelsById,
  pricing,
  providersById,
} from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard";
import { buildSkillWeb } from "@/lib/skillweb";
import { Tag, LICENSE_TAG } from "@/components/tag";
import { SourceLink, VerifiedMark } from "@/components/provenance";
import { SkillWeb } from "@/components/skill-web";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function generateStaticParams() {
  return models.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = modelsById[id];
  if (!model) return { title: "Model not found" };
  return {
    title: model.name,
    description:
      model.description ?? `${model.name} benchmark scores and sources.`,
  };
}

function fmtContext(tokens?: number | null) {
  if (!tokens) return "—";
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M tokens`;
  if (tokens >= 1_000) return `${tokens / 1_000}K tokens`;
  return `${tokens} tokens`;
}

function fmtPrice(usdPerM: number) {
  return `$${parseFloat(usdPerM.toFixed(3))}`;
}

export default async function ModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = modelsById[id];
  if (!model) notFound();

  const provider = providersById[model.providerId];
  const category = categoryById[model.category];
  const { rows, benchmarks: catBenchmarks } = buildLeaderboard(model.category);
  const rowIndex = rows.findIndex((r) => r.model.id === model.id);
  const row = rows[rowIndex];
  const rank = rowIndex + 1;
  const skillWeb = buildSkillWeb(model.id);
  const hasSkillWeb =
    skillWeb != null && skillWeb.industries.some((p) => p.measured > 0);
  const isLlm = model.category === "llm";
  const price = pricing[model.id];
  const priceItems = price
    ? [
        { label: "Input", value: price.inputPerM },
        { label: "Output", value: price.outputPerM },
        ...(price.cacheReadPerM != null
          ? [{ label: "Cache read", value: price.cacheReadPerM }]
          : []),
        ...(price.cacheWritePerM != null
          ? [{ label: "Cache write", value: price.cacheWritePerM }]
          : []),
      ]
    : [];

  const meta: { label: string; value: string }[] = [
    { label: "Provider", value: provider?.name ?? "—" },
    {
      label: "Released",
      value: model.releaseDate ?? "Unannounced",
    },
    {
      label: "Parameters",
      value: model.paramsB ? `${model.paramsB}B` : "Undisclosed",
    },
    ...(model.category === "llm"
      ? [{ label: "Context", value: fmtContext(model.contextWindow) }]
      : []),
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon weight="thin" className="size-4" />
        Leaderboard
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant={category.status === "emerging" ? "emerging" : "live"}>
            {category.label}
          </Tag>
          <Tag variant={LICENSE_TAG[model.license].variant}>
            {LICENSE_TAG[model.license].label}
          </Tag>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {model.name}
            </h1>
            {model.description && (
              <p className="max-w-2xl text-muted-foreground">
                {model.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              {model.modalities.map((m) => (
                <span
                  key={m}
                  className="rounded bg-muted/60 px-1.5 py-0.5 text-xs text-muted-foreground"
                >
                  {m}
                </span>
              ))}
              {model.website && (
                <a
                  href={model.website}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  Official site <ArrowSquareOutIcon weight="thin" className="size-3" />
                </a>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground">Crosshair Index</div>
            <div className="tabular text-3xl font-semibold leading-none tracking-tight">
              {row?.index != null ? row.index.toFixed(1) : "—"}
            </div>
            <div className="mt-1.5 text-sm font-normal text-muted-foreground">
              #{rank} of {rows.length} · {category.label}
            </div>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border/70 bg-card/40 p-5 sm:grid-cols-4">
        {meta.map((m) => (
          <div key={m.label}>
            <dt className="text-xs text-muted-foreground">{m.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{m.value}</dd>
          </div>
        ))}
      </dl>

      {priceItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Token pricing
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border/70 bg-card/40 p-5 sm:grid-cols-4">
            {priceItems.map((p) => (
              <div key={p.label}>
                <dt className="text-xs text-muted-foreground">{p.label}</dt>
                <dd className="tabular mt-0.5 text-sm font-medium">
                  {fmtPrice(p.value)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    /1M
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            USD per 1M tokens · cache read = cached input (hit), cache write =
            caching surcharge · official list pricing (June 2026).
          </p>
        </section>
      )}

      {hasSkillWeb && skillWeb && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {isLlm ? "Industry skill web" : "Capability web"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLlm
                ? "Professional-domain strengths, composed from the benchmarks relevant to each field. Highlight an axis to see the benchmarks behind it."
                : "Strengths across world-modeling capabilities — each axis is one benchmark domain. Coverage is sparse while these evaluations mature; empty axes read “no data yet.”"}
            </p>
          </div>
          <SkillWeb data={skillWeb} modelName={model.name} />
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Scorecard</h2>
        {row && row.measured > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Benchmark</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catBenchmarks.map((b) => {
                  const cell = row.cells[b.id];
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="align-middle">
                        <Link
                          href={`/benchmarks/${b.id}`}
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {b.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {b.domain}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {cell ? (
                          <span
                            className={
                              cell.isBest
                                ? "tabular font-semibold text-primary"
                                : "tabular"
                            }
                          >
                            {cell.display}
                            {cell.isBest && (
                              <span className="ml-1 text-xs">best</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        {cell ? (
                          <SourceLink source={cell.source} />
                        ) : (
                          <span className="text-sm text-muted-foreground/60">
                            not evaluated
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        {cell && <VerifiedMark verified={cell.verified} />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No published results yet. This model is tracked and will populate as
            standardized results become available.
          </div>
        )}
      </section>
    </div>
  );
}
