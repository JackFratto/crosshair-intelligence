"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CrosshairLogo } from "@/components/crosshair-logo";
import { MainNav } from "@/components/main-nav";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // On the leaderboard the fixed left rail provides the brand and spans above
  // the nav, so the header drops its own brand and shifts right to clear the
  // rail/panel (its width is published as --sidebar-width by the leaderboard).
  const onLeaderboard = pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={cn(
          "flex h-14 w-full items-center gap-3",
          onLeaderboard
            ? "px-4 transition-[padding] duration-200 sm:px-6 lg:pl-[calc(var(--sidebar-width,3rem)_+_1.5rem)]"
            : "mx-auto max-w-6xl px-4 sm:px-6",
        )}
      >
        {/* On the leaderboard, the fixed rail shows the brand at lg+, so hide it
            here then — but show it on mobile/tablet where the rail is hidden. */}
        <Link
          href="/"
          className={cn(
            "group flex items-center gap-2 font-semibold tracking-tight",
            onLeaderboard && "lg:hidden",
          )}
        >
          <CrosshairLogo className="size-5 text-primary" />
          <span className="hidden sm:inline">
            Crosshair{" "}
            <span className="font-normal text-muted-foreground">
              Intelligence
            </span>
          </span>
          <span className="sm:hidden">Crosshair</span>
        </Link>
        <div
          className={cn(
            "mx-1 hidden h-5 w-px bg-border sm:block",
            onLeaderboard && "lg:hidden",
          )}
        />
        <MainNav />
        <div className="ml-auto flex items-center gap-1 pr-2 text-sm">
          <a
            href="https://github.com/JackFratto/crosshair-intelligence"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <GithubLogoIcon weight="regular" className="size-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
