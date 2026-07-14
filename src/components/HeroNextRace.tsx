import { getDriverOrFallback, getTeamOrFallback, nextRace } from "@/lib/f1-data";
import { useCountdown } from "@/hooks/useCountdown";
import { useRafTilt } from "@/hooks/useRafTilt";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";
import { ThreeCarCanvas } from "./ThreeCarCanvas";
import { useState } from "react";
import { LiveryConceptBoard } from "./LiveryConceptBoard";
import { Eye } from "lucide-react";
import { useF1Schedule } from "@/hooks/useF1Data";

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function TimeBlock({ label, value, glow }: { label: string; value: number; glow?: boolean }) {
  return (
    <div className="flex flex-col items-start border-l border-hairline pl-4 sm:pl-6">
      <div
        className={`tabular text-5xl sm:text-6xl font-bold tracking-tight ${glow ? "glow-pulse" : ""}`}
        style={{ color: "white" }}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-muted">{label}</div>
    </div>
  );
}

export function HeroNextRace({
  profile,
  onEditProfile,
}: {
  profile: Profile;
  onEditProfile: () => void;
}) {
  const { data: realTimeSchedule = [] } = useF1Schedule();

  const now = new Date();
  const upcoming =
    realTimeSchedule.length > 0
      ? realTimeSchedule.find((r) => new Date(r.dateISO).getTime() > now.getTime())
      : undefined;
  const race = upcoming || nextRace();

  const cd = useCountdown(race.dateISO);
  const driver = getDriverOrFallback(profile.favoriteDriverId);
  const team = driver ? getTeamOrFallback(driver.teamId) : undefined;
  const raceDate = new Date(race.dateISO);
  const fmt = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const [liveryMode, setLiveryMode] = useState<"dark" | "black" | "teal" | "white">("dark");
  const [boardOpen, setBoardOpen] = useState(false);

  // rAF-throttled parallax on hero (no-op on coarse pointers / reduced motion)
  const heroRef = useRafTilt<HTMLElement>(20, { global: true });

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-canvas grid-bg">
      {/* Ambient team-color glow */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-30"
        style={{
          background: `radial-gradient(circle, ${team?.color ?? "#1c69d4"}, transparent 60%)`,
          transform: "translate(var(--px, 0), var(--py, 0))",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, var(--m-red), transparent 60%)` }}
      />

      <MStripe />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 pt-6 sm:pt-8 pb-8 sm:pb-10 relative">
        <div className="flex items-center justify-between text-eyebrow text-ink-muted mb-8">
          <span>
            {greet()}, {profile.name}.
          </span>
          <button onClick={onEditProfile} className="hover:text-white transition-colors">
            Edit profile →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          {/* Main Info Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 text-eyebrow mb-4">
                <span className="tabular text-white">
                  Round {race.round.toString().padStart(2, "0")} / 24
                </span>
                <MStripe className="!w-12 !h-[3px]" />
                <span className="text-ink-muted">
                  {race.city} · {race.country}
                </span>
              </div>

              <h1 className="text-hero text-white mb-4 rise">
                {race.name.replace(" Grand Prix", "").replace(" GP", "").replace(" Grand-Prix", "")}
                <br />
                <span style={{ color: team?.color ?? "rgba(255,255,255,0.4)" }}>Grand Prix.</span>
              </h1>

              <p className="text-lead text-body max-w-2xl mb-8">
                Lights out {fmt.format(raceDate)} ·{" "}
                <span className="text-white">{timeFmt.format(raceDate)}</span>. Lap record{" "}
                <span className="tabular text-white">{race.lapRecord}</span> · 2025 pole{" "}
                <span className="tabular text-white">{race.polePrev}</span>.
              </p>

              {/* Countdown */}
              <div className="mb-8">
                <div className="text-eyebrow text-ink-muted mb-4">Time to lights out</div>
                <div className="grid grid-cols-4 gap-3 sm:gap-8 max-w-2xl">
                  <TimeBlock label="Days" value={cd.days} />
                  <TimeBlock label="Hours" value={cd.hours} />
                  <TimeBlock label="Minutes" value={cd.minutes} />
                  <TimeBlock label="Seconds" value={cd.seconds} glow />
                </div>
              </div>
            </div>

            {driver && team && (
              <div className="inline-flex items-stretch bg-surface-card tilt-card self-start mt-4">
                <span className="w-1" style={{ background: team.color }} />
                <div className="px-6 py-5 flex items-center gap-6">
                  <span className="tabular text-4xl font-bold" style={{ color: team.color }}>
                    {driver.number}
                  </span>
                  <div>
                    <div className="text-eyebrow text-ink-muted">Your driver</div>
                    <div className="text-white text-lg font-bold uppercase tracking-tight mt-1">
                      {driver.firstName} {driver.lastName}
                    </div>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-hairline" />
                  <div className="hidden sm:block">
                    <div className="text-eyebrow text-ink-muted">Team</div>
                    <div className="text-white text-sm mt-1">{team.name}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3D Showcase Column */}
          {team && driver && (
            <div className="lg:col-span-1 flex flex-col bg-surface-card border border-hairline-strong overflow-hidden h-[320px] lg:h-auto">
              <div className="p-4 border-b border-hairline-strong flex justify-between items-center bg-black/40">
                <div>
                  <div className="text-eyebrow text-ink-muted">// LIVERY SHOWROOM</div>
                  <div className="text-xs font-bold text-white uppercase mt-0.5">
                    {team.short} - {driver.lastName} #{driver.number}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {team.id === "mclaren" && (
                    <button
                      onClick={() => setBoardOpen(true)}
                      className="text-[9px] font-mono text-[#FF8700] px-2 py-0.5 border border-[#FF8700]/50 hover:bg-[#FF8700]/10 uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-2.5 w-2.5" />
                      Board
                    </button>
                  )}
                  <div className="text-[10px] font-mono text-ink-muted px-2 py-0.5 border border-hairline uppercase">
                    ROTATING
                  </div>
                </div>
              </div>

              <div className="flex-1 relative bg-black min-h-[180px]">
                <ThreeCarCanvas
                  teamId={team.id}
                  driverNumber={driver.number}
                  mode="rotate"
                  liveryMode={team.id === "mclaren" ? liveryMode : "dark"}
                />
              </div>

              {team.id === "mclaren" && (
                <div className="p-2 border-t border-hairline-strong bg-black/60 flex justify-between items-center flex-wrap gap-1">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase">// MODE:</span>
                  <div className="flex gap-1">
                    {(["dark", "black", "teal", "white"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setLiveryMode(m)}
                        className={`px-1.5 py-0.5 text-[8px] font-mono border uppercase transition-colors cursor-pointer ${
                          liveryMode === m
                            ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <MStripe />

      {team && driver && team.id === "mclaren" && (
        <LiveryConceptBoard
          open={boardOpen}
          onClose={() => setBoardOpen(false)}
          driverNumber={driver.number}
        />
      )}
    </section>
  );
}
