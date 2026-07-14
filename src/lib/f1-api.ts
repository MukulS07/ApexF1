import { drivers, teams, type Driver, type Race, getDriverTeamColor } from "./f1-data";

const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const OPENF1_BASE_URL = "https://api.openf1.org/v1";

// Mapping 3-letter driver codes to Jolpica API driver IDs
export const DRIVER_CODE_TO_API_ID: Record<string, string> = {
  NOR: "norris",
  PIA: "piastri",
  LEC: "leclerc",
  HAM: "hamilton",
  RUS: "russell",
  ANT: "antonelli",
  VER: "max_verstappen",
  TSU: "tsunoda",
  ALO: "alonso",
  STR: "stroll",
  GAS: "gasly",
  COL: "colapinto",
  ALB: "albon",
  SAI: "sainz",
  HAD: "hadjar",
  LAW: "lawson",
  HUL: "hulkenberg",
  BOR: "bortoleto",
  OCO: "ocon",
  BEA: "bearman",
  PER: "perez",
  BOT: "bottas",
};

// Reverse mapping
export const API_ID_TO_DRIVER_CODE: Record<string, string> = Object.entries(
  DRIVER_CODE_TO_API_ID,
).reduce(
  (acc, [code, id]) => {
    acc[id] = code;
    return acc;
  },
  {} as Record<string, string>,
);

// Mapping Jolpica constructor IDs to our local team IDs
export const API_CONSTRUCTOR_TO_APP_TEAM: Record<string, string> = {
  mclaren: "mclaren",
  ferrari: "ferrari",
  mercedes: "mercedes",
  red_bull: "redbull",
  aston_martin: "aston",
  alpine: "alpine",
  williams: "williams",
  rb: "rb",
  sauber: "sauber",
  audi: "sauber",
  haas: "haas",
  cadillac: "cadillac",
};

// Helper: map api driver to our driver ID
export function getDriverCodeFromApi(apiDriver: { driverId: string; code?: string }) {
  if (apiDriver.code && drivers.some((d) => d.id === apiDriver.code)) {
    return apiDriver.code;
  }
  return API_ID_TO_DRIVER_CODE[apiDriver.driverId] || apiDriver.code || "";
}

// ----------------------------------------------------
// Jolpica API Calls
// ----------------------------------------------------

export async function fetchDriverStandings(year = "2026") {
  const res = await fetch(`${JOLPICA_BASE_URL}/${year}/driverstandings.json`);
  if (!res.ok) throw new Error("Failed to fetch driver standings");
  const data = await res.json();
  const lists = data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  return lists.map((item: any) => ({
    driverId: getDriverCodeFromApi(item.Driver),
    points: parseInt(item.points, 10),
    position: parseInt(item.position, 10),
    wins: parseInt(item.wins, 10),
    rawDriver: item.Driver,
    constructorId:
      API_CONSTRUCTOR_TO_APP_TEAM[item.Constructors?.[0]?.constructorId] ||
      item.Constructors?.[0]?.constructorId ||
      "haas",
  }));
}

export async function fetchConstructorStandings(year = "2026") {
  const res = await fetch(`${JOLPICA_BASE_URL}/${year}/constructorstandings.json`);
  if (!res.ok) throw new Error("Failed to fetch constructor standings");
  const data = await res.json();
  const lists = data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

  return lists.map((item: any) => ({
    teamId:
      API_CONSTRUCTOR_TO_APP_TEAM[item.Constructor.constructorId] || item.Constructor.constructorId,
    points: parseInt(item.points, 10),
    position: parseInt(item.position, 10),
    wins: parseInt(item.wins, 10),
    teamName: item.Constructor.name,
  }));
}

