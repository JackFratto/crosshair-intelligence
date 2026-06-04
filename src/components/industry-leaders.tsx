import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "@/components/provider-logo";
import { hueSweepFill } from "@/lib/gradient";
import type { IndustryStanding } from "@/lib/skillweb";

const FALLBACK_COLOR = "#6b7280";

/**
 * Horizontal bar graph ranking models by their industry score (0–100). The
 * highest score is bold, and each bar is tinted with its provider's brand
 * color. Used compactly on the "By industry" cards (`limit`) and in full on
 * the industry detail page (`linkModels`).
 */
export function IndustryLeaders({
  standings,
  limit,
  linkModels = false,
}: {
  standings: IndustryStanding[];
  limit?: number;
  linkModels?: boolean;
}) {
  const list = limit ? standings.slice(0, limit) : standings;
  if (!list.length) {
    return (
      <p className="text-sm text-muted-foreground">No measured results yet.</p>
    );
  }
  return (
    <div className="space-y-1.5">
      {list.map((s, i) => {
        const lead = i === 0;
        const emph = lead
          ? "font-semibold text-foreground"
          : "text-muted-foreground";
        const color = s.provider?.color ?? FALLBACK_COLOR;
        return (
          <div key={s.model.id} className="flex items-center gap-2">
            <span className="flex w-28 shrink-0 items-center gap-1.5">
              {s.provider && <ProviderLogo provider={s.provider} />}
              {linkModels ? (
                <Link
                  href={`/models/${s.model.id}`}
                  className={cn(
                    "truncate text-xs transition-colors hover:text-primary",
                    emph,
                  )}
                >
                  {s.model.name}
                </Link>
              ) : (
                <span className={cn("truncate text-xs", emph)}>
                  {s.model.name}
                </span>
              )}
            </span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted-foreground/15">
              <span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${Math.max(2, Math.min(100, s.score))}%`,
                  backgroundColor: color,
                  backgroundImage: hueSweepFill(color),
                }}
              />
            </span>
            <span className={cn("tabular w-9 shrink-0 text-right text-xs", emph)}>
              {s.score.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
