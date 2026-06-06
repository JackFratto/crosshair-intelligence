import type { Metadata } from "next";
import Link from "next/link";
import { DATASET_META } from "@/lib/data";
import { Tag } from "@/components/tag";

export const metadata: Metadata = {
  title: "About & Methodology",
  description:
    "How Crosshair Intelligence scores models, sources data, and where it's headed.",
};

const SOURCE_KINDS: { label: string; desc: string }[] = [
  {
    label: "vendor",
    desc: "Self-reported by the model's creator. Useful, but unaudited and often run under favorable conditions.",
  },
  {
    label: "paper",
    desc: "Published in a paper or technical report (arXiv, model card with methodology).",
  },
  {
    label: "third-party",
    desc: "Measured by an independent evaluator — an arena, a lab, or a standardized harness.",
  },
  {
    label: "crosshair-eval",
    desc: "Run by Crosshair's own evaluation harness (phase 2). These are the only figures we mark verified.",
  },
];

const ROADMAP = [
  {
    phase: "Phase 1 — Curated leaderboard",
    status: "now",
    points: [
      "Static, transparent dataset of models, benchmarks, and scores.",
      "Every score carries a cited source and a verified flag (current data is sourced but not independently reproduced).",
      "Direction-aware normalization and the composite Crosshair Index.",
    ],
  },
  {
    phase: "Phase 2 — Live evaluations",
    status: "next",
    points: [
      "Run benchmarks ourselves through the Vercel AI Gateway (one key, every provider).",
      "Promote reproduced figures to source kind crosshair-eval, verified: true.",
      "Re-run on a schedule so the board tracks new releases automatically.",
    ],
  },
  {
    phase: "Phase 3 — World models",
    status: "later",
    points: [
      "Track world models (V-JEPA 2, Cosmos, Veo 3, Wan, HunyuanVideo, Sora, Genie 3, Marble, Ray 3) as a cited roster, attaching per-benchmark scores wherever models actually publish them.",
      "Surface fragmented suites — video understanding & anticipation (Something-Something v2, EPIC-Kitchens-100, Perception Test), generative physics (Physics-IQ), and physical-AI generation (PAI-Bench) — without faking a composite the data can't support.",
      "Co-develop benchmark definitions with the community as the field consolidates.",
    ],
  },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-14 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          About &amp; methodology
        </h1>
        <p className="text-lg text-muted-foreground">
          Crosshair Intelligence is an open leaderboard built on one principle:
          a benchmark number is only as good as the source behind it. Here is
          how the board works and where it is going.
        </p>
      </header>

      <Section id="index" title="How scoring works">
        <p className="text-muted-foreground">
          Models are compared on a shared set of benchmarks per category. Raw
          scores live in different units — accuracies, pass rates, Elo, Fréchet
          distances — so each is normalized to a 0–100 scale:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            Bounded metrics (anything with a known maximum, like a percentage)
            are scaled against that maximum.
          </li>
          <li>
            Unbounded metrics (Elo, FVD, the AA Intelligence Index) are scaled
            by their min–max within the column.
          </li>
          <li>
            Lower-is-better metrics (e.g. FVD) are inverted, so a higher
            normalized value always means &ldquo;better.&rdquo;
          </li>
        </ul>
        <p className="text-muted-foreground">
          The <span className="text-foreground">Crosshair Index</span> averages
          a model&rsquo;s standing <em>relative to the field</em> on each
          benchmark — its min–max position within that column — rather than its
          raw normalized score. This keeps any one benchmark from dominating by
          its absolute difficulty: an easy benchmark where everyone clusters near
          90% can&rsquo;t outweigh a brutal one like Humanity&rsquo;s Last Exam
          where everyone clusters near 40%, and a model can&rsquo;t climb just by
          reporting more of the easy ones. Benchmarks a model hasn&rsquo;t
          disclosed aren&rsquo;t dropped from the average either — they&rsquo;re
          imputed at a mild, slightly-below-median floor, so omitting a benchmark
          can only ever cost a model, never lift it. The index is shown only when
          a model covers at least 40% of its category&rsquo;s benchmarks —
          otherwise a single cherry-picked result could carry it. The Artificial
          Analysis Intelligence Index is itself a composite, included here as one
          input alongside the individual benchmarks.
        </p>
      </Section>

      <Section id="data" title="Data policy & honesty">
        <div className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Sourced &amp; cited, not independently verified.
          </span>{" "}
          {DATASET_META.note} Treat every number as a starting point, not a
          verdict. Last updated {DATASET_META.lastUpdated}.
        </div>
        <p className="text-muted-foreground">
          Every score records where it came from. We distinguish four kinds of
          source, and only reproduce-it-ourselves results are ever marked
          verified:
        </p>
        <div className="space-y-2">
          {SOURCE_KINDS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 rounded-lg border border-border/70 bg-card/40 p-3 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <Tag variant="outline" className="w-fit">
                {s.label}
              </Tag>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="roadmap" title="Roadmap">
        <div className="space-y-4">
          {ROADMAP.map((r) => (
            <div
              key={r.phase}
              className="rounded-xl border border-border/70 bg-card/40 p-5"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium tracking-tight">{r.phase}</h3>
                <Tag variant={r.status === "now" ? "accent" : "outline"}>
                  {r.status}
                </Tag>
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {r.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contribute" title="Contribute data">
        <p className="text-muted-foreground">
          The dataset is plain TypeScript. To correct a number or add a model,
          edit the files under{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            src/data/
          </code>{" "}
          and open a pull request:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              models.ts
            </code>{" "}
            — add the model with its provider, modalities, and license.
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              benchmarks.ts
            </code>{" "}
            — define the benchmark, its metric, and direction.
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              scores.ts
            </code>{" "}
            — add scores with a real source link; leave{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
              verified
            </code>{" "}
            false unless you reproduced it.
          </li>
        </ul>
        <p className="text-muted-foreground">
          Prefer primary sources (papers, model cards, standardized harnesses)
          over screenshots, and note the evaluation conditions where they
          matter.
        </p>
        <p>
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            ← Back to the leaderboard
          </Link>
        </p>
      </Section>
    </div>
  );
}
