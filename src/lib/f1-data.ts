// Static 2026 F1 season data — the frontend-only dashboard operates on this
// curated dataset (Jolpica/OpenF1 wiring lives out of scope for this demo).

export type Team = {
  id: string;
  name: string;
  short: string;
  color: string; // hex, becomes the personalized --team accent
  hq: string;
};

export type Driver = {
  id: string; // 3-letter code, e.g. VER
  firstName: string;
  lastName: string;
  number: number;
  teamId: string;
  country: string; // ISO alpha-2
  wins: number;
  poles: number;
  podiums: number;
  championships: number;
  form: number[]; // last 5 race finishes (position)
};

export type Race = {
  round: number;
  name: string;
  circuit: string;
  country: string;
  city: string;
  dateISO: string;         // race start (Sunday) in UTC
  qualifyingISO: string;
  sprint?: string;
  lapRecord: string;
  polePrev: string;
};

export const teams: Team[] = [
  { id: "mclaren", name: "McLaren", short: "MCL", color: "#ff8000", hq: "Woking, UK" },
  { id: "ferrari", name: "Scuderia Ferrari", short: "FER", color: "#dc0000", hq: "Maranello, IT" },
  { id: "mercedes", name: "Mercedes-AMG", short: "MER", color: "#00d7b6", hq: "Brackley, UK" },
  { id: "redbull", name: "Red Bull Racing", short: "RBR", color: "#4781d7", hq: "Milton Keynes, UK" },
  { id: "aston", name: "Aston Martin", short: "AST", color: "#229971", hq: "Silverstone, UK" },
  { id: "alpine", name: "Alpine", short: "ALP", color: "#ff87bc", hq: "Enstone, UK" },
  { id: "williams", name: "Williams", short: "WIL", color: "#1868db", hq: "Grove, UK" },
  { id: "rb", name: "Racing Bulls", short: "RB",  color: "#6692ff", hq: "Faenza, IT" },
  { id: "sauber", name: "Kick Sauber", short: "SAU", color: "#01c00e", hq: "Hinwil, CH" },
  { id: "haas", name: "Haas", short: "HAA", color: "#b6babd", hq: "Kannapolis, US" },
  { id: "cadillac", name: "Cadillac F1", short: "CAD", color: "#efeff0", hq: "Charlotte, US" },
];

