import { useEffect, useRef } from "react";
import { getDriverOrFallback, getTeamOrFallback, nextRace } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { useLiveWeatherAndStints } from "@/hooks/useF1Data";
import { systemLogger } from "@/lib/system-logger";

export function TrackTelemetry({ profile }: { profile: Profile }) {
  const driver = getDriverOrFallback(profile.favoriteDriverId);
  const team = driver ? getTeamOrFallback(driver.teamId) : undefined;
  const color = team?.color ?? "#1c69d4";
  const race = nextRace();
  const { weather } = useLiveWeatherAndStints();

  const pathRef = useRef<SVGPathElement | null>(null);

  // Refs for direct DOM updates
  const speedRef = useRef<HTMLDivElement | null>(null);
  const gearRef = useRef<HTMLDivElement | null>(null);
  const rpmRef = useRef<HTMLDivElement | null>(null);
  const drsRef = useRef<HTMLDivElement | null>(null);
  const throttleBarRef = useRef<HTMLDivElement | null>(null);
  const throttleValRef = useRef<HTMLDivElement | null>(null);
  const brakeBarRef = useRef<HTMLDivElement | null>(null);
  const brakeValRef = useRef<HTMLDivElement | null>(null);

  // Refs for car dot circles
  const dotOutlineRef = useRef<SVGCircleElement | null>(null);
  const dotFillRef = useRef<SVGCircleElement | null>(null);
  const dotCoreRef = useRef<SVGCircleElement | null>(null);

  // Sector elements
  const sectorLabelRef = useRef<HTMLSpanElement | null>(null);
  const sectorBoxesRef = useRef<(HTMLDivElement | null)[]>([]);

  // Tyre temperature bars
  const tyreTempRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tyreValRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    systemLogger.log(`Track telemetry feed initialized for ${race.name}`, "success");
    systemLogger.log(`Starting telemetry simulation loop (90s interval)`, "info");
  }, [race.name]);

  useEffect(() => {
    if (weather) {
      systemLogger.log(
        `Weather synchronized: Air ${weather.air_temperature}°C / Track ${weather.track_temperature}°C, ${weather.rainfall ? "RAIN DETECTED" : "DRY TRACK"}`,
        "info",
      );
    }
  }, [weather]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      if (speedRef.current) speedRef.current.innerText = "234";
      if (gearRef.current) gearRef.current.innerText = "6";
      if (rpmRef.current) rpmRef.current.innerText = "10,230";
      return;
    }

    const LAP_MS = 90_000; // 90s "lap"
    let start = 0;
    let rafId: number | null = null;

    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % LAP_MS) / LAP_MS;

      // 1. Calculate derived values
      const speedVal = Math.round(120 + 200 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6 - 0.4)));
      const throttleVal = Math.max(
        0,
        Math.min(100, Math.round(60 + 45 * Math.sin(t * Math.PI * 6))),
      );
      const brakeVal = Math.max(
        0,
        Math.min(100, Math.round(30 - 60 * Math.sin(t * Math.PI * 6 - 0.6))),
      );
      const gearVal = Math.max(1, Math.min(8, 1 + Math.round(((speedVal - 80) / 260) * 7)));
      const drsVal = throttleVal > 85 && brakeVal < 5;
      const rpmVal = 6000 + Math.round((speedVal / 340) * 6500);
      const sectorVal = t < 0.34 ? 1 : t < 0.68 ? 2 : 3;

      // 2. Perform Direct DOM Updates
      if (speedRef.current) speedRef.current.innerText = speedVal.toString();
      if (gearRef.current) gearRef.current.innerText = gearVal.toString();
      if (rpmRef.current) rpmRef.current.innerText = rpmVal.toLocaleString();
      if (drsRef.current) {
        drsRef.current.innerText = drsVal ? "OPEN" : "CLOSED";
        drsRef.current.style.color = drsVal ? color : "var(--ink-muted)";
      }
      if (throttleBarRef.current) throttleBarRef.current.style.width = `${throttleVal}%`;
      if (throttleValRef.current) throttleValRef.current.innerText = `${throttleVal}%`;
      if (brakeBarRef.current) brakeBarRef.current.style.width = `${brakeVal}%`;
      if (brakeValRef.current) brakeValRef.current.innerText = `${brakeVal}%`;

      // Update circuit dot position
      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(len * t);
        if (dotOutlineRef.current) {
          dotOutlineRef.current.setAttribute("cx", pt.x.toString());
          dotOutlineRef.current.setAttribute("cy", pt.y.toString());
        }
        if (dotFillRef.current) {
          dotFillRef.current.setAttribute("cx", pt.x.toString());
          dotFillRef.current.setAttribute("cy", pt.y.toString());
        }
        if (dotCoreRef.current) {
          dotCoreRef.current.setAttribute("cx", pt.x.toString());
          dotCoreRef.current.setAttribute("cy", pt.y.toString());
        }
      }

      // Update sector label
      if (sectorLabelRef.current) {
        sectorLabelRef.current.innerText = `LAP · SECTOR ${sectorVal}`;
      }

      // Highlight active sector cards
      sectorBoxesRef.current.forEach((box, i) => {
        if (box) {
          const active = sectorVal === i + 1;
          box.style.opacity = active ? "1" : "0.6";
          box.style.borderColor = active ? color : "var(--hairline)";
        }
      });

      // Update tyre temps with slight noise animation
      tyreTempRefs.current.forEach((tempBar, i) => {
        if (tempBar) {
          const noise = Math.sin(t * Math.PI * 12 + i) * 2;
          const temp = Math.round(92 + 8 * Math.sin(i + i * 1.7) + noise);
          if (tyreValRefs.current[i]) {
            tyreValRefs.current[i]!.innerText = `${temp}°C`;
          }
          tempBar.style.background = `color-mix(in oklab, ${color} ${Math.min(100, temp)}%, #333)`;
        }
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [color]);

  const sectorTimes = ["23.482", "27.914", "24.106"];

  return (
    <section className="bg-canvas border-t border-hairline-strong relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(60% 60% at 20% 100%, ${color}, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
          <div>
            <div className="text-eyebrow mb-4" style={{ color }}>
              // Track telemetry
            </div>
            <h2 className="text-display text-white">
              Live from
              <br />
              the car.
            </h2>
            <p className="text-body text-sm mt-4 max-w-md">
              Simulated lap of {race.circuit} in {driver?.lastName ?? "your driver"}'s{" "}
              <span style={{ color }}>{team?.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-2 w-2">
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: color, opacity: 0.7 }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: color }}
              />
            </span>
            <span ref={sectorLabelRef} className="text-eyebrow text-white">
              LAP · SECTOR 1
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-px bg-hairline-strong border border-hairline-strong">
          {/* Circuit map */}
          <div className="bg-surface-card p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-eyebrow text-ink-muted">Circuit trace</div>
              <div className="flex items-center gap-3 text-xs font-mono">
                {weather ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400">
                      LIVE // Track {Math.round(weather.track_temperature)}°C // Air{" "}
                      {Math.round(weather.air_temperature)}°C
                    </span>
                  </>
                ) : (
                  <span className="text-ink-muted">{race.circuit}</span>
                )}
              </div>
            </div>
            <svg viewBox="0 0 400 240" className="w-full h-56">
              <path
                d="M40,180 C40,60 120,40 200,60 C280,80 340,40 360,90 C380,140 300,160 260,140 C220,120 200,200 140,200 C80,200 40,220 40,180 Z"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                ref={pathRef}
                d="M40,180 C40,60 120,40 200,60 C280,80 340,40 360,90 C380,140 300,160 260,140 C220,120 200,200 140,200 C80,200 40,220 40,180 Z"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="4 6"
                opacity="0.6"
              />
              {/* Statically positioned sector markers */}
              <circle cx={243} cy={68} r={3} fill="white" opacity={0.5} />
              <circle cx={213} cy={172} r={3} fill="white" opacity={0.5} />

              {/* Car dot */}
              <circle ref={dotOutlineRef} cx={40} cy={180} r={10} fill={color} opacity={0.25} />
              <circle ref={dotFillRef} cx={40} cy={180} r={5} fill={color} />
              <circle ref={dotCoreRef} cx={40} cy={180} r={2} fill="white" />
            </svg>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {sectorTimes.map((s, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    sectorBoxesRef.current[i] = el;
                  }}
                  className="border-l pl-3 transition-all duration-150 opacity-60"
                  style={{ borderColor: "var(--hairline)" }}
                >
                  <div className="text-eyebrow text-ink-muted">S{i + 1}</div>
                  <div className="tabular text-lg text-white mt-1">{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gauges */}
          <div className="bg-surface-card p-6 sm:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-eyebrow text-ink-muted">Speed</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <div ref={speedRef} className="tabular text-6xl font-bold text-white">
                    0
                  </div>
                  <div className="text-xs text-ink-muted">KM/H</div>
                </div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">Gear</div>
                <div ref={gearRef} className="tabular text-6xl font-bold mt-2" style={{ color }}>
                  1
                </div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">RPM</div>
                <div ref={rpmRef} className="tabular text-2xl text-white mt-2">
                  6,000
                </div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">DRS</div>
                <div
                  ref={drsRef}
                  className="tabular text-2xl mt-2 font-bold transition-colors"
                  style={{ color: "var(--ink-muted)" }}
                >
                  CLOSED
                </div>
              </div>
            </div>

            {/* Throttle Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-eyebrow text-ink-muted">Throttle</div>
                <div ref={throttleValRef} className="tabular text-xs text-white">
                  0%
                </div>
              </div>
              <div className="h-2 bg-hairline-strong overflow-hidden">
                <div
                  ref={throttleBarRef}
                  className="h-full transition-[width] duration-75 ease-out"
                  style={{ width: "0%", background: color }}
                />
              </div>
            </div>

            {/* Brake Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-eyebrow text-ink-muted">Brake</div>
                <div ref={brakeValRef} className="tabular text-xs text-white">
                  0%
                </div>
              </div>
              <div className="h-2 bg-hairline-strong overflow-hidden">
                <div
                  ref={brakeBarRef}
                  className="h-full transition-[width] duration-75 ease-out"
                  style={{ width: "0%", background: "var(--m-red)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              {(["FL", "FR", "RL", "RR"] as const).map((t, i) => (
                <div key={t} className="border border-hairline p-2">
                  <div className="text-[10px] uppercase tracking-widest text-ink-muted">
                    {t} tyre
                  </div>
                  <div
                    ref={(el) => {
                      tyreValRefs.current[i] = el;
                    }}
                    className="tabular text-sm text-white mt-1"
                  >
                    92°C
                  </div>
                  <div
                    ref={(el) => {
                      tyreTempRefs.current[i] = el;
                    }}
                    className="h-[3px] mt-2 transition-all duration-150"
                    style={{ background: "#333" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
