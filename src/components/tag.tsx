import { cn } from "@/lib/utils";

export type TagVariant =
  | "default"
  | "outline"
  | "open"
  | "research"
  | "emerging"
  | "live"
  | "accent";

const variants: Record<TagVariant, string> = {
  default: "border-border bg-muted/50 text-muted-foreground",
  outline: "border-border text-muted-foreground",
  open: "border-primary/30 bg-primary/10 text-primary",
  research: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  emerging: "border-warning/40 bg-warning/10 text-warning",
  live: "border-primary/30 bg-primary/10 text-primary",
  accent: "border-primary/30 bg-primary/10 text-primary",
};

/**
 * Hook-free pill. Unlike the shadcn `Badge` (which relies on Base UI's
 * `useRender`), this is a plain element and is safe in Server Components.
 */
export function Tag({
  variant = "default",
  className,
  children,
}: {
  variant?: TagVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const LICENSE_TAG: Record<
  string,
  { label: string; variant: TagVariant }
> = {
  "open-weights": { label: "Open weights", variant: "open" },
  proprietary: { label: "Proprietary", variant: "outline" },
  research: { label: "Research", variant: "research" },
  unknown: { label: "Undisclosed", variant: "default" },
};
