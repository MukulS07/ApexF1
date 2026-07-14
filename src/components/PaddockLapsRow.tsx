import { useEffect, useRef, useMemo } from "react";
import { getDriverOrFallback, getTeamOrFallback, driversStandings } from "@/lib/f1-data";
import { useDriverStandings } from "@/hooks/useF1Data";
import type { Profile } from "@/hooks/useProfile";

export function PaddockLapsRow({ profile }: { profile: Profile }) {
  const driver = getDriverOrFallback(profile.favoriteDriverId);
  const team = driver ? getTeamOrFallback(driver.teamId) : undefined;
  const color = team?.color ?? "#1c69d4";

  const { data: realTimeDrivers = [] } = useDriverStandings();
  const currentDrivers = realTimeDrivers.length > 0 ? realTimeDrivers : driversStandings;

  // Resolve top 8 drivers + the user's favorite driver if not in top 8
  const topDrivers = currentDrivers.slice(0, 8);
  const favDriverId = profile.favoriteDriverId;
  const hasFav = topDrivers.some((d: { driverId: string }) => d.driverId === favDriverId);

  const displayDrivers = useMemo(() => {
    const arr = [...topDrivers];
    if (!hasFav) {
      const favEntry = currentDrivers.find((d: { driverId: string }) => d.driverId === favDriverId);
      if (favEntry) {
        arr.push(favEntry);
      }
    }
    return arr;
  }, [topDrivers, hasFav, currentDrivers, favDriverId]);

  const paddockPathRef = useRef<SVGPathElement | null>(null);
  const paddockDotsRef = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const LAP_MS = 90_000; // 90s "lap"
    let start = 0;
    let rafId: number | null = null;

    const loop = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % LAP_MS) / LAP_MS;

      if (paddockPathRef.current) {
        const len = paddockPathRef.current.getTotalLength();

        displayDrivers.forEach((entry, index) => {
          const d = getDriverOrFallback(entry.driverId);
          // Deterministic speed multiplier and offset based on driver number
          const speedMult = 0.95 + ((d.number * 17) % 15) * 0.01; // between 0.95 and 1.10
          const offset = ((d.number * 23) % 100) / 100; // between 0.0 and 1.0

          const prog = (t * speedMult + offset) % 1.0;
          const pt = paddockPathRef.current!.getPointAtLength(len * prog);
          const el = paddockDotsRef.current[index];
          if (el) {
            el.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
          }
        });
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [displayDrivers]);

  return (
    <div className="bg-canvas border-b border-hairline-strong py-6 sm:py-8">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <div className="bg-surface-card border border-hairline-strong p-6 sm:p-8 relative rounded-[2px]">
          <div className="flex items-center justify-between mb-6">
            <div className="text-eyebrow text-white font-bold">
              ON{" "}
              <span className="italic font-serif normal-case tracking-normal text-red-500">
                TRACK
              </span>
            </div>
            <div className="flex items-center gap-2 text-eyebrow text-[#cfa05b] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#cfa05b] animate-ping" />
              <span>PADDOCK LAPS</span>
            </div>
          </div>

          <div className="relative overflow-hidden w-full bg-canvas/40 py-4 border-y border-hairline-strong">
            <svg viewBox="0 0 800 80" className="w-full h-20">
              {/* Curve path */}
              <path
                ref={paddockPathRef}
                d="M 50,45 C 250,15 550,65 750,45"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50,45 C 250,15 550,65 750,45"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeLinecap="round"
              />

              {/* Curve Labels */}
              <text
                x="50"
                y="68"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                S/F
              </text>
              <text
                x="400"
                y="24"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                T1
              </text>
              <text
                x="750"
                y="68"
                fill="rgba(255,255,255,0.3)"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                PIT
              </text>

              {/* Dynamic Driver Pills */}
              {displayDrivers.map((entry, index) => {
                const d = getDriverOrFallback(entry.driverId);
                const t = getTeamOrFallback(d.teamId);
                const isFav = d.id === favDriverId;

                const label = isFav ? "YOURS" : d.id;
                const dotColor = isFav ? color : t.color;

                return (
                  <g
                    key={d.id}
                    ref={(el) => {
                      paddockDotsRef.current[index] = el;
                    }}
                    className="transition-transform duration-100 ease-out"
                  >
                    <rect
                      x={isFav ? "-20" : "-16"}
                      y="-8"
                      width={isFav ? "40" : "32"}
                      height="16"
                      rx="8"
                      fill="rgba(9,9,9,0.95)"
                      stroke={dotColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="3"
                      fill={dotColor}
                      fontSize="8"
                      fontWeight="extrabold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dynamic Legend */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 text-[10px] uppercase font-bold tracking-widest font-sans">
            {displayDrivers.map((entry) => {
              const d = getDriverOrFallback(entry.driverId);
              const t = getTeamOrFallback(d.teamId);
              const isFav = d.id === favDriverId;
              const dotColor = isFav ? color : t.color;

              if (isFav) {
                return (
                  <div key={d.id} className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-mono" style={{ color: dotColor }}>
                      YOURS
                    </span>
                    <span className="text-ink-muted">
                      - {d.firstName[0]}. {d.lastName}
                    </span>
                  </div>
                );
              }

              return (
                <div key={d.id} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span className="text-white font-mono" style={{ color: dotColor }}>
                    {d.id}
                  </span>
                  <span className="text-ink-muted">
                    - {d.firstName[0]}. {d.lastName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