export async function fetchSchedule(year = "2026"): Promise<Race[]> {
  const res = await fetch(`${JOLPICA_BASE_URL}/${year}.json`);
  if (!res.ok) throw new Error("Failed to fetch schedule");
  const data = await res.json();
  const races = data.MRData?.RaceTable?.Races || [];

  return races.map((r: any) => {
    // Map dates to UTC ISO format
    const dateISO = r.time ? `${r.date}T${r.time}` : `${r.date}T00:00:00Z`;
    const qualifyingISO = r.Qualifying
      ? r.Qualifying.time
        ? `${r.Qualifying.date}T${r.Qualifying.time}`
        : `${r.Qualifying.date}T00:00:00Z`
      : dateISO;

    return {
      round: parseInt(r.round, 10),
      name: r.raceName,
      circuit: r.Circuit.circuitName,
      country: r.Circuit.Location.country,
      city: r.Circuit.Location.locality,
      dateISO,
      qualifyingISO,
      sprint: r.Sprint
        ? r.Sprint.time
          ? `${r.Sprint.date}T${r.Sprint.time}`
          : `${r.Sprint.date}T00:00:00Z`
        : undefined,
      lapRecord: "1:18.500", // Fallback static circuit trivia
      polePrev: "1:15.000",
    };
  });
}

export async function fetchLastRaceResults(year = "2026") {
  const res = await fetch(`${JOLPICA_BASE_URL}/${year}/last/results.json`);
  if (!res.ok) throw new Error("Failed to fetch last race results");
  const data = await res.json();
  const race = data.MRData?.RaceTable?.Races?.[0];
  if (!race) return null;

  const results = race.Results || [];
  const top10 = results.slice(0, 10).map((r: any) => getDriverCodeFromApi(r.Driver));
  const podium = results.slice(0, 3).map((r: any) => getDriverCodeFromApi(r.Driver));

  // Find fastest lap
  let fastestLapId = "";
  let fastestLapTime = "--:--.---";
  results.forEach((r: any) => {
    if (r.FastestLap?.rank === "1") {
      fastestLapId = getDriverCodeFromApi(r.Driver);
      fastestLapTime = r.FastestLap.Time.time;
    }
  });

  // Find pole position
  const poleWinner = results.find((r: any) => parseInt(r.grid, 10) === 1);
  const poleId = poleWinner ? getDriverCodeFromApi(poleWinner.Driver) : top10[0];

  const resultsMapped = results.map((r: any) => ({
    driverId: getDriverCodeFromApi(r.Driver),
    position: parseInt(r.position, 10),
    points: parseInt(r.points || "0", 10),
    grid: parseInt(r.grid || "0", 10),
    status: r.status,
    time: r.Time?.time || r.status || "",
    rawDriver: r.Driver,
    rawConstructor: r.Constructor,
  }));

  return {
    name: race.raceName,
    circuit: race.Circuit.circuitName,
    round: parseInt(race.round, 10),
    dateISO: race.time ? `${race.date}T${race.time}` : `${race.date}T00:00:00Z`,
    winnerId: podium[0] || "",
    fastestLapId: fastestLapId || podium[0] || "",
    fastestLap: fastestLapTime,
    podium,
    poleId,
    poleTime: poleWinner?.FastestLap?.Time?.time || "1:03.512",
    q3Best: poleWinner?.FastestLap?.Time?.time || "1:03.512",
    top10,
    results: resultsMapped,
    // Weather will be loaded separately from OpenF1
    conditions: { airC: 22, trackC: 38, humidity: 50, rain: false },
    tireStrategy: [], // will be loaded from OpenF1 stints
  };
}

