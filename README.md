# Crosshair Intelligence

An open benchmarking leaderboard for Large Language Models **LLM's** and **world models** (V-JEPA, Genie, Cosmos, …). Our mission is simple: help you pick the **right model for the job** by weighing *intelligence* against *cost* — sector by sector.

Models are scored across both general capability and **professional domains** — software engineering, finance, law, medicine, and more — and a cost–performance (Pareto) view pairs price against capability to surface the smartest model per dollar. As standardized world-model evaluations mature, the same framework is built to capture their effectiveness too. figures are sourced and cited to maximize credibility of scores.

> **Data provenance.** Figures are sourced from vendor model cards, [Artificial Analysis](https://artificialanalysis.ai), and the [LMArena](https://lmarena.ai) & [SWE-bench](https://www.swebench.com) leaderboards as of **June 2026**, and are cited per cell. They are vendor- or third-party-**reported** and have **not** been independently reproduced by Crosshair — every score is `verified: false`. Benchmarks and harnesses differ between vendors, so treat cross-model comparisons as directional. See [Data integrity](#data-integrity).

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS v4 + shadcn/ui (on Base UI) |
| Data | Static, typed modules in `src/data` (DB-swappable) |
| Hosting | Vercel (fully static / SSG) |

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

## What's tracked

The board curates **current, publicly-released** models that have authoritative, citable benchmark data (June 2026) — ~32 models across 16 providers: frontier flagships (Claude Opus 4.8, GPT-5.5, Gemini 3.1 Pro, Grok 4.3, DeepSeek V4-Pro, Kimi K2.6), recent legacy tiers (Claude Opus 4.7/4.6, GPT-5.4/5.2, Gemini 2.5 Pro, Grok 4.20), open-weights leaders (Llama 4, Qwen3.6/3.7, GLM-5.1, NVIDIA Nemotron 3 Ultra), and entries from Amazon (Nova 2 Pro), Meta (Muse Spark), MiniMax, and ByteDance (Doubao).

Benchmark columns are the ones current frontier models actually publish and that still separate them — **GPQA Diamond, SWE-bench Verified, Humanity's Last Exam, LiveCodeBench, MMLU-Pro, LMArena Elo** — plus the **Artificial Analysis Intelligence Index** (independent composite) and four professional-domain benchmarks from the independent evaluator **[Vals AI](https://www.vals.ai)**: CorpFin (finance), LegalBench (law), TaxEval (tax/accounting), and MedCode (medicine). Those domain scores power the per-industry "skill" views — Software Engineering, Investment Banking, Corporate Law, Medicine, Scientific Research, Management Consulting, and Accounting & Audit. (AIME and MMMU were dropped: they've saturated, and vendors now report AIME 2026 / MMMU-Pro instead.) World models are tracked but carry no scores yet — standardized world-model evaluation is still emerging.

## Architecture

```
src/
├─ app/                      # App Router pages (all statically generated)
│  ├─ page.tsx               # Home: hero + interactive leaderboard
│  ├─ models/                # /models and /models/[id] scorecards
│  ├─ benchmarks/            # /benchmarks and /benchmarks/[id] rankings
│  └─ about/                 # Methodology, data policy, roadmap
├─ components/
│  ├─ leaderboard.tsx        # The interactive (client) table: tabs, search, sort
│  ├─ provenance.tsx         # Source links + verified marks
│  ├─ tag.tsx                # Hook-free pill (safe in Server Components)
│  └─ ui/                    # shadcn primitives
├─ data/                     # ← the dataset (edit these to contribute)
│  ├─ providers.ts
│  ├─ models.ts
│  ├─ benchmarks.ts
│  └─ scores.ts
└─ lib/
   ├─ types.ts               # Domain types
   ├─ data.ts                # Single data access point (indexes + lookups)
   ├─ leaderboard.ts         # Normalization + Crosshair Index + ranking
   └─ evaluation/            # Phase-2: live-eval runner interface + AI Gateway stub
```

