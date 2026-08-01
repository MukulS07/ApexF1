import { useEffect, useMemo, useRef, useState } from "react";
import {
  constructorsStandings,
  driversStandings,
  getDriverOrFallback,
  getTeamOrFallback,
} from "@/lib/f1-data";
import { useDriverStandings, useConstructorStandings } from "@/hooks/useF1Data";

type Tab = "drivers" | "constructors";

export function Standings({ favoriteDriverId }: { favoriteDriverId?: string }) {
  const [tab, setTab] = useState<Tab>("drivers");
  const [renderTab, setRenderTab] = useState<Tab>("drivers");
  const [phase, setPhase] = useState<"in" | "out">("in");

  const { data: realTimeDrivers = [] } = useDriverStandings();
  const { data: realTimeTeams = [] } = useConstructorStandings();

  const currentDrivers = realTimeDrivers.length > 0 ? realTimeDrivers : driversStandings;
  const currentTeams = realTimeTeams.length > 0 ? realTimeTeams : constructorsStandings;

  // Cross-fade between tabs: fade current out, swap, fade new in.
  useEffect(() => {
    if (tab === renderTab) return;
    setPhase("out");
    const t = window.setTimeout(() => {
      setRenderTab(tab);
      setPhase("in");
    }, 180);
    return () => window.clearTimeout(t);
  }, [tab, renderTab]);

  const leader = useMemo(
    () => (renderTab === "drivers" ? (currentDrivers[0]?.points || 1) : (currentTeams[0]?.points || 1)),
    [renderTab, currentDrivers, currentTeams],
  );

  // Highlight flash when the favorite driver changes.
  const [flash, setFlash] = useState(0);
  const prev = useRef<string | undefined>(favoriteDriverId);
  useEffect(() => {
    if (prev.current !== favoriteDriverId) {
      prev.current = favoriteDriverId;
      setFlash((n) => n + 1);
    }
  }, [favoriteDriverId]);

  return (
    <section className="bg-canvas border-t border-hairline-strong">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <div className="text-eyebrow text-ink-muted mb-4">// The championship</div>
            <h2 className="text-display text-white">
              Who's
              <br />
              winning.
            </h2>
          </div>
          <div
            role="tablist"
            aria-label="Standings"
            className="relative inline-flex gap-8 self-start"
          >
            {(["drivers", "constructors"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`relative text-eyebrow pb-2 transition-colors ${
                  tab === t ? "text-white" : "text-ink-muted hover:text-white"
                }`}
              >
                {t}
                <span
                  className={`absolute left-0 right-0 -bottom-[1px] h-[2px] bg-white origin-left transition-transform duration-300 ease-out ${
                    tab === t ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div
          key={renderTab}
          className={`transition-all duration-200 ease-out ${
            phase === "out" ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {renderTab === "drivers" ? (
            <ol className="divide-y divide-hairline-strong border-y border-hairline-strong">
              {currentDrivers.map((row: any, i: number) => {
                const d = getDriverOrFallback(
                  row.driverId,
                  row.rawDriver
                    ? { ...row.rawDriver, constructorId: row.constructorId }
                    : undefined,
                );
                const t = getTeamOrFallback(d.teamId);
                const mine = d.id === favoriteDriverId;
                return (
                  <li
                    key={row.driverId || i}
                    // key on flash re-triggers the highlight animation
                    data-mine={mine ? "true" : undefined}
                    className={`group grid grid-cols-[40px_1fr_auto] sm:grid-cols-[50px_60px_1fr_180px_130px] items-center gap-4 py-5 px-2 speed-line transition-colors hover:bg-surface-soft relative ${
                      mine ? "row-flash" : ""
                    }`}
                    style={
                      mine
                        ? ({
                            ["--team-hex" as string]: t.color,
                            animationDelay: `${flash * 0}ms`,
                          } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {mine && (
                      <span
                        key={`bar-${flash}`}
                        className="absolute left-0 top-0 bottom-0 w-[3px] mine-bar"
                        style={{ background: t.color }}
                      />
                    )}
                    <span className="tabular text-2xl font-bold text-ink-muted">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span
                      className="tabular text-2xl font-bold hidden sm:block"
                      style={{ color: t.color }}
                    >
                      {d.number}
                    </span>
                    <div>
                      <div className="text-lg font-bold uppercase tracking-tight flex items-center gap-3 text-white">
                        <span className="text-white/60">{d.firstName}</span>
                        <span>{d.lastName}</span>
                        {mine && (
                          <span
                            key={`badge-${flash}`}
                            className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 mine-badge"
                            style={{ background: t.color, color: "white" }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                        {t.name}
                      </div>
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
                      {row.points}
                      <span className="text-xs text-ink-muted ml-2 font-normal">PTS</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <ol className="divide-y divide-hairline-strong border-y border-hairline-strong">
              {currentTeams.map((row: any, i: number) => {
                const t = getTeamOrFallback(row.teamId, row.teamName);
                return (
                  <li
                    key={row.teamId || i}
                    className="group grid grid-cols-[50px_1fr_auto] sm:grid-cols-[50px_1fr_220px_130px] items-center gap-4 py-5 px-2 speed-line transition-colors hover:bg-surface-soft"
                  >
                    <span className="tabular text-2xl font-bold text-ink-muted">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="h-10 w-1" style={{ background: t.color }} />
                      <div>
                        <div className="text-lg font-bold uppercase tracking-tight text-white">
                          {t.name}
                        </div>
                        <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                          {t.hq}
                        </div>
                      </div>
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
                      {row.points}
                      <span className="text-xs text-ink-muted ml-2 font-normal">PTS</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
