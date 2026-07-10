import { getDriver, getTeam, lastRace } from "@/lib/f1-data";

const TIRE_COLOR: Record<string, string> = {
  S: "#e53935", M: "#fdd835", H: "#f5f5f7", I: "#43a047", W: "#1e88e5",
};
const TIRE_LABEL: Record<string, string> = { S: "Soft", M: "Med", H: "Hard", I: "Int", W: "Wet" };

export function LastRaceRecap() {
  const winner = getDriver(lastRace.winnerId)!;
  const winnerTeam = getTeam(winner.teamId)!;
  const fl = getDriver(lastRace.fastestLapId)!;
  const pole = getDriver(lastRace.poleId)!;

  return (
    <section className="tile-dark">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-20 sm:py-28">
        <div className="mb-12">
          <div className="text-sm text-white/50 uppercase tracking-widest mb-3">Paddock intel · last race</div>
          <h2 className="text-display text-white">{lastRace.name}.</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Winner card */}
          <div
            className="rounded-3xl p-8 lg:col-span-2 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${winnerTeam.color}, ${winnerTeam.color}88)` }}
          >
            <div className="text-xs uppercase tracking-widest text-white/80">Winner · P1</div>
            <div className="mt-3 flex items-baseline gap-4">
              <div className="tabular text-6xl font-semibold text-white">{winner.number}</div>
              <div>
                <div className="text-2xl font-semibold text-white tracking-tight">{winner.firstName} {winner.lastName}</div>
                <div className="text-sm text-white/80">{winnerTeam.name}</div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 text-white">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-widest">Pole</div>
                <div className="text-lg font-semibold mt-1">{pole.lastName}</div>
                <div className="tabular text-sm text-white/80">{lastRace.poleTime}</div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-widest">Fastest lap</div>
                <div className="text-lg font-semibold mt-1">{fl.lastName}</div>
                <div className="tabular text-sm text-white/80">{lastRace.fastestLap}</div>
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-widest">Best Q3</div>
                <div className="text-lg font-semibold mt-1 tabular">{lastRace.q3Best}</div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="rounded-3xl p-8 bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-white/50">Conditions</div>
            <div className="mt-4 space-y-4">
              <Row label="Air"     value={`${lastRace.conditions.airC}°C`} />
              <Row label="Track"   value={`${lastRace.conditions.trackC}°C`} />
              <Row label="Humidity" value={`${lastRace.conditions.humidity}%`} />
              <Row label="Rain"    value={lastRace.conditions.rain ? "Yes" : "Dry"} />
            </div>
          </div>
        </div>

        {/* Podium + top 10 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="rounded-3xl p-8 bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-white/50 mb-6">Podium</div>
            <div className="space-y-4">
              {lastRace.podium.map((id, i) => {
                const d = getDriver(id)!;
                const t = getTeam(d.teamId)!;
                return (
                  <div key={id} className="flex items-center gap-4">
                    <div className="tabular text-3xl font-semibold text-white/40 w-8">{i + 1}</div>
                    <div className="h-10 w-1 rounded-full" style={{ background: t.color }} />
                    <div className="flex-1">
                      <div className="text-white font-semibold tracking-tight">{d.firstName} {d.lastName}</div>
                      <div className="text-sm text-white/50">{t.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-white/5 border border-white/10">
            <div className="text-xs uppercase tracking-widest text-white/50 mb-6">Tire strategy</div>
            <div className="space-y-3">
              {lastRace.tireStrategy.map((s) => {
                const d = getDriver(s.driverId)!;
                return (
                  <div key={s.driverId} className="flex items-center gap-4">
                    <div className="text-sm text-white w-24 truncate">{d.lastName}</div>
                    <div className="flex gap-1">
                      {s.stints.map((c, i) => (
                        <div
                          key={i}
                          className="h-6 w-10 rounded-md flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: TIRE_COLOR[c],
                            color: c === "M" || c === "H" ? "#1d1d1f" : "white",
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
    <div className="flex items-baseline justify-between">
      <span className="text-white/60 text-sm">{label}</span>
      <span className="tabular text-white text-xl font-semibold">{value}</span>
    </div>
  );
}
