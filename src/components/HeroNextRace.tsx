import { getDriver, getTeam, nextRace } from "@/lib/f1-data";
import { useCountdown } from "@/hooks/useCountdown";
import { useEffect, useRef } from "react";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";

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
        className={`tabular text-6xl sm:text-8xl font-bold tracking-tight ${glow ? "glow-pulse" : ""}`}
        style={{ color: "white" }}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-ink-muted">{label}</div>
    </div>
  );
}

export function HeroNextRace({ profile, onEditProfile }: { profile: Profile; onEditProfile: () => void }) {
  const race = nextRace();
  const cd = useCountdown(race.dateISO);
  const driver = getDriver(profile.favoriteDriverId);
  const team = driver ? getTeam(driver.teamId) : undefined;
  const raceDate = new Date(race.dateISO);
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  // Parallax mouse tilt on hero
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", `${x * 20}px`);
      el.style.setProperty("--py", `${y * 20}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-canvas grid-bg">
      {/* Ambient team-color glow */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full blur-3xl opacity-30 slow-spin"
        style={{ background: `radial-gradient(circle, ${team?.color ?? "#1c69d4"}, transparent 60%)`,
                 transform: "translate(var(--px, 0), var(--py, 0))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, var(--m-red), transparent 60%)` }}
      />

      <MStripe />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 pt-16 sm:pt-24 pb-24 sm:pb-32 relative">
        <div className="flex items-center justify-between text-eyebrow text-ink-muted mb-16">
          <span>{greet()}, {profile.name}.</span>
          <button onClick={onEditProfile} className="hover:text-white transition-colors">Edit profile →</button>
        </div>

        <div className="flex items-center gap-4 text-eyebrow mb-6">
          <span className="tabular text-white">Round {race.round.toString().padStart(2, "0")} / 24</span>
          <MStripe className="!w-12 !h-[3px]" />
          <span className="text-ink-muted">{race.city} · {race.country}</span>
        </div>

        <h1 className="text-hero text-white mb-8 rise">
          {race.name.replace(" GP", "")}<br />
          <span className="text-white/40">Grand Prix.</span>
        </h1>

        <p className="text-lead text-body max-w-2xl mb-16">
          Lights out {fmt.format(raceDate)} · <span className="text-white">{timeFmt.format(raceDate)}</span>. Lap record{" "}
          <span className="tabular text-white">{race.lapRecord}</span> · 2025 pole{" "}
          <span className="tabular text-white">{race.polePrev}</span>.
        </p>

        {/* Countdown */}
        <div className="mb-16">
          <div className="text-eyebrow text-ink-muted mb-6">Time to lights out</div>
          <div className="grid grid-cols-4 gap-3 sm:gap-8 max-w-2xl">
            <TimeBlock label="Days" value={cd.days} />
            <TimeBlock label="Hours" value={cd.hours} />
            <TimeBlock label="Minutes" value={cd.minutes} />
            <TimeBlock label="Seconds" value={cd.seconds} glow />
          </div>
        </div>

        {driver && team && (
          <div className="inline-flex items-stretch bg-surface-card tilt-card">
            <span className="w-1" style={{ background: team.color }} />
            <div className="px-6 py-5 flex items-center gap-6">
              <span className="tabular text-4xl font-bold" style={{ color: team.color }}>{driver.number}</span>
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

      <MStripe />
    </section>
  );
}
