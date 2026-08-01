# Changelog

All notable changes to the **ApexF1 Dashboard** project will be documented in this file.

---

## [2026-08-01] - Telemetry Hub & Session Control

### Added
- **🏎 Race Weekend Session Control Hub (`RaceSessionsHub`)**:
  - Implemented a prominent, accessible toggle switch between **Upcoming Race Sessions** (FP1–FP3, Qualifying, GP specs, rain forecasts, tyre compounds) and **Previous Race Session Data**.
  - Added **Interactive Q1, Q2, and Q3 Expandable Dropdown Accordion Panels**: Clicking on Q1, Q2, or Q3 opens a detailed session classification dropdown showing driver lap times, gaps, sector splits, and knockout zone indicators.
- **📡 Real-time User Interaction Telemetry Logger**:
  - Wired live `systemLogger` events to stream telemetry logs to the bottom HUD on every website interaction (session toggles, standings tab switches, driver profile changes, super licence card exports, AI chatbot queries).

### Fixed
- **📊 2026 Driver & Constructor Standings Synchronization**:
  - Fixed out-of-order driver points and aligned all 22 drivers across the 2026 season grid.
  - Synchronized driver points mathematically with `constructorsStandings` totals and updated the `lastRace` snapshot to Round 12: British GP.

---

## [2026-07-14]

### Added
- **🚦 Interactive F1 Starting Lights Gantry (`StartingLights`)**:
  - Implemented a custom start gantry matching the FIA 5-red-light starting sequence.
  - Added dynamic audio beep synthesis using the browser's native Web Audio API (zero audio file downloads/external dependencies required).
  - Added randomized delays before "Lights Out" to simulate a real GP start.
  - Added visual bouncing checkered flags upon race start.
  - Rendered the component inside the `HeroNextRace` container under the countdown.

### Changed
- **🤖 AI Paddock Assistant (`MiniChatbot`)**:
  - Switched the backend from Google Gemini to the **NVIDIA NIM API** employing the **Minimax-M3** model.
  - Refactored `src/lib/gemini.ts` server handler to dynamically accept custom `model` arguments and resolve credentials.
  - Merged system instructions inside the first user message block to address the `system` message role restriction for the Minimax model.
  - Configured payload hyperparameters (`max_tokens: 8192`, `temperature: 1.00`, `top_p: 0.95`).
- **⚡ Vercel Deployment Target**:
  - Configured Nitro engine target preset to `vercel` inside `vite.config.ts` to output in Vercel's Build Output API format.
- **🔒 Git Environment**:
  - Updated `.gitignore` to ignore the `.vercel` local build directory to prevent local build assets from leaking into version control.
- **📝 Documentation & Templates**:
  - Updated `README.md` to reflect new starting lights features, NVIDIA AI catalog details, and Vercel build instructions.
  - Updated `.env.example` with the `NVIDIA_API_KEY` placeholder.
