import { getDriver, getTeam, nextRace } from "@/lib/f1-data";
import { useCountdown } from "@/hooks/useCountdown";
import type { Profile } from "@/hooks/useProfile";

function greet() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function TimeBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="tabular text-5xl sm:text-7xl font-semibold tracking-tight" style={{ color: "var(--team-hex, white)" }}>
        {value.toString().padStart(2, "0")}
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest text-white/50">{label}</div>
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

  return (
    <section className="tile-dark relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(60% 60% at 80% 0%, ${team?.color ?? "#0066cc"}33, transparent 70%)`,
        }}
      />
      <div className="mx-auto max-w-6xl px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28 relative">
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/60 mb-10">
          <span>{greet()}, {profile.name}.</span>
          <button onClick={onEditProfile} className="hover:text-white transition">Edit profile</button>
        </div>

        <div className="flex items-baseline gap-3 text-white/60 text-sm tracking-tight mb-4">
          <span className="tabular">Round {race.round.toString().padStart(2, "0")}</span>
          <span className="opacity-40">·</span>
          <span>{race.city}, {race.country}</span>
        </div>

        <h1 className="text-hero text-white mb-6" style={{ fontWeight: 600 }}>
          {race.name}.
        </h1>
        <p className="text-lead text-white/70 max-w-2xl mb-14">
          Lights out {fmt.format(raceDate)} · {timeFmt.format(raceDate)}. Circuit lap record{" "}
          <span className="tabular text-white/90">{race.lapRecord}</span>, 2025 pole{" "}
          <span className="tabular text-white/90">{race.polePrev}</span>.
        </p>

        <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-xl">
          <TimeBlock label="days" value={cd.days} />
          <TimeBlock label="hrs"  value={cd.hours} />
          <TimeBlock label="min"  value={cd.minutes} />
          <TimeBlock label="sec"  value={cd.seconds} />
        </div>

        {driver && team && (
          <div className="mt-16 inline-flex items-center gap-4 rounded-full bg-white/5 backdrop-blur px-5 py-3 border border-white/10">
            <span className="tabular text-2xl font-semibold" style={{ color: team.color }}>{driver.number}</span>
            <span className="text-white/90 tracking-tight">
              Your driver <span className="font-semibold">{driver.firstName} {driver.lastName}</span>
            </span>
            <span className="text-white/50 text-sm">· {team.name}</span>
          </div>
        )}
      </div>
    </section>
  );
}
