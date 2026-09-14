export type CircuitData = {
  id: string;
  name: string;
  location: string;
  country: string;
  lengthKm: string;
  turns: number;
  svgPath: string;
  sectorMarkers: { x: number; y: number }[];
  startPoint: { x: number; y: number };
};

export const f1Circuits: Record<string, CircuitData> = {
  "Albert Park": {
    id: "melbourne",
    name: "Albert Park Circuit",
    location: "Melbourne",
    country: "Australia",
    lengthKm: "5.278 km",
    turns: 14,
    svgPath:
      "M 60 170 L 60 90 Q 60 60 90 60 L 220 60 Q 250 60 270 80 L 330 140 Q 350 160 340 180 Q 330 200 300 200 L 160 200 Q 120 200 100 180 Z",
    sectorMarkers: [
      { x: 180, y: 60 },
      { x: 335, y: 160 },
    ],
    startPoint: { x: 60, y: 170 },
  },
  "Baku City Circuit": {
    id: "baku",
    name: "Baku City Circuit",
    location: "Baku",
    country: "Azerbaijan",
    lengthKm: "6.003 km",
    turns: 20,
    svgPath:
      "M 40 190 L 360 190 Q 380 190 380 170 L 380 140 Q 380 120 360 120 L 240 120 L 240 70 Q 240 40 210 40 L 170 40 Q 150 40 150 60 L 150 110 Q 150 120 130 120 L 60 120 Q 40 120 40 140 Z",
    sectorMarkers: [
      { x: 360, y: 120 },
      { x: 190, y: 40 },
    ],
    startPoint: { x: 40, y: 190 },
  },
  "Circuit de Monaco": {
    id: "monaco",
    name: "Circuit de Monaco",
    location: "Monte Carlo",
    country: "Monaco",
    lengthKm: "3.337 km",
    turns: 19,
    svgPath:
      "M 80 190 L 40 190 Q 30 190 30 175 L 40 100 Q 45 60 90 50 L 180 50 Q 220 50 250 80 L 290 120 Q 320 150 350 130 Q 370 110 360 80 Q 350 50 320 60 L 260 80 L 210 130 Q 190 150 150 150 L 100 150 Z",
    sectorMarkers: [
      { x: 180, y: 50 },
      { x: 340, y: 120 },
    ],
    startPoint: { x: 80, y: 190 },
  },
  Silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    location: "Silverstone",
    country: "United Kingdom",
    lengthKm: "5.891 km",
    turns: 18,
    svgPath:
      "M 50 160 L 50 90 Q 50 50 100 50 L 160 50 L 200 90 L 240 50 L 310 50 Q 350 50 350 90 L 330 140 Q 310 180 260 180 L 190 180 Q 150 180 130 150 L 100 180 Z",
    sectorMarkers: [
      { x: 200, y: 90 },
      { x: 330, y: 140 },
    ],
    startPoint: { x: 50, y: 160 },
  },
  "Spa-Francorchamps": {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    location: "Spa",
    country: "Belgium",
    lengthKm: "7.004 km",
    turns: 19,
    svgPath:
      "M 50 190 L 40 150 Q 35 120 55 100 L 110 45 Q 125 35 145 45 L 230 75 Q 260 85 280 65 L 340 45 Q 365 40 370 65 L 350 140 Q 330 190 280 190 L 180 190 L 120 190 Z",
    sectorMarkers: [
      { x: 230, y: 75 },
      { x: 350, y: 140 },
    ],
    startPoint: { x: 50, y: 190 },
  },
  Monza: {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    location: "Monza",
    country: "Italy",
    lengthKm: "5.793 km",
    turns: 11,
    svgPath:
      "M 40 180 L 360 180 Q 380 180 380 150 L 380 120 Q 380 60 310 60 L 160 60 Q 130 60 110 80 L 70 120 Q 40 150 40 180 Z",
    sectorMarkers: [
      { x: 380, y: 120 },
      { x: 160, y: 60 },
    ],
    startPoint: { x: 40, y: 180 },
  },
  Suzuka: {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    location: "Suzuka",
    country: "Japan",
    lengthKm: "5.807 km",
    turns: 18,
    svgPath:
      "M 60 180 Q 40 140 60 100 Q 80 60 120 50 L 180 50 Q 220 50 240 80 L 300 160 Q 340 200 360 160 Q 380 120 340 80 L 260 50 Q 220 50 180 120 L 120 180 Z",
    sectorMarkers: [
      { x: 180, y: 50 },
      { x: 340, y: 80 },
    ],
    startPoint: { x: 60, y: 180 },
  },
  Sakhir: {
    id: "bahrain",
    name: "Bahrain International Circuit",
    location: "Sakhir",
    country: "Bahrain",
    lengthKm: "5.412 km",
    turns: 15,
    svgPath:
      "M 50 180 L 330 180 Q 360 180 360 150 L 340 110 Q 320 80 280 80 L 200 80 Q 170 50 130 50 L 80 80 Q 50 110 50 180 Z",
    sectorMarkers: [
      { x: 280, y: 80 },
      { x: 130, y: 50 },
    ],
    startPoint: { x: 50, y: 180 },
  },
  "Circuit of the Americas": {
    id: "cota",
    name: "Circuit of the Americas",
    location: "Austin",
    country: "USA",
    lengthKm: "5.513 km",
    turns: 20,
    svgPath:
      "M 50 190 L 70 50 Q 80 40 100 60 L 140 100 L 180 60 L 220 100 L 340 100 Q 360 100 360 130 L 360 160 Q 360 190 320 190 L 180 190 L 120 190 Z",
    sectorMarkers: [
      { x: 180, y: 60 },
      { x: 360, y: 130 },
    ],
    startPoint: { x: 50, y: 190 },
  },
  Interlagos: {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    location: "São Paulo",
    country: "Brazil",
    lengthKm: "4.309 km",
    turns: 15,
    svgPath:
      "M 80 180 L 80 90 Q 80 50 120 50 L 180 50 Q 220 50 250 80 L 320 80 Q 350 80 350 110 L 330 160 Q 300 200 240 170 L 180 130 L 130 180 Z",
    sectorMarkers: [
      { x: 180, y: 50 },
      { x: 330, y: 160 },
    ],
    startPoint: { x: 80, y: 180 },
  },
  "Red Bull Ring": {
    id: "spielberg",
    name: "Red Bull Ring",
    location: "Spielberg",
    country: "Austria",
    lengthKm: "4.318 km",
    turns: 10,
    svgPath:
      "M 60 180 L 340 180 Q 360 180 360 150 L 280 60 Q 260 40 230 50 L 150 80 Q 110 60 80 90 L 50 140 Z",
    sectorMarkers: [
      { x: 280, y: 60 },
      { x: 150, y: 80 },
    ],
    startPoint: { x: 60, y: 180 },
  },
  Zandvoort: {
    id: "zandvoort",
    name: "Circuit Zandvoort",
    location: "Zandvoort",
    country: "Netherlands",
    lengthKm: "4.259 km",
    turns: 14,
    svgPath:
      "M 60 180 L 60 90 Q 60 50 100 50 L 200 50 Q 250 50 280 80 L 320 120 Q 350 160 320 180 Q 280 200 220 170 L 140 170 Z",
    sectorMarkers: [
      { x: 200, y: 50 },
      { x: 320, y: 120 },
    ],
    startPoint: { x: 60, y: 180 },
  },
  "Marina Bay": {
    id: "singapore",
    name: "Marina Bay Street Circuit",
    location: "Singapore",
    country: "Singapore",
    lengthKm: "4.940 km",
    turns: 19,
    svgPath:
      "M 50 180 L 350 180 Q 370 180 370 150 L 370 110 Q 370 70 330 70 L 220 70 L 180 110 L 130 70 Q 90 70 50 110 Z",
    sectorMarkers: [
      { x: 330, y: 70 },
      { x: 180, y: 110 },
    ],
    startPoint: { x: 50, y: 180 },
  },
  "Yas Marina": {
    id: "abudhabi",
    name: "Yas Marina Circuit",
    location: "Abu Dhabi",
    country: "United Arab Emirates",
    lengthKm: "5.281 km",
    turns: 16,
    svgPath:
      "M 40 180 L 360 180 Q 380 180 380 140 L 360 90 Q 340 50 290 50 L 180 50 Q 140 50 110 80 L 60 130 Q 40 150 40 180 Z",
    sectorMarkers: [
      { x: 290, y: 50 },
      { x: 110, y: 80 },
    ],
    startPoint: { x: 40, y: 180 },
  },
};

export function getCircuitData(circuitName?: string): CircuitData {
  if (!circuitName) return f1Circuits["Baku City Circuit"];

  if (f1Circuits[circuitName]) return f1Circuits[circuitName];

  const lower = circuitName.toLowerCase();
  const foundKey = Object.keys(f1Circuits).find(
    (k) => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );

  if (foundKey) return f1Circuits[foundKey];

  return f1Circuits["Baku City Circuit"];
}
