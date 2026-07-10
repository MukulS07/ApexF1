import { useState } from "react";
import { constructorsStandings, driversStandings, getDriver, getTeam } from "@/lib/f1-data";

export function Standings({ favoriteDriverId }: { favoriteDriverId?: string }) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");
  const leader = tab === "drivers" ? driversStandings[0].points : constructorsStandings[0].points;

  return (
    <section className="tile-light border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-20 sm:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="text-sm text-ink-muted uppercase tracking-widest mb-3">The championship</div>
            <h2 className="text-display">Who's winning.</h2>
          </div>
          <div className="inline-flex bg-parchment rounded-full p-1 self-start">
            {(["drivers", "constructors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm capitalize transition ${
                  tab === t ? "bg-background shadow-sm text-ink" : "text-ink-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "drivers" ? (
          <ol className="divide-y divide-hairline">
            {driversStandings.map((row, i) => {
              const d = getDriver(row.driverId)!;
              const t = getTeam(d.teamId)!;
              const mine = d.id === favoriteDriverId;
              return (
                <li
                  key={row.driverId}
                  className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[40px_60px_1fr_160px_120px] items-center gap-4 py-5"
                  style={mine ? { background: `linear-gradient(90deg, ${t.color}0f, transparent 60%)`, borderRadius: 12, paddingLeft: 12, paddingRight: 12 } : undefined}
                >
                  <span className="tabular text-xl text-ink-muted">{i + 1}</span>
                  <span
                    className="tabular text-2xl font-semibold hidden sm:block"
                    style={{ color: t.color }}
                  >{d.number}</span>
                  <div>
                    <div className="text-lg font-semibold tracking-tight flex items-center gap-2">
                      {d.firstName} <span>{d.lastName}</span>
                      {mine && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: t.color, color: "white" }}>You</span>}
                    </div>
                    <div className="text-sm text-ink-muted">{t.name}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(row.points / leader) * 100}%`, background: t.color }} />
                    </div>
                  </div>
                  <div className="tabular text-2xl font-semibold text-right">{row.points}<span className="text-xs text-ink-muted ml-1 font-normal">PTS</span></div>
                </li>
              );
            })}
          </ol>
        ) : (
          <ol className="divide-y divide-hairline">
            {constructorsStandings.map((row, i) => {
              const t = getTeam(row.teamId)!;
              return (
                <li key={row.teamId} className="grid grid-cols-[40px_1fr_auto] sm:grid-cols-[40px_1fr_200px_120px] items-center gap-4 py-5">
                  <span className="tabular text-xl text-ink-muted">{i + 1}</span>
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-1.5 rounded-full" style={{ background: t.color }} />
                    <div>
                      <div className="text-lg font-semibold tracking-tight">{t.name}</div>
                      <div className="text-sm text-ink-muted">{t.hq}</div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(row.points / leader) * 100}%`, background: t.color }} />
                    </div>
                  </div>
                  <div className="tabular text-2xl font-semibold text-right">{row.points}<span className="text-xs text-ink-muted ml-1 font-normal">PTS</span></div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
