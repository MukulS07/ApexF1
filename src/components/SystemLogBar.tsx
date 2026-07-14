import { useEffect, useState, useRef } from "react";
import { systemLogger, type LogEntry } from "@/lib/system-logger";
import {
  Terminal,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  Activity,
  Heart,
} from "lucide-react";

export function SystemLogBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial last updated time
    updateLastUpdatedTime();

    // Subscribe to systemLogger events
    const unsubscribe = systemLogger.subscribe((newLogs) => {
      if (!isPaused) {
        setLogs(newLogs);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isPaused]);

  useEffect(() => {
    if (isOpen && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const updateLastUpdatedTime = () => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLastUpdated(time);
  };

  const handleRefresh = () => {
    systemLogger.log("Forced telemetry refresh sequence initiated", "warn");
    setTimeout(() => {
      systemLogger.log("Weather conditions updated: Track 32.5°C / Ambient 25.1°C", "success");
      systemLogger.log("Championship standings cache validated", "info");
      updateLastUpdatedTime();
    }, 450);
  };

  const handleClear = () => {
    // Clear logs locally (or we can just clear our current state)
    setLogs([]);
    systemLogger.log("Telemetry console logs cleared", "info");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col font-mono text-[10px] select-none pointer-events-auto">
      {/* BMW M Stripe Divider above the bar */}
      <div className="h-[2px] w-full bg-linear-to-r from-[var(--m-blue-light)] via-[var(--m-blue-dark)] to-[var(--m-red)]" />

      {/* Expanded Credits/Tip Panel */}
      <div
        className={`bg-zinc-950/95 text-zinc-300 border-t border-hairline-strong transition-all duration-300 ease-in-out overflow-hidden flex flex-col font-sans ${
          isTipOpen ? "h-96" : "h-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Left Column: Credits */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#ff2a2a] uppercase tracking-wider block">◆ CREDITS</span>
                <h2 className="text-3xl font-display font-black uppercase tracking-tight text-white mt-1.5 mb-1.5">
                  ApexF1<span className="text-[#ff2a2a] font-sans font-bold">.</span>
                </h2>
                <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                  Developed by Mukul Sharma. Now hosted live for every F1 fan.
                </p>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                I'm <strong className="font-semibold text-white">Mukul Sharma</strong>. I build telemetry dashboards and tools for the things I love — Formula 1 racing, performance engineering, and web technology. If this workspace makes your race weekend better, that's enough.
              </p>

              {/* Links */}
              <div className="flex flex-wrap gap-2.5 pt-2.5">
                <a
                  href="https://github.com/MukulS07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-zinc-800 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors text-[10.5px] font-mono uppercase tracking-wider flex items-center gap-1 rounded-xs"
                >
                  github.com/MukulS07 →
                </a>
                <a
                  href="https://linkedin.com/in/mukulsharma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 border border-zinc-800 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors text-[10.5px] font-mono uppercase tracking-wider flex items-center gap-1 rounded-xs"
                >
                  linkedin/mukulsharma →
                </a>
              </div>
            </div>

            {/* Right Column: Support */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">◆ PIT CREW SUPPORT</span>
                <h3 className="text-base font-display font-black uppercase tracking-tight text-white mt-1.5 mb-1.5 leading-tight">
                  If this made your race weekend, <span className="text-[#ff2a2a]">pit us in.</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  No ads, no subscriptions, no accounts — that's the promise. A small tip keeps the garage lights on.
                </p>
              </div>

              {/* Tiers */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="border border-zinc-800/80 p-2.5 text-center bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-between rounded-xs">
                  <span className="bg-zinc-800 text-zinc-300 text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs font-bold select-none">P10</span>
                  <span className="text-lg font-mono font-bold tracking-tight text-white mt-1">₹100</span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block mt-1 whitespace-nowrap">POINTS FINISH</span>
                </div>
                <div className="border border-zinc-800/80 p-2.5 text-center bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-between rounded-xs">
                  <span className="bg-[#ff2a2a] text-white text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs font-bold select-none">P3</span>
                  <span className="text-lg font-mono font-bold tracking-tight text-white mt-1">₹300</span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block mt-1 whitespace-nowrap">PODIUM</span>
                </div>
                <div className="border border-zinc-800/80 p-2.5 text-center bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors flex flex-col items-center justify-between rounded-xs">
                  <span className="bg-amber-500 text-white text-[9.5px] font-mono px-1.5 py-0.5 rounded-xs font-bold select-none">P1</span>
                  <span className="text-lg font-mono font-bold tracking-tight text-white mt-1">₹500</span>
                  <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-wider block mt-1 whitespace-nowrap">RACE WINNER</span>
                </div>
              </div>

              {/* Payments Area */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/40 border border-zinc-800/80 p-4 rounded-xs pt-1.5 mt-1.5">
                {/* QR Code (First) */}
                <div className="w-24 h-24 bg-white p-1 rounded-xs flex items-center justify-center shrink-0 border border-zinc-800">
                  <img
                    src="/qr-code.jpeg"
                    alt="UPI QR Code"
                    className="w-full h-full object-contain select-none"
                  />
                </div>
                {/* UPI Details (Next) */}
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <div>
                    <span className="text-[9.5px] font-mono text-[#ff2a2a] block tracking-wider uppercase font-bold">UPI PAYMENT · SCAN OR SEND</span>
                    <span className="text-sm font-bold font-mono tracking-tight block mt-0.5 text-zinc-100">mukulsharmams007-1@oksbi</span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 leading-normal">
                    Scan QR code with any UPI app (PhonePe, GPay, Paytm, BHIM) or send directly to the ID.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Logs Console */}
      <div
        className={`bg-black/95 border-t border-hairline-strong transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
          isOpen ? "h-48" : "h-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar text-zinc-400">
          {logs.length === 0 ? (
            <div className="text-zinc-600 italic">// No telemetry logs in console buffer.</div>
          ) : (
            logs
              .slice()
              .reverse()
              .map((log, i) => {
                let colorClass = "text-zinc-400";
                if (log.type === "success") colorClass = "text-[#00B5A1]";
                if (log.type === "warn") colorClass = "text-[#FF8700]";
                if (log.type === "error") colorClass = "text-[#e22718] font-bold";

                return (
                  <div
                    key={i}
                    className="flex gap-3 hover:bg-zinc-900/40 py-0.5 px-1 rounded transition-colors"
                  >
                    <span className="text-zinc-600 select-none">[{log.timestamp}]</span>
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })
          )}
          <div ref={consoleEndRef} />
        </div>

        {/* Console Controls Footer */}
        <div className="h-8 bg-zinc-950 border-t border-hairline-strong px-6 flex items-center justify-between text-zinc-500">
          <div className="flex gap-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? (
                <Play className="h-3 w-3 text-[#00B5A1]" />
              ) : (
                <Pause className="h-3 w-3 text-[#FF8700]" />
              )}
              {isPaused ? "RESUME FEED" : "PAUSE FEED"}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              CLEAR BUFFER
            </button>
          </div>
          <div className="text-zinc-600">// CHANNEL: telemetry_feed_v2.06b</div>
        </div>
      </div>

      {/* Main Status Log Bar */}
      <div className="h-10 bg-black/90 backdrop-blur-md border-t border-hairline-strong px-6 flex items-center justify-between text-white shadow-2xl">
        {/* Left Side: System status & last update */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B5A1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B5A1]"></span>
            </span>
            <span className="font-bold tracking-wider text-zinc-300">TELEMETRY SYSTEM: ACTIVE</span>
          </div>

          <span className="text-zinc-700">|</span>

          <div className="flex items-center gap-1 text-zinc-400">
            <span>LAST UPDATE:</span>
            <span className="text-[#00B5A1] tabular-nums">{lastUpdated}</span>
          </div>

          {logs.length > 0 && (
            <>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-500 hidden sm:inline truncate max-w-[200px] md:max-w-[350px]">
                <span className="text-[#FF8700] mr-1.5">&gt;&gt;</span>
                {logs[0].message}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Refresh & Toggles */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-800 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer rounded-xs"
            title="Force telemetry refresh"
          >
            <RefreshCw className="h-3 w-3 animate-spin-hover" />
            <span className="hidden xs:inline">REFRESH</span>
          </button>

          <button
            onClick={() => {
              setIsTipOpen(!isTipOpen);
              setIsOpen(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 border transition-all cursor-pointer rounded-xs ${
              isTipOpen
                ? "border-[#ff2a2a] text-[#ff2a2a] bg-[#ff2a2a]/5 hover:bg-[#ff2a2a]/10"
                : "border-zinc-800 text-zinc-400 hover:border-[#ff2a2a] bg-zinc-950/50 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Heart className={`h-3 w-3 ${isTipOpen ? "fill-current" : ""}`} />
            <span>CREDITS & TIP</span>
            {isTipOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>

          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setIsTipOpen(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1 border transition-all cursor-pointer rounded-xs ${
              isOpen
                ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5 hover:bg-[#FF8700]/10"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-500 bg-zinc-950/50 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Terminal className="h-3 w-3" />
            <span>SYSTEM LOG</span>
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
