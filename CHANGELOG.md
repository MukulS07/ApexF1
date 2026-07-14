# Changelog

All notable changes to the **ApexF1 Dashboard** project will be documented in this file.

---

## [Unreleased] - 2026-07-14

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
