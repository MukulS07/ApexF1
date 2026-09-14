import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

type GantryState = "idle" | 1 | 2 | 3 | 4 | 5 | "go" | "abort";

export function StartingLights() {
  const [state, setState] = useState<GantryState>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesize Formula 1 buzzer beeps using Web Audio API
  const playBeep = (freq = 800, duration = 0.15, isGo = false) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (isGo) {
        // High-pitch overtake buzzer
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.4);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.4);
      } else {
        // Standard red light beep
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration);
      }
    } catch (e) {
      console.warn("Web Audio blocked or failed", e);
    }
  };

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const triggerSequence = () => {
    clearTimers();
    setState(1);
    playBeep(880, 0.15);

    let current = 1;
    const runNextLight = () => {
      timerRef.current = setTimeout(() => {
        current += 1;
        if (current <= 5) {
          setState(current as GantryState);
          playBeep(880, 0.15);
          runNextLight();
        } else {
          // Randomized FIA delay before lights out (1.2 to 3.0 seconds)
          const fiaDelay = 1200 + Math.random() * 1800;
          timerRef.current = setTimeout(() => {
            setState("go");
            playBeep(1200, 0.4, true);

            // Keep "GO" state for 4 seconds, then reset to idle
            timerRef.current = setTimeout(() => {
              setState("idle");
            }, 4000);
          }, fiaDelay);
        }
      }, 1000);
    };

    runNextLight();
  };

  const resetSequence = () => {
    clearTimers();
    setState("idle");
  };

  return (
    <div className="bg-zinc-950 border border-zinc-850 p-6 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Carbon fiber grid texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header telemetry info */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4">
        <span>// PADDOCK START GANTRY</span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label="Toggle audio feedback"
          className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs font-mono text-zinc-300 hover:text-white rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-red-500" /> : <VolumeX className="h-3.5 w-3.5 text-zinc-500" />}
          {soundEnabled ? "SOUND ON" : "MUTED"}
        </button>
      </div>

      {/* The FIA Start Gantry Casing */}
      <div className="bg-zinc-900 border-4 border-zinc-800 p-4 rounded-xs shadow-2xl relative z-10 w-full max-w-lg flex justify-between gap-2.5 sm:gap-4">
        {[1, 2, 3, 4, 5].map((lightIdx) => {
          const isLit = typeof state === "number" && state >= lightIdx;
          const isGo = state === "go";

          return (
            <div
              key={lightIdx}
              className="flex-1 bg-zinc-950 border border-zinc-800 p-2 rounded-xs flex flex-col gap-2 items-center justify-center relative shadow-inner"
            >
              {/* Top Double-Row LED Circle */}
              <div
                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-zinc-900 transition-all duration-100 flex items-center justify-center relative ${
                  isLit
                    ? "bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)]"
                    : isGo
                    ? "bg-zinc-950"
                    : "bg-zinc-900/50"
                }`}
              >
                {/* Tiny LED dots internally */}
                <div className={`w-1.5 h-1.5 rounded-full ${isLit ? "bg-white/60" : "bg-transparent"}`} />
              </div>

              {/* Bottom Double-Row LED Circle */}
              <div
                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full border border-zinc-900 transition-all duration-100 flex items-center justify-center relative ${
                  isLit
                    ? "bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.8),inset_0_2px_4px_rgba(255,255,255,0.4)]"
                    : isGo
                    ? "bg-zinc-950"
                    : "bg-zinc-900/50"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isLit ? "bg-white/60" : "bg-transparent"}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Text Indicator overlay / Status output */}
      <div className="h-10 mt-5 flex items-center justify-center text-center">
        {state === "idle" && (
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider animate-pulse">
            Ready to deploy. Click trigger to begin lights sequence.
          </span>
        )}
        {typeof state === "number" && (
          <span className="text-xs font-mono text-red-500 uppercase tracking-wider font-bold">
            STEADY... LIGHTS ON ({state}/5)
          </span>
        )}
        {state === "go" && (
          <span className="text-base sm:text-lg font-display font-black italic text-emerald-500 uppercase tracking-wider animate-bounce select-none">
            🏁 LIGHTS OUT AND AWAY WE GO! 🏁
          </span>
        )}
      </div>

      {/* Gantry Controls */}
      <div className="flex gap-3 mt-2">
        {state === "idle" ? (
          <button
            onClick={triggerSequence}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Trigger Sequence
          </button>
        ) : (
          <button
            onClick={resetSequence}
            className="px-5 py-2.5 bg-red-950/80 border border-red-700 text-red-400 hover:bg-red-900 hover:text-white text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Abort & Reset
          </button>
        )}
      </div>
    </div>
  );
}
