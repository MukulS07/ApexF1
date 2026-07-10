import { useEffect, useState } from "react";
import { drivers, getTeam } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-canvas shadow-2xl overflow-hidden bg-background">
        {step === 1 ? (
          <div className="p-10 sm:p-14">
            <div className="text-sm text-ink-muted mb-3 tracking-tight">Welcome to the Pit Wall</div>
            <h2 className="text-display mb-4">What should we call you?</h2>
            <p className="text-lead text-ink-muted mb-8">Your season, your name in the timing tower.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full text-2xl font-medium bg-parchment rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-action transition"
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
            />
            <div className="mt-8 flex items-center justify-between">
              {onClose ? (
                <button onClick={onClose} className="btn-pill-ghost">Cancel</button>
              ) : <span />}
              <button
                onClick={() => name.trim() && setStep(2)}
                disabled={!name.trim()}
                className="btn-pill disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="p-10 sm:p-14">
            <div className="text-sm text-ink-muted mb-3 tracking-tight">Step 2 of 2</div>
            <h2 className="text-display mb-2">Pick your driver.</h2>
            <p className="text-lead text-ink-muted mb-6">We'll paint the season in their team colors.</p>
            <div className="max-h-[52vh] overflow-y-auto -mx-2 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-2">
                {drivers.map((d) => {
                  const team = getTeam(d.teamId)!;
                  const selected = driverId === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDriverId(d.id)}
                      className="group relative text-left rounded-2xl overflow-hidden bg-parchment p-4 transition hover:scale-[1.02]"
                      style={{
                        outline: selected ? `3px solid ${team.color}` : "none",
                        outlineOffset: "-3px",
                      }}
                    >
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{ background: team.color }}
                      />
                      <div className="tabular text-4xl font-semibold mt-2" style={{ color: team.color }}>
                        {d.number}
                      </div>
                      <div className="mt-2 text-sm text-ink-muted">{d.firstName}</div>
                      <div className="text-base font-semibold tracking-tight">{d.lastName}</div>
                      <div className="mt-1 text-xs text-ink-muted">{team.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="btn-pill-ghost">Back</button>
              <button
                onClick={() => driverId && onComplete({ name: name.trim(), favoriteDriverId: driverId })}
                disabled={!driverId}
                className="btn-pill disabled:opacity-40"
              >
                Enter the Pit Wall
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
