import { driversStandings, getDriver, getTeam } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";
import { ThreeCarCanvas } from "./ThreeCarCanvas";
import { useState } from "react";
import { LiveryConceptBoard } from "./LiveryConceptBoard";
import { Eye } from "lucide-react";

export function YourDriver({ profile }: { profile: Profile }) {
  const d = getDriver(profile.favoriteDriverId);
  if (!d) return null;
  const team = getTeam(d.teamId)!;
  const rank = driversStandings.findIndex((s) => s.driverId === d.id);
  const points = rank >= 0 ? driversStandings[rank].points : 0;

  const [liveryMode, setLiveryMode] = useState<"dark" | "black" | "teal" | "white">("dark");
  const [boardOpen, setBoardOpen] = useState(false);

  return (
    <section className="bg-canvas border-t border-hairline-strong relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20"
           style={{ background: `radial-gradient(60% 80% at 100% 0%, ${team.color}, transparent 70%)` }} />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
          
          {/* Stats Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div className="mb-10">
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

          {/* 3D Showcase Column */}
          <div className="lg:col-span-1 flex flex-col bg-surface-card border border-hairline-strong overflow-hidden min-h-[450px]">
            <div className="p-5 border-b border-hairline-strong flex justify-between items-center bg-black/40">
              <div>
                <div className="text-eyebrow text-ink-muted">// LIVERY SHOWROOM</div>
                <div className="text-xs font-bold text-white uppercase mt-0.5">{team.short} - {d.lastName} #{d.number}</div>
              </div>
              <div className="flex items-center gap-2">
                {team.id === "mclaren" && (
                  <button
                    onClick={() => setBoardOpen(true)}
                    className="text-[9px] font-mono text-[#FF8700] px-2 py-0.5 border border-[#FF8700]/50 hover:bg-[#FF8700]/10 uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-2.5 w-2.5" />
                    Board
                  </button>
                )}
                <div className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 border border-hairline-strong uppercase">
                  3D VIEW
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative bg-black">
              <ThreeCarCanvas
                teamId={team.id}
                driverNumber={d.number}
                mode="interactive"
                liveryMode={team.id === "mclaren" ? liveryMode : "dark"}
              />
            </div>
            
            {team.id === "mclaren" ? (
              <div className="p-3 bg-black/60 border-t border-hairline-strong flex justify-between items-center flex-wrap gap-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">// LIVERY MODE:</span>
                <div className="flex gap-1">
                  {(["dark", "black", "teal", "white"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setLiveryMode(m)}
                      className={`px-2 py-0.5 text-[8px] font-mono border uppercase transition-colors cursor-pointer ${
                        liveryMode === m
                          ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5"
                          : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-black/60 border-t border-hairline-strong text-center text-[10px] font-mono text-ink-muted select-none">
                DRAG TO ROTATE // SCROLL TO ZOOM
              </div>
            )}
          </div>

        </div>
      </div>

      <LiveryConceptBoard
        open={boardOpen}
        onClose={() => setBoardOpen(false)}
        driverNumber={d.number}
      />
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
