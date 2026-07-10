export function TopNav({ onEdit }: { onEdit: () => void }) {
  return (
    <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-md text-white/90 h-11 flex items-center px-6 sm:px-10 text-xs tracking-tight">
      <div className="mx-auto max-w-6xl w-full flex items-center justify-between">
        <a href="#" className="font-semibold flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--team-hex, #0066cc)" }} />
          The Pit Wall
        </a>
        <div className="hidden sm:flex items-center gap-8 text-white/60">
          <a href="#next"      className="hover:text-white transition">Next race</a>
          <a href="#standings" className="hover:text-white transition">Standings</a>
          <a href="#calendar"  className="hover:text-white transition">Calendar</a>
          <a href="#recap"     className="hover:text-white transition">Recap</a>
          <a href="#driver"    className="hover:text-white transition">Your driver</a>
        </div>
        <button onClick={onEdit} className="text-white/60 hover:text-white transition">Edit</button>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="tile-parchment border-t border-hairline">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-16 text-sm text-ink-muted">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-ink font-semibold mb-3">The Pit Wall</div>
            <p className="leading-relaxed">Your ambient F1 2026 dashboard. No accounts. No ads. No subscriptions. Just Sunday.</p>
          </div>
          <div>
            <div className="text-ink font-semibold mb-3">Data</div>
            <p className="leading-relaxed">Timings and standings from Jolpica F1. Live conditions from OpenF1. Everything cached and gently refreshed.</p>
          </div>
          <div>
            <div className="text-ink font-semibold mb-3">The build</div>
            <p className="leading-relaxed">A single page you can leave open all season. Installs as a PWA on any device.</p>
          </div>
          <div>
            <div className="text-ink font-semibold mb-3">Support</div>
            <p className="leading-relaxed">Tip jar coming soon — P10, P3, or P1. Whatever feels right.</p>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-hairline text-xs">
          Unofficial fan project. Not affiliated with Formula 1, the FIA, or any team. Driver and team names used for identification only.
        </div>
      </div>
    </footer>
  );
}
