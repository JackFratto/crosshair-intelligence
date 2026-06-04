import { CheckIcon, ArrowSquareOutIcon } from "@phosphor-icons/react/dist/ssr";
import type { ScoreSource } from "@/lib/types";
import { Tag } from "@/components/tag";

const KIND_LABEL: Record<ScoreSource["kind"], string> = {
  vendor: "vendor",
  paper: "paper",
  "third-party": "3rd-party",
  "crosshair-eval": "crosshair",
};

export function SourceLink({ source }: { source: ScoreSource }) {
  const inner = (
    <span className="inline-flex items-center gap-1">
      {source.label}
      {source.url && (
        <ArrowSquareOutIcon weight="thin" className="size-3 opacity-60" />
      )}
    </span>
  );
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {inner}
        </a>
      ) : (
        <span className="text-muted-foreground">{inner}</span>
      )}
      <Tag variant="outline">{KIND_LABEL[source.kind]}</Tag>
    </span>
  );
}

export function VerifiedMark({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        <CheckIcon weight="thin" className="size-3.5" />
        verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="size-2 rounded-full border border-muted-foreground/50" />
      unverified
    </span>
  );
}
