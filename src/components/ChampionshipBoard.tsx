import { useEffect, useRef, useState } from "react";
import {
  constructorsStandings,
  driversStandings,
  getDriver,
  getDriverOrFallback,
  getTeam,
  getTeamOrFallback,
  lastRace,
} from "@/lib/f1-data";
import { useDriverStandings, useConstructorStandings, useLastRaceResults } from "@/hooks/useF1Data";

/**
 * Three-column aligned board:
 *   § 01 Drivers' Championship  |  § 02 Constructors' Cup  |  § 03 Paddock Intel
 *
 * Columns share the same eyebrow / heading rhythm so rows line up horizontally
 * across the full width (matches the reference layout).
 */
export function ChampionshipBoard({ favoriteDriverId }: { favoriteDriverId?: string }) {
  // Highlight flash when the favorite driver changes.
  const [flash, setFlash] = useState(0);
  const prev = useRef<string | undefined>(favoriteDriverId);
  useEffect(() => {
    if (prev.current !== favoriteDriverId) {
      prev.current = favoriteDriverId;
      setFlash((n) => n + 1);
    }
  }, [favoriteDriverId]);

  const { data: realTimeDrivers = [] } = useDriverStandings();
  const { data: realTimeTeams = [] } = useConstructorStandings();
  const { data: realTimeLastRace = null } = useLastRaceResults();

  const currentDrivers = realTimeDrivers.length > 0 ? realTimeDrivers : driversStandings;
  const currentTeams = realTimeTeams.length > 0 ? realTimeTeams : constructorsStandings;
  const currentLastRace: any = realTimeLastRace || lastRace;

  const driverLeader = currentDrivers[0]?.points || 1;
  const teamLeader = currentTeams[0]?.points || 1;

  const winner = getDriverOrFallback(currentLastRace.winnerId);
  const winnerTeam = getTeamOrFallback(winner.teamId);
  const fl = getDriverOrFallback(currentLastRace.fastestLapId);

  return (
    <section className="bg-canvas border-t border-hairline-strong">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr_0.95fr] gap-px bg-hairline-strong border border-hairline-strong">
          {/* -------- § 01 Drivers -------- */}
          <Column
            index="01"
            title="Drivers'"
            accent="Championship"
            sub={`${currentDrivers.length} rounds in`}
          >
            <ol>
              {currentDrivers.map((row: any, i: number) => {
                const d = getDriverOrFallback(
                  row.driverId,
                  (row as any).rawDriver
                    ? {
                        ...(row as any).rawDriver,
                        constructorId: row.constructorId,
                      }
                    : undefined,
                );
                const t = getTeamOrFallback(d.teamId);
                const mine = d.id === favoriteDriverId;
                return (
                  <li
                    key={row.driverId}
                    className={`group grid grid-cols-[36px_1fr_auto] items-center gap-3 py-4 px-4 border-b border-hairline transition-colors hover:bg-surface-soft relative ${
                      mine ? "row-flash" : ""
                    }`}
                    style={
                      mine
                        ? ({ ["--team-hex" as string]: t.color } as React.CSSProperties)
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
                    <span className="tabular text-lg font-bold text-ink-muted">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold uppercase tracking-tight truncate">
                          {d.firstName[0]}. {d.lastName}
                        </span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 tabular"
                          style={{ background: t.color, color: "white" }}
                        >
                          {d.id}
                        </span>
                        {mine && (
                          <span
                            key={`badge-${flash}`}
                            className="text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 mine-badge"
                            style={{ background: t.color, color: "white" }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-1 truncate">
                        {t.name} · {d.country}
                      </div>
                      <div className="h-[2px] bg-hairline-strong overflow-hidden mt-2">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(row.points / driverLeader) * 100}%`,
                            background: t.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="tabular text-2xl font-bold text-right text-white leading-none">
                      {row.points}
                      <div className="text-[10px] text-ink-muted font-normal mt-1">PTS</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Column>

          {/* -------- § 02 Constructors -------- */}
          <Column
            index="02"
            title="Constructors'"
            accent="Cup"
            sub={`All ${currentTeams.length} teams · 2026`}
          >
            <ol>
              {currentTeams.map((row: any, i: number) => {
                const t = getTeamOrFallback(row.teamId, (row as any).teamName);
                return (
                  <li
                    key={row.teamId}
                    className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 py-4 px-4 border-b border-hairline transition-colors hover:bg-surface-soft"
                  >
                    <span className="tabular text-lg font-bold text-ink-muted">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="text-white font-bold uppercase tracking-tight truncate">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-1 truncate">
                        {t.short} · {t.hq}
                      </div>
                      <div className="h-[2px] bg-hairline-strong overflow-hidden mt-2">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${(row.points / teamLeader) * 100}%`,
                            background: t.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="tabular text-2xl font-bold text-right text-white leading-none">
                      {row.points}
                      <div className="text-[10px] text-ink-muted font-normal mt-1">PTS</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Column>

          {/* -------- § 03 Paddock Intel -------- */}
          <Column
            index="03"
            title="Paddock"
            accent="Intel"
            sub="Last race · top stories"
            aside={
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Data
              </span>
            }
          >
            <div className="px-4 py-3 border-b border-hairline text-[11px] uppercase tracking-wider text-ink-muted">
              {currentLastRace.name} · {currentLastRace.circuit} · Result
            </div>
            {currentLastRace.podium.map((id: string, i: number) => {
              const d = getDriverOrFallback(id);
              const t = getTeamOrFallback(d.teamId);
              const label =
                i === 0
                  ? currentLastRace.results?.[0]?.time || currentLastRace.fastestLap
                  : currentLastRace.results?.[i]
                    ? currentLastRace.results[i].time
                    : `+${(0.4 + i * 0.35).toFixed(3)}`;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 py-4 px-4 border-b border-hairline"
                >
                  <span
                    className="text-[10px] font-bold px-2 py-1 tabular"
                    style={{ background: t.color, color: "white" }}
                  >
                    P{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold uppercase tracking-tight truncate">
                      {d.firstName} {d.lastName}
                    </div>
                    <div className="text-[11px] text-ink-muted uppercase tracking-wider mt-0.5 truncate">
                      {t.name} · #{d.number}
                    </div>
                  </div>
                  <div className="tabular text-sm font-bold text-white">{label}</div>
                </div>
              );
            })}

            <Story
              tag="Last race"
              index="01"
              headline={`${winner.firstName} ${winner.lastName} wins ${currentLastRace.name}`}
              body={`${winner.firstName} ${winner.lastName} (${winnerTeam.name}) took the flag ahead of the field at ${currentLastRace.circuit}.`}
            />
            <Story
              tag="Fastest lap"
              index="02"
              headline={`${fl.lastName[0]}. ${fl.lastName} sets ${currentLastRace.fastestLap} at ${currentLastRace.name}`}
              body={`Fastest tour of the race on the closing stint — a bonus point if it stays in the top ten.`}
            />
            <Story
              tag="Championship"
              index="03"
              headline={`${getDriverOrFallback(currentDrivers[0]?.driverId).lastName} leads ${getDriverOrFallback(currentDrivers[1]?.driverId).lastName} by ${(currentDrivers[0]?.points || 0) - (currentDrivers[1]?.points || 0)} points`}
              body={`${getTeamOrFallback(getDriverOrFallback(currentDrivers[0]?.driverId).teamId).name} versus ${getTeamOrFallback(getDriverOrFallback(currentDrivers[1]?.driverId).teamId).name} at the front — who wins this year?`}
            />
          </Column>
        </div>
      </div>
    </section>
  );
}

function Column({
  index,
  title,
  accent,
  sub,
  aside,
  children,
}: {
  index: string;
  title: string;
  accent: string;
  sub: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-card">
      <header className="px-4 pt-6 pb-5 border-b border-hairline flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-eyebrow text-ink-muted mb-2">§ {index}</div>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-none">
            {title}{" "}
            <span
              className="italic font-serif normal-case tracking-normal"
              style={{ color: "var(--team-hex, #ff2a2a)" }}
            >
              {accent}
            </span>
          </h2>
          <div className="text-[11px] uppercase tracking-wider text-ink-muted mt-3">{sub}</div>
        </div>
        {aside && <div className="shrink-0 mt-1">{aside}</div>}
      </header>
      {children}
    </div>
  );
}

function Story({
  tag,
  index,
  headline,
  body,
}: {
  tag: string;
  index: string;
  headline: string;
  body: string;
}) {
  return (
    <div className="px-4 py-5 border-b border-hairline">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 bg-white/5 text-white">
          {tag}
        </span>
        <span className="text-[10px] tabular text-ink-muted">{index}</span>
      </div>
      <div className="text-white font-bold tracking-tight leading-snug">{headline}</div>
      <p className="text-sm text-ink-muted mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
