import { driversStandings, getDriver, getTeam } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";

export function YourDriver({ profile }: { profile: Profile }) {
  const d = getDriver(profile.favoriteDriverId);
  if (!d) return null;
  const team = getTeam(d.teamId)!;
  const rank = driversStandings.findIndex((s) => s.driverId === d.id);
  const points = rank >= 0 ? driversStandings[rank].points : 0;

  return (
    <section className="tile-light border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-20 sm:py-28">
        <div className="mb-10">
          <div className="text-sm uppercase tracking-widest mb-3" style={{ color: team.color }}>Your driver</div>
          <h2 className="text-display flex items-baseline gap-4 flex-wrap">
            <span>{d.firstName} {d.lastName}.</span>
            <span className="tabular text-4xl" style={{ color: team.color }}>#{d.number}</span>
          </h2>
          <p className="text-lead text-ink-muted mt-3">Driving for {team.name}. {team.hq}.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Championship" value={rank >= 0 ? `P${rank + 1}` : "—"} accent={team.color} />
          <Stat label="Points 2026"  value={points.toString()} />
          <Stat label="Career wins"  value={d.wins.toString()} />
          <Stat label="Career poles" value={d.poles.toString()} />
          <Stat label="Podiums"      value={d.podiums.toString()} />
          <Stat label="Titles"       value={d.championships.toString()} accent={d.championships > 0 ? team.color : undefined} />
          <div className="col-span-2 rounded-3xl bg-parchment p-6">
            <div className="text-xs uppercase tracking-widest text-ink-muted mb-4">Form · last 5</div>
            <div className="flex items-end gap-2 h-24">
              {d.form.map((pos, i) => {
                const h = Math.max(10, 100 - pos * 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-md" style={{ height: `${h}%`, background: team.color, opacity: 0.4 + (1 - pos / 22) * 0.6 }} />
                    <div className="tabular text-xs text-ink-muted">P{pos}</div>
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
    <div className="rounded-3xl bg-parchment p-6">
      <div className="text-xs uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="tabular text-4xl font-semibold mt-3 tracking-tight" style={accent ? { color: accent } : undefined}>{value}</div>
    </div>
  );
}
