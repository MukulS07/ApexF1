# 🏁 ApexF1 — The Ultimate F1 2026 Dashboard

Welcome to **ApexF1** (Pitwall Refresh), a cutting-edge Formula 1 dashboard designed for the upcoming 2026 season. Built with performance, interactivity, and premium aesthetics in mind, ApexF1 integrates real-time telemetry, 3D interactive model customization, F1 calendars, driver statistics, and an AI-powered paddock assistant.

---

## 🚀 Key Features

*   **🏎️ Interactive 3D Livery Designer (`ThreeCarCanvas`)**
    *   Fully interactive 3D Formula 1 car rendered using **Three.js** and WebGL.
    *   Change colors, tweak paint finishes (glossy, matte, metallic), adjust decals, and preview custom designs in real-time.
*   **🤖 AI Paddock Assistant (`MiniChatbot`)**
    *   An in-dashboard chatbot powered by the **Google Gemini API**.
    *   Ask questions about F1 rules, the 2026 season regulations, driver statistics, or team strategies.
*   **📊 Live Track Telemetry (`TrackTelemetry`)**
    *   Real-time simulated telemetry displaying Speed (KM/H), Gear, RPM, DRS activation, Throttle/Brake percentages, and individual Tyre Temperatures.
*   **🏆 Championship Standings & Calendar**
    *   Up-to-date visual boards for Driver and Constructor standings (`ChampionshipBoard`, `Standings`).
    *   Detailed interactive race weekends tracker with countdowns (`SeasonCalendar`, `HeroNextRace`).
*   **🎴 Driver Card Generator (`ShareDriverCardModal`)**
    *   Customize your own F1 driver profile card with stats, flags, and custom imagery, ready to export and share.
*   **📡 System Logger Bar (`SystemLogBar`)**
    *   Integrated live system performance and logs monitor panel reflecting application events.

---

## 🛠️ Tech Stack

*   **Framework:** [TanStack Start](https://tanstack.com/router/v1/docs/start/overview) (React 19, TypeScript)
*   **Routing:** File-based routing using [TanStack Router](https://tanstack.com/router)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **3D Graphics:** [Three.js](https://threejs.org/)
*   **State Management & Data Fetching:** [TanStack Query](https://tanstack.com/query) (React Query)
*   **Animations:** [GSAP](https://gsap.com/) (GreenSock Animation Platform)
*   **AI Integration:** Gemini API via custom server functions

---

## ⚙️ Getting Started

### 📋 Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) installed.

### 📥 Installation
Clone the repository and install the dependencies:
```bash
# Using Bun (recommended)
bun install

# Using npm
npm install
```

### 🔑 Environment Variables
Create a `.env` file in the root directory and configure the environment variables:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
Refer to `.env.example` for details.

### 🚀 Running Local Development
To launch the application in development mode with hot-reloading:
```bash
bun dev
# or
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) to view the application in your browser.

### 🏗️ Building for Production
To build the application for production:
```bash
bun run build
# or
npm run build
```
To preview the production build locally:
```bash
bun run preview
# or
npm run preview
```

---

## 📂 Project Structure

```text
├── 3d model/             # 3D assets and configurations
├── public/               # Static assets (images, icons, etc.)
├── src/
│   ├── components/       # UI Components (3D Canvas, Telemetry, Standings, etc.)
│   │   └── ui/           # Radix and custom UI primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core utilities, APIs, Gemini client, and loggers
│   ├── routes/           # File-based TanStack Router pages (index.tsx, __root.tsx)
│   ├── styles.css        # Tailwind config and global styles
│   ├── router.tsx        # Router instantiation
│   └── server.ts         # TanStack Start entry point
├── package.json          # Script commands and dependencies
└── tsconfig.json         # TypeScript configuration
```

---

## 📄 License
This project is private and proprietary.
