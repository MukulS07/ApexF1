import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { systemLogger } from "@/lib/system-logger";
import { MStripe } from "./MStripe";

export function TopNav({ onEdit }: { onEdit: () => void }) {
  return (
    <>
      <nav className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-strong text-white h-16 flex items-center px-6 sm:px-10">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex items-center gap-[2px]" aria-hidden>
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-light)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-dark)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-red)" }} />
            </span>
            <span className="font-bold uppercase tracking-[0.15em] text-sm">ApexF1</span>
          </a>
          <div className="hidden md:flex items-center gap-10 text-eyebrow text-ink-muted">
            <a href="#next" className="hover:text-white transition-colors">
              Next race
            </a>
            <a href="#sessions" className="hover:text-white transition-colors text-white font-bold">
              Sessions
            </a>
            <a href="#standings" className="hover:text-white transition-colors">
              Standings
            </a>
            <a
              href="#telemetry"
              className="hover:text-white transition-colors"
              style={{ color: "var(--team-hex)" }}
            >
              Telemetry
            </a>
            <a href="#calendar" className="hover:text-white transition-colors">
              Calendar
            </a>
            <a href="#recap" className="hover:text-white transition-colors">
              Recap
            </a>
            <a href="#driver" className="hover:text-white transition-colors">
              Driver
            </a>
          </div>
          <button
            onClick={onEdit}
            className="text-eyebrow text-ink-muted hover:text-white transition-colors"
          >
            Edit
          </button>
        </div>
      </nav>
      {/* Marquee ticker */}
      <div className="bg-canvas border-b border-hairline-strong overflow-hidden">
        <div className="marquee py-2 text-eyebrow text-ink-muted">
          {Array.from({ length: 2 }).flatMap((_, k) => [
            <span key={`a${k}`}>▸ Season 2026 live</span>,
            <span key={`b${k}`} className="text-white">
              ▸ New engine formula · 50% electric
            </span>,
            <span key={`c${k}`}>▸ Cadillac joins the grid</span>,
            <span key={`d${k}`} className="text-white">
              ▸ 24 rounds · 6 sprints
            </span>,
            <span key={`e${k}`}>▸ Unofficial fan project</span>,
          ])}
        </div>
      </div>
    </>
  );
}

