import { useState } from "react";
import { X, Copy, Check, Download, Film } from "lucide-react";
import { getDriverOrFallback, getTeamOrFallback } from "@/lib/f1-data";
import { systemLogger } from "@/lib/system-logger";
import type { Profile } from "@/hooks/useProfile";
// @ts-ignore
import gifshot from "gifshot";

type Props = {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  rank: number;
  points: number;
  wins: number;
  podiums: number;
};

export function ShareDriverCardModal({
  open,
  onClose,
  profile,
  rank,
  points,
  wins,
  podiums,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [gifDownloading, setGifDownloading] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);

  if (!open) return null;

  const d = getDriverOrFallback(profile.favoriteDriverId);
  const team = getTeamOrFallback(d.teamId);
  const color = team.color;

  const handleCopy = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/?driver=${d.id}`);
    setCopied(true);
    systemLogger.log(`Super Licence share link copied to clipboard (${d.id})`, "info");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    systemLogger.log(`Super Licence card export initiated for ${d.lastName}`, "info");
    const svgText = generateSvgCard(d, team, rank, points, wins, podiums);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `${d.lastName.toLowerCase()}_super_licence.png`;
          a.click();
        } catch (err) {
          console.error("Canvas export failed, falling back to direct SVG download:", err);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${d.lastName.toLowerCase()}_super_licence.svg`;
          a.click();
        }
      }
      URL.revokeObjectURL(url);
      setDownloading(false);
    };
    img.onerror = () => {
      setDownloading(false);
    };
    img.src = url;
  };

  const handleDownloadGif = () => {
    const canvas = document.querySelector(
      "#driver-3d-showcase-container canvas",
    ) as HTMLCanvasElement;
    if (!canvas) {
      alert("Livery canvas not found. Make sure the 3D model is loaded in the background!");
      return;
    }

    setGifDownloading(true);
    setGifProgress(10);

    const frames: string[] = [];
    let capturedCount = 0;
    const totalFrames = 15;

    const captureInterval = setInterval(() => {
      if (capturedCount >= totalFrames) {
        clearInterval(captureInterval);
        setGifProgress(50);

        // Compile using gifshot
        gifshot.createGIF(
          {
            images: frames,
            gifWidth: 400,
            gifHeight: 300,
            interval: 0.1, // 100ms per frame
            numFrames: totalFrames,
            frameDuration: 1,
          },
          (obj: any) => {
            if (!obj.error) {
              setGifProgress(100);
              const a = document.createElement("a");
              a.href = obj.image;
              a.download = `${d.lastName.toLowerCase()}_livery_3d.gif`;
              a.click();
            } else {
              console.error("GIF creation failed:", obj.error);
              alert("Failed to compile animated GIF.");
            }
            setGifDownloading(false);
            setGifProgress(0);
          },
        );
      } else {
        // Capture a frame from the WebGL canvas
        const frameData = canvas.toDataURL("image/jpeg", 0.7);
        frames.push(frameData);
        capturedCount++;
        setGifProgress(10 + Math.round((capturedCount / totalFrames) * 35));
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0e0e] border border-hairline-strong max-w-2xl w-full p-6 sm:p-8 relative rounded-[2px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="text-eyebrow text-ink-muted mb-1">// FIA OFFICIAL RECORD</div>
          <h3 className="text-xl font-bold uppercase tracking-wider text-white">
            Share Super Licence
          </h3>
        </div>

        {/* CSS Preview Card */}
        <div className="relative overflow-hidden aspect-[1.6/1] bg-[#121212] border border-zinc-800 p-6 flex flex-col justify-between rounded-[2px] shadow-2xl select-none">
          {/* Carbon Fiber subtle grid effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgba(255,255,255,0.01) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.01) 75%), linear-gradient(45deg, rgba(255,255,255,0.01) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.01) 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />

          {/* Large background number */}
          <span
            className="absolute bottom-[-30px] right-4 text-[180px] font-black leading-none opacity-[0.03] select-none pointer-events-none"
            style={{ color }}
          >
            #{d.number}
          </span>

          {/* Top Line & Labels */}
          <div>
            <div className="h-[2px] w-full mb-3" style={{ backgroundColor: color }} />
            <div className="flex justify-between items-center text-[8px] font-mono font-bold tracking-wider">
              <span className="text-[#cfa05b]">FIA AUTOMOBILE SUPER LICENCE</span>
              <span className="text-emerald-400">STATUS: ACTIVE // PADDOCK GRANTED</span>
            </div>
            <div className="h-[1px] w-full bg-zinc-800 mt-2" />
          </div>

          {/* Main Details Body */}
          <div className="flex items-stretch flex-1 my-4">
            {/* Portrait Box */}
            <div className="w-24 bg-[#181818] border border-zinc-800 rounded-[1px] flex flex-col items-center justify-between p-3 select-none">
              <div className="w-full flex-1 flex items-center justify-center opacity-25">
                {/* SVG Minimalist Helmet Outline */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-14 h-14"
                  stroke="currentColor"
                  fill="none"
                  style={{ color }}
                >
                  <path
                    d="M50 15 C30 15 30 75 30 75 C30 80 40 85 50 85 C60 85 70 80 70 75 C70 75 70 15 50 15 Z"
                    strokeWidth="4"
                  />
                  <path
                    d="M35 50 C35 50 50 40 65 50 L65 62 C65 62 50 68 35 62 Z"
                    strokeWidth="3"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                </svg>
              </div>
              <div className="text-[7px] font-mono text-zinc-500 tracking-wider text-center mt-2 uppercase">
                PILOT ACCESS ID
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex-1 pl-5 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-black uppercase tracking-wider text-white leading-none mb-1">
                  {d.firstName} {d.lastName}
                </h4>
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-widest"
                  style={{ color }}
                >
                  {team.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
                <div>
                  <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    STANDING
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {rank >= 0 ? `P${rank + 1}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    POINTS
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{points}</div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    WINS
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{wins}</div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">
                    PODIUMS
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">{podiums}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Barcode & Delegation */}
          <div className="flex justify-between items-end border-t border-zinc-800 pt-3">
            {/* Barcode representation */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-px h-5 items-stretch opacity-60">
                <div className="w-[3px] bg-zinc-400" />
                <div className="w-[1px] bg-zinc-400" />
                <div className="w-[4px] bg-zinc-400" />
                <div className="w-[2px] bg-zinc-400" />
                <div className="w-[1px] bg-zinc-400" />
                <div className="w-[3px] bg-zinc-400" />
                <div className="w-[2px] bg-zinc-400" />
                <div className="w-[4px] bg-zinc-400" />
              </div>
              <div className="text-[7px] font-mono text-zinc-500 uppercase tracking-widest">
                {d.id}-{d.number}
              </div>
            </div>

            {/* Stewards stamp */}
            <div className="text-right">
              <div className="text-[8px] font-mono text-[#cfa05b] font-bold uppercase tracking-wider">
                FIA STEWARDS DELEGATE
              </div>
              <div className="h-[1px] w-32 bg-zinc-800 ml-auto my-0.5" />
              <div className="text-[6px] font-mono text-zinc-600 uppercase">
                HASH // F1-2026-{d.id}
              </div>
            </div>
          </div>
        </div>

        {/* Share Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <button
            onClick={handleCopy}
            disabled={copied}
            className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-500 bg-zinc-900/40 hover:bg-zinc-800/40 text-white font-mono uppercase text-[10px] tracking-wider py-3 px-2 cursor-pointer transition-all duration-300 rounded-[2px]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-in zoom-in-50 duration-150" />
                <span>LINK COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                <span>COPY SHARE LINK</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 border font-mono uppercase text-[10px] tracking-wider py-3 px-2 cursor-pointer transition-all duration-300 rounded-[2px]"
            style={{
              borderColor: color,
              background: `color-mix(in oklab, ${color} 8%, transparent)`,
              color: "#fff",
            }}
          >
            <Download className="h-3.5 w-3.5" style={{ color }} />
            <span>{downloading ? "GENERATING..." : "DOWNLOAD LICENSE (PNG)"}</span>
          </button>

          <button
            onClick={handleDownloadGif}
            disabled={gifDownloading}
            className="w-full flex items-center justify-center gap-2 border font-mono uppercase text-[10px] tracking-wider py-3 px-2 cursor-pointer transition-all duration-300 rounded-[2px] bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 text-white"
          >
            <Film className="h-3.5 w-3.5 text-[#cfa05b]" />
            <span>{gifDownloading ? `RECORDING (${gifProgress}%)` : "DOWNLOAD LIVERY (GIF)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// High-Res SVG Card Generator
function generateSvgCard(
  d: any,
  team: any,
  rank: number,
  points: number,
  wins: number,
  podiums: number,
) {
  const teamColor = team.color;
  const fullName = `${d.firstName} ${d.lastName}`.toUpperCase();
  const teamName = team.name.toUpperCase();
  const rankStr = rank >= 0 ? `P${rank + 1}` : "—";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0c0c" />
      <stop offset="100%" stop-color="#141414" />
    </linearGradient>
  </defs>
  
  <rect width="800" height="500" rx="4" fill="url(#bg-grad)" stroke="#222" stroke-width="2" />
  
  <!-- carbon line overlays -->
  <path d="M 0 0 L 800 500 M 0 100 L 800 600 M 0 -100 L 800 400" stroke="rgba(255,255,255,0.01)" stroke-width="1" />
  
  <rect x="30" y="30" width="740" height="3" fill="${teamColor}" />
  
  <text x="30" y="55" fill="#cfa05b" font-family="sans-serif" font-size="10" font-weight="900" letter-spacing="3">FIA AUTOMOBILE SUPER LICENCE</text>
  <text x="770" y="55" fill="#10b981" font-family="sans-serif" font-size="10" font-weight="900" letter-spacing="1" text-anchor="end">STATUS: ACTIVE // PADDOCK GRANTED</text>
  
  <line x1="30" y1="70" x2="770" y2="70" stroke="#222" stroke-width="1" />
  
  <!-- Backing text -->
  <text x="740" y="440" fill="${teamColor}" fill-opacity="0.03" font-family="sans-serif" font-size="280" font-weight="900" text-anchor="end">#${d.number}</text>
  
  <!-- Helmet Box -->
  <rect x="30" y="100" width="220" height="260" fill="#161616" stroke="#2a2a2a" stroke-width="1" rx="2" />
  <path d="M 140 160 C 105 160 105 230 105 255 C 105 262 112 270 130 270 L 150 270 C 168 270 175 262 175 255 C 175 230 175 160 140 160 Z" fill="none" stroke="${teamColor}" stroke-width="3" stroke-opacity="0.25" />
  <path d="M 112 205 C 112 205 140 190 168 205 L 168 220 C 168 220 140 230 112 220 Z" fill="${teamColor}" fill-opacity="0.2" stroke="${teamColor}" stroke-width="2" />
  <text x="140" y="325" fill="#555" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">PILOT ACCESS ID</text>
  
  <!-- Details -->
  <text x="280" y="135" fill="#ffffff" font-family="sans-serif" font-size="34" font-weight="900" letter-spacing="1">${fullName}</text>
  <text x="280" y="165" fill="${teamColor}" font-family="sans-serif" font-size="14" font-weight="700" letter-spacing="3">${teamName}</text>
  
  <!-- Grid of details -->
  <text x="280" y="215" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">CURRENT STANDING</text>
  <text x="280" y="245" fill="#fff" font-family="sans-serif" font-size="26" font-weight="800">${rankStr}</text>
  
  <text x="480" y="215" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">POINTS SECURED</text>
  <text x="480" y="245" fill="#fff" font-family="sans-serif" font-size="26" font-weight="800">${points}</text>
  
  <text x="280" y="295" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">CAREER WINS</text>
  <text x="280" y="325" fill="#fff" font-family="sans-serif" font-size="26" font-weight="800">${wins}</text>
  
  <text x="480" y="295" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">PODIUM FINISHES</text>
  <text x="480" y="325" fill="#fff" font-family="sans-serif" font-size="26" font-weight="800">${podiums}</text>
  
  <text x="280" y="375" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">WORLD TITLES</text>
  <text x="280" y="405" fill="#fff" font-family="sans-serif" font-size="26" font-weight="800">${d.championships}</text>
  
  <text x="480" y="375" fill="#666" font-family="monospace" font-size="9" letter-spacing="1">CAR IDENTIFIER</text>
  <text x="480" y="405" fill="${teamColor}" font-family="sans-serif" font-size="26" font-weight="800">#${d.number}</text>

  <!-- Barcode -->
  <g transform="translate(30, 435)">
    <rect x="0" y="0" width="3" height="30" fill="#444" />
    <rect x="5" y="0" width="1" height="30" fill="#444" />
    <rect x="8" y="0" width="4" height="30" fill="#444" />
    <rect x="14" y="0" width="2" height="30" fill="#444" />
    <rect x="18" y="0" width="1" height="30" fill="#444" />
    <rect x="21" y="0" width="3" height="30" fill="#444" />
    <rect x="26" y="0" width="2" height="30" fill="#444" />
    <text x="0" y="43" fill="#444" font-family="monospace" font-size="9">${d.id}-${d.number}</text>
  </g>
  
  <text x="770" y="445" fill="#cfa05b" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="end" letter-spacing="1">FIA STEWARDS DELEGATE</text>
  <line x1="600" y1="455" x2="770" y2="455" stroke="#222" stroke-width="1" />
  <text x="770" y="470" fill="#444" font-family="monospace" font-size="8" text-anchor="end">HASH // F1-2026-${d.id}</text>
</svg>`;
}
