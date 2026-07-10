import { useEffect, useRef, useState } from "react";
import { getDriver, getTeam, nextRace } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";

// A simulated live telemetry board — driven by rAF, painted in your team color.
// (No live feed wired; values are a smooth pseudo-lap loop so it always feels alive.)
export function TrackTelemetry({ profile }: { profile: Profile }) {
  const driver = getDriver(profile.favoriteDriverId);
  const team = driver ? getTeam(driver.teamId) : undefined;
  const color = team?.color ?? "#1c69d4";
  const race = nextRace();

  const [t, setT] = useState(0); // 0..1 lap progress
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);
  const reduced = useRef<boolean>(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) { setT(0.42); return; }
    const LAP_MS = 90_000; // 90s "lap"
    const loop = (ts: number) => {
      if (!start.current) start.current = ts;
      const p = ((ts - start.current) % LAP_MS) / LAP_MS;
      setT(p);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  // Derived values — a stylised speed/throttle/brake curve across a lap.
  const speed = Math.round(120 + 200 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6 - 0.4)));
  const throttle = Math.max(0, Math.min(100, Math.round(60 + 45 * Math.sin(t * Math.PI * 6))));
  const brake = Math.max(0, Math.min(100, Math.round(30 - 60 * Math.sin(t * Math.PI * 6 - 0.6))));
  const gear = Math.max(1, Math.min(8, 1 + Math.round(((speed - 80) / 260) * 7)));
  const drs = throttle > 85 && brake < 5;
  const rpm = 6000 + Math.round((speed / 340) * 6500);

  // A stylised circuit path (not the real track) — dot rides along it.
  const pathRef = useRef<SVGPathElement | null>(null);
  const [dot, setDot] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    const p = pathRef.current.getPointAtLength(len * t);
    setDot({ x: p.x, y: p.y });
  }, [t]);

  const sector = t < 0.34 ? 1 : t < 0.68 ? 2 : 3;
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
            <div className="text-eyebrow mb-4" style={{ color }}>// Track telemetry</div>
            <h2 className="text-display text-white">Live from<br />the car.</h2>
            <p className="text-body text-sm mt-4 max-w-md">
              Simulated lap of {race.circuit} in {driver?.lastName ?? "your driver"}'s{" "}
              <span style={{ color }}>{team?.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: color, opacity: 0.7 }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
            </span>
            <span className="text-eyebrow text-white">LAP · SECTOR {sector}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-px bg-hairline-strong border border-hairline-strong">
          {/* Circuit map */}
          <div className="bg-surface-card p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-eyebrow text-ink-muted">Circuit trace</div>
              <div className="tabular text-xs text-ink-muted">{race.circuit}</div>
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
              {/* Sector markers */}
              {[0.34, 0.68].map((p, i) => {
                const el = pathRef.current;
                if (!el) return null;
                const pt = el.getPointAtLength(el.getTotalLength() * p);
                return <circle key={i} cx={pt.x} cy={pt.y} r={3} fill="white" opacity={0.5} />;
              })}
              {/* Car dot */}
              <circle cx={dot.x} cy={dot.y} r={10} fill={color} opacity={0.25} />
              <circle cx={dot.x} cy={dot.y} r={5} fill={color} />
              <circle cx={dot.x} cy={dot.y} r={2} fill="white" />
            </svg>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {sectorTimes.map((s, i) => (
                <div key={i} className={`border-l pl-3 ${sector === i + 1 ? "" : "opacity-60"}`}
                     style={{ borderColor: sector === i + 1 ? color : "var(--hairline)" }}>
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
                  <div className="tabular text-6xl font-bold text-white">{speed}</div>
                  <div className="text-xs text-ink-muted">KM/H</div>
                </div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">Gear</div>
                <div className="tabular text-6xl font-bold mt-2" style={{ color }}>{gear}</div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">RPM</div>
                <div className="tabular text-2xl text-white mt-2">{rpm.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-eyebrow text-ink-muted">DRS</div>
                <div
                  className="tabular text-2xl mt-2 font-bold transition-colors"
                  style={{ color: drs ? color : "var(--ink-muted)" }}
                >
                  {drs ? "OPEN" : "CLOSED"}
                </div>
              </div>
            </div>

            <Bar label="Throttle" value={throttle} color={color} />
            <Bar label="Brake"    value={brake}    color="var(--m-red)" />

            <div className="grid grid-cols-4 gap-2 pt-2">
              {(["FL", "FR", "RL", "RR"] as const).map((t, i) => {
                const temp = 92 + Math.round(8 * Math.sin(i + i * 1.7));
                return (
                  <div key={t} className="border border-hairline p-2">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted">{t} tyre</div>
                    <div className="tabular text-sm text-white mt-1">{temp}°C</div>
                    <div className="h-[3px] mt-2" style={{ background: `color-mix(in oklab, ${color} ${Math.min(100, temp)}%, #333)` }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-eyebrow text-ink-muted">{label}</div>
        <div className="tabular text-xs text-white">{value}%</div>
      </div>
      <div className="h-2 bg-hairline-strong overflow-hidden">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
