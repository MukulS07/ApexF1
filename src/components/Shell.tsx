import { MStripe } from "./MStripe";

export function TopNav({ onEdit }: { onEdit: () => void }) {
  return (
    <>
      <nav className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline-strong text-white h-16 flex items-center px-6 sm:px-10">
        <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <span className="inline-flex items-center gap-[2px]" aria-hidden>
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-light)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-blue-dark)" }} />
              <span className="h-4 w-[3px]" style={{ background: "var(--m-red)" }} />
            </span>
            <span className="font-bold uppercase tracking-[0.15em] text-sm">The Pit Wall</span>
          </a>
          <div className="hidden md:flex items-center gap-10 text-eyebrow text-ink-muted">
            <a href="#next"      className="hover:text-white transition-colors">Next race</a>
            <a href="#standings" className="hover:text-white transition-colors">Standings</a>
            <a href="#calendar"  className="hover:text-white transition-colors">Calendar</a>
            <a href="#recap"     className="hover:text-white transition-colors">Recap</a>
            <a href="#driver"    className="hover:text-white transition-colors">Driver</a>
          </div>
          <button onClick={onEdit} className="text-eyebrow text-ink-muted hover:text-white transition-colors">Edit</button>
        </div>
      </nav>
      {/* Marquee ticker */}
      <div className="bg-canvas border-b border-hairline-strong overflow-hidden">
        <div className="marquee py-2 text-eyebrow text-ink-muted">
          {Array.from({ length: 2 }).flatMap((_, k) => [
            <span key={`a${k}`}>▸ Season 2026 live</span>,
            <span key={`b${k}`} className="text-white">▸ New engine formula · 50% electric</span>,
            <span key={`c${k}`}>▸ Cadillac joins the grid</span>,
            <span key={`d${k}`} className="text-white">▸ 24 rounds · 6 sprints</span>,
            <span key={`e${k}`}>▸ Unofficial fan project</span>,
          ])}
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline-strong">
      <MStripe />
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-20 text-body text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-eyebrow text-white mb-4">The Pit Wall</div>
            <p className="leading-relaxed">Your ambient F1 2026 dashboard. No accounts. No ads. No subscriptions. Just Sunday.</p>
          </div>
          <div>
            <div className="text-eyebrow text-white mb-4">Data</div>
            <p className="leading-relaxed">Timings and standings from Jolpica F1. Live conditions from OpenF1. Gently cached, always fresh.</p>
          </div>
          <div>
            <div className="text-eyebrow text-white mb-4">The build</div>
            <p className="leading-relaxed">A single page you leave open all season. Installs as a PWA on any device.</p>
          </div>
          <div>
            <div className="text-eyebrow text-white mb-4">Support</div>
            <p className="leading-relaxed">Tip jar coming soon — P10, P3, or P1. Whatever feels right.</p>
          </div>
        </div>
        <div className="mt-16 pt-6 border-t border-hairline text-xs uppercase tracking-wider text-ink-muted">
          Unofficial fan project. Not affiliated with Formula 1, the FIA, or any team. Driver and team names used for identification only.
        </div>
      </div>
    </footer>
  );
}
