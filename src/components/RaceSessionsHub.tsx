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
  Sparkles,
} from "lucide-react";
import { getDriverOrFallback, getTeamOrFallback, nextRace, lastRace } from "@/lib/f1-data";
import { useF1Schedule, useLastRaceResults } from "@/hooks/useF1Data";
import type { Profile } from "@/hooks/useProfile";

type ViewMode = "upcoming" | "previous";
type UpcomingSessionId = "fp1" | "fp2" | "fp3" | "qualifying" | "race";
type PreviousSessionId = "fp" | "qualifying" | "race" | "strategy";

export function RaceSessionsHub({ profile }: { profile?: Profile }) {
  const [mode, setMode] = useState<ViewMode>("upcoming");
  const [upcomingTab, setUpcomingTab] = useState<UpcomingSessionId>("fp1");
  const [previousTab, setPreviousTab] = useState<PreviousSessionId>("race");

  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode);
    systemLogger.log(
      `Race session hub mode toggled to: ${newMode === "upcoming" ? "UPCOMING SESSIONS" : "PREVIOUS SESSION DATA"}`,
      "info",
    );
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-canvas p-5 border border-hairline">
                  <div className="text-eyebrow text-emerald-400 mb-2">// Q3 Pole Position</div>
                  <div className="text-2xl font-bold text-white font-mono">{racePrevious.poleTime || "1:25.819"}</div>
                  <div className="text-sm font-bold text-white mt-2 uppercase">{poleDriver.firstName} {poleDriver.lastName}</div>
                  <div className="text-xs text-ink-muted mt-0.5">McLaren F1 Team</div>
                </div>
                <div className="bg-canvas p-5 border border-hairline">
                  <div className="text-eyebrow text-amber-400 mb-2">// Q2 Cut-off Delta</div>
                  <div className="text-2xl font-bold text-white font-mono">+0.084s</div>
                  <div className="text-sm font-bold text-white mt-2 uppercase">Q2 Knockout Margin</div>
                  <div className="text-xs text-ink-muted mt-0.5">Top 10 separated by 0.412s</div>
                </div>
                <div className="bg-canvas p-5 border border-hairline">
                  <div className="text-eyebrow text-sky-400 mb-2">// Q1 Session Track Speed</div>
                  <div className="text-2xl font-bold text-white font-mono">328.4 km/h</div>
                  <div className="text-sm font-bold text-white mt-2 uppercase">Speed Trap Record</div>
                  <div className="text-xs text-ink-muted mt-0.5">Main Straight Apex</div>
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
