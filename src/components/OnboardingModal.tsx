import { useEffect, useState } from "react";
import { drivers, getTeam, getDriver } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";
import { ThreeCarCanvas } from "./ThreeCarCanvas";

type Props = {
  open: boolean;
  onComplete: (profile: Profile) => void;
  onClose?: () => void;
  initial?: Profile | null;
};

export function F1CarSilhouette({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 35" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 24 C5 24, 8 22, 10 20 C12 17, 16 17, 18 20 C20 23, 25 24, 28 23 C31 22, 35 18, 39 17 C44 16, 52 16, 55 18 C58 20, 62 23, 67 23 C71 23, 73 20, 75 20 C78 20, 81 22, 84 24 L86 24 C87 24, 88 23, 88 22 L87 18 L82 18 L79 14 L73 14 L71 18 L62 17 L56 12 L43 13 L35 16 L28 18 L28 18 L22 18 L19 15 L10 15 L8 18 L2 18 L1 21 C1 22, 2 24, 3 24 H5 Z"
        fill="currentColor"
        style={{ color }}
      />
      {/* Front Wheel */}
      <circle cx="18" cy="21" r="5" fill="#080808" stroke="currentColor" strokeWidth="1.2" style={{ color }} />
      <circle cx="18" cy="21" r="2.2" fill="#181818" />
      {/* Rear Wheel */}
      <circle cx="67" cy="21" r="5.5" fill="#080808" stroke="currentColor" strokeWidth="1.2" style={{ color }} />
      <circle cx="67" cy="21" r="2.5" fill="#181818" />
    </svg>
  );
}

