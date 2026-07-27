import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Cpu, User, Sparkles, MessageSquare, Radio } from "lucide-react";
import { getDriverOrFallback, getTeamOrFallback, driversStandings, constructorsStandings } from "@/lib/f1-data";
import type { Profile } from "@/hooks/useProfile";
import { callGeminiServerFn } from "@/lib/gemini";

// --- API CONFIGURATION ---
const AI_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const AI_API_KEY = "";

type Message = {
  id: string;
  sender: "user" | "mini";
  text: string;
  timestamp: string;
};

const SUGGESTIONS = [
  { label: "Explain DRS & ERS", query: "Can you explain DRS and ERS?" },
  { label: "Tyre Compounds Guide", query: "What are the tyre compounds and how are they used?" },
  { label: "2026 Season Standings", query: "Who is leading the 2026 championship and what are the standings?" },
  { label: "Next GP Schedule", query: "What is the schedule for the next Grand Prix?" },
];

const LOCAL_RESPONSES: Record<string, string> = {
  drs: `**DRS (Drag Reduction System)**: Opened when a car is within 1.0 second of the car ahead in designated zones. It rotates the rear wing flap to reduce drag, boosting top speed by ~10-12 km/h.

**ERS (Energy Recovery System)**: Hybrid power unit harvesting energy during braking (MGU-K) and exhaust heat (MGU-H), providing an additional 160hp (~120kW) of battery power per lap.`,
  tyre: `F1 tyre regulations divide compounds into:

● **Slicks (Dry)**: C1 (Hardest) to C5 (Softest). Softs provide maximum grip but wear quickly. Hards offer longevity at the expense of peak cornering speeds.

● **Wets (Rain)**: **Intermediates** (green sidewall, for damp tracks without standing water) and **Full Wets** (blue sidewall, designed to evacuate up to 85 liters of water per second to prevent aquaplaning).`,
  standings: `The current 2026 driver standings show Oscar Piastri (234 pts) leading Lando Norris (226 pts), followed by Charles Leclerc (151 pts) and George Russell (147 pts).

Teams are pushing hard under the brand new 2026 engine and active aero regulations!`,
  schedule: `Understood. Here is the upcoming schedule for Round 13 — **Hungarian Grand Prix**:

---

**NEXT GRAND PRIX — Hungarian Grand Prix**
● **Country:** Hungary  
● **Circuit:** Hungaroring, Budapest  
● **Lap Length:** 4.381 km  
● **Race Distance:** 70 Laps / 306.63 km  

**Weekend Schedule (Local CEST Time):**

| Session | Day | Time |
|---|---|---|
| Free Practice 1 | Friday | 13:30 |
| Free Practice 2 | Friday | 17:00 |
| Free Practice 3 | Saturday | 12:30 |
| Qualifying | Saturday | 16:00 |
| Race | Sunday | 15:00 |

**Key Strategy Notes:**
● **Tyre Compounds Allocated:** C2 (Hard), C3 (Medium), C4 (Soft)  
● **DRS Zones:** 2 Zones (Main Straight & Turn 1–Turn 2)  
● **Pit Lane Time Loss:** ~21.5 seconds  
● **Weather Forecast:** Warm & dry (28°C Ambient, 42°C Track)  

---

⚠️ **Telemetry Reminder:** As we head into this weekend, focus on Sector 2 entry traction and brake stability. We'll cross-reference FP1/FP2 long-run data against your quali simulations tonight.`,
};

