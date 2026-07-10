import { useState } from "react";
import { constructorsStandings, driversStandings, getDriver, getTeam } from "@/lib/f1-data";

export function Standings({ favoriteDriverId }: { favoriteDriverId?: string }) {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");
  const leader = tab === "drivers" ? driversStandings[0].points : constructorsStandings[0].points;

  return (
    <section className="bg-canvas border-t border-hairline-strong">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <div className="text-eyebrow text-ink-muted mb-4">// The championship</div>
            <h2 className="text-display text-white">Who's<br />winning.</h2>
          </div>
          <div className="inline-flex gap-6 self-start">
            {(["drivers", "constructors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-eyebrow pb-2 transition-colors border-b-2 ${
                  tab === t ? "text-white border-white" : "text-ink-muted border-transparent hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "drivers" ? (
          <ol className="divide-y divide-hairline-strong border-y border-hairline-strong">
            {driversStandings.map((row, i) => {
              const d = getDriver(row.driverId)!;
              const t = getTeam(d.teamId)!;
              const mine = d.id === favoriteDriverId;
              return (
                <li
                  key={row.driverId}
                  className="group grid grid-cols-[40px_1fr_auto] sm:grid-cols-[50px_60px_1fr_180px_130px] items-center gap-4 py-5 px-2 speed-line transition-colors hover:bg-surface-soft relative"
                >
                  {mine && <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: t.color }} />}
                  <span className="tabular text-2xl font-bold text-ink-muted">{(i + 1).toString().padStart(2, "0")}</span>
                  <span className="tabular text-2xl font-bold hidden sm:block" style={{ color: t.color }}>{d.number}</span>
                  <div>
                    <div className="text-lg font-bold uppercase tracking-tight flex items-center gap-3 text-white">
                      <span className="text-white/60">{d.firstName}</span>
                      <span>{d.lastName}</span>
                      {mine && <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5" style={{ background: t.color, color: "white" }}>You</span>}
                    </div>
                    <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">{t.name}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-[3px] bg-hairline-strong overflow-hidden">
                      <div
                        className="h-full transition-all duration-700 group-hover:brightness-125"
                        style={{ width: `${(row.points / leader) * 100}%`, background: t.color }}
                      />
                    </div>
                  </div>
                  <div className="tabular text-3xl font-bold text-right text-white">
                    {row.points}<span className="text-xs text-ink-muted ml-2 font-normal">PTS</span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <ol className="divide-y divide-hairline-strong border-y border-hairline-strong">
            {constructorsStandings.map((row, i) => {
              const t = getTeam(row.teamId)!;
              return (
                <li key={row.teamId} className="group grid grid-cols-[50px_1fr_auto] sm:grid-cols-[50px_1fr_220px_130px] items-center gap-4 py-5 px-2 speed-line transition-colors hover:bg-surface-soft">
                  <span className="tabular text-2xl font-bold text-ink-muted">{(i + 1).toString().padStart(2, "0")}</span>
                  <div className="flex items-center gap-4">
                    <span className="h-10 w-1" style={{ background: t.color }} />
                    <div>
                      <div className="text-lg font-bold uppercase tracking-tight text-white">{t.name}</div>
                      <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">{t.hq}</div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="h-[3px] bg-hairline-strong overflow-hidden">
                      <div className="h-full transition-all duration-700 group-hover:brightness-125" style={{ width: `${(row.points / leader) * 100}%`, background: t.color }} />
                    </div>
                  </div>
                  <div className="tabular text-3xl font-bold text-right text-white">{row.points}<span className="text-xs text-ink-muted ml-2 font-normal">PTS</span></div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
