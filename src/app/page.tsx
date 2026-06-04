import { buildAllLeaderboards } from "@/lib/leaderboard";
import { buildModelPreview, type ModelPreviewData } from "@/lib/skillweb";
import {
  CATEGORIES,
  industries,
  models,
  worldModelCapabilities,
} from "@/lib/data";
import { Leaderboard } from "@/components/leaderboard";
import type { Industry, ModelCategory } from "@/lib/types";

export default function Home() {
  const datasets = buildAllLeaderboards();
  const previews: Record<string, ModelPreviewData> = Object.fromEntries(
    models.map((m) => [m.id, buildModelPreview(m.id)] as const),
  );
  const industriesByCategory: Record<ModelCategory, Industry[]> = {
    llm: industries,
    "world-model": worldModelCapabilities,
  };

  return (
    <section className="w-full">
      <Leaderboard
        datasets={datasets}
        categories={CATEGORIES}
        previews={previews}
        industries={industriesByCategory}
      />
    </section>
  );
}