export function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [minutesAgo, setMinutesAgo] = useState(0);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      systemLogger.log("PWA install prompt intercepted & loaded", "info");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    // Increment minutesAgo every 60s
    const interval = setInterval(() => {
      setMinutesAgo((prev) => prev + 1);
    }, 60000);

    // Reset when system logger gets a new log or when manual refresh happens
    const unsubscribe = systemLogger.subscribe(() => {
      setMinutesAgo(0);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("App can be installed directly from your browser's address bar or settings menu.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    systemLogger.log(`PWA install request outcome: ${outcome}`, "info");
    setDeferredPrompt(null);
  };

  return (
    <footer className="bg-canvas border-t border-hairline-strong pb-10">
      <MStripe />

      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-16 text-body text-sm">
        {/* Header Row: Install App & Last Updated */}
        <div className="flex items-center justify-between border-b border-hairline-strong pb-8 mb-12 flex-wrap gap-4">
          <button
            onClick={handleInstallClick}
            className="bg-[#e22718] text-white hover:bg-[#e22718]/90 text-[10px] font-mono uppercase tracking-wider px-4 py-2.5 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full border border-white/40">
              <Download className="h-2.5 w-2.5" />
            </span>
            Install App
          </button>

          <div className="bg-zinc-950 border border-hairline-strong text-[10px] font-mono text-zinc-400 px-4 py-2.5 flex items-center gap-2 rounded-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B5A1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00B5A1]"></span>
            </span>
            <span>UPDATED {minutesAgo === 0 ? "JUST NOW" : `${minutesAgo} MIN AGO`}</span>
          </div>
        </div>

        {/* Row 1: The Build (1/3) & The Data (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 border-b border-hairline-strong pb-10 mb-10">
          {/* Column 1: The Build */}
          <div className="lg:border-r lg:border-zinc-900 lg:pr-12">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              § 07 · THE BUILD
            </div>
            <h3 className="text-3xl font-serif italic text-white mt-1.5 mb-5 flex items-baseline gap-0.5 normal-case font-normal">
              The Build<span className="text-[#ff2a2a] font-sans font-bold">.</span>
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#ff2a2a]/30 bg-black text-[#ff2a2a] text-[10px] font-mono uppercase tracking-wider rounded-xs whitespace-nowrap">
                <span className="text-[6px] mr-1 select-none">●</span>
                React 19
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#1c69d4]/30 bg-black text-[#1c69d4] text-[10px] font-mono uppercase tracking-wider rounded-xs whitespace-nowrap">
                <span className="text-[6px] mr-1 select-none">●</span>
                TypeScript
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#eab308]/30 bg-black text-[#eab308] text-[10px] font-mono uppercase tracking-wider rounded-xs whitespace-nowrap">
                <span className="text-[6px] mr-1 select-none">●</span>
                TanStack Start
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-zinc-700/30 bg-black text-zinc-400 text-[10px] font-mono uppercase tracking-wider rounded-xs whitespace-nowrap">
                <span className="text-[6px] mr-1 select-none">●</span>
                Three.js (WebGL)
              </span>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed font-light font-sans">
              Built with <strong className="text-zinc-200 font-semibold">React 19</strong>,{" "}
              <strong className="text-zinc-200 font-semibold">TypeScript</strong>, and the{" "}
              <strong className="text-zinc-200 font-semibold">TanStack Start</strong> full-stack
              framework with type-safe routing.
              <br />
              <br />
              Features an interactive 3D showroom rendering real F1 car models via{" "}
              <strong className="text-zinc-200 font-semibold">Three.js</strong>. Optimized with an
              offscreen observer to maintain a fluid 60 FPS scroll.
            </p>

            {/* Core Dependencies */}
            <div className="mt-8 pt-5 border-t border-zinc-900">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest block mb-3">
                § CORE PACKAGES
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono text-zinc-400">
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>react</span>
                  <span className="text-zinc-500">v19.2.0</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>three.js</span>
                  <span className="text-zinc-500">v0.185.1</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>tanstack</span>
                  <span className="text-zinc-500">v1.168</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>tailwind</span>
                  <span className="text-zinc-500">v4.2.1</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>gsap</span>
                  <span className="text-zinc-500">v3.15.0</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900/50 pb-1">
                  <span>recharts</span>
                  <span className="text-zinc-500">v2.15.4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: The Data (2/3 width, 2x2 grid) */}
          <div className="lg:col-span-2">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
              § 08 · THE DATA
            </div>
            <h3 className="text-3xl font-serif italic text-white mt-1.5 mb-6 flex items-baseline gap-0.5 normal-case font-normal">
              The Data<span className="text-[#ff2a2a] font-sans font-bold">.</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider block font-bold">
                  2026 CALENDAR & STANDINGS
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-2 font-light">
                  Curated mid-year 2026 standings and round schedules stored statically in the
                  client application payload.
                </p>
                <span className="text-[10px] font-mono text-[#ff2a2a] uppercase tracking-wider block mt-1.5">
                  STATIC TELEMETRY SNAPSHOT
                </span>
              </div>

              <div>
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider block font-bold">
                  LIVE WEATHER TELEMETRY
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-2 font-light">
                  Fetches live weather conditions directly from track sensors using real-time OpenF1
                  API connection polling.
                </p>
                <span className="text-[10px] font-mono text-[#ff2a2a] uppercase tracking-wider block mt-1.5">
                  POLLS EVERY 60 SECONDS
                </span>
              </div>

              <div className="border-t border-zinc-900 pt-5">
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider block font-bold">
                  DRIVER BIOS & CAREER STATS
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-2 font-light">
                  Total wins, podiums, poles, championships, and recent form metrics loaded based on
                  your selected driver.
                </p>
                <span className="text-[10px] font-mono text-[#ff2a2a] uppercase tracking-wider block mt-1.5">
                  GENTLY CACHED DATA
                </span>
              </div>

              <div className="border-t border-zinc-900 pt-5">
                <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider block font-bold">
                  TRACK TELEMETRY SIMULATION
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-2 font-light">
                  Simulated 90s telemetry loops running at 60 FPS, animating positions along custom
                  SVG track vector paths.
                </p>
                <span className="text-[10px] font-mono text-[#ff2a2a] uppercase tracking-wider block mt-1.5">
                  rAF INTERACTIVE LOOP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: The Changelog (Horizontal Cards) */}
        <div className="mb-12">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
            § 09 · THE CHANGELOG
          </div>
          <h3 className="text-3xl font-serif italic text-white mt-1.5 mb-6 flex items-baseline gap-0.5 normal-case font-normal">
            The Changelog<span className="text-[#ff2a2a] font-sans font-bold">.</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/20 border border-emerald-500/30 p-5 hover:border-emerald-400 transition-colors rounded-[2px] shadow-lg">
              <span className="text-xs font-mono text-emerald-400 block font-bold uppercase tracking-wider">
                2026-08-01 · TELEMETRY HUB
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed mt-2 font-light">
                Added interactive Race Weekend Session Control Hub featuring a big, accessible toggle
                between Upcoming Race Sessions (FP1–3, Quali, GP specs) and Previous Race Data.
              </p>
            </div>

            <div className="bg-zinc-900/20 border border-amber-500/30 p-5 hover:border-amber-400 transition-colors rounded-[2px] shadow-lg">
              <span className="text-xs font-mono text-amber-400 block font-bold uppercase tracking-wider">
                2026-08-01 · QUALI DROPDOWNS
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed mt-2 font-light">
                Implemented interactive Q1, Q2, and Q3 expandable dropdown accordion panels with full driver
                lap times, sector splits, gap deltas, and knockout zone indicators.
              </p>
            </div>

            <div className="bg-zinc-900/20 border border-sky-500/30 p-5 hover:border-sky-400 transition-colors rounded-[2px] shadow-lg">
              <span className="text-xs font-mono text-sky-400 block font-bold uppercase tracking-wider">
                2026-08-01 · DATA SYNC & LOGS
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed mt-2 font-light">
                Synchronized all 22 drivers across the 2026 season data model, fixed team points math, and
                wired live systemLogger events to stream telemetry logs on every website interaction.
              </p>
            </div>
          </div>
        </div>

        {/* Footer legal disclaimer */}
        <div className="pt-8 border-t border-hairline-strong text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span>Unofficial fan project. Not affiliated with Formula 1, the FIA, or any team.</span>
            <div className="flex items-center gap-3 mt-1.5 text-zinc-400">
              <span className="text-zinc-600 select-none">MADE BY</span>
              <span className="text-zinc-300 font-semibold">MUKUL SHARMA</span>
              <span className="text-zinc-700 select-none">·</span>
              <a
                href="https://github.com/MukulS07"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff2a2a] transition-colors flex items-center gap-1"
              >
                <span className="text-[6px] text-zinc-600">●</span> GITHUB
              </a>
              <span className="text-zinc-700 select-none">·</span>
              <a
                href="https://linkedin.com/in/mukulsharma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1c69d4] transition-colors flex items-center gap-1"
              >
                <span className="text-[6px] text-zinc-600">●</span> LINKEDIN
              </a>
            </div>
          </div>
          <span>© {new Date().getFullYear()} ApexF1</span>
        </div>
      </div>
    </footer>
  );
}
