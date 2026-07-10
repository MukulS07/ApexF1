import { useEffect, useState } from "react";
import { drivers, getTeam } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { MStripe } from "./MStripe";

type Props = {
  open: boolean;
  onComplete: (profile: Profile) => void;
  onClose?: () => void;
  initial?: Profile | null;
};

export function OnboardingModal({ open, onComplete, onClose, initial }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initial?.name ?? "");
  const [driverId, setDriverId] = useState(initial?.favoriteDriverId ?? "");

  useEffect(() => {
    if (open) {
      setStep(1);
      setName(initial?.name ?? "");
      setDriverId(initial?.favoriteDriverId ?? "");
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-canvas border border-hairline-strong shadow-2xl overflow-hidden rise">
        <MStripe />
        {step === 1 ? (
          <div className="p-10 sm:p-14">
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
            <div className="mt-10 flex items-center justify-between">
              {onClose ? <button onClick={onClose} className="btn-m-ghost">Cancel</button> : <span />}
              <button onClick={() => name.trim() && setStep(2)} disabled={!name.trim()} className="btn-m disabled:opacity-40">
                Continue →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 sm:p-14">
            <div className="text-eyebrow text-ink-muted mb-4">// Step 2 of 2</div>
            <h2 className="text-display text-white mb-2">Pick your driver.</h2>
            <p className="text-lead text-body mb-8">We'll paint the season in their team colors.</p>
            <div className="max-h-[50vh] overflow-y-auto -mx-2 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-2">
                {drivers.map((d) => {
                  const team = getTeam(d.teamId)!;
                  const selected = driverId === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDriverId(d.id)}
                      className="group relative text-left bg-surface-card p-4 transition-all tilt-card border border-hairline hover:border-white"
                      style={selected ? { borderColor: team.color, background: `color-mix(in oklab, ${team.color} 12%, var(--surface-card))` } : undefined}
                    >
                      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: team.color }} />
                      <div className="tabular text-4xl font-bold mt-2" style={{ color: team.color }}>{d.number}</div>
                      <div className="mt-2 text-xs uppercase tracking-widest text-ink-muted">{d.firstName}</div>
                      <div className="text-base font-bold uppercase tracking-tight text-white">{d.lastName}</div>
                      <div className="mt-2 text-[10px] uppercase tracking-wider text-ink-muted">{team.short}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-10 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="btn-m-ghost">← Back</button>
              <button
                onClick={() => driverId && onComplete({ name: name.trim(), favoriteDriverId: driverId })}
                disabled={!driverId}
                className="btn-m disabled:opacity-40"
              >
                Enter the pit wall →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