export const drivers: Driver[] = [
  { id: "NOR", firstName: "Lando",    lastName: "Norris",     number: 4,  teamId: "mclaren",  country: "GB", wins: 12, poles: 14, podiums: 44, championships: 1, form: [1,2,1,3,1] },
  { id: "PIA", firstName: "Oscar",    lastName: "Piastri",    number: 81, teamId: "mclaren",  country: "AU", wins: 9,  poles: 7,  podiums: 30, championships: 0, form: [2,1,4,1,2] },
  { id: "LEC", firstName: "Charles",  lastName: "Leclerc",    number: 16, teamId: "ferrari",  country: "MC", wins: 8,  poles: 26, podiums: 42, championships: 0, form: [3,4,2,5,4] },
  { id: "HAM", firstName: "Lewis",    lastName: "Hamilton",   number: 44, teamId: "ferrari",  country: "GB", wins: 105,poles: 104,podiums: 202,championships: 7, form: [5,3,7,4,6] },
  { id: "RUS", firstName: "George",   lastName: "Russell",    number: 63, teamId: "mercedes", country: "GB", wins: 4,  poles: 5,  podiums: 18, championships: 0, form: [4,5,3,2,3] },
  { id: "ANT", firstName: "Andrea Kimi", lastName: "Antonelli", number: 12, teamId: "mercedes", country: "IT", wins: 1, poles: 1, podiums: 6, championships: 0, form: [6,8,5,7,5] },
  { id: "VER", firstName: "Max",      lastName: "Verstappen", number: 1,  teamId: "redbull",  country: "NL", wins: 64, poles: 44, podiums: 118,championships: 4, form: [7,6,6,6,7] },
  { id: "TSU", firstName: "Yuki",     lastName: "Tsunoda",    number: 22, teamId: "redbull",  country: "JP", wins: 0,  poles: 0,  podiums: 1,  championships: 0, form: [10,9,8,11,10] },
  { id: "ALO", firstName: "Fernando", lastName: "Alonso",     number: 14, teamId: "aston",    country: "ES", wins: 32, poles: 22, podiums: 106,championships: 2, form: [8,7,10,8,9] },
  { id: "STR", firstName: "Lance",    lastName: "Stroll",     number: 18, teamId: "aston",    country: "CA", wins: 0,  poles: 1,  podiums: 3,  championships: 0, form: [12,14,11,13,12] },
  { id: "GAS", firstName: "Pierre",   lastName: "Gasly",      number: 10, teamId: "alpine",   country: "FR", wins: 1,  poles: 0,  podiums: 5,  championships: 0, form: [11,10,12,9,11] },
  { id: "COL", firstName: "Franco",   lastName: "Colapinto",  number: 43, teamId: "alpine",   country: "AR", wins: 0,  poles: 0,  podiums: 0,  championships: 0, form: [15,17,14,16,15] },
  { id: "ALB", firstName: "Alex",     lastName: "Albon",      number: 23, teamId: "williams", country: "TH", wins: 0,  poles: 0,  podiums: 2,  championships: 0, form: [9,11,9,10,8] },
  { id: "SAI", firstName: "Carlos",   lastName: "Sainz",      number: 55, teamId: "williams", country: "ES", wins: 4,  poles: 6,  podiums: 27, championships: 0, form: [13,12,13,12,13] },
  { id: "HAD", firstName: "Isack",    lastName: "Hadjar",     number: 6,  teamId: "rb",       country: "FR", wins: 0,  poles: 0,  podiums: 1,  championships: 0, form: [14,13,15,14,14] },
  { id: "LAW", firstName: "Liam",     lastName: "Lawson",     number: 30, teamId: "rb",       country: "NZ", wins: 0,  poles: 0,  podiums: 0,  championships: 0, form: [16,15,17,15,16] },
  { id: "HUL", firstName: "Nico",     lastName: "Hülkenberg", number: 27, teamId: "sauber",   country: "DE", wins: 0,  poles: 1,  podiums: 1,  championships: 0, form: [17,16,16,17,18] },
  { id: "BOR", firstName: "Gabriel",  lastName: "Bortoleto",  number: 5,  teamId: "sauber",   country: "BR", wins: 0,  poles: 0,  podiums: 0,  championships: 0, form: [18,18,19,18,17] },
  { id: "OCO", firstName: "Esteban",  lastName: "Ocon",       number: 31, teamId: "haas",     country: "FR", wins: 1,  poles: 0,  podiums: 3,  championships: 0, form: [19,20,18,19,19] },
  { id: "BEA", firstName: "Ollie",    lastName: "Bearman",    number: 87, teamId: "haas",     country: "GB", wins: 0,  poles: 0,  podiums: 0,  championships: 0, form: [20,19,20,20,20] },
  { id: "PER", firstName: "Sergio",   lastName: "Pérez",      number: 11, teamId: "cadillac", country: "MX", wins: 6,  poles: 3,  podiums: 39, championships: 0, form: [21,21,21,21,21] },
  { id: "BOT", firstName: "Valtteri", lastName: "Bottas",     number: 77, teamId: "cadillac", country: "FI", wins: 10, poles: 20, podiums: 67, championships: 0, form: [22,22,22,22,22] },
];

// Standings after Round 11 (Austrian GP) — 2026 season mid-year snapshot
export const driversStandings = [
  { driverId: "PIA", points: 234 },
  { driverId: "NOR", points: 226 },
  { driverId: "LEC", points: 151 },
  { driverId: "RUS", points: 147 },
  { driverId: "VER", points: 138 },
  { driverId: "HAM", points: 109 },
  { driverId: "ANT", points: 97  },
  { driverId: "ALB", points: 54  },
  { driverId: "ALO", points: 42  },
  { driverId: "HAD", points: 38  },
];

export const constructorsStandings = [
  { teamId: "mclaren",  points: 460 },
  { teamId: "ferrari",  points: 260 },
  { teamId: "mercedes", points: 244 },
  { teamId: "redbull",  points: 172 },
  { teamId: "williams", points: 72  },
  { teamId: "aston",    points: 58  },
  { teamId: "rb",       points: 52  },
  { teamId: "alpine",   points: 27  },
  { teamId: "haas",     points: 18  },
  { teamId: "sauber",   points: 11  },
  { teamId: "cadillac", points: 3   },
];