export async function fetchDriverCareerStats(driverCode: string) {
  const apiId = DRIVER_CODE_TO_API_ID[driverCode];
  if (!apiId) throw new Error(`Unknown driver code: ${driverCode}`);

  const winsUrl = `${JOLPICA_BASE_URL}/drivers/${apiId}/results/1.json?limit=1`;
  const polesUrl = `${JOLPICA_BASE_URL}/drivers/${apiId}/qualifying/1.json?limit=1`;
  const p2Url = `${JOLPICA_BASE_URL}/drivers/${apiId}/results/2.json?limit=1`;
  const p3Url = `${JOLPICA_BASE_URL}/drivers/${apiId}/results/3.json?limit=1`;

  // Fetch totals in parallel
  const [winsRes, polesRes, p2Res, p3Res] = await Promise.all([
    fetch(winsUrl),
    fetch(polesUrl),
    fetch(p2Url),
    fetch(p3Url),
  ]);

  const [winsData, polesData, p2Data, p3Data] = await Promise.all([
    winsRes.json(),
    polesRes.json(),
    p2Res.json(),
    p3Res.json(),
  ]);

  const wins = parseInt(winsData.MRData?.total || "0", 10);
  const poles = parseInt(polesData.MRData?.total || "0", 10);
  const p2 = parseInt(p2Data.MRData?.total || "0", 10);
  const p3 = parseInt(p3Data.MRData?.total || "0", 10);
  const podiums = wins + p2 + p3;

  // Fetch last 5 races form
  // We first fetch results with limit=5 and offset=total-5 to get the latest 5 races
  const totalRacesRes = await fetch(`${JOLPICA_BASE_URL}/drivers/${apiId}/results.json?limit=1`);
  const totalRacesData = await totalRacesRes.json();
  const totalRaces = parseInt(totalRacesData.MRData?.total || "0", 10);

  let form: number[] = [];
  if (totalRaces > 0) {
    const limit = Math.min(5, totalRaces);
    const offset = Math.max(0, totalRaces - limit);
    const formRes = await fetch(
      `${JOLPICA_BASE_URL}/drivers/${apiId}/results.json?limit=${limit}&offset=${offset}`,
    );
    const formData = await formRes.json();
    const races = formData.MRData?.RaceTable?.Races || [];

    form = races.map((r: any) => {
      const pos = parseInt(r.Results?.[0]?.position || "20", 10);
      return isNaN(pos) ? 20 : pos;
    });
  }

  return {
    wins,
    poles,
    podiums,
    form,
  };
}

// ----------------------------------------------------
// OpenF1 API Calls
// ----------------------------------------------------

export interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_short_name: string;
  country_name: string;
}

export async function fetchOpenF1Sessions(year = 2026): Promise<OpenF1Session[]> {
  const res = await fetch(`${OPENF1_BASE_URL}/sessions?year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch OpenF1 sessions");
  return res.json();
}

export function findActiveOrLatestSession(sessions: OpenF1Session[], now = new Date()) {
  if (!sessions.length) return null;
  const nowMs = now.getTime();

  // 1. Try to find a currently active session
  const active = sessions.find((s) => {
    const start = new Date(s.date_start).getTime();
    const end = new Date(s.date_end).getTime();
    return nowMs >= start && nowMs <= end;
  });
  if (active) return active;

  // 2. Otherwise find the most recent session in the past
  const pastSessions = sessions
    .filter((s) => new Date(s.date_start).getTime() <= nowMs)
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());

  return pastSessions[0] || null;
}

export async function fetchLiveWeather(sessionKey: number) {
  const res = await fetch(`${OPENF1_BASE_URL}/weather?session_key=${sessionKey}`);
  if (!res.ok) throw new Error("Failed to fetch weather");
  const data = await res.json();
  if (!data.length) return null;

  // Return the most recent weather sample
  return data[data.length - 1];
}

export interface OpenF1Stint {
  compound: string;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export async function fetchLiveStints(sessionKey: number): Promise<OpenF1Stint[]> {
  const res = await fetch(`${OPENF1_BASE_URL}/stints?session_key=${sessionKey}`);
  if (!res.ok) throw new Error("Failed to fetch stints");
  return res.json();
}

export async function fetchSeasonWinners(year = "2026") {
  const res = await fetch(`${JOLPICA_BASE_URL}/${year}/results/1.json?limit=50`);
  if (!res.ok) throw new Error("Failed to fetch season winners");
  const data = await res.json();
  const races = data.MRData?.RaceTable?.Races || [];

  const winners: Record<
    number,
    { driverId: string; code: string; lastName: string; teamColor: string }
  > = {};
  races.forEach((r: any) => {
    const result = r.Results?.[0];
    if (result) {
      const code = getDriverCodeFromApi(result.Driver);
      winners[parseInt(r.round, 10)] = {
        driverId: code,
        code,
        lastName: result.Driver.familyName,
        teamColor: getDriverTeamColor(code),
      };
    }
  });
  return winners;
}
