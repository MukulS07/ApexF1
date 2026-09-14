import { useState, useEffect } from "react";
import { Download, Menu, X } from "lucide-react";
import { systemLogger } from "@/lib/system-logger";
import { MStripe } from "./MStripe";

export function TopNav({ onEdit }: { onEdit: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-strong text-white h-16 flex items-center px-4 sm:px-10">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex items-center gap-[2px]" aria-hidden>
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-light)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-dark)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-red)" }} />
            </span>
            <span className="font-bold uppercase tracking-[0.15em] text-sm">ApexF1</span>
          </a>
          <div className="hidden md:flex items-center gap-4 lg:gap-8 text-xs font-mono text-zinc-400">
            <a href="#next" className="hover:text-white transition-colors">
              Next Race
            </a>
            <a href="#sessions" className="hover:text-white transition-colors text-white font-bold">
              Sessions
            </a>
            <a href="#standings" className="hover:text-white transition-colors">
              Standings
            </a>
            <a href="#telemetry" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
              <span>Telemetry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Live Telemetry Available" aria-label="Live"></span>
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
          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-md border border-zinc-800 bg-zinc-900 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-30 bg-zinc-950/95 border-b border-hairline-strong backdrop-blur-xl p-6 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4 text-sm font-mono text-zinc-300">
            <a
              href="#next"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900"
            >
              <span>Next Race</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#sessions"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900 text-white font-bold"
            >
              <span>Sessions Hub</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#standings"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900"
            >
              <span>Standings</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#telemetry"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900"
            >
              <div className="flex items-center gap-2">
                <span>Telemetry</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#calendar"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900"
            >
              <span>Calendar</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#recap"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between border-b border-zinc-900"
            >
              <span>Recap</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
            <a
              href="#driver"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded hover:bg-zinc-900 hover:text-white flex items-center justify-between"
            >
              <span>Driver Profile</span>
              <span className="text-xs text-red-500 font-bold">▸</span>
            </a>
          </div>
        </div>
      )}

      {/* Marquee ticker */}
      <div className="bg-canvas border-b border-hairline-strong overflow-hidden">
        <div className="marquee py-2 text-xs font-mono text-zinc-400">
          {Array.from({ length: 2 }).flatMap((_, k) => [
            <span key={`a${k}`}>▸ Season 2026 Live</span>,
            <span key={`b${k}`} className="text-white">
              ▸ New Engine Formula · 50% Electric
            </span>,
            <span key={`c${k}`}>▸ Cadillac Joins Grid</span>,
            <span key={`d${k}`} className="text-white">
              ▸ 24 Rounds · 6 Sprints
            </span>,
            <span key={`e${k}`}>▸ Unofficial Fan Project</span>,
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
    const interval = setInterval(() => {
      setMinutesAgo((prev) => prev + 1);
    }, 60000);

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
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="flex items-center justify-center h-4 w-4 rounded-full border border-white/40">
              <Download className="h-2.5 w-2.5" />
            </span>
            Install App
          </button>

          <div className="bg-zinc-950 border border-hairline-strong text-xs font-mono text-zinc-400 px-4 py-2.5 flex items-center gap-2 rounded">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>UPDATED {minutesAgo === 0 ? "JUST NOW" : `${minutesAgo} MIN AGO`}</span>
          </div>
        </div>

        {/* Row 1: The Build (1/3) & The Data (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 border-b border-hairline-strong pb-10 mb-10">
          {/* Column 1: The Build */}
          <div className="lg:border-r lg:border-zinc-900 lg:pr-12">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
              § 07 · THE BUILD
            </div>
            <h3 className="text-3xl font-serif italic text-white mt-1 mb-5 flex items-baseline gap-0.5 normal-case font-normal">
              The Build<span className="text-red-500 font-sans font-bold">.</span>
            </h3>

            {/* Badges - Simplified non-button styling */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded">React 19</span>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded">TypeScript</span>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded">TanStack Start</span>
              <span className="text-xs font-mono text-zinc-300 bg-zinc-900/80 px-2.5 py-1 rounded">Three.js</span>
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
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">
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
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
              § 08 · THE DATA
            </div>
            <h3 className="text-3xl font-serif italic text-white mt-1 mb-6 flex items-baseline gap-0.5 normal-case font-normal">
              The Data<span className="text-red-500 font-sans font-bold">.</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <span className="text-xs font-mono text-zinc-200 uppercase tracking-wider block font-bold">
                  2026 CALENDAR & STANDINGS
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1.5 font-light">
                  Curated mid-year 2026 standings and round schedules stored statically in the
                  client application payload.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span>Static telemetry snapshot</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-zinc-200 uppercase tracking-wider block font-bold">
                  LIVE WEATHER TELEMETRY
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1.5 font-light">
                  Fetches live weather conditions directly from track sensors using real-time OpenF1
                  API connection polling.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span>Polls every 60 seconds</span>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4">
                <span className="text-xs font-mono text-zinc-200 uppercase tracking-wider block font-bold">
                  DRIVER BIOS & CAREER STATS
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1.5 font-light">
                  Total wins, podiums, poles, championships, and recent form metrics loaded based on
                  your selected driver.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" aria-hidden="true" />
                  <span>Client-cached data</span>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4">
                <span className="text-xs font-mono text-zinc-200 uppercase tracking-wider block font-bold">
                  TRACK TELEMETRY SIMULATION
                </span>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1.5 font-light">
                  Simulated 90s telemetry loops running at 60 FPS, animating positions along custom
                  SVG track vector paths.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  <span>Interactive rAF loop</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: The Changelog (Horizontal Cards) */}
        <div className="mb-12">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            § 09 · THE CHANGELOG
          </div>
          <h3 className="text-3xl font-serif italic text-white mt-1 mb-6 flex items-baseline gap-0.5 normal-case font-normal">
            The Changelog<span className="text-red-500 font-sans font-bold">.</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/20 border border-emerald-500/30 p-5 hover:border-emerald-400 transition-colors rounded shadow-lg">
              <span className="text-xs font-mono text-emerald-400 block font-bold uppercase tracking-wider">
                2026-08-01 · TELEMETRY HUB
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed mt-2 font-light">
                Added interactive Race Weekend Session Control Hub featuring a big, accessible toggle
                between Upcoming Race Sessions (FP1–3, Quali, GP specs) and Previous Race Data.
              </p>
            </div>

            <div className="bg-zinc-900/20 border border-amber-500/30 p-5 hover:border-amber-400 transition-colors rounded shadow-lg">
              <span className="text-xs font-mono text-amber-400 block font-bold uppercase tracking-wider">
                2026-08-01 · QUALI DROPDOWNS
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed mt-2 font-light">
                Implemented interactive Q1, Q2, and Q3 expandable dropdown accordion panels with full driver
                lap times, sector splits, gap deltas, and knockout zone indicators.
              </p>
            </div>

            <div className="bg-zinc-900/20 border border-sky-500/30 p-5 hover:border-sky-400 transition-colors rounded shadow-lg">
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
        <div className="pt-8 border-t border-hairline-strong text-xs font-mono text-zinc-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-1">
            <span>Unofficial fan project. Not affiliated with Formula 1, the FIA, or any team.</span>
            <div className="flex items-center gap-3 mt-1.5 text-zinc-400">
              <span className="text-zinc-500">Made by</span>
              <span className="text-zinc-200 font-semibold">Mukul Sharma</span>
              <span className="text-zinc-700">•</span>
              <a
                href="https://github.com/MukulS07"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://linkedin.com/in/mukulsharma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
          <span>© {new Date().getFullYear()} ApexF1</span>
        </div>
      </div>
    </footer>
  );
}
