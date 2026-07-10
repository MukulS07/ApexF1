import { calendar2026 } from "@/lib/f1-data";
import { MStripe } from "./MStripe";

export function SeasonCalendar() {
  const now = Date.now();
  const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const nextRound = calendar2026.find((x) => new Date(x.dateISO).getTime() > now)?.round;

  return (
    <section className="bg-surface-soft border-t border-hairline-strong">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-24 sm:py-32">
        <div className="mb-16 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="text-eyebrow text-ink-muted mb-4">// The 2026 season</div>
            <h2 className="text-display text-white">Twenty-four<br />Sundays.</h2>
          </div>
          <MStripe className="!w-32" />
        </div>

        <div className="border border-hairline-strong">
          {calendar2026.map((r, idx) => {
            const d = new Date(r.dateISO);
            const past = d.getTime() < now;
            const isNext = r.round === nextRound;
            return (
              <div
                key={r.round}
                className={`group grid grid-cols-[60px_1fr_auto] sm:grid-cols-[70px_1fr_1fr_200px] gap-4 items-center px-5 sm:px-8 py-5 speed-line transition-colors ${
                  idx > 0 ? "border-t border-hairline-strong" : ""
                } ${isNext ? "bg-surface-card" : "hover:bg-surface-card/60"}`}
              >
                <div className="flex items-center gap-3">
                  {isNext && <span className="h-6 w-[3px]" style={{ background: "var(--team-hex)" }} />}
                  <span className={`tabular text-2xl font-bold ${past && !isNext ? "text-ink-muted" : "text-white"}`}>
                    {r.round.toString().padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <div className={`text-base font-bold uppercase tracking-tight ${past && !isNext ? "text-ink-muted line-through decoration-1" : "text-white"}`}>
                    {r.name}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-ink-muted mt-1">{r.circuit}</div>
                </div>
                <div className="hidden sm:block text-xs uppercase tracking-wider text-ink-muted">
                  {r.city}, {r.country}
                </div>
                <div className="text-right">
                  <div className={`tabular text-base font-bold ${past && !isNext ? "text-ink-muted" : "text-white"}`}>
                    {dateFmt.format(d)}
                  </div>
                  {isNext ? (
                    <div className="text-[10px] uppercase tracking-[0.25em] mt-1 font-bold" style={{ color: "var(--team-hex)" }}>
                      ▸ Up next
                    </div>
                  ) : r.sprint ? (
                    <div className="text-[10px] uppercase tracking-[0.25em] mt-1 text-ink-muted">Sprint</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
