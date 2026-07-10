import { driversStandings, getDriver, getTeam } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";

export function YourDriver({ profile }: { profile: Profile }) {
  const d = getDriver(profile.favoriteDriverId);
  if (!d) return null;
  const team = getTeam(d.teamId)!;
  const rank = driversStandings.findIndex((s) => s.driverId === d.id);
  const points = rank >= 0 ? driversStandings[rank].points : 0;

  return (
    <section className="bg-canvas border-t border-hairline-strong relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20"
           style={{ background: `radial-gradient(60% 80% at 100% 0%, ${team.color}, transparent 70%)` }} />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="mb-12">
          <div className="text-eyebrow mb-4" style={{ color: team.color }}>// Your driver</div>
          <MStripe className="!w-24 mb-6" />
          <h2 className="text-display text-white flex items-baseline gap-6 flex-wrap">
            <span>{d.firstName} {d.lastName}.</span>
            <span className="tabular text-4xl" style={{ color: team.color }}>#{d.number}</span>
          </h2>
          <p className="text-lead text-body mt-4">Driving for {team.name} · {team.hq}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline-strong border border-hairline-strong">
          <Stat label="Championship" value={rank >= 0 ? `P${rank + 1}` : "—"} accent={team.color} />
          <Stat label="Points 2026"  value={points.toString()} />
          <Stat label="Career wins"  value={d.wins.toString()} />
          <Stat label="Career poles" value={d.poles.toString()} />
          <Stat label="Podiums"      value={d.podiums.toString()} />
          <Stat label="Titles"       value={d.championships.toString()} accent={d.championships > 0 ? team.color : undefined} />

          <div className="col-span-2 bg-surface-card p-6">
            <div className="text-eyebrow text-ink-muted mb-6">Form · last 5</div>
            <div className="flex items-end gap-3 h-28">
              {d.form.map((pos, i) => {
                const h = Math.max(10, 100 - pos * 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      className="w-full transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${h}%`, background: team.color, opacity: 0.4 + (1 - pos / 22) * 0.6 }}
                    />
                    <div className="tabular text-[10px] uppercase tracking-widest text-ink-muted">P{pos}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-surface-card p-6 tilt-card">
      <div className="text-eyebrow text-ink-muted">{label}</div>
      <div className="tabular text-5xl font-bold mt-4 text-white" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}
