import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedMatch } from "@/components/home/FeaturedMatch";
import { UpcomingMatches } from "@/components/home/UpcomingMatches";
import { MiniLeaderboard } from "@/components/home/MiniLeaderboard";
import { HomeBoutiqueBanner } from "@/components/home/HomeBoutiqueBanner";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <HeroSection />
      <FeaturedMatch />
      <div className="mt-4 mb-6">
        <HomeBoutiqueBanner />
      </div>
      <div className="grid md:grid-cols-3 gap-6 pb-8">
        <div className="md:col-span-2">
          <UpcomingMatches />
        </div>
        <div>
          <MiniLeaderboard />
        </div>
      </div>
    </div>
  );
}