Data flows one way: `data/*` → `lib/data.ts` (builds lookup indexes) → `lib/leaderboard.ts` (joins + normalizes) → Server Components compute a serializable `LeaderboardData` at build time → the client `<Leaderboard>` handles sorting/filtering. Swapping the static files for a database means changing only `lib/data.ts`.

### Data model

- **Provider** — the org behind a model (OpenAI, Meta, …).
- **Model** — a system, tagged with a `category` (`llm` | `world-model`), modalities, and license. The same shape holds language and world models.
- **Benchmark** — a test, scoped to a category, with a `metric`, `unit`, and a `higherIsBetter` direction.
- **Score** — a `(model, benchmark)` value with a `source` (`vendor` | `paper` | `third-party` | `crosshair-eval`) and a `verified` flag.

### The Crosshair Index

Raw scores live in different units (accuracy %, pass rate, Elo, FVD, the AA Index), so each is normalized to 0–100:

- **Bounded** metrics (known max, e.g. a percentage) scale against that max.
- **Unbounded** metrics (Elo, FVD, the AA Index) scale by min–max within the column.
- **Lower-is-better** metrics (e.g. FVD) are inverted, so higher normalized always means better.

The **Crosshair Index** is the mean of a model's normalized scores — shown only when the model covers **≥ 40%** of its category's benchmarks, so a single cherry-picked result can't top the chart. The Artificial Analysis Intelligence Index is itself a composite, included as one normalized input alongside the individual benchmarks.

## <a id="data-integrity"></a>Data integrity

- Every score records **where it came from** (a linked source) and whether Crosshair has **independently reproduced it** (`verified`). All current data is `verified: false` — it's sourced, not reproduced.
- Only `crosshair-eval` (phase 2) figures are ever marked verified.
- Where a provider doesn't publish a benchmark, the cell is left empty rather than filled by guesswork.
- Prefer primary sources (papers, model cards, standardized harnesses) over screenshots, and note evaluation conditions (e.g. reasoning effort, tool use) where they matter.

## Contributing data

The dataset is plain TypeScript — open a PR editing `src/data`:

1. **`models.ts`** — add the model (provider, modalities, license, dates).
2. **`benchmarks.ts`** — define the benchmark, its metric, unit, and direction.
3. **`scores.ts`** — add scores via `buildScores(modelId, source, { [benchmarkId]: value })`. Attach a real source URL; leave `verified: false` unless you reproduced it.

Referential integrity is by string id (`providerId`, `modelId`, `benchmarkId`); keep them consistent.

## Roadmap

- **Phase 1 — Curated leaderboard (now).** Transparent static dataset, sourced + cited + flagged scores, direction-aware index.
- **Phase 2 — Live evaluations.** Run benchmarks via the **Vercel AI Gateway** (one key, every provider). The contracts live in `src/lib/evaluation`; implement `GatewayRunner.run()` and promote reproduced figures to `crosshair-eval` / `verified: true`. Schedule re-runs so the board tracks new releases.
- **Phase 3 — World models.** Stand up harnesses for physical prediction, planning, and video coherence; track V-JEPA, Genie, Cosmos, and newcomers as results mature; co-develop benchmark definitions with the community.

### Turning on live evals (phase 2 sketch)

```bash
pnpm add ai
# set AI_GATEWAY_API_KEY locally; Vercel injects OIDC creds in prod
```

Implement `run()` in `src/lib/evaluation/gateway-runner.ts` using `generateText({ model: "provider/model", prompt })`, grade against the benchmark's rubric, and emit a `Score`. The registry in `evaluation/index.ts` will pick it up automatically.

## Deploy to Vercel

```bash
vercel        # preview
vercel --prod # production
```

Optionally set `NEXT_PUBLIC_SITE_URL` (used for canonical/OG metadata). No other configuration is required.

---

Built with Next.js. Figures are sourced and cited as of June 2026 — vendor/third-party reported, not independently verified.
