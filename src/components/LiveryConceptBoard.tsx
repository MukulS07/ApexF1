import { useState } from "react";
import { ThreeCarCanvas } from "./ThreeCarCanvas";
import { X, Camera, Palette, Shield, Info, Maximize2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  driverNumber: number;
}

type LiveryMode = "dark" | "black" | "teal" | "white";
type CameraPreset = "orbit" | "top" | "side" | "detail-sidepod" | "detail-nose" | "detail-wing";

export function LiveryConceptBoard({ open, onClose, driverNumber }: Props) {
  const [liveryMode, setLiveryMode] = useState<LiveryMode>("dark");
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>("orbit");
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  if (!open) return null;

  const colors = [
    { name: "PAPAYA ORANGE", hex: "#FF8700", desc: "Primary brand identifier" },
    { name: "TEAL BLUE", hex: "#00B5A1", desc: "Heritage accent stripe" },
    { name: "CARBON BLACK", hex: "#0A0A0A", desc: "Lightweight composite base" },
    { name: "WHITE", hex: "#FFFFFF", desc: "High-contrast sponsor livery" },
  ];

  const modes = [
    { id: "dark" as LiveryMode, name: "DARK MODE", label: "Default Concept" },
    { id: "black" as LiveryMode, name: "BLACK MODE", label: "Stealth Carbon" },
    { id: "teal" as LiveryMode, name: "TEAL MODE", label: "Stripe Contrast" },
    { id: "white" as LiveryMode, name: "WHITE MODE", label: "Championship Spec" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in font-display">
      {/* Main Board Container */}
      <div className="relative w-full max-w-7xl bg-zinc-950 border border-zinc-800 rounded-none shadow-2xl overflow-hidden flex flex-col min-h-[90vh]">
        {/* Futuristic Grid Overlay Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

        {/* Header */}
        <div className="relative p-6 sm:px-8 border-b border-zinc-800 flex justify-between items-center z-10 bg-black/50 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-[2px]" aria-hidden>
                <span className="h-5 w-[3.5px] bg-[#FF8700]" />
                <span className="h-5 w-[3.5px] bg-[#00B5A1]" />
                <span className="h-5 w-[3.5px] bg-zinc-700" />
              </span>
              <span className="font-bold uppercase tracking-[0.25em] text-xl sm:text-2xl text-white">McLAREN</span>
            </div>
            <div className="text-[10px] tracking-widest text-[#FF8700] uppercase font-mono mt-1">
              MCL38 / 2025 LIVERY CONCEPT // SPEC 4.0
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-[10px] tracking-widest text-zinc-500 uppercase font-mono">STATUS</div>
              <div className="text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase">ACTIVE RENDERING</div>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-zinc-800 hover:border-[#FF8700] hover:text-[#FF8700] transition-all duration-300 text-zinc-400 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 z-10">
          
          {/* LEFT PANEL: Details & Spec Zoom (cols: 3) */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            <div>
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-3 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-[#FF8700]" />
                // CONCEPT DETAILS
              </div>
              <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                Click any layout element below to lock the high-fidelity 3D viewport camera telemetry onto the specific chassis component.
              </div>
            </div>

            {/* Detail Camera Zoom Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setCameraPreset("detail-sidepod")}
                className={`group relative text-left border p-3 flex flex-col justify-between transition-all duration-300 min-h-[90px] ${
                  cameraPreset === "detail-sidepod"
                    ? "bg-[#FF8700]/10 border-[#FF8700] text-white"
                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                <div className="text-[9px] font-mono tracking-wider">// SPEC_01 // CHASSIS</div>
                <div className="text-xs font-bold uppercase mt-1">Engine Cover & Sidepod</div>
                <div className="text-[9px] font-mono text-zinc-500 mt-2 group-hover:text-zinc-300">
                  Chrome & Cisco brand placement.
                </div>
              </button>

              <button
                onClick={() => setCameraPreset("detail-nose")}
                className={`group relative text-left border p-3 flex flex-col justify-between transition-all duration-300 min-h-[90px] ${
                  cameraPreset === "detail-nose"
                    ? "bg-[#FF8700]/10 border-[#FF8700] text-white"
                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                <div className="text-[9px] font-mono tracking-wider">// SPEC_02 // NOSE</div>
                <div className="text-xs font-bold uppercase mt-1">Front Nose & Wing</div>
                <div className="text-[9px] font-mono text-zinc-500 mt-2 group-hover:text-zinc-300">
                  Active front wing and Lando Norris #{driverNumber} placement.
                </div>
              </button>

              <button
                onClick={() => setCameraPreset("detail-wing")}
                className={`group relative text-left border p-3 flex flex-col justify-between transition-all duration-300 min-h-[90px] ${
                  cameraPreset === "detail-wing"
                    ? "bg-[#FF8700]/10 border-[#FF8700] text-white"
                    : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                }`}
              >
                <div className="text-[9px] font-mono tracking-wider">// SPEC_03 // REAR</div>
                <div className="text-xs font-bold uppercase mt-1">Rear Wing & Endplate</div>
                <div className="text-[9px] font-mono text-zinc-500 mt-2 group-hover:text-zinc-300">
                  Dropbox Dash rear wing livery integration.
                </div>
              </button>
            </div>
            
            <div className="border border-zinc-800/80 p-4 bg-zinc-900/20 backdrop-blur-sm mt-auto">
              <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 mb-1">
                <Shield className="h-3 w-3 text-[#00B5A1]" />
                TELEM_TOWER
              </div>
              <div className="text-[9px] text-zinc-400 font-mono leading-tight">
                MCL_026_REF // SIGNAL EXCELLENT
                <br />
                PADDOCK INTEL SYNCED
              </div>
            </div>
          </div>

          {/* CENTRE PANEL: 3D Render & Exploded Schematic (cols: 6) */}
          <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
            
            {/* Top Interactive Exploded View Schematic */}
            <div className="bg-black/40 border border-zinc-800 p-4 relative overflow-hidden select-none">
              <div className="absolute top-2 left-3 text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
                // ACTIVE EXPLODED PANEL SPECS
              </div>
              
              {/* SVG Parts Map */}
              <div className="h-20 w-full flex items-center justify-center relative mt-2">
                <svg viewBox="0 0 400 60" className="w-full h-full max-w-md stroke-zinc-700 stroke-1 fill-none">
                  {/* Left wing */}
                  <path
                    d="M 20,30 L 60,30 L 60,15"
                    className={`transition-all ${hoveredPart === "front-wing" ? "stroke-[#FF8700] stroke-[1.5px]" : "hover:stroke-zinc-400 cursor-pointer"}`}
                    onMouseEnter={() => setHoveredPart("front-wing")}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setCameraPreset("detail-nose")}
                  />
                  {/* Chassis lines */}
                  <path
                    d="M 60,30 L 160,30 L 180,20 L 260,20 L 280,30"
                    className={`transition-all ${hoveredPart === "body" ? "stroke-[#FF8700] stroke-[1.5px]" : "hover:stroke-zinc-400 cursor-pointer"}`}
                    onMouseEnter={() => setHoveredPart("body")}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setCameraPreset("detail-sidepod")}
                  />
                  {/* Halo loop */}
                  <path
                    d="M 170,18 A 8,8 0 0 1 186,18"
                    className={`transition-all ${hoveredPart === "halo" ? "stroke-[#00B5A1] stroke-[1.5px]" : "hover:stroke-zinc-400 cursor-pointer"}`}
                    onMouseEnter={() => setHoveredPart("halo")}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setCameraPreset("detail-sidepod")}
                  />
                  {/* Rear wing */}
                  <path
                    d="M 280,30 L 320,30 L 320,10 L 340,10"
                    className={`transition-all ${hoveredPart === "rear-wing" ? "stroke-[#FF8700] stroke-[1.5px]" : "hover:stroke-zinc-400 cursor-pointer"}`}
                    onMouseEnter={() => setHoveredPart("rear-wing")}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => setCameraPreset("detail-wing")}
                  />
                  {/* Front suspension node */}
                  <line
                    x1="80" y1="30" x2="100" y2="45"
                    className={`transition-all ${hoveredPart === "suspension" ? "stroke-zinc-400 stroke-[1.5px]" : ""}`}
                  />
                  <line
                    x1="260" y1="30" x2="280" y2="45"
                    className={`transition-all ${hoveredPart === "suspension" ? "stroke-zinc-400 stroke-[1.5px]" : ""}`}
                  />
                </svg>

                {/* Overlay text labeling hovered part */}
                <div className="absolute bottom-1 text-[9px] font-mono tracking-widest text-[#FF8700] uppercase">
                  {hoveredPart ? `PANEL: ${hoveredPart}` : "HOVER SCHEMATIC TO ANCHOR"}
                </div>
              </div>
            </div>

            {/* Main 3D Viewport Box */}
            <div className="flex-1 bg-black border border-zinc-800 relative flex flex-col min-h-[350px]">
              
              {/* 3D Canvas */}
              <div className="flex-1 relative overflow-hidden bg-[#050505]">
                <ThreeCarCanvas
                  teamId="mclaren"
                  driverNumber={driverNumber}
                  mode="interactive"
                  liveryMode={liveryMode}
                  cameraPreset={cameraPreset}
                />
              </div>

              {/* Viewport Camera Preset Controller HUD */}
              <div className="p-3 border-t border-zinc-800 bg-black/80 flex justify-between items-center z-10 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">CAMERA VIEWPORT</span>
                </div>
                
                <div className="flex items-center gap-1 font-mono text-[9px]">
                  <button
                    onClick={() => setCameraPreset("orbit")}
                    className={`px-2 py-1 border transition-colors ${
                      cameraPreset === "orbit"
                        ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    ORBIT VIEW (3D)
                  </button>

                  <button
                    onClick={() => setCameraPreset("top")}
                    className={`px-2 py-1 border transition-colors ${
                      cameraPreset === "top"
                        ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    TOP DOWN
                  </button>

                  <button
                    onClick={() => setCameraPreset("side")}
                    className={`px-2 py-1 border transition-colors ${
                      cameraPreset === "side"
                        ? "border-[#FF8700] text-[#FF8700] bg-[#FF8700]/5"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    SIDE PROFILE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Colors & Livery Modes Selector (cols: 3) */}
          <div className="lg:col-span-3 flex flex-col gap-6 order-3">
            
            {/* Colors Spec Panel */}
            <div className="border border-zinc-800 p-4 bg-black/20">
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-3 flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 text-[#FF8700]" />
                // COLOURS
              </div>
              
              <div className="flex flex-col gap-3 font-mono">
                {colors.map((c) => (
                  <div key={c.hex} className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 border border-zinc-700 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div>
                      <div className="text-[10px] font-bold text-white uppercase">{c.name}</div>
                      <div className="text-[9px] text-[#FF8700] font-mono tracking-wider mt-0.5">{c.hex}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Livery Spec Modes Panel */}
            <div className="border border-zinc-800 p-4 bg-black/20 flex-1 flex flex-col">
              <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-3 flex items-center gap-2">
                <Maximize2 className="h-3.5 w-3.5 text-[#00B5A1]" />
                // LIVERY SPEC MODES
              </div>

              <div className="flex flex-col gap-3 flex-1 justify-center">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setLiveryMode(m.id);
                      if (cameraPreset.startsWith("detail-")) {
                        // Reset camera preset to see full livery change beautifully
                        setCameraPreset("orbit");
                      }
                    }}
                    className={`group relative text-left border p-3 flex justify-between items-center transition-all duration-300 ${
                      liveryMode === m.id
                        ? "bg-[#FF8700]/10 border-[#FF8700] text-white"
                        : "bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-display uppercase tracking-wider">{m.name}</div>
                      <div className="text-[9px] text-zinc-500 group-hover:text-zinc-300 font-mono mt-0.5">
                        {m.label}
                      </div>
                    </div>
                    
                    {/* Tiny neon color indicator */}
                    <div className="flex gap-[2px]">
                      {m.id === "dark" && (
                        <>
                          <span className="h-2 w-1.5 bg-[#FF8700]" />
                          <span className="h-2 w-1.5 bg-[#00B5A1]" />
                          <span className="h-2 w-1.5 bg-zinc-700" />
                        </>
                      )}
                      {m.id === "black" && (
                        <>
                          <span className="h-2 w-1.5 bg-zinc-900" />
                          <span className="h-2 w-1.5 bg-[#FF8700]" />
                        </>
                      )}
                      {m.id === "teal" && (
                        <>
                          <span className="h-2 w-1.5 bg-[#00B5A1]" />
                          <span className="h-2 w-1.5 bg-zinc-800" />
                        </>
                      )}
                      {m.id === "white" && (
                        <>
                          <span className="h-2 w-1.5 bg-white" />
                          <span className="h-2 w-1.5 bg-[#00B5A1]" />
                          <span className="h-2 w-1.5 bg-[#FF8700]" />
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Footer Ticker Bar */}
        <div className="relative py-2 border-t border-zinc-800 bg-black/60 overflow-hidden font-mono text-[8px] text-zinc-500 uppercase tracking-widest flex items-center px-6">
          <span className="text-emerald-400 font-bold shrink-0">▸ STREAMING</span>
          <div className="marquee-slow py-1 ml-4 flex gap-8 shrink-0">
            <span>NO. #{driverNumber} // LANDO NORRIS</span>
            <span>MCLAREN FORMULA 1 TEAM // MCL38 LIVERY SPEC</span>
            <span>CHASSIS TYPE: CARBON COMPS // ENGINES: MERCEDES HPP</span>
            <span>POWER UNIT: 1.6L V6 TURBO HYBRID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
