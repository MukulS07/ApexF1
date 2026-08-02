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
import { FlipCard } from "./ui/flip-card";
import { RotateCw, Trophy } from "lucide-react";

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
            sub={`${currentLastRace.round || 12} rounds completed`}
            aside={
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <RotateCw className="h-3 w-3 animate-spin" style={{ animationDuration: "10s" }} />
                AUTO FLIP / UNFLIP
              </span>
            }
          >
            <div className="p-3">
              <DriversFlipCard
                drivers={currentDrivers}
                driverLeader={driverLeader}
                favoriteDriverId={favoriteDriverId}
                flash={flash}
              />
            </div>
          </Column>

          {/* -------- § 02 Constructors -------- */}
          <Column
            index="02"
            title="Constructors'"
            accent="Cup"
            sub={`All ${currentTeams.length} teams · 2026`}
            aside={
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <RotateCw className="h-3 w-3 animate-spin" style={{ animationDuration: "10s" }} />
                FLIP CARD ENABLED
              </span>
            }
          >
            <div className="p-3">
              <ConstructorsFlipCard teams={currentTeams} teamLeader={teamLeader} />
            </div>
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

function DriversFlipCard({
  drivers,
  driverLeader,
  favoriteDriverId,
  flash,
}: {
  drivers: any[];
  driverLeader: number;
  favoriteDriverId?: string;
  flash: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto flip when scrolled into view & auto unflip when scrolled out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFlipped(true);
          } else {
            setIsFlipped(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const topRow = drivers[0];
  const topDriver = getDriverOrFallback(
    topRow?.driverId,
    (topRow as any)?.rawDriver
      ? { ...(topRow as any).rawDriver, constructorId: topRow?.constructorId }
      : undefined
  );
  const topTeam = getTeamOrFallback(topDriver.teamId);
  const secondRow = drivers[1];
  const leadMargin = (topRow?.points || 0) - (secondRow?.points || 0);

  const frontSide = (
    <div className="relative overflow-hidden bg-[#0d0d0d] border border-hairline-strong p-6 min-h-[580px] flex flex-col justify-between rounded-[2px] shadow-2xl group/card">
      {/* Carbon fiber grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%), linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      />

      {/* Team Accent Glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-40"
        style={{ background: topTeam.color }}
      />

      {/* Watermark Big Number */}
      <span
        className="absolute bottom-[-20px] right-2 text-[160px] font-black leading-none opacity-[0.04] pointer-events-none select-none"
        style={{ color: topTeam.color }}
      >
        #{topDriver.number}
      </span>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-eyebrow text-ink-muted flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" style={{ color: topTeam.color }} />
            // DRIVER SPOTLIGHT
          </span>
          <span
            className="text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest text-white rounded-[1px]"
            style={{ background: topTeam.color }}
          >
            P1 LEADER
          </span>
        </div>
        <div className="h-[2px] w-full" style={{ background: topTeam.color }} />
      </div>

      {/* Main Driver Info */}
      <div className="relative z-10 my-auto py-6">
        <div className="text-[11px] font-mono text-ink-muted uppercase tracking-widest mb-1 flex items-center gap-2">
          <span>{topTeam.name}</span>
          <span>·</span>
          <span>#{topDriver.number}</span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none mb-3">
          {topDriver.firstName} {topDriver.lastName}
        </h3>

        <div className="flex items-baseline gap-4 mt-6">
          <span className="tabular text-5xl font-extrabold text-white">
            {topRow?.points}
          </span>
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
            PTS ({leadMargin > 0 ? `+${leadMargin} PTS LEAD` : "CHAMPIONSHIP LEADER"})
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-[3px] bg-hairline-strong overflow-hidden mt-4 w-full">
          <div
            className="h-full"
            style={{ width: "100%", background: topTeam.color }}
          />
        </div>
      </div>

      {/* Footer Flip CTA */}
      <div className="relative z-10 pt-4 border-t border-hairline flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <RotateCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
          SCROLL TO AUTO-FLIP / UNFLIP
        </span>
        <span className="text-[10px] font-mono text-white px-2.5 py-1 border border-hairline bg-surface-card uppercase tracking-wider group-hover/card:border-white transition-colors">
          FLIP 🔄
        </span>
      </div>
    </div>
  );

  const backSide = (
    <div className="relative bg-[#0d0d0d] border border-hairline-strong p-4 sm:p-5 min-h-[580px] flex flex-col justify-between rounded-[2px] shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-hairline mb-2">
        <span className="text-eyebrow text-ink-muted">// FULL DRIVERS STANDINGS ({drivers.length})</span>
        <span className="text-[10px] font-mono text-white px-2 py-0.5 border border-hairline bg-surface-card uppercase tracking-wider hover:bg-zinc-800 transition-colors">
          FLIP TO LEADER 🔄
        </span>
      </div>

      {/* Entire drivers standings displayed cleanly with zero inner scrolling */}
      <ol className="flex-1 flex flex-col justify-between py-1">
        {drivers.map((row: any, i: number) => {
          const d = getDriverOrFallback(
            row.driverId,
            (row as any).rawDriver
              ? { ...(row as any).rawDriver, constructorId: row.constructorId }
              : undefined
          );
          const t = getTeamOrFallback(d.teamId);
          const mine = d.id === favoriteDriverId;

          return (
            <li
              key={row.driverId}
              className={`grid grid-cols-[28px_1fr_auto] items-center gap-3 py-1.5 px-3 border-b border-hairline/30 hover:bg-surface-soft transition-colors relative ${
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
                  className="absolute left-0 top-0 bottom-0 w-[2px] mine-bar"
                  style={{ background: t.color }}
                />
              )}
              <span className="tabular text-xs font-bold text-ink-muted">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs text-white font-bold uppercase truncate">
                      {d.firstName[0]}. {d.lastName}
                    </span>
                    {mine && (
                      <span
                        key={`badge-${flash}`}
                        className="text-[8px] font-bold uppercase tracking-[0.15em] px-1 py-0.2 mine-badge"
                        style={{ background: t.color, color: "white" }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-ink-muted uppercase hidden sm:inline truncate">
                    {t.short}
                  </span>
                </div>
                <div className="h-[2px] bg-hairline-strong overflow-hidden mt-1">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(row.points / driverLeader) * 100}%`,
                      background: t.color,
                    }}
                  />
                </div>
              </div>
              <div className="tabular text-xs font-bold text-right text-white">
                {row.points} <span className="text-[9px] text-ink-muted font-normal">PTS</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      <FlipCard
        front={frontSide}
        back={backSide}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        className="h-[580px]"
      />
    </div>
  );
}

function ConstructorsFlipCard({
  teams,
  teamLeader,
}: {
  teams: any[];
  teamLeader: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto flip when scrolled into viewport & unflip when scrolled out of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFlipped(true);
          } else {
            setIsFlipped(false);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const topRow = teams[0];
  const topTeam = getTeamOrFallback(topRow?.teamId, topRow?.teamName);
  const secondRow = teams[1];
  const leadMargin = (topRow?.points || 0) - (secondRow?.points || 0);

  const frontSide = (
    <div className="relative overflow-hidden bg-[#0d0d0d] border border-hairline-strong p-6 min-h-[580px] flex flex-col justify-between rounded-[2px] shadow-2xl group/card">
      {/* Carbon fiber grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%), linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
        }}
      />

      {/* Top Accent Color Glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-40"
        style={{ background: topTeam.color }}
      />

      {/* Watermark Big Number */}
      <span
        className="absolute bottom-[-20px] right-2 text-[160px] font-black leading-none opacity-[0.04] pointer-events-none select-none"
        style={{ color: topTeam.color }}
      >
        #1
      </span>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-eyebrow text-ink-muted flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" style={{ color: topTeam.color }} />
            // LEADER SPOTLIGHT
          </span>
          <span
            className="text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest text-white rounded-[1px]"
            style={{ background: topTeam.color }}
          >
            P1 LEADER
          </span>
        </div>
        <div className="h-[2px] w-full" style={{ background: topTeam.color }} />
      </div>

      {/* Main Brand Info */}
      <div className="relative z-10 my-auto py-6">
        <div className="text-[11px] font-mono text-ink-muted uppercase tracking-widest mb-1">
          {topTeam.hq} · {topTeam.short}
        </div>
        <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none mb-3">
          {topTeam.name}
        </h3>

        <div className="flex items-baseline gap-4 mt-6">
          <span className="tabular text-5xl font-extrabold text-white">
            {topRow?.points}
          </span>
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
            PTS ({leadMargin > 0 ? `+${leadMargin} PTS LEAD` : "CHAMPIONSHIP LEADER"})
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-[3px] bg-hairline-strong overflow-hidden mt-4 w-full">
          <div
            className="h-full"
            style={{ width: "100%", background: topTeam.color }}
          />
        </div>
      </div>

      {/* Footer Flip CTA */}
      <div className="relative z-10 pt-4 border-t border-hairline flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <RotateCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
          CLICK CARD TO VIEW ALL TEAMS
        </span>
        <span className="text-[10px] font-mono text-white px-2.5 py-1 border border-hairline bg-surface-card uppercase tracking-wider group-hover/card:border-white transition-colors">
          FLIP 🔄
        </span>
      </div>
    </div>
  );

  const backSide = (
    <div className="relative bg-[#0d0d0d] border border-hairline-strong p-4 sm:p-5 min-h-[580px] flex flex-col justify-between rounded-[2px] shadow-2xl">
      <div className="flex items-center justify-between pb-3 border-b border-hairline mb-2">
        <span className="text-eyebrow text-ink-muted">// FULL CONSTRUCTORS STANDINGS ({teams.length})</span>
        <span className="text-[10px] font-mono text-white px-2 py-0.5 border border-hairline bg-surface-card uppercase tracking-wider hover:bg-zinc-800 transition-colors">
          FLIP TO LEADER 🔄
        </span>
      </div>

      {/* Entire standings displayed cleanly with zero inner scrolling */}
      <ol className="flex-1 flex flex-col justify-between py-1">
        {teams.map((row: any, i: number) => {
          const t = getTeamOrFallback(row.teamId, (row as any).teamName);
          return (
            <li
              key={row.teamId}
              className="grid grid-cols-[28px_1fr_auto] items-center gap-3 py-1.5 px-3 border-b border-hairline/30 hover:bg-surface-soft transition-colors"
            >
              <span className="tabular text-xs font-bold text-ink-muted">
                {(i + 1).toString().padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white font-bold uppercase truncate">
                    {t.name}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted uppercase hidden sm:inline truncate">
                    {t.short}
                  </span>
                </div>
                <div className="h-[2px] bg-hairline-strong overflow-hidden mt-1">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(row.points / teamLeader) * 100}%`,
                      background: t.color,
                    }}
                  />
                </div>
              </div>
              <div className="tabular text-xs font-bold text-right text-white">
                {row.points} <span className="text-[9px] text-ink-muted font-normal">PTS</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      <FlipCard
        front={frontSide}
        back={backSide}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped(!isFlipped)}
        className="h-[580px]"
      />
    </div>
  );
}

