import { useDriverStandings, useLastRaceResults } from "@/hooks/useF1Data";
import { getDriverOrFallback, getTeamOrFallback, driversStandings, lastRace } from "@/lib/f1-data";

export function StatsRow({ favoriteDriverId }: { favoriteDriverId: string }) {
  const { data: realTimeDrivers = [] } = useDriverStandings();
  const { data: realTimeLastRace = null } = useLastRaceResults();

  const currentDrivers = realTimeDrivers.length > 0 ? realTimeDrivers : driversStandings;
  const currentLastRace = realTimeLastRace || lastRace;

  // 1. Championship Lead Calculation
  const leaderEntry = currentDrivers[0];
  const secondEntry = currentDrivers[1];
  const leadGap = leaderEntry && secondEntry ? leaderEntry.points - secondEntry.points : 0;

  const leaderDriver = leaderEntry ? getDriverOrFallback(leaderEntry.driverId) : null;
  const secondDriver = secondEntry ? getDriverOrFallback(secondEntry.driverId) : null;

  const leaderNameFmt = leaderDriver
    ? `${leaderDriver.firstName[0]}. ${leaderDriver.lastName}`
    : "";
  const secondNameFmt = secondDriver
    ? `${secondDriver.firstName[0]}. ${secondDriver.lastName}`
    : "";
  const leadSubtext =
    leaderDriver && secondDriver ? `${leaderNameFmt} over ${secondNameFmt}` : "No active standings";

  // 2. Last Race Fastest Lap
  const flDriver = getDriverOrFallback(currentLastRace.fastestLapId);
  const flNameFmt = `${flDriver.firstName[0]}. ${flDriver.lastName}`;
  const flValue = currentLastRace.fastestLap;
  const flSubtext = `${flNameFmt} · ${currentLastRace.name}`;

  // 3. Last Race Winner
  const winnerDriver = getDriverOrFallback(currentLastRace.winnerId);
  const winnerTeam = getTeamOrFallback(winnerDriver.teamId);
  const winnerNameFmt = `${winnerDriver.firstName[0]}. ${winnerDriver.lastName}`;
  const winnerSubtext = `${winnerTeam.name} · ${currentLastRace.name}`;

  // 4. Your Driver Card
  const favoriteDriver = getDriverOrFallback(favoriteDriverId);
  const favoriteTeam = getTeamOrFallback(favoriteDriver.teamId);
  const rankIdx = currentDrivers.findIndex((s: any) => s.driverId === favoriteDriverId);
  const favoritePoints = rankIdx >= 0 ? currentDrivers[rankIdx].points : 0;
  const favoriteRank = rankIdx >= 0 ? `P${rankIdx + 1}` : "—";
  const favoriteDriverNameFmt = `${favoriteDriver.firstName[0]}. ${favoriteDriver.lastName}`;
  const favoriteSubtext = `${favoriteDriverNameFmt} · ${favoriteTeam.name}`;

  return (
    <div className="bg-canvas border-t border-b border-hairline-strong">
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 md:grid-cols-4 gap-px bg-hairline-strong">
        {/* Championship Lead Card */}
        <div className="bg-canvas p-6 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-bold">
              // Championship Lead
            </div>
            <div className="text-4xl font-serif italic text-white mt-4 flex items-baseline gap-1">
              <span style={{ color: "var(--team-hex, var(--m-red))" }}>+{leadGap}</span>
              <span className="text-xl font-sans normal-case text-ink-muted">pts</span>
            </div>
          </div>
          <div className="text-xs text-white/60 mt-3 truncate">{leadSubtext}</div>
        </div>

        {/* Fastest Lap Card */}
        <div className="bg-canvas p-6 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-bold">
              // Last Race · Fastest Lap
            </div>
            <div className="text-4xl font-serif italic text-white mt-4 tracking-tight">
              {flValue}
            </div>
          </div>
          <div className="text-xs text-white/60 mt-3 truncate">{flSubtext}</div>
        </div>

        {/* Winner Card */}
        <div className="bg-canvas p-6 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-bold">
              // Last Race · Winner
            </div>
            <div className="text-4xl font-serif italic text-white mt-4 truncate">
              {winnerNameFmt}
            </div>
          </div>
          <div className="text-xs text-white/60 mt-3 truncate">{winnerSubtext}</div>
        </div>

        {/* Your Driver Card */}
        <div className="bg-canvas p-6 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink-muted font-bold">
              // Your Driver
            </div>
            <div className="text-4xl font-serif italic text-white mt-4 flex items-baseline gap-2">
              <span>{favoriteRank}</span>
              <span className="text-xl font-sans normal-case text-ink-muted">·</span>
              <span>{favoritePoints}</span>
              <span className="text-xl font-sans normal-case text-ink-muted">pts</span>
            </div>
          </div>
          <div className="text-xs text-white/60 mt-3 truncate">{favoriteSubtext}</div>
        </div>
      </div>
    </div>
  );
}
