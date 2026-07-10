import { calendar2026 } from "@/lib/f1-data";

export function SeasonCalendar() {
  const now = Date.now();
  const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

  return (
    <section className="tile-parchment">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-20 sm:py-28">
        <div className="mb-12">
          <div className="text-sm text-ink-muted uppercase tracking-widest mb-3">The 2026 season</div>
          <h2 className="text-display">Twenty-four Sundays.</h2>
        </div>

        <div className="grid gap-px bg-hairline rounded-2xl overflow-hidden">
          {calendar2026.map((r) => {
            const d = new Date(r.dateISO);
            const past = d.getTime() < now;
            const isNext = !past && calendar2026.find((x) => new Date(x.dateISO).getTime() > now)?.round === r.round;
            return (
              <div
                key={r.round}
                className="grid grid-cols-[60px_1fr_auto] sm:grid-cols-[60px_1fr_1fr_180px] gap-4 items-center bg-background px-5 sm:px-8 py-5"
                style={isNext ? { background: "var(--tile-dark)", color: "white" } : undefined}
              >
                <span className={`tabular text-2xl font-semibold ${past && !isNext ? "text-ink-muted" : ""}`}>
                  {r.round.toString().padStart(2, "0")}
                </span>
                <div>
                  <div className={`text-lg font-semibold tracking-tight ${past && !isNext ? "text-ink-muted line-through decoration-1" : ""}`}>
                    {r.name}
                  </div>
                  <div className={`text-sm ${isNext ? "text-white/60" : "text-ink-muted"}`}>{r.circuit}</div>
                </div>
                <div className={`hidden sm:block text-sm ${isNext ? "text-white/60" : "text-ink-muted"}`}>
                  {r.city}, {r.country}
                </div>
                <div className="text-right">
                  <div className={`tabular text-base font-semibold ${isNext ? "" : past ? "text-ink-muted" : ""}`}>
                    {dateFmt.format(d)}
                  </div>
                  {r.sprint && (
                    <div className={`text-[10px] uppercase tracking-widest mt-1 ${isNext ? "text-white/60" : "text-ink-muted"}`}>
                      Sprint weekend
                    </div>
                  )}
                  {isNext && (
                    <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--team-hex, white)" }}>
                      Up next
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