export const calendar2026: Race[] = [
  { round: 1,  name: "Australian GP",     circuit: "Albert Park",           country: "Australia",    city: "Melbourne",   dateISO: "2026-03-08T04:00:00Z", qualifyingISO: "2026-03-07T05:00:00Z", lapRecord: "1:19.813", polePrev: "1:15.096" },
  { round: 2,  name: "Chinese GP",        circuit: "Shanghai Int'l Circuit",country: "China",        city: "Shanghai",    dateISO: "2026-03-15T07:00:00Z", qualifyingISO: "2026-03-14T07:00:00Z", sprint: "2026-03-14T03:00:00Z", lapRecord: "1:32.238", polePrev: "1:30.641" },
  { round: 3,  name: "Japanese GP",       circuit: "Suzuka",                country: "Japan",        city: "Suzuka",      dateISO: "2026-03-29T05:00:00Z", qualifyingISO: "2026-03-28T06:00:00Z", lapRecord: "1:30.983", polePrev: "1:26.983" },
  { round: 4,  name: "Bahrain GP",        circuit: "Sakhir",                country: "Bahrain",      city: "Sakhir",      dateISO: "2026-04-12T15:00:00Z", qualifyingISO: "2026-04-11T16:00:00Z", lapRecord: "1:31.447", polePrev: "1:29.407" },
  { round: 5,  name: "Saudi Arabian GP",  circuit: "Jeddah Corniche",       country: "Saudi Arabia", city: "Jeddah",      dateISO: "2026-04-19T17:00:00Z", qualifyingISO: "2026-04-18T17:00:00Z", lapRecord: "1:30.734", polePrev: "1:27.294" },
  { round: 6,  name: "Miami GP",          circuit: "Miami Int'l Autodrome", country: "USA",          city: "Miami",       dateISO: "2026-05-03T19:30:00Z", qualifyingISO: "2026-05-02T19:00:00Z", sprint: "2026-05-02T16:00:00Z", lapRecord: "1:29.708", polePrev: "1:26.983" },
  { round: 7,  name: "Emilia Romagna GP", circuit: "Imola",                 country: "Italy",        city: "Imola",       dateISO: "2026-05-24T13:00:00Z", qualifyingISO: "2026-05-23T14:00:00Z", lapRecord: "1:15.484", polePrev: "1:14.746" },
  { round: 8,  name: "Monaco GP",         circuit: "Circuit de Monaco",     country: "Monaco",       city: "Monte Carlo", dateISO: "2026-05-31T13:00:00Z", qualifyingISO: "2026-05-30T14:00:00Z", lapRecord: "1:12.909", polePrev: "1:10.270" },
  { round: 9,  name: "Spanish GP",        circuit: "Circuit de Barcelona",  country: "Spain",        city: "Barcelona",   dateISO: "2026-06-14T13:00:00Z", qualifyingISO: "2026-06-13T14:00:00Z", lapRecord: "1:16.330", polePrev: "1:11.383" },
  { round: 10, name: "Canadian GP",       circuit: "Circuit Gilles Villeneuve", country: "Canada",   city: "Montreal",    dateISO: "2026-06-28T18:00:00Z", qualifyingISO: "2026-06-27T20:00:00Z", lapRecord: "1:13.078", polePrev: "1:10.899" },
  { round: 11, name: "Austrian GP",       circuit: "Red Bull Ring",         country: "Austria",      city: "Spielberg",   dateISO: "2026-07-05T13:00:00Z", qualifyingISO: "2026-07-04T14:00:00Z", lapRecord: "1:05.619", polePrev: "1:03.720" },
  { round: 12, name: "British GP",        circuit: "Silverstone",           country: "UK",           city: "Silverstone", dateISO: "2026-07-19T14:00:00Z", qualifyingISO: "2026-07-18T14:00:00Z", lapRecord: "1:27.097", polePrev: "1:25.819" },
  { round: 13, name: "Hungarian GP",      circuit: "Hungaroring",           country: "Hungary",      city: "Budapest",    dateISO: "2026-08-02T13:00:00Z", qualifyingISO: "2026-08-01T14:00:00Z", lapRecord: "1:16.627", polePrev: "1:15.227" },
  { round: 14, name: "Belgian GP",        circuit: "Spa-Francorchamps",     country: "Belgium",      city: "Spa",         dateISO: "2026-08-23T13:00:00Z", qualifyingISO: "2026-08-22T14:00:00Z", sprint: "2026-08-22T10:00:00Z", lapRecord: "1:44.701", polePrev: "1:40.907" },
  { round: 15, name: "Dutch GP",          circuit: "Zandvoort",             country: "Netherlands",  city: "Zandvoort",   dateISO: "2026-09-06T13:00:00Z", qualifyingISO: "2026-09-05T13:00:00Z", lapRecord: "1:11.097", polePrev: "1:08.660" },
  { round: 16, name: "Italian GP",        circuit: "Monza",                 country: "Italy",        city: "Monza",       dateISO: "2026-09-13T13:00:00Z", qualifyingISO: "2026-09-12T14:00:00Z", lapRecord: "1:21.046", polePrev: "1:18.792" },
  { round: 17, name: "Azerbaijan GP",     circuit: "Baku City Circuit",     country: "Azerbaijan",   city: "Baku",        dateISO: "2026-09-27T11:00:00Z", qualifyingISO: "2026-09-26T12:00:00Z", lapRecord: "1:43.009", polePrev: "1:41.365" },
  { round: 18, name: "Singapore GP",      circuit: "Marina Bay",            country: "Singapore",    city: "Singapore",   dateISO: "2026-10-11T12:00:00Z", qualifyingISO: "2026-10-10T13:00:00Z", lapRecord: "1:34.486", polePrev: "1:29.525" },
  { round: 19, name: "United States GP",  circuit: "Circuit of the Americas", country: "USA",        city: "Austin",      dateISO: "2026-10-25T19:00:00Z", qualifyingISO: "2026-10-24T22:00:00Z", sprint: "2026-10-24T18:00:00Z", lapRecord: "1:36.169", polePrev: "1:32.833" },
  { round: 20, name: "Mexico City GP",    circuit: "Autódromo Hermanos Rodríguez", country: "Mexico", city: "Mexico City", dateISO: "2026-11-01T20:00:00Z", qualifyingISO: "2026-10-31T22:00:00Z", lapRecord: "1:17.774", polePrev: "1:15.946" },
  { round: 21, name: "São Paulo GP",      circuit: "Interlagos",            country: "Brazil",       city: "São Paulo",   dateISO: "2026-11-08T17:00:00Z", qualifyingISO: "2026-11-07T18:30:00Z", sprint: "2026-11-07T14:00:00Z", lapRecord: "1:10.540", polePrev: "1:08.899" },
  { round: 22, name: "Las Vegas GP",      circuit: "Las Vegas Strip",       country: "USA",          city: "Las Vegas",   dateISO: "2026-11-22T06:00:00Z", qualifyingISO: "2026-11-21T06:00:00Z", lapRecord: "1:34.876", polePrev: "1:32.312" },
  { round: 23, name: "Qatar GP",          circuit: "Lusail",                country: "Qatar",        city: "Lusail",      dateISO: "2026-11-29T16:00:00Z", qualifyingISO: "2026-11-28T18:00:00Z", sprint: "2026-11-28T14:00:00Z", lapRecord: "1:22.384", polePrev: "1:20.235" },
  { round: 24, name: "Abu Dhabi GP",      circuit: "Yas Marina",            country: "UAE",          city: "Abu Dhabi",   dateISO: "2026-12-06T13:00:00Z", qualifyingISO: "2026-12-05T14:00:00Z", lapRecord: "1:25.637", polePrev: "1:22.595" },
];

