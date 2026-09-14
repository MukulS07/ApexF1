import fs from "fs";
import path from "path";

const circuitsMap = {
  "Albert Park": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/au-1953.geojson",
  "Baku City Circuit": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/az-2016.geojson",
  "Circuit de Monaco": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/mc-1929.geojson",
  "Silverstone": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/gb-1948.geojson",
  "Spa-Francorchamps": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/be-1925.geojson",
  "Monza": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/it-1953.geojson",
  "Suzuka": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/jp-1962.geojson",
  "Sakhir": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/bh-2002.geojson",
  "Circuit of the Americas": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/us-2012.geojson",
  "Interlagos": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/br-1977.geojson",
  "Red Bull Ring": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/at-1969.geojson",
  "Zandvoort": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/nl-1948.geojson",
  "Marina Bay": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/sg-2008.geojson",
  "Yas Marina": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/ae-2009.geojson",
  "Circuit Gilles Villeneuve": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/ca-1978.geojson",
  "Shanghai Int'l Circuit": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/cn-2004.geojson",
  "Circuit de Barcelona": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/es-1991.geojson",
  "Hungaroring": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/hu-1986.geojson",
  "Imola": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/it-1953.geojson",
  "Miami Int'l Autodrome": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/us-2022.geojson",
  "Las Vegas Strip": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/us-2023.geojson",
  "Lusail": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/qa-2004.geojson",
  "Jeddah Corniche": "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/sa-2021.geojson",
};

function projectCoordinates(coords, width = 380, height = 220, padding = 30) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  coords.forEach(([lon, lat]) => {
    if (lon < minX) minX = lon;
    if (lon > maxX) maxX = lon;
    if (lat < minY) minY = lat;
    if (lat > maxY) maxY = lat;
  });

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const scaleX = (width - padding * 2) / rangeX;
  const scaleY = (height - padding * 2) / rangeY;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (width - rangeX * scale) / 2 + padding;
  const offsetY = (height - rangeY * scale) / 2 + padding;

  const points = coords.map(([lon, lat]) => {
    const x = (lon - minX) * scale + offsetX;
    const y = height - ((lat - minY) * scale + offsetY); // invert Y for SVG
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Pick sector markers at ~33% and ~66% along the path
  const s1Idx = Math.floor(points.length * 0.33);
  const s2Idx = Math.floor(points.length * 0.66);
  const sectorMarkers = [points[s1Idx] || points[0], points[s2Idx] || points[0]];
  const startPoint = points[0];

  return { path, sectorMarkers, startPoint };
}

async function run() {
  const result = {};

  for (const [key, url] of Object.entries(circuitsMap)) {
    try {
      console.log(`Fetching ${key} from ${url}...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      
      const props = json.features?.[0]?.properties || {};
      const coords = json.features?.[0]?.geometry?.coordinates || [];

      if (!coords.length) {
        console.warn(`No coordinates for ${key}`);
        continue;
      }

      const { path: svgPath, sectorMarkers, startPoint } = projectCoordinates(coords);

      result[key] = {
        id: props.id || key.toLowerCase().replace(/[^a-z0-9]/g, ""),
        name: props.Name || key,
        location: props.Location || key,
        country: props.id ? props.id.substring(0, 2).toUpperCase() : "",
        lengthKm: props.length ? `${(props.length / 1000).toFixed(3)} km` : "5.000 km",
        turns: 16,
        svgPath,
        sectorMarkers,
        startPoint,
      };
    } catch (err) {
      console.error(`Failed to fetch ${key}:`, err.message);
    }
  }

  const fileContent = `export type CircuitData = {
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

export const f1Circuits: Record<string, CircuitData> = ${JSON.stringify(result, null, 2)};

export function getCircuitData(circuitName?: string): CircuitData {
  if (!circuitName) return f1Circuits["Baku City Circuit"] || Object.values(f1Circuits)[0];

  if (f1Circuits[circuitName]) return f1Circuits[circuitName];

  const lower = circuitName.toLowerCase();
  const foundKey = Object.keys(f1Circuits).find(
    (k) => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)
  );

  if (foundKey) return f1Circuits[foundKey];

  return f1Circuits["Baku City Circuit"] || Object.values(f1Circuits)[0];
}
`;

  const targetPath = path.resolve(process.cwd(), "src/lib/circuits-data.ts");
  fs.writeFileSync(targetPath, fileContent, "utf8");
  console.log(` Successfully wrote official real circuits data to ${targetPath}`);
}

run();