export function MiniChatbot({ profile }: { profile: Profile | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "mini",
      text: "Lights out and away we go! I'm **Mini**, your ApexF1 AI companion. Ask me anything about driver standings, track telemetry, regulations, or race strategy!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resolve driver / team specifics
  const driver = profile ? getDriverOrFallback(profile.favoriteDriverId) : null;
  const team = driver ? getTeamOrFallback(driver.teamId) : null;
  const driverName = driver ? driver.lastName.toUpperCase() : "DRIVER";
  const driverNumber = driver ? driver.number : "00";
  const teamColor = team ? team.color : "#ff2a2a";
  const teamName = team ? team.name.toUpperCase() : "APEX RACING";

  // Play F1 Radio notification sound
  const playRadioSound = () => {
    try {
      const audio = new Audio("/formula-1-radio-notification.mp3");
      audio.volume = 0.45;
      audio.play();
    } catch (e) {
      console.warn("Audio playback blocked or failed", e);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      playRadioSound();
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const aiPromise = callGeminiServerFn({
        data: {
          text: textToSend,
          driverName,
          driverNumber,
          teamName,
          apiUrl: AI_API_URL,
          apiKey: "",
          model: "meta/llama-3.1-8b-instruct",
        },
      });

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 12000)
      );

      const response = await Promise.race([aiPromise, timeoutPromise]);

      let replyText = "";
      if (response && !response.startsWith("Error")) {
        replyText = response;
      } else {
        replyText = getFastPaddockResponse(textToSend);
      }

      const miniMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "mini",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, miniMsg]);
      setIsTyping(false);
      playRadioSound();
    } catch (e: any) {
      console.warn("AI API call falling back to fast local paddock engine", e);
      const replyText = getFastPaddockResponse(textToSend);

      const miniMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "mini",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, miniMsg]);
      setIsTyping(false);
      playRadioSound();
    }
  };

  const getFastPaddockResponse = (query: string): string => {
    const q = query.toLowerCase();
    const driverFirstName = driver ? driver.firstName : "Driver";
    const favLastName = driver ? driver.lastName : "Driver";

    // 1. Next Race / Schedule / GP queries
    if (
      q.includes("schedule") ||
      q.includes("calendar") ||
      q.includes("next race") ||
      q.includes("next gp") ||
      q.includes("hungarian") ||
      q.includes("hungaroring") ||
      q.includes("when is the next")
    ) {
      return `Copy that, **${driverFirstName}**. Here is the confirmed telemetry schedule for Round 13 — **Hungarian Grand Prix**:

---

**NEXT GRAND PRIX — Hungarian Grand Prix**
● **Country:** Hungary  
● **Circuit:** Hungaroring, Budapest  
● **Lap Length:** 4.381 km  
● **Race Distance:** 70 Laps / 306.63 km  

**Weekend Timetable (Local CEST Time):**

| Session | Day | Time |
|---|---|---|
| Free Practice 1 | Friday | 13:30 |
| Free Practice 2 | Friday | 17:00 |
| Free Practice 3 | Saturday | 12:30 |
| Qualifying | Saturday | 16:00 |
| Race | Sunday | 15:00 |

**Strategy & Track Spec:**
● **Pirelli Tyre Allocation:** C2 (Hard), C3 (Medium), C4 (Soft)  
● **DRS Zones:** 2 Zones (Main Straight & Turn 1–Turn 2)  
● **Pit Stop Loss:** ~21.5 seconds  
● **Track Conditions:** Warm & dry (28°C Ambient, 42°C Track)  

---

⚠️ **Telemetry Briefing:** We've configured your car for high-downforce cornering in Sector 2 (T4–T11). Expect tight degradation windows on the Soft compound during quali runs.

📡 *Mini — Race Engineering Desk, ${teamName} HQ*`;
    }

    // 2. DRS / ERS / 2026 Engine Rules
    if (q.includes("drs") || q.includes("ers") || q.includes("engine") || q.includes("2026 rules") || q.includes("aero")) {
      return `**2026 Technical & Power Unit Regulations Overview**:

1. **DRS & Active Aerodynamics**:
   ● **Z-Mode**: High-downforce mode for cornering stability.
   ● **X-Mode**: Low-drag straight-line mode, opening both front & rear wing flaps for maximum top speed on straights.

2. **Power Unit (MGU-K & ERS)**:
   ● **Electric Power Boost**: MGU-K electric output increased to **350 kW (~470 hp)**.
   ● **100% Sustainable Fuel**: Zero net carbon drop-in fuels.
   ● **Manual Override Mode**: Extra energy deployment available up to 355 km/h for overtaking when trailing within 1.0s.

3. **Chassis & Weight**:
   ● Reduced wheelbase (3400mm) and width (1900mm) for nimbler racing. Total car weight reduced by 30kg.`;
    }

    // 3. Tyres & Strategy
    if (q.includes("tyre") || q.includes("tire") || q.includes("compound") || q.includes("strategy") || q.includes("pit")) {
      return `**Paddock Tyre & Pit Strategy Matrix**:

● **Dry Slick Compounds**:
  - **C1 - C2 (Hard)**: Max longevity, lower thermal degradation. Ideal for long 1-stop stints.
  - **C3 (Medium)**: The versatile race compound balancing grip and stint length.
  - **C4 - C5 (Soft)**: Maximum mechanical grip for Single-Lap Qualifying pace; prone to thermal graining on high-fuel loads.

● **Wet Weather Tires**:
  - **Intermediate (Green)**: Damp surface up to 10mm water depth.
  - **Full Wet (Blue)**: Heavy rain, clearing **85L of water/sec** per tyre at 300 km/h.

● **Undercut Tactics**: Pitting 1–2 laps early on fresh rubber can yield a **1.8–2.4s advantage** on out-laps over cars staying out on worn tyres.`;
    }

    // 4. Standings / Championship
    if (q.includes("standing") || q.includes("leader") || q.includes("points") || q.includes("championship")) {
      const topDriversList = driversStandings.slice(0, 6).map((entry, idx) => {
        const d = getDriverOrFallback(entry.driverId);
        const t = getTeamOrFallback(d.teamId);
        return `${idx + 1}. **${d.firstName} ${d.lastName}** (${t.name}) — ${entry.points} pts`;
      }).join("\n");

      const topTeamsList = constructorsStandings.slice(0, 4).map((entry, idx) => {
        const t = getTeamOrFallback(entry.teamId);
        return `${idx + 1}. **${t.name}** — ${entry.points} pts`;
      }).join("\n");

      return `**World Championship Standings**:

**Drivers' Championship**:
${topDriversList}

**Constructors' Championship**:
${topTeamsList}

*Your driver **${favLastName}** is locked in the championship battle with ${teamName}!*`;
    }

    // 5. Radio / Pit Calls
    if (
      q.includes("box") ||
      q.includes("pit") ||
      q.includes("radio") ||
      q.includes("mode") ||
      q.includes("strat") ||
      q.includes("delta")
    ) {
      return `Radio loud and clear, **${driverFirstName}**!

● **Radio Check**: 5/5 Signal strength calibrated on ${teamName} frequency.
● **Pace Delta**: Currently +0.421s ahead of target stint pace.
● **Engine Mode**: Default Strat 2. Use 'Mode Push' for out-laps.
● **Pit Window**: Expecting Pit Window on Lap 22–26 for Medium to Hard transition.

*Standing by for your next radio call on the pit wall!*`;
    }

    // Default intelligent fallback
    return `Radio received, **${driverFirstName}**!

I have telemetry logged for your **${teamName}** car (#${driverNumber}).

Ask me anything about:
● **Next Race & Weekend Schedule**
● **Driver & Constructor Standings**
● **2026 Engine Rules, DRS & Active Aero**
● **Tyre Degradation & Pit Window Strategy**

*Standing by on pit wall comms channel.*`;
  };

  // Helper to parse bold markdown **text** to HTML tags in React safely
  const renderFormattedText = (text: string) => {
    if (typeof text !== "string") return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-14 right-6 z-40 h-12 w-12 rounded-full bg-zinc-950 border border-zinc-800 hover:border-[#ff2a2a] text-zinc-400 hover:text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer group"
        title="Chat with Mini"
      >
        <div className="absolute inset-0 rounded-full bg-[#ff2a2a]/5 animate-ping opacity-75 group-hover:bg-[#ff2a2a]/10" />
        <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 bg-[#ff2a2a] text-white text-[7px] font-mono font-bold tracking-widest rounded-full uppercase scale-90">
          Mini
        </span>
      </button>

      {/* Expanded Chatbot Dialog */}
      <div
        className={`fixed bottom-28 right-6 z-40 w-[360px] sm:w-[395px] h-[520px] bg-[#0c0c0e]/95 border border-zinc-850 shadow-2xl rounded-lg overflow-hidden flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        {/* Header bar */}
        <div className="h-12 bg-zinc-950 border-b border-hairline-strong px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff2a2a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff2a2a]"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-[#ff2a2a] animate-pulse" /> MINI // TEAM COMMS CHANNEL
              </span>
              <span className="text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest">
                RADIO FEED STATUS: CALIBRATED
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/50">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex flex-col w-full bg-[#18191c] border border-zinc-850 rounded-lg overflow-hidden shadow-lg relative`}
              >
                {/* Horizontal Team Color Line for User */}
                {isUser && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]"
                    style={{ backgroundColor: teamColor }}
                  />
                )}
                {/* Horizontal Accent Line for Mini */}
                {!isUser && (
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-[var(--m-blue-light)] via-[var(--m-blue-dark)] to-[var(--m-red)]" />
                )}

                {/* Card Header (Authentic Comms Graphics style) */}
                <div className="bg-[#1e1f22]/95 px-4 py-3 flex items-center justify-between border-b border-zinc-900/60">
                  <div className="flex items-center gap-4">
                    {isUser ? (
                      <>
                        <span
                          className="font-display font-black text-4xl leading-none tracking-tighter"
                          style={{ color: teamColor }}
                        >
                          {driverNumber}
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span
                            className="font-display font-black text-base tracking-wide"
                            style={{ color: teamColor }}
                          >
                            {driverName}
                          </span>
                          <span className="font-display font-black text-base tracking-wide text-white">
                            RADIO
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-display font-black text-4xl leading-none tracking-tighter text-[#ff2a2a]">
                          ENG
                        </span>
                        <div className="flex flex-col leading-tight">
                          <span className="font-display font-black text-base tracking-wide text-[#ff2a2a]">
                            MINI
                          </span>
                          <span className="font-display font-black text-base tracking-wide text-white">
                            ENGINEER
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Team Badge / Active Comms Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0e0f11] px-2.5 py-1 border border-zinc-800 rounded font-mono text-[9px] font-bold text-white select-none">
                      {isUser ? (team?.short || "DRV") : "PIT"}
                    </div>
                    <Radio className="h-4 w-4 animate-pulse" style={{ color: isUser ? teamColor : "#ff2a2a" }} />
                  </div>
                </div>

                {/* Card Body (The Quote message) */}
                <div className="p-4 bg-[#141517]/50">
                  {isUser ? (
                    <p
                      className="font-display font-black text-sm uppercase tracking-wide leading-relaxed text-right"
                      style={{ color: teamColor }}
                    >
                      "{msg.text}"
                    </p>
                  ) : (
                    <div className="font-mono text-xs leading-relaxed text-zinc-300 text-left whitespace-pre-wrap">
                      {renderFormattedText(msg.text)}
                    </div>
                  )}
                </div>

                {/* Card Footer (Transmission Time) */}
                <div className="px-4 py-1.5 bg-[#0e0f11]/30 border-t border-zinc-900/50 flex justify-between items-center text-[7.5px] font-mono text-zinc-500">
                  <span className="uppercase tracking-widest flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    comms live
                  </span>
                  <span>TIME: {msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {/* Suggestion Chips (only show when greeting is the last message) */}
          {messages.length === 1 && !isTyping && (
            <div className="pl-1 pr-1 pt-1 space-y-2.5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">
                ◆ SELECT RACE COMMS TOPIC:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s.query)}
                    className="px-2.5 py-2 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white text-[9px] font-mono uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-[#ff2a2a]" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="bg-[#1b1b1f]/60 border border-zinc-850/60 rounded-md p-3.5 shadow-md flex items-center gap-3 animate-pulse">
              <Bot className="h-4.5 w-4.5 text-[#ff2a2a] animate-bounce" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Mini is calibrating telemetry responder...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="h-14 bg-zinc-950 border-t border-hairline-strong px-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="TYPE RADIO TRANSMISSION..."
            className="flex-1 bg-zinc-900/60 border border-zinc-850 focus:border-zinc-700 outline-none text-xs text-white px-3 py-2 font-mono uppercase tracking-wider placeholder:text-zinc-600 rounded-xs"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="h-8 w-8 rounded-xs bg-[#ff2a2a] text-white flex items-center justify-center hover:bg-red-650 disabled:bg-zinc-950 disabled:text-zinc-650 border border-transparent disabled:border-zinc-850 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </>
  );
}
