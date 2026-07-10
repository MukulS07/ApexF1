import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { OnboardingModal } from "@/components/OnboardingModal";
import { HeroNextRace } from "@/components/HeroNextRace";
import { ChampionshipBoard } from "@/components/ChampionshipBoard";
import { SeasonCalendar } from "@/components/SeasonCalendar";
import { YourDriver } from "@/components/YourDriver";
import { TrackTelemetry } from "@/components/TrackTelemetry";
import { Footer, TopNav } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Pit Wall — Your F1 2026 Dashboard" },
      { name: "description", content: "A quiet, always-on Formula 1 2026 dashboard. Countdown to lights-out, live standings, calendar, and paddock intel — in your driver's team colors." },
      { property: "og:title", content: "The Pit Wall — Your F1 2026 Dashboard" },
      { property: "og:description", content: "Countdown, standings, calendar, and recap for the 2026 F1 season — personalised to your driver." },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, setProfile, hydrated } = useProfile();
  const [editing, setEditing] = useState(false);

  if (!hydrated) {
    return <div className="min-h-screen bg-background" />;
  }

  const needsOnboarding = !profile;

  return (
    <div className="min-h-screen">
      <TopNav onEdit={() => setEditing(true)} />

      {profile ? (
        <>
          <div id="next"><HeroNextRace profile={profile} onEditProfile={() => setEditing(true)} /></div>
          <div id="standings"><Standings favoriteDriverId={profile.favoriteDriverId} /></div>
          <div id="telemetry"><TrackTelemetry profile={profile} /></div>
          <div id="calendar"><SeasonCalendar /></div>
          <div id="recap"><LastRaceRecap /></div>
          <div id="driver"><YourDriver profile={profile} /></div>
          <Footer />
        </>
      ) : (
        <div className="min-h-[80vh] tile-dark flex items-center justify-center px-6">
          <div className="text-center max-w-xl">
            <h1 className="text-hero text-white">The Pit Wall.</h1>
            <p className="text-lead text-white/60 mt-4">
              Your quiet, always-on F1 2026 dashboard.
            </p>
          </div>
        </div>
      )}

      <OnboardingModal
        open={needsOnboarding || editing}
        initial={profile}
        onClose={profile ? () => setEditing(false) : undefined}
        onComplete={(p) => {
          setProfile(p);
          setEditing(false);
        }}
      />
    </div>
  );
}
