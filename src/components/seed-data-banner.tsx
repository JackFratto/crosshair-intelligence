import Link from "next/link";
import { InfoIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Standing data-provenance note. The dataset is real and cited, but figures are
 * vendor- or third-party-reported rather than independently reproduced — so the
 * disclaimer stays visible instead of being hidden once "seed" data is gone.
 */
export function SeedDataBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm">
      <InfoIcon
        weight="thin"
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
      />
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">
          Sourced &amp; cited — not independently verified.
        </span>{" "}
        Figures come from vendor model cards, Artificial Analysis, and the
        LMArena &amp; SWE-bench leaderboards (June 2026); every cell links its
        source.{" "}
        <Link
          href="/about#data"
          className="text-primary underline-offset-4 hover:underline"
        >
          How we handle data →
        </Link>
      </p>
    </div>
  );
}
