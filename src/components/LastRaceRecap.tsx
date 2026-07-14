import { getDriverOrFallback, getTeamOrFallback, lastRace } from "@/lib/f1-data";
import { MStripe } from "./MStripe";
import { useLastRaceResults, useLiveWeatherAndStints } from "@/hooks/useF1Data";

const TIRE_COLOR: Record<string, string> = {
  S: "#e53935",
  M: "#fdd835",
  H: "#f5f5f7",
  I: "#43a047",
  W: "#1e88e5",
};
const TIRE_LABEL: Record<string, string> = { S: "Soft", M: "Med", H: "Hard", I: "Int", W: "Wet" };

export function LastRaceRecap() {
  const { data: realTimeLastRace = null } = useLastRaceResults();
  const { weather, stints } = useLiveWeatherAndStints();

  const currentLastRace = realTimeLastRace || lastRace;

  const winner = getDriverOrFallback(currentLastRace.winnerId);
  const winnerTeam = getTeamOrFallback(winner.teamId);
  const fl = getDriverOrFallback(currentLastRace.fastestLapId);
  const pole = getDriverOrFallback(currentLastRace.poleId);

  // Weather calculations
  const airC = weather
    ? Math.round(weather.air_temperature)
    : (currentLastRace.conditions?.airC ?? 24);
  const trackC = weather
    ? Math.round(weather.track_temperature)
    : (currentLastRace.conditions?.trackC ?? 41);
  const humidity = weather
    ? Math.round(weather.humidity)
    : (currentLastRace.conditions?.humidity ?? 46);
  const rain = weather ? weather.rainfall === 1 : (currentLastRace.conditions?.rain ?? false);

  // Process live tyre stints from OpenF1
  const stintsByDriverNum: Record<number, string[]> = {};
  if (stints && stints.length > 0) {
    const sortedStints = [...stints].sort((a, b) => a.stint_number - b.stint_number);
    sortedStints.forEach((s) => {
      if (!stintsByDriverNum[s.driver_number]) {
        stintsByDriverNum[s.driver_number] = [];
      }
      let compLetter = "S";
      const compUpper = s.compound.toUpperCase();
      if (compUpper.startsWith("MED")) compLetter = "M";
      else if (compUpper.startsWith("HAR")) compLetter = "H";
      else if (compUpper.startsWith("INT")) compLetter = "I";
      else if (compUpper.startsWith("WET")) compLetter = "W";

      stintsByDriverNum[s.driver_number].push(compLetter);
    });
  }

  // Generate strategy list for top 5 drivers
  const strategyDrivers = currentLastRace.top10.slice(0, 5);
  const formattedTireStrategy = strategyDrivers.map((id: string) => {
    const d = getDriverOrFallback(id);
    const driverStints = stintsByDriverNum[d.number];
    return {
      driverId: id,
      stints:
        driverStints && driverStints.length > 0
          ? driverStints
          : currentLastRace.tireStrategy?.find((ts: any) => ts.driverId === id)?.stints || [
              "M",
              "H",
            ],
    };
  });

  return (
    <section className="bg-canvas border-t border-hairline-strong" id="recap">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="mb-16">
          <div className="text-eyebrow text-ink-muted mb-4">// Paddock intel · last race</div>
          <h2 className="text-display text-white">{currentLastRace.name}.</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-hairline-strong border border-hairline-strong">
          {/* Winner card */}
          <div className="lg:col-span-2 bg-surface-card p-8 relative overflow-hidden tilt-card scan-loop">
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background: `radial-gradient(circle at 70% 30%, ${winnerTeam.color}, transparent 55%)`,
              }}
            />
            <div className="relative">
              <div className="text-eyebrow text-ink-muted">Winner · P1</div>
              <MStripe className="!w-16 mt-3 mb-6" />
              <div className="flex items-baseline gap-6">
                <div className="tabular text-8xl font-bold" style={{ color: winnerTeam.color }}>
                  {winner.number}
                </div>
                <div>
                  <div className="text-3xl font-bold text-white uppercase tracking-tight">
                    {winner.firstName} {winner.lastName}
                  </div>
                  <div className="text-sm text-ink-muted uppercase tracking-wider mt-2">
                    {winnerTeam.name}
                  </div>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6 text-white">
                <div className="border-l border-hairline pl-4">
                  <div className="text-eyebrow text-ink-muted">Pole</div>
                  <div className="text-lg font-bold uppercase mt-2">{pole.lastName}</div>
                  <div className="tabular text-sm text-body">{currentLastRace.poleTime}</div>
                </div>
                <div className="border-l border-hairline pl-4">
                  <div className="text-eyebrow text-ink-muted">Fastest lap</div>
                  <div className="text-lg font-bold uppercase mt-2">{fl.lastName}</div>
                  <div className="tabular text-sm text-body">{currentLastRace.fastestLap}</div>
                </div>
                <div className="border-l border-hairline pl-4">
                  <div className="text-eyebrow text-ink-muted">Best Q3</div>
                  <div className="text-lg font-bold uppercase mt-2 tabular">
                    {currentLastRace.q3Best}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-surface-card p-8">
            <div className="text-eyebrow text-ink-muted mb-6">Conditions</div>
            <div className="space-y-5">
              <Row label="Air" value={`${airC}°C`} />
              <Row label="Track" value={`${trackC}°C`} />
              <Row label="Humidity" value={`${humidity}%`} />
              <Row label="Rain" value={rain ? "Yes" : "Dry"} />
            </div>
          </div>
        </div>

        {/* Podium + strategy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-hairline-strong border-x border-b border-hairline-strong">
          <div className="bg-surface-card p-8">
            <div className="text-eyebrow text-ink-muted mb-6">Podium</div>
            <div className="space-y-5">
              {currentLastRace.podium.map((id: string, i: number) => {
                const d = getDriverOrFallback(id);
                const t = getTeamOrFallback(d.teamId);
                return (
                  <div key={id} className="flex items-center gap-5 speed-line py-2">
                    <div className="tabular text-4xl font-bold text-ink-muted w-10">{i + 1}</div>
                    <div className="h-12 w-1" style={{ background: t.color }} />
                    <div className="flex-1">
                      <div className="text-white font-bold uppercase tracking-tight">
                        {d.firstName} {d.lastName}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-ink-muted mt-1">
                        {t.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-card p-8">
            <div className="text-eyebrow text-ink-muted mb-6">Tire strategy</div>
            <div className="space-y-3">
              {formattedTireStrategy.map((s: any) => {
                const d = getDriverOrFallback(s.driverId);
                return (
                  <div key={s.driverId} className="flex items-center gap-4">
                    <div className="text-xs uppercase tracking-wider text-white w-24 truncate font-bold">
                      {d.lastName}
                    </div>
                    <div className="flex gap-1">
                      {s.stints.map((c: string, i: number) => (
                        <div
                          key={i}
                          className="h-7 w-11 flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110"
                          style={{
                            background: TIRE_COLOR[c],
                            color: c === "M" || c === "H" ? "#000" : "white",
                          }}
                          title={TIRE_LABEL[c]}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-hairline pb-3">
      <span className="text-eyebrow text-ink-muted">{label}</span>
      <span className="tabular text-white text-2xl font-bold">{value}</span>
    </div>
  );
}
