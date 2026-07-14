import { useEffect, useState } from "react";
import { calendar2026 } from "@/lib/f1-data";
import { useF1Schedule, useSeasonWinners } from "@/hooks/useF1Data";
import { MStripe } from "./MStripe";

const COUNTRY_CODES: Record<string, string> = {
  Australia: "AU",
  China: "CN",
  Japan: "JP",
  Bahrain: "BH",
  "Saudi Arabia": "SA",
  USA: "US",
  Italy: "IT",
  Monaco: "MC",
  Spain: "ES",
  Canada: "CA",
  Austria: "AT",
  UK: "GB",
  Hungary: "HU",
  Belgium: "BE",
  Netherlands: "NL",
  Azerbaijan: "AZ",
  Singapore: "SG",
  Mexico: "MX",
  Brazil: "BR",
  Qatar: "QA",
  UAE: "AE",
};

export function SeasonCalendar() {
  const now = Date.now();
  const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" });

  const { data: realTimeSchedule = [] } = useF1Schedule();
  const { data: seasonWinners = {} } = useSeasonWinners();

  const currentCalendar = realTimeSchedule.length > 0 ? realTimeSchedule : calendar2026;
  const nextRound = currentCalendar.find((x) => new Date(x.dateISO).getTime() > now)?.round;

  const totalRounds = currentCalendar.length;
  const completedRounds = currentCalendar.filter(
    (r) => new Date(r.dateISO).getTime() < now || seasonWinners[r.round],
  ).length;
  const year = currentCalendar[0] ? new Date(currentCalendar[0].dateISO).getFullYear() : 2026;

  return (
    <section className="bg-surface-soft border-t border-hairline-strong text-white">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 py-20 sm:py-24">
        {/* Custom scrollbar to match dark dashboard theme */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .calendar-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .calendar-scrollbar::-webkit-scrollbar-track {
            background: var(--canvas, #090909);
            border-top: 1px solid var(--hairline-strong, #3a3a3a);
          }
          .calendar-scrollbar::-webkit-scrollbar-thumb {
            background: var(--hairline-strong, #3a3a3a);
            border-radius: 3px;
          }
          .calendar-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--ink-muted, #6e675f);
          }
        `,
          }}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="text-eyebrow text-ink-muted mb-4">// The {year} season</div>
            <h2 className="text-display text-white">
              Season{" "}
              <span
                className="italic font-serif normal-case tracking-normal animate-pulse-slow"
                style={{ color: "var(--team-hex, #ff2a2a)" }}
              >
                Calendar
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <MStripe className="!w-24 hidden md:block" />
            <div className="text-eyebrow text-ink-muted">
              {totalRounds} ROUNDS · {year} · {completedRounds} DONE
            </div>
          </div>
        </div>

        {/* Calendar Horizontal Grid */}
        <div className="border border-hairline-strong bg-canvas overflow-x-auto calendar-scrollbar select-none rounded-[2px]">
          <div className="flex divide-x divide-hairline-strong min-w-max">
            {currentCalendar.map((r) => {
              const d = new Date(r.dateISO);
              const isCompleted = d.getTime() < now || !!seasonWinners[r.round];
              const isNext = r.round === nextRound;
              const roundWinner = seasonWinners[r.round];

              const formattedDate = dateFmt.format(d).toUpperCase();
              const countryCode = COUNTRY_CODES[r.country] || r.country.slice(0, 2).toUpperCase();

              return (
                <div
                  key={r.round}
                  className={`w-[140px] flex-shrink-0 flex flex-col justify-between h-[280px] p-6 relative transition-all duration-300 speed-line ${
                    isNext
                      ? "bg-surface-card border-t border-[var(--team-hex)]"
                      : "hover:bg-surface-soft/60"
                  }`}
                  style={{
                    borderTopColor: isNext ? "var(--team-hex)" : undefined,
                  }}
                >
                  {/* Top Progress Highlight Line for Completed Races */}
                  {isCompleted && !isNext && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: "var(--team-hex, #ff2a2a)" }}
                    />
                  )}

                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <span className="tabular text-[10px] font-mono text-ink-muted font-bold">
                      R{r.round.toString().padStart(2, "0")}
                    </span>
                    {isCompleted && (
                      <span
                        className="h-1.5 w-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: roundWinner?.teamColor || "#cfa05b" }}
                        title={roundWinner ? `Winner: ${roundWinner.lastName}` : "Completed"}
                      />
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="mt-4 flex-1 flex flex-col justify-center">
                    <div className="text-3xl font-extrabold text-white tracking-tight uppercase leading-none font-sans group-hover:text-[var(--team-hex)] transition-colors">
                      {countryCode}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-ink-muted mt-1.5 leading-none font-bold">
                      {r.country}
                    </div>
                    <div className="text-base font-serif italic text-white mt-3.5 leading-tight truncate">
                      {r.city}
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-auto pt-4 border-t border-hairline">
                    <div className="tabular text-[10px] font-bold text-white uppercase tracking-wider">
                      {formattedDate}
                    </div>
                    {roundWinner ? (
                      <div
                        className="text-[10px] font-mono mt-1 truncate font-semibold"
                        style={{ color: "#cfa05b" }}
                        title={`Winner: ${roundWinner.lastName}`}
                      >
                        ★ {roundWinner.lastName}
                      </div>
                    ) : isNext ? (
                      <div
                        className="text-[9px] uppercase tracking-[0.2em] mt-1 font-bold animate-pulse"
                        style={{ color: "var(--team-hex, #ff2a2a)" }}
                      >
                        ▸ Up next
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