// "Last race" recap — Austrian GP 2026 (Round 11), most recently completed
export const lastRace = {
  name: "Austrian GP",
  circuit: "Red Bull Ring",
  round: 11,
  dateISO: "2026-07-05T13:00:00Z",
  winnerId: "PIA",
  fastestLapId: "NOR",
  fastestLap: "1:06.482",
  podium: ["PIA", "NOR", "LEC"] as string[],
  poleId: "NOR",
  poleTime: "1:03.512",
  q3Best: "1:03.512",
  top10: ["PIA","NOR","LEC","RUS","VER","HAM","ANT","ALB","HAD","ALO"] as string[],
  conditions: { airC: 24, trackC: 41, humidity: 46, rain: false as boolean },
  tireStrategy: [
    { driverId: "PIA", stints: ["M","H","H"] as string[] },
    { driverId: "NOR", stints: ["M","H","M"] as string[] },
    { driverId: "LEC", stints: ["S","M","H"] as string[] },
    { driverId: "RUS", stints: ["M","M","H"] as string[] },
    { driverId: "VER", stints: ["H","M","M"] as string[] },
  ],
};

export function getDriver(id: string) {
  return drivers.find((d) => d.id === id);
}
export function getTeam(id: string) {
  return teams.find((t) => t.id === id);
}
export function getDriverTeamColor(driverId: string) {
  const d = getDriver(driverId);
  if (!d) return "#0066cc";
  return getTeam(d.teamId)?.color ?? "#0066cc";
}
export function nextRace(now = new Date()): Race {
  const upcoming = calendar2026.find((r) => new Date(r.dateISO).getTime() > now.getTime());
  return upcoming ?? calendar2026[calendar2026.length - 1];
}
