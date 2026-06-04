import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import { benchmarks, benchmarksById } from "@/lib/data";
import { buildLeaderboard } from "@/lib/leaderboard";
import { Tag } from "@/components/tag";
import { SourceLink, VerifiedMark } from "@/components/provenance";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function generateStaticParams() {
  return benchmarks.map((b) => ({ id: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const benchmark = benchmarksById[id];
  if (!benchmark) return { title: "Benchmark not found" };
  return { title: benchmark.name, description: benchmark.description };
}

export default async function BenchmarkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const benchmark = benchmarksById[id];
  if (!benchmark) notFound();

  const { rows } = buildLeaderboard(benchmark.category);
  const ranked = rows
    .filter((row) => row.cells[benchmark.id])
    .map((row) => ({ row, cell: row.cells[benchmark.id]! }))
    .sort((a, b) => b.cell.normalized - a.cell.normalized);

  const facts: { label: string; value: string }[] = [
    { label: "Domain", value: benchmark.domain },
    { label: "Metric", value: benchmark.unit ?? benchmark.metric },
    {
      label: "Orientation",
      value: benchmark.higherIsBetter ? "Higher is better" : "Lower is better",
    },
    { label: "Results", value: String(ranked.length) },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <Link
        href="/benchmarks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon weight="thin" className="size-4" />
        Benchmarks
      </Link>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant="outline">{benchmark.domain}</Tag>
          <Tag variant={benchmark.higherIsBetter ? "accent" : "emerging"}>
            {benchmark.higherIsBetter ? "higher is better" : "lower is better"}
          </Tag>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {benchmark.name}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {benchmark.description}
        </p>
        {benchmark.url && (
          <a
            href={benchmark.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            Benchmark source <ArrowSquareOutIcon weight="thin" className="size-3.5" />
          </a>
        )}
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border/70 bg-card/40 p-5 sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{f.value}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Ranking</h2>
        {ranked.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 text-center text-xs text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranked.map(({ row, cell }, i) => (
                  <TableRow key={row.model.id}>
                    <TableCell className="tabular text-center align-middle text-sm text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="align-middle">
                      <Link
                        href={`/models/${row.model.id}`}
                        className="font-medium transition-colors hover:text-primary"
                      >
                        {row.model.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {row.provider?.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <span
                        className={
                          i === 0
                            ? "tabular font-semibold text-primary"
                            : "tabular"
                        }
                      >
                        {cell.display}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle">
                      <SourceLink source={cell.source} />
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <VerifiedMark verified={cell.verified} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-card/40 p-8 text-center text-sm text-muted-foreground">
            No results recorded for this benchmark yet.
          </div>
        )}
      </section>
    </div>
  );
}
