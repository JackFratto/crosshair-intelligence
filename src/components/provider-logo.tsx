import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/types";

/**
 * A provider's brand mark. Uses a local logo SVG when we have one, and falls
 * back to a colored monogram (brand color + initial) for providers without a
 * logo (e.g. OpenAI/xAI, which aren't in our icon set).
 */
export function ProviderLogo({
  provider,
  className,
}: {
  provider: Provider;
  className?: string;
}) {
  if (provider.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={provider.logo}
        alt={provider.name}
        title={provider.name}
        width={14}
        height={14}
        loading="lazy"
        className={cn("h-3.5 w-auto object-contain", className)}
      />
    );
  }

  const initial = (provider.shortName ?? provider.name).charAt(0).toUpperCase();
  return (
    <span
      title={provider.name}
      aria-label={provider.name}
      className={cn(
        "inline-flex size-3.5 items-center justify-center rounded-[3px] text-[9px] font-bold text-white",
        className,
      )}
      style={{ backgroundColor: provider.color ?? "#6b7280" }}
    >
      {initial}
    </span>
  );
}
