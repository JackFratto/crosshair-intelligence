import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, modelsFor, providersById } from "@/lib/data";
import { Tag, LICENSE_TAG } from "@/components/tag";

export const metadata: Metadata = {
  title: "Models",
  description: "Every model tracked on Crosshair Intelligence.",
};

function fmtContext(tokens?: number | null) {
  if (!tokens) return null;
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M ctx`;
  if (tokens >= 1_000) return `${tokens / 1_000}K ctx`;
  return `${tokens} ctx`;
}

export default function ModelsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Models</h1>
        <p className="max-w-2xl text-muted-foreground">
          Every system on the board, language and world models alike. Select one
          for its full scorecard and sources.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const list = modelsFor(cat.id);
        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {cat.label}
              </h2>
              {cat.status === "emerging" && (
                <Tag variant="emerging">emerging</Tag>
              )}
              <span className="text-sm text-muted-foreground">
                · {list.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => {
                const provider = providersById[m.providerId];
                const ctx = fmtContext(m.contextWindow);
                return (
                  <Link
                    key={m.id}
                    href={`/models/${m.id}`}
                    className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-5 transition-colors hover:border-primary/40 hover:bg-card/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium tracking-tight group-hover:text-primary">
                          {m.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {provider?.name}
                        </p>
                      </div>
                      <Tag variant={LICENSE_TAG[m.license].variant}>
                        {LICENSE_TAG[m.license].label}
                      </Tag>
                    </div>
                    {m.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {m.description}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1 text-xs text-muted-foreground">
                      {m.modalities.slice(0, 4).map((mod) => (
                        <span
                          key={mod}
                          className="rounded bg-muted/60 px-1.5 py-0.5"
                        >
                          {mod}
                        </span>
                      ))}
                      {ctx && <span className="tabular px-1 py-0.5">{ctx}</span>}
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
