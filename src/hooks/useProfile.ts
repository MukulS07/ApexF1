import { useEffect, useState } from "react";
import { getDriverTeamColor } from "@/lib/f1-data";

export type Profile = {
  name: string;
  favoriteDriverId: string;
};

const KEY = "pitwall.profile.v1";

export function useProfile() {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProfileState(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (profile) {
      const color = getDriverTeamColor(profile.favoriteDriverId);
      document.documentElement.style.setProperty("--team-hex", color);
    }
  }, [profile, hydrated]);

  const setProfile = (p: Profile) => {
    setProfileState(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return { profile, setProfile, clearProfile, hydrated };
}
