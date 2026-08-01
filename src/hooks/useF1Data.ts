import { useQuery } from "@tanstack/react-query";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchSchedule,
  fetchLastRaceResults,
  fetchDriverCareerStats,
  fetchOpenF1Sessions,
  fetchLiveWeather,
  fetchLiveStints,
  findActiveOrLatestSession,
  fetchSeasonWinners,
} from "@/lib/f1-api";

// 10 minutes refresh for standings, schedule, last race results
const TEN_MIN_MS = 10 * 60 * 1000;
// 6 hours refresh for driver career stats
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
// 60 seconds refresh for weather and stints during a session
const ONE_MIN_MS = 60 * 1000;

export function useDriverStandings(year = "2026") {
  return useQuery({
    queryKey: ["driverStandings", year],
    queryFn: () => fetchDriverStandings(year),
    staleTime: TEN_MIN_MS,
    refetchInterval: TEN_MIN_MS,
  });
}

export function useConstructorStandings(year = "2026") {
  return useQuery({
    queryKey: ["constructorStandings", year],
    queryFn: () => fetchConstructorStandings(year),
    staleTime: TEN_MIN_MS,
    refetchInterval: TEN_MIN_MS,
  });
}

export function useF1Schedule(year = "2026") {
  return useQuery({
    queryKey: ["f1Schedule", year],
    queryFn: () => fetchSchedule(year),
    staleTime: TEN_MIN_MS,
    refetchInterval: TEN_MIN_MS,
  });
}

export function useLastRaceResults(year = "2026") {
  return useQuery({
    queryKey: ["lastRaceResults", year],
    queryFn: () => fetchLastRaceResults(year),
    staleTime: TEN_MIN_MS,
    refetchInterval: TEN_MIN_MS,
  });
}

export function useDriverCareerStats(driverCode?: string) {
  return useQuery({
    queryKey: ["driverCareerStats", driverCode],
    queryFn: () => fetchDriverCareerStats(driverCode!),
    enabled: !!driverCode,
    staleTime: SIX_HOURS_MS,
    refetchInterval: SIX_HOURS_MS,
  });
}

export function useLiveWeatherAndStints(year = 2026) {
  // 1. Fetch sessions (cached for 24h as it updates daily)
  const {
    data: sessions = [],
    isLoading: isSessionsLoading,
    isError: isSessionsError,
  } = useQuery({
    queryKey: ["openf1Sessions", year],
    queryFn: () => fetchOpenF1Sessions(year),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const activeSession = findActiveOrLatestSession(sessions);
  const sessionKey = activeSession?.session_key;

  // 2. Fetch live weather (polls every 60s)
  const {
    data: weather = null,
    isLoading: isWeatherLoading,
    isError: isWeatherError,
  } = useQuery({
    queryKey: ["liveWeather", sessionKey],
    queryFn: () => fetchLiveWeather(sessionKey!),
    enabled: !!sessionKey,
    staleTime: ONE_MIN_MS,
    refetchInterval: ONE_MIN_MS,
  });

  // 3. Fetch live stints (polls every 60s)
  const {
    data: stints = [],
    isLoading: isStintsLoading,
    isError: isStintsError,
  } = useQuery({
    queryKey: ["liveStints", sessionKey],
    queryFn: () => fetchLiveStints(sessionKey!),
    enabled: !!sessionKey,
    staleTime: ONE_MIN_MS,
    refetchInterval: ONE_MIN_MS,
  });

  return {
    activeSession,
    weather,
    stints,
    isLoading: isSessionsLoading || (!!sessionKey && (isWeatherLoading || isStintsLoading)),
    isError: isSessionsError || isWeatherError || isStintsError,
  };
}

export function useSeasonWinners(year = "2026") {
  return useQuery({
    queryKey: ["seasonWinners", year],
    queryFn: () => fetchSeasonWinners(year),
    staleTime: TEN_MIN_MS,
    refetchInterval: TEN_MIN_MS,
  });
}
