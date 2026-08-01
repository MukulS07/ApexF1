import { useState } from "react";
import { systemLogger } from "@/lib/system-logger";
import {
  Calendar,
  History,
  Clock,
  Flag,
  Zap,
  Gauge,
  Thermometer,
  CloudRain,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { getDriverOrFallback, getTeamOrFallback, nextRace, lastRace } from "@/lib/f1-data";
import { useF1Schedule, useLastRaceResults } from "@/hooks/useF1Data";
import type { Profile } from "@/hooks/useProfile";

type ViewMode = "upcoming" | "previous";
type UpcomingSessionId = "fp1" | "fp2" | "fp3" | "qualifying" | "race";
type PreviousSessionId = "fp" | "qualifying" | "race" | "strategy";
type QualiPhase = "Q1" | "Q2" | "Q3";

export function RaceSessionsHub({ profile }: { profile?: Profile }) {
  const [mode, setMode] = useState<ViewMode>("upcoming");
  const [upcomingTab, setUpcomingTab] = useState<UpcomingSessionId>("fp1");
  const [previousTab, setPreviousTab] = useState<PreviousSessionId>("qualifying");
  const [activeQualiPhase, setActiveQualiPhase] = useState<QualiPhase>("Q3");

  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode);
    systemLogger.log(
      `Race session hub mode toggled to: ${newMode === "upcoming" ? "UPCOMING SESSIONS" : "PREVIOUS SESSION DATA"}`,
      "info",
    );
  };

  const handleQualiPhaseToggle = (phase: QualiPhase) => {
    setActiveQualiPhase(phase);
    systemLogger.log(`Qualifying telemetry dropdown opened: ${phase} session classification`, "info");
  };

  const handleUpcomingTabChange = (tabId: UpcomingSessionId) => {
    setUpcomingTab(tabId);
    systemLogger.log(`Upcoming session tab selected: ${tabId.toUpperCase()}`, "info");
  };

  const handlePreviousTabChange = (tabId: PreviousSessionId) => {
    setPreviousTab(tabId);
    systemLogger.log(`Previous race session tab selected: ${tabId.toUpperCase()}`, "info");
  };

  const { data: realTimeSchedule = [] } = useF1Schedule();
  const { data: realTimeLastRace = null } = useLastRaceResults();

  const now = new Date();
  const upcoming =
    realTimeSchedule.length > 0
      ? realTimeSchedule.find((r) => new Date(r.dateISO).getTime() > now.getTime())
      : undefined;
  const raceUpcoming = upcoming || nextRace();
  const racePrevious: any = realTimeLastRace || lastRace;

  const favDriver = profile ? getDriverOrFallback(profile.favoriteDriverId) : null;
  const favTeam = favDriver ? getTeamOrFallback(favDriver.teamId) : null;
  const accentColor = favTeam?.color || "#e53935";

  // Derive dates for upcoming sessions (assuming standard F1 weekend schedule: FP1/FP2 Friday, FP3/Quali Saturday, Race Sunday)
  const raceDate = new Date(raceUpcoming.dateISO);
  const fridayDate = new Date(raceDate);
  fridayDate.setDate(raceDate.getDate() - 2);
  const saturdayDate = new Date(raceDate);
  saturdayDate.setDate(raceDate.getDate() - 1);

  const upcomingSessions: Record<
    UpcomingSessionId,
    {
      name: string;
      sub: string;
      dateStr: string;
      timeUTC: string;
      duration: string;
      focus: string;
      compounds: string[];
      airC: number;
      trackC: number;
      rainRisk: string;
    }
  > = {
    fp1: {
      name: "Free Practice 1",
      sub: "Aero Baseline & Track Evolution",
      dateStr: fridayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      timeUTC: "11:30 UTC",
      duration: "60 mins",
      focus: "Flow-vis paint runs, floor ride height checks, hard tyre C1/C2 installation stints.",
      compounds: ["Hard", "Medium"],
      airC: 24,
      trackC: 36,
      rainRisk: "10%",
    },
    fp2: {
      name: "Free Practice 2",
      sub: "Quali Sims & Long Run Pace",
      dateStr: fridayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      timeUTC: "15:00 UTC",
      duration: "60 mins",
      focus: "Soft tyre single-lap qualifying simulations followed by 18-lap high-fuel race simulations.",
      compounds: ["Soft", "Medium"],
      airC: 26,
      trackC: 42,
      rainRisk: "25%",
    },
    fp3: {
      name: "Free Practice 3",
      sub: "Final Setup Fine-Tuning",
      dateStr: saturdayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      timeUTC: "10:30 UTC",
      duration: "60 mins",
      focus: "Low-fuel qualifying trim runs, wing angle adjustments, front suspension stiffness tweaks.",
      compounds: ["Soft"],
      airC: 23,
      trackC: 38,
      rainRisk: "15%",
    },
    qualifying: {
      name: "Qualifying (Q1 / Q2 / Q3)",
      sub: "Pole Position Shootout",
      dateStr: saturdayDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      timeUTC: raceUpcoming.qualifyingISO
        ? new Date(raceUpcoming.qualifyingISO).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })
        : "14:00 UTC",
      duration: "60 mins",
      focus: "18-minute Q1 (bottom 5 eliminated), 15-minute Q2 (bottom 5 eliminated), 12-minute Q3 Pole shootout.",
      compounds: ["Soft C3/C4"],
      airC: 25,
      trackC: 44,
      rainRisk: "20%",
    },
    race: {
      name: "Grand Prix Race",
      sub: "Lights-Out Main Feature",
      dateStr: raceDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
      timeUTC: raceDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }),
      duration: "70 Laps (approx. 90m)",
      focus: "Mandatory 2-compound strategy run, thermal tyre management, undercut pit windows.",
      compounds: ["Hard", "Medium", "Soft"],
      airC: 27,
      trackC: 45,
      rainRisk: "15%",
    },
  };

  const currentUpcoming = upcomingSessions[upcomingTab];

  // Previous Session Data Mock/Real
  const winnerDriver = getDriverOrFallback(racePrevious.winnerId);
  const winnerTeam = getTeamOrFallback(winnerDriver.teamId);
  const poleDriver = getDriverOrFallback(racePrevious.poleId || "NOR");
  const flDriver = getDriverOrFallback(racePrevious.fastestLapId || "NOR");

  return (
    <section className="bg-canvas border-t border-b border-hairline-strong py-16 sm:py-24" id="sessions">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        {/* Header & Main Big Accessible Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 text-eyebrow text-ink-muted mb-3">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>// Telemetry & Session Hub</span>
            </div>
            <h2 className="text-display text-white">
              Race Weekend
              <br />
              <span className="italic font-serif font-normal" style={{ color: accentColor }}>
                Session Control.
              </span>
            </h2>
          </div>

          {/* BIG PROMINENT ACCESSIBLE TOGGLE */}
          <div
            role="tablist"
            aria-label="Race Session Selector"
            className="bg-zinc-950 p-2 border-2 border-hairline-strong rounded-xl shadow-2xl flex flex-col sm:flex-row gap-2 w-full lg:w-auto"
          >
            <button
              role="tab"
              aria-selected={mode === "upcoming"}
              onClick={() => handleModeChange("upcoming")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === "upcoming"
                  ? "bg-surface-card text-white shadow-lg border border-white/20 scale-[1.02]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
              style={mode === "upcoming" ? { borderLeft: `4px solid ${accentColor}` } : {}}
            >
              <Calendar className="h-4 w-4" style={{ color: mode === "upcoming" ? accentColor : "currentColor" }} />
              <div className="text-left">
                <div>UPCOMING SESSIONS</div>
                <div className="text-[10px] font-mono font-normal text-zinc-400 lowercase tracking-normal">
                  {raceUpcoming.name} · Round {raceUpcoming.round}
                </div>
              </div>
            </button>

            <button
              role="tab"
              aria-selected={mode === "previous"}
              onClick={() => handleModeChange("previous")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                mode === "previous"
                  ? "bg-surface-card text-white shadow-lg border border-white/20 scale-[1.02]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
              style={mode === "previous" ? { borderLeft: `4px solid ${accentColor}` } : {}}
            >
              <History className="h-4 w-4" style={{ color: mode === "previous" ? accentColor : "currentColor" }} />
              <div className="text-left">
                <div>PREVIOUS RACE SESSION DATA</div>
                <div className="text-[10px] font-mono font-normal text-zinc-400 lowercase tracking-normal">
                  {racePrevious.name} · Round {racePrevious.round} Results
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Content Container */}
        {mode === "upcoming" ? (
          <div className="bg-surface-card border border-hairline-strong rounded-lg p-6 sm:p-8 shadow-2xl transition-all duration-300">
            {/* Session Sub-Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-hairline-strong pb-4 mb-8 overflow-x-auto gap-4">
              <div className="flex items-center gap-2">
                {(["fp1", "fp2", "fp3", "qualifying", "race"] as UpcomingSessionId[]).map((tabId) => {
                  const labels: Record<UpcomingSessionId, string> = {
                    fp1: "Practice 1",
                    fp2: "Practice 2",
                    fp3: "Practice 3",
                    qualifying: "Qualifying",
                    race: "Grand Prix",
                  };
                  const active = upcomingTab === tabId;
                  return (
                    <button
                      key={tabId}
                      onClick={() => handleUpcomingTabChange(tabId)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-[2px] whitespace-nowrap ${
                        active
                          ? "bg-white text-black font-extrabold shadow-md"
                          : "text-ink-muted hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      {labels[tabId]}
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-ink-muted font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>Next GP: {raceUpcoming.city}, {raceUpcoming.country}</span>
              </div>
            </div>

            {/* Session Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Main Card */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-baseline justify-between flex-wrap gap-4 border-b border-hairline pb-4">
                  <div>
                    <span className="text-eyebrow text-emerald-400 uppercase font-mono tracking-widest">// Schedule & Focus</span>
                    <h3 className="text-2xl font-bold text-white mt-1">{currentUpcoming.name}</h3>
                    <p className="text-sm text-ink-muted mt-0.5">{currentUpcoming.sub}</p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xl font-bold text-white">{currentUpcoming.timeUTC}</div>
                    <div className="text-xs text-ink-muted">{currentUpcoming.dateStr}</div>
                  </div>
                </div>

                <div className="bg-canvas/60 border border-hairline p-5 rounded-[2px]">
                  <div className="text-xs text-ink-muted uppercase tracking-widest font-mono mb-2">// Session Objectives</div>
                  <p className="text-sm text-white/90 leading-relaxed font-sans">{currentUpcoming.focus}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-canvas/40 border border-hairline p-4">
                    <div className="text-[10px] text-ink-muted font-mono uppercase">// Duration</div>
                    <div className="text-base font-bold text-white mt-1">{currentUpcoming.duration}</div>
                  </div>
                  <div className="bg-canvas/40 border border-hairline p-4">
                    <div className="text-[10px] text-ink-muted font-mono uppercase">// Circuit</div>
                    <div className="text-base font-bold text-white mt-1 truncate">{raceUpcoming.circuit}</div>
                  </div>
                  <div className="bg-canvas/40 border border-hairline p-4 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-ink-muted font-mono uppercase">// Lap Record</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">{raceUpcoming.lapRecord || "1:18.500"}</div>
                  </div>
                </div>
              </div>

              {/* Right Weather & Tyres Card */}
              <div className="bg-canvas/70 border border-hairline p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="text-eyebrow text-ink-muted mb-4">// Track & Weather Spec</div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Thermometer className="h-5 w-5 text-red-400" />
                      <div>
                        <div className="text-[10px] text-ink-muted uppercase font-mono">Track Temp</div>
                        <div className="text-lg font-bold text-white">{currentUpcoming.trackC}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CloudRain className="h-5 w-5 text-sky-400" />
                      <div>
                        <div className="text-[10px] text-ink-muted uppercase font-mono">Rain Risk</div>
                        <div className="text-lg font-bold text-white">{currentUpcoming.rainRisk}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-hairline pt-4">
                    <div className="text-[10px] text-ink-muted uppercase font-mono mb-3">// Nominated Compounds</div>
                    <div className="flex items-center gap-2">
                      {currentUpcoming.compounds.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-zinc-900 border border-hairline text-xs font-bold uppercase tracking-wider text-white"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-hairline pt-4 flex items-center justify-between text-xs text-ink-muted font-mono">
                  <span>Round {raceUpcoming.round} of 24</span>
                  <span className="text-white font-bold">{raceUpcoming.city} GP</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-card border border-hairline-strong rounded-lg p-6 sm:p-8 shadow-2xl transition-all duration-300">
            {/* Previous Session Sub-Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-hairline-strong pb-4 mb-8 overflow-x-auto gap-4">
              <div className="flex items-center gap-2">
                {(["race", "qualifying", "fp", "strategy"] as PreviousSessionId[]).map((tabId) => {
                  const labels: Record<PreviousSessionId, string> = {
                    race: "Race Classification",
                    qualifying: "Qualifying Q1/Q2/Q3",
                    fp: "Practice Pace",
                    strategy: "Tyre Stints",
                  };
                  const active = previousTab === tabId;
                  return (
                    <button
                      key={tabId}
                      onClick={() => handlePreviousTabChange(tabId)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-[2px] whitespace-nowrap ${
                        active
                          ? "bg-white text-black font-extrabold shadow-md"
                          : "text-ink-muted hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      {labels[tabId]}
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-ink-muted font-mono">
                <Flag className="h-3.5 w-3.5 text-amber-400" />
                <span>Last Completed: {racePrevious.name} ({racePrevious.circuit})</span>
              </div>
            </div>

            {/* Previous Session Tab Content */}
            {previousTab === "race" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top 3 Podium Highlights */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="text-eyebrow text-ink-muted mb-2">// Grand Prix Classification Top 5</div>
                  <div className="divide-y divide-hairline border-y border-hairline">
                    {(racePrevious.top10 || ["NOR", "PIA", "HAM", "VER", "LEC"]).slice(0, 5).map((driverId: string, idx: number) => {
                      const d = getDriverOrFallback(driverId);
                      const t = getTeamOrFallback(d.teamId);
                      return (
                        <div key={driverId} className="flex items-center justify-between py-3.5 px-3 hover:bg-surface-soft transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="tabular text-xl font-bold text-ink-muted w-6">P{idx + 1}</span>
                            <span className="h-6 w-1" style={{ background: t.color }} />
                            <div>
                              <div className="text-sm font-bold uppercase text-white">
                                {d.firstName} {d.lastName}
                              </div>
                              <div className="text-xs text-ink-muted uppercase">{t.name}</div>
                            </div>
                          </div>
                          <div className="text-right font-mono text-xs text-white/80">
                            {idx === 0 ? "WINNER" : `+${(idx * 4.382 + 1.21).toFixed(3)}s`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Telemetry Stats */}
                <div className="bg-canvas/70 border border-hairline p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-eyebrow text-ink-muted mb-4">// Race Benchmarks</div>
                    <div className="space-y-4">
                      <div className="bg-canvas p-4 border border-hairline">
                        <div className="text-[10px] text-ink-muted font-mono uppercase">// Winner</div>
                        <div className="text-lg font-bold text-white mt-1" style={{ color: winnerTeam.color }}>
                          {winnerDriver.firstName} {winnerDriver.lastName}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">{winnerTeam.name}</div>
                      </div>

                      <div className="bg-canvas p-4 border border-hairline">
                        <div className="text-[10px] text-ink-muted font-mono uppercase">// Fastest Lap</div>
                        <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{racePrevious.fastestLap || "1:27.097"}</div>
                        <div className="text-xs text-ink-muted mt-0.5">{flDriver.firstName} {flDriver.lastName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previousTab === "qualifying" && (
              <div className="space-y-6">
                {/* 3 Interactive Dropdown Triggers for Q1, Q2, Q3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Q3 POLE SHOOTOUT TRIGGER */}
                  <button
                    onClick={() => handleQualiPhaseToggle("Q3")}
                    aria-expanded={activeQualiPhase === "Q3"}
                    className={`p-5 border transition-all text-left relative cursor-pointer group ${
                      activeQualiPhase === "Q3"
                        ? "bg-canvas border-emerald-400 shadow-lg ring-1 ring-emerald-400/50"
                        : "bg-canvas/50 border-hairline hover:border-zinc-500 hover:bg-canvas"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-eyebrow text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" /> // Q3 Pole Position
                      </span>
                      {activeQualiPhase === "Q3" ? (
                        <ChevronUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-white" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">{racePrevious.poleTime || "1:25.819"}</div>
                    <div className="text-sm font-bold text-white mt-2 uppercase">{poleDriver.firstName} {poleDriver.lastName}</div>
                    <div className="text-xs text-ink-muted mt-0.5 flex justify-between items-center">
                      <span>McLaren F1 Team</span>
                      <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">
                        {activeQualiPhase === "Q3" ? "▾ Inspecting Results" : "▸ Click to open Q3 dropdown"}
                      </span>
                    </div>
                  </button>

                  {/* Q2 KNOCKOUT TRIGGER */}
                  <button
                    onClick={() => handleQualiPhaseToggle("Q2")}
                    aria-expanded={activeQualiPhase === "Q2"}
                    className={`p-5 border transition-all text-left relative cursor-pointer group ${
                      activeQualiPhase === "Q2"
                        ? "bg-canvas border-amber-400 shadow-lg ring-1 ring-amber-400/50"
                        : "bg-canvas/50 border-hairline hover:border-zinc-500 hover:bg-canvas"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-eyebrow text-amber-400 font-bold uppercase flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" /> // Q2 Knockout Phase
                      </span>
                      {activeQualiPhase === "Q2" ? (
                        <ChevronUp className="h-4 w-4 text-amber-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-white" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">+0.084s</div>
                    <div className="text-sm font-bold text-white mt-2 uppercase">Q2 Knockout Margin</div>
                    <div className="text-xs text-ink-muted mt-0.5 flex justify-between items-center">
                      <span>Top 10 separated by 0.412s</span>
                      <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                        {activeQualiPhase === "Q2" ? "▾ Inspecting Results" : "▸ Click to open Q2 dropdown"}
                      </span>
                    </div>
                  </button>

                  {/* Q1 KNOCKOUT TRIGGER */}
                  <button
                    onClick={() => handleQualiPhaseToggle("Q1")}
                    aria-expanded={activeQualiPhase === "Q1"}
                    className={`p-5 border transition-all text-left relative cursor-pointer group ${
                      activeQualiPhase === "Q1"
                        ? "bg-canvas border-sky-400 shadow-lg ring-1 ring-sky-400/50"
                        : "bg-canvas/50 border-hairline hover:border-zinc-500 hover:bg-canvas"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-eyebrow text-sky-400 font-bold uppercase flex items-center gap-1.5">
                        <Flag className="h-3.5 w-3.5" /> // Q1 Knockout Phase
                      </span>
                      {activeQualiPhase === "Q1" ? (
                        <ChevronUp className="h-4 w-4 text-sky-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-white" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white font-mono">328.4 km/h</div>
                    <div className="text-sm font-bold text-white mt-2 uppercase">Speed Trap Record</div>
                    <div className="text-xs text-ink-muted mt-0.5 flex justify-between items-center">
                      <span>Main Straight Apex</span>
                      <span className="text-[10px] text-sky-400 uppercase font-mono tracking-wider">
                        {activeQualiPhase === "Q1" ? "▾ Inspecting Results" : "▸ Click to open Q1 dropdown"}
                      </span>
                    </div>
                  </button>
                </div>

                {/* EXPANDABLE DROPBOX RESULTS PANEL */}
                <div className="bg-canvas border border-hairline p-6 rounded-[2px] shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-hairline pb-4 mb-6 flex-wrap gap-4">
                    <div>
                      <span
                        className={`text-xs font-mono font-bold uppercase tracking-widest ${
                          activeQualiPhase === "Q3"
                            ? "text-emerald-400"
                            : activeQualiPhase === "Q2"
                            ? "text-amber-400"
                            : "text-sky-400"
                        }`}
                      >
                        // {activeQualiPhase} QUALIFYING SESSION TELEMETRY & RESULTS
                      </span>
                      <h4 className="text-xl font-bold text-white mt-1">
                        {activeQualiPhase === "Q3"
                          ? "Q3 Pole Position Top 10 Final Shootout"
                          : activeQualiPhase === "Q2"
                          ? "Q2 Intermediate Qualifying (P11–P15 Eliminated)"
                          : "Q1 Initial Qualifying Knockout (P16–P20 Eliminated)"}
                      </h4>
                    </div>

                    {/* Phase Switch Pills inside the dropdown */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 border border-hairline rounded-[2px]">
                      {(["Q1", "Q2", "Q3"] as QualiPhase[]).map((phase) => (
                        <button
                          key={phase}
                          onClick={() => handleQualiPhaseToggle(phase)}
                          className={`px-3 py-1 text-xs font-bold font-mono transition-colors cursor-pointer ${
                            activeQualiPhase === phase
                              ? "bg-white text-black font-extrabold"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {phase}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RESULTS LIST BASED ON ACTIVE QUALI PHASE */}
                  {activeQualiPhase === "Q3" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[40px_1fr_120px_140px] text-[10px] font-mono text-ink-muted uppercase tracking-widest pb-2 border-b border-hairline px-2">
                        <span>POS</span>
                        <span>DRIVER & TEAM</span>
                        <span className="text-right">Q3 TIME</span>
                        <span className="text-right">SECTOR SPLITS</span>
                      </div>
                      {[
                        { code: "NOR", time: racePrevious.poleTime || "1:25.819", gap: "POLE", s1: "27.102", s2: "34.215", s3: "24.502" },
                        { code: "PIA", time: "1:26.041", gap: "+0.222s", s1: "27.180", s2: "34.310", s3: "24.551" },
                        { code: "HAM", time: "1:26.115", gap: "+0.296s", s1: "27.205", s2: "34.350", s3: "24.560" },
                        { code: "VER", time: "1:26.208", gap: "+0.389s", s1: "27.240", s2: "34.390", s3: "24.578" },
                        { code: "LEC", time: "1:26.290", gap: "+0.471s", s1: "27.270", s2: "34.420", s3: "24.600" },
                        { code: "RUS", time: "1:26.350", gap: "+0.531s", s1: "27.310", s2: "34.450", s3: "24.590" },
                        { code: "ANT", time: "1:26.440", gap: "+0.621s", s1: "27.350", s2: "34.490", s3: "24.600" },
                        { code: "TSU", time: "1:26.530", gap: "+0.711s", s1: "27.390", s2: "34.520", s3: "24.620" },
                        { code: "ALO", time: "1:26.610", gap: "+0.791s", s1: "27.420", s2: "34.560", s3: "24.630" },
                        { code: "GAS", time: "1:26.720", gap: "+0.901s", s1: "27.480", s2: "34.610", s3: "24.630" },
                      ].map((item, idx) => {
                        const d = getDriverOrFallback(item.code);
                        const t = getTeamOrFallback(d.teamId);
                        return (
                          <div
                            key={item.code}
                            className={`grid grid-cols-[40px_1fr_120px_140px] items-center p-3 text-sm transition-colors border-b border-hairline/60 ${
                              idx === 0 ? "bg-emerald-950/30 border-l-4 border-l-emerald-400" : "hover:bg-surface-soft"
                            }`}
                          >
                            <span className="tabular font-bold font-mono text-ink-muted">
                              {idx === 0 ? "P1" : `P${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="h-5 w-1" style={{ background: t.color }} />
                              <div>
                                <span className="font-bold text-white uppercase">{d.firstName} {d.lastName}</span>
                                <span className="text-xs text-ink-muted ml-2">#{d.number} · {t.name}</span>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="font-bold text-white">{item.time}</div>
                              <div className="text-[10px] text-ink-muted">{item.gap}</div>
                            </div>
                            <div className="text-right font-mono text-xs text-ink-muted">
                              {item.s1} / {item.s2} / {item.s3}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeQualiPhase === "Q2" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[40px_1fr_140px] text-[10px] font-mono text-ink-muted uppercase tracking-widest pb-2 border-b border-hairline px-2">
                        <span>POS</span>
                        <span>DRIVER & TEAM</span>
                        <span className="text-right">Q2 LAP TIME & GAP</span>
                      </div>
                      {[
                        { code: "PIA", time: "1:25.992", gap: "leader" },
                        { code: "NOR", time: "1:26.040", gap: "+0.048s" },
                        { code: "HAM", time: "1:26.115", gap: "+0.123s" },
                        { code: "VER", time: "1:26.180", gap: "+0.188s" },
                        { code: "LEC", time: "1:26.245", gap: "+0.253s" },
                        { code: "RUS", time: "1:26.310", gap: "+0.318s" },
                        { code: "ANT", time: "1:26.390", gap: "+0.398s" },
                        { code: "TSU", time: "1:26.460", gap: "+0.468s" },
                        { code: "ALO", time: "1:26.540", gap: "+0.548s" },
                        { code: "GAS", time: "1:26.620", gap: "+0.628s" },
                        // Q2 ELIMINATION CUTOFF
                        { code: "OCO", time: "1:26.704", gap: "+0.712s", eliminated: true },
                        { code: "HAD", time: "1:26.780", gap: "+0.788s", eliminated: true },
                        { code: "COL", time: "1:26.850", gap: "+0.858s", eliminated: true },
                        { code: "STR", time: "1:26.920", gap: "+0.928s", eliminated: true },
                        { code: "BEA", time: "1:27.010", gap: "+1.018s", eliminated: true },
                      ].map((item, idx) => {
                        const d = getDriverOrFallback(item.code);
                        const t = getTeamOrFallback(d.teamId);
                        const isCutoff = idx === 10;
                        return (
                          <div key={item.code}>
                            {isCutoff && (
                              <div className="my-3 py-1.5 px-3 bg-amber-950/40 border-y border-amber-800/60 text-amber-400 text-xs font-mono font-bold flex items-center justify-between">
                                <span>⚠ Q2 KNOCKOUT CUTOFF ZONE (P11 - P15 ELIMINATED)</span>
                                <span>Q2 Margin: +0.084s</span>
                              </div>
                            )}
                            <div
                              className={`grid grid-cols-[40px_1fr_140px] items-center p-3 text-sm transition-colors border-b border-hairline/60 ${
                                item.eliminated ? "bg-red-950/10 text-zinc-400" : "hover:bg-surface-soft"
                              }`}
                            >
                              <span className="tabular font-bold font-mono text-ink-muted">P{idx + 1}</span>
                              <div className="flex items-center gap-3">
                                <span className="h-5 w-1" style={{ background: t.color }} />
                                <div>
                                  <span className="font-bold uppercase text-white">{d.firstName} {d.lastName}</span>
                                  <span className="text-xs text-ink-muted ml-2">#{d.number} · {t.name}</span>
                                </div>
                              </div>
                              <div className="text-right font-mono">
                                <div className="font-bold text-white">{item.time}</div>
                                <div className="text-[10px] text-ink-muted">{item.gap}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {activeQualiPhase === "Q1" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-[40px_1fr_140px] text-[10px] font-mono text-ink-muted uppercase tracking-widest pb-2 border-b border-hairline px-2">
                        <span>POS</span>
                        <span>DRIVER & TEAM</span>
                        <span className="text-right">Q1 LAP TIME & GAP</span>
                      </div>
                      {[
                        { code: "NOR", time: "1:26.110", gap: "leader" },
                        { code: "VER", time: "1:26.240", gap: "+0.130s" },
                        { code: "LEC", time: "1:26.315", gap: "+0.205s" },
                        { code: "PIA", time: "1:26.380", gap: "+0.270s" },
                        { code: "HAM", time: "1:26.450", gap: "+0.340s" },
                        { code: "RUS", time: "1:26.510", gap: "+0.400s" },
                        { code: "ANT", time: "1:26.580", gap: "+0.470s" },
                        { code: "TSU", time: "1:26.690", gap: "+0.580s" },
                        { code: "ALO", time: "1:26.740", gap: "+0.630s" },
                        { code: "GAS", time: "1:26.810", gap: "+0.700s" },
                        { code: "OCO", time: "1:26.880", gap: "+0.770s" },
                        { code: "HAD", time: "1:26.940", gap: "+0.830s" },
                        { code: "COL", time: "1:27.010", gap: "+0.900s" },
                        { code: "STR", time: "1:27.080", gap: "+0.970s" },
                        { code: "BEA", time: "1:27.140", gap: "+1.030s" },
                        // Q1 ELIMINATION CUTOFF
                        { code: "LAW", time: "1:27.280", gap: "+1.170s", eliminated: true },
                        { code: "ALB", time: "1:27.350", gap: "+1.240s", eliminated: true },
                        { code: "SAI", time: "1:27.420", gap: "+1.310s", eliminated: true },
                        { code: "HUL", time: "1:27.560", gap: "+1.450s", eliminated: true },
                        { code: "BOR", time: "1:27.790", gap: "+1.680s", eliminated: true },
                      ].map((item, idx) => {
                        const d = getDriverOrFallback(item.code);
                        const t = getTeamOrFallback(d.teamId);
                        const isCutoff = idx === 15;
                        return (
                          <div key={item.code}>
                            {isCutoff && (
                              <div className="my-3 py-1.5 px-3 bg-red-950/40 border-y border-red-800/60 text-red-400 text-xs font-mono font-bold flex items-center justify-between">
                                <span>🚨 Q1 KNOCKOUT CUTOFF ZONE (P16 - P20 ELIMINATED)</span>
                                <span>Q1 Margin: +0.140s</span>
                              </div>
                            )}
                            <div
                              className={`grid grid-cols-[40px_1fr_140px] items-center p-3 text-sm transition-colors border-b border-hairline/60 ${
                                item.eliminated ? "bg-red-950/15 text-zinc-400" : "hover:bg-surface-soft"
                              }`}
                            >
                              <span className="tabular font-bold font-mono text-ink-muted">P{idx + 1}</span>
                              <div className="flex items-center gap-3">
                                <span className="h-5 w-1" style={{ background: t.color }} />
                                <div>
                                  <span className="font-bold uppercase text-white">{d.firstName} {d.lastName}</span>
                                  <span className="text-xs text-ink-muted ml-2">#{d.number} · {t.name}</span>
                                </div>
                              </div>
                              <div className="text-right font-mono">
                                <div className="font-bold text-white">{item.time}</div>
                                <div className="text-[10px] text-ink-muted">{item.gap}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {previousTab === "fp" && (
              <div className="space-y-4 font-mono text-sm">
                <div className="text-eyebrow text-ink-muted mb-2">// Free Practice 1 - 3 Pace Leaders</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-canvas p-4 border border-hairline">
                    <div className="text-[10px] text-ink-muted uppercase font-mono">FP1 Leader</div>
                    <div className="text-base font-bold text-white mt-1">L. Norris (1:28.112)</div>
                    <div className="text-xs text-ink-muted mt-1">Medium Compound (C2)</div>
                  </div>
                  <div className="bg-canvas p-4 border border-hairline">
                    <div className="text-[10px] text-ink-muted uppercase font-mono">FP2 Leader</div>
                    <div className="text-base font-bold text-white mt-1">O. Piastri (1:27.432)</div>
                    <div className="text-xs text-ink-muted mt-1">Soft Compound (C3)</div>
                  </div>
                  <div className="bg-canvas p-4 border border-hairline">
                    <div className="text-[10px] text-ink-muted uppercase font-mono">FP3 Leader</div>
                    <div className="text-base font-bold text-white mt-1">L. Norris (1:26.540)</div>
                    <div className="text-xs text-ink-muted mt-1">Qualifying Simulation Trim</div>
                  </div>
                </div>
              </div>
            )}

            {previousTab === "strategy" && (
              <div className="space-y-4">
                <div className="text-eyebrow text-ink-muted mb-2">// Top Driver Tyre Stint Sequences</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(racePrevious.tireStrategy || [
                    { driverId: "NOR", stints: ["M", "H"] },
                    { driverId: "PIA", stints: ["M", "H"] },
                    { driverId: "HAM", stints: ["S", "M", "H"] },
                  ]).map((stintItem: any, idx: number) => {
                    const d = getDriverOrFallback(stintItem.driverId);
                    return (
                      <div key={idx} className="bg-canvas p-4 border border-hairline flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold uppercase text-white">{d.firstName[0]}. {d.lastName}</div>
                          <div className="text-[10px] text-ink-muted uppercase">Stints: {stintItem.stints.join(" ➔ ")}</div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          {stintItem.stints.map((s: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className={`px-2 py-0.5 rounded-[2px] font-bold ${
                                s === "S"
                                  ? "bg-red-950 text-red-400 border border-red-800"
                                  : s === "M"
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : "bg-zinc-800 text-zinc-200 border border-zinc-600"
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
