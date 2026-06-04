import Link from "next/link";
import { CrosshairLogo } from "@/components/crosshair-logo";

const columns: { heading: string; links: { href: string; label: string }[] }[] =
  [
    {
      heading: "Explore",
      links: [
        { href: "/", label: "Leaderboard" },
        { href: "/benchmarks", label: "Benchmarks" },
        { href: "/models", label: "Models" },
      ],
    },
    {
      heading: "Project",
      links: [
        { href: "/about", label: "Methodology" },
        { href: "/about#data", label: "Data policy" },
        { href: "/about#roadmap", label: "Roadmap" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1.6fr_1fr_1fr] sm:px-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <CrosshairLogo className="size-5 text-primary" />
            Crosshair Intelligence
          </div>
        </div>
        {columns.map((col) => (
          <nav key={col.heading} className="space-y-3 text-sm">
            <p className="font-medium text-foreground">{col.heading}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