export function OnboardingModal({ open, onComplete, onClose, initial }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initial?.name ?? "");
  const [driverId, setDriverId] = useState(initial?.favoriteDriverId ?? "");
  const [syncPercentage, setSyncPercentage] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(1);
      setName(initial?.name ?? "");
      setDriverId(initial?.favoriteDriverId ?? "");
      setSyncPercentage(0);
    }
  }, [open, initial]);

  // Animate the fake HUD telemetry syncing sequence in Step 3
  useEffect(() => {
    if (step === 3) {
      setSyncPercentage(0);
      const interval = setInterval(() => {
        setSyncPercentage((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!open) return null;

  const selectedDriver = getDriver(driverId);
  const selectedTeam = selectedDriver ? getTeam(selectedDriver.teamId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-canvas border border-hairline-strong shadow-2xl overflow-hidden rise relative min-h-[500px] flex flex-col">
        <MStripe />
        
        {step === 1 && (
          <div className="p-10 sm:p-14 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-eyebrow text-ink-muted mb-4">// Welcome to the pit wall</div>
              <h2 className="text-display text-white mb-4">Driver name.</h2>
              <p className="text-lead text-body mb-10">Your season, your name in the timing tower.</p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ENTER YOUR NAME"
                className="w-full text-3xl font-bold uppercase tracking-tight bg-surface-card text-white px-6 py-6 outline-none border border-hairline focus:border-white transition placeholder:text-ink-muted"
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
              />
            </div>
            <div className="mt-10 flex items-center justify-between">
              {onClose ? <button onClick={onClose} className="btn-m-ghost">Cancel</button> : <span />}
              <button onClick={() => name.trim() && setStep(2)} disabled={!name.trim()} className="btn-m disabled:opacity-40">
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-10 sm:p-14 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-eyebrow text-ink-muted mb-4">// Step 2 of 3</div>
              <h2 className="text-display text-white mb-2">Pick your driver.</h2>
              <p className="text-lead text-body mb-8">We'll paint the season in their team colors.</p>
              <div className="max-h-[45vh] overflow-y-auto -mx-2 pr-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
                  {drivers.map((d) => {
                    const team = getTeam(d.teamId)!;
                    const selected = driverId === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDriverId(d.id)}
                        className="group relative text-left bg-surface-card p-4 transition-all tilt-card border border-hairline hover:border-white flex flex-col justify-between min-h-[130px]"
                        style={selected ? { borderColor: team.color, background: `color-mix(in oklab, ${team.color} 12%, var(--surface-card))` } : undefined}
                      >
                        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: team.color }} />
                        <div className="flex justify-between items-start w-full mt-2">
                          <div className="tabular text-4xl font-bold" style={{ color: team.color }}>{d.number}</div>
                          <F1CarSilhouette color={team.color} className="w-14 h-6 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="mt-3">
                          <div className="text-[10px] uppercase tracking-widest text-ink-muted">{d.firstName}</div>
                          <div className="text-base font-bold uppercase tracking-tight text-white">{d.lastName}</div>
                          <div className="text-[9px] uppercase tracking-wider text-ink-muted mt-0.5">{team.name}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-10 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="btn-m-ghost">← Back</button>
              <button
                onClick={() => driverId && setStep(3)}
                disabled={!driverId}
                className="btn-m disabled:opacity-40"
              >
                Sync Team Car →
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedDriver && selectedTeam && (
          <div className="flex-1 flex flex-col bg-black overflow-hidden relative min-h-[500px]">
            {/* 3D Viewport */}
            <div className="absolute inset-0 z-0">
              <ThreeCarCanvas
                teamId={selectedTeam.id}
                driverNumber={selectedDriver.number}
                mode="reveal"
              />
            </div>

            {/* High-tech overlay panels */}
            <div className="relative z-10 flex-1 flex flex-col justify-between p-8 sm:p-10 pointer-events-none">
              {/* Telemetry Console (Left Side) */}
              <div className="w-full max-w-sm bg-black/75 border border-hairline-strong p-5 backdrop-blur-md self-start text-left text-xs font-mono space-y-2 mt-4">
                <div className="text-white/60">// COCKPIT LINK ESTABLISHED</div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">DRIVER:</span>
                  <span className="text-white font-bold">{selectedDriver.firstName} {selectedDriver.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">CAR ID:</span>
                  <span className="text-white font-bold">{selectedTeam.short.toUpperCase()}-2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">FREQUENCY:</span>
                  <span className="text-white">868.32 MHz</span>
                </div>
                <div className="h-[1px] bg-hairline-strong my-2" />
                <div className="space-y-1">
                  <div className={syncPercentage > 20 ? "text-emerald-400" : "text-ink-muted animate-pulse"}>
                    {syncPercentage > 20 ? "✓ LIVERY MAPPED" : "⚡ LOADING LIVERY..."}
                  </div>
                  <div className={syncPercentage > 50 ? "text-emerald-400" : "text-ink-muted animate-pulse"}>
                    {syncPercentage > 50 ? "✓ TYRE SCALES SYNCHRONIZED" : "⚡ CALIBRATING WHEEL SENSORS..."}
                  </div>
                  <div className={syncPercentage > 85 ? "text-emerald-400" : "text-ink-muted"}>
                    {syncPercentage > 85 ? "✓ ENGINE MAPS LOADED" : syncPercentage > 50 ? "⚡ FETCHING CONFIG..." : "⚡ QUEUED"}
                  </div>
                  <div className={syncPercentage >= 100 ? "text-emerald-400 font-bold" : "text-ink-muted"}>
                    {syncPercentage >= 100 ? "✓ PIT WALL INTERFACE READY" : "⚡ GRID LINKING..."}
                  </div>
                </div>
              </div>

              {/* Action Button & Loader (Bottom Panel) */}
              <div className="w-full max-w-md mx-auto bg-black/85 border border-hairline p-6 backdrop-blur-md text-center pointer-events-auto shadow-2xl relative">
                {syncPercentage < 100 ? (
                  <div>
                    <div className="flex justify-between items-center mb-2 font-display text-[9px] uppercase tracking-widest text-ink-muted">
                      <span>SYNCING TELEMETRY TOWERS</span>
                      <span className="tabular">{Math.min(100, Math.round(syncPercentage))}%</span>
                    </div>
                    <div className="h-[2px] bg-surface-card w-full overflow-hidden relative">
                      <div
                        className="h-full bg-white transition-all duration-150 ease-out"
                        style={{ width: `${Math.min(100, syncPercentage)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300">
                    <button
                      onClick={() => onComplete({ name: name.trim(), favoriteDriverId: driverId })}
                      className="w-full btn-m text-center flex items-center justify-center gap-3 relative overflow-hidden group shadow-lg py-5 text-lg cursor-pointer"
                      style={{
                        background: selectedTeam.color,
                        color: "#fff",
                        borderColor: selectedTeam.color,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative z-10 font-bold uppercase tracking-wider">ENTER THE PIT WALL →</span>
                    </button>
                    <div className="mt-2 text-[9px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
                      STATUS: SYSTEM SYNC COMPLETE
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
