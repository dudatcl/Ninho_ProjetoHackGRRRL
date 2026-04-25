import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storage, todayKey } from '@/lib/storage';
import type { DiaryEntry, ProfileData, SymptomKey } from '@/lib/types';

interface AppCtx {
  profile: ProfileData | null;
  diary: DiaryEntry[];
  currentWeek: number;        // weeks + demoOffsetWeeks (clamped 1-42)
  daysToBirth: number;
  saveProfile: (p: Omit<ProfileData, 'createdAt' | 'demoOffsetWeeks'>) => void;
  resetAll: () => void;
  toggleSymptomToday: (s: SymptomKey) => void;
  advanceWeeks: (n: number) => void;
  consecutiveDaysWith: (s: SymptomKey) => number;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(() => storage.getProfile());
  const [diary, setDiary] = useState<DiaryEntry[]>(() => storage.getDiary());

  useEffect(() => {
    if (profile) storage.setProfile(profile);
  }, [profile]);

  useEffect(() => {
    storage.setDiary(diary);
  }, [diary]);

  const saveProfile: AppCtx['saveProfile'] = useCallback((p) => {
    const full: ProfileData = {
      ...p,
      createdAt: new Date().toISOString(),
      demoOffsetWeeks: 0,
    };
    setProfile(full);
  }, []);

  const resetAll = useCallback(() => {
    storage.clearAll();
    setProfile(null);
    setDiary([]);
  }, []);

  const toggleSymptomToday = useCallback((s: SymptomKey) => {
    const key = todayKey();
    setDiary((prev) => {
      const idx = prev.findIndex((e) => e.date === key);
      if (idx === -1) return [...prev, { date: key, symptoms: [s] }];
      const entry = prev[idx];
      const has = entry.symptoms.includes(s);
      const updated: DiaryEntry = {
        ...entry,
        symptoms: has ? entry.symptoms.filter((x) => x !== s) : [...entry.symptoms, s],
      };
      const copy = [...prev];
      copy[idx] = updated;
      return copy;
    });
  }, []);

  const advanceWeeks = useCallback((n: number) => {
    setProfile((prev) => (prev ? { ...prev, demoOffsetWeeks: prev.demoOffsetWeeks + n } : prev));
  }, []);

  const currentWeek = useMemo(() => {
    if (!profile) return 0;
    return Math.max(1, Math.min(42, profile.weeks + profile.demoOffsetWeeks));
  }, [profile]);

  const daysToBirth = useMemo(() => Math.max(0, (40 - currentWeek) * 7), [currentWeek]);

  const consecutiveDaysWith = useCallback(
    (s: SymptomKey) => {
      // checa hoje, ontem, anteontem...
      let count = 0;
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = todayKey(d);
        const entry = diary.find((e) => e.date === key);
        if (entry?.symptoms.includes(s)) count++;
        else break;
      }
      return count;
    },
    [diary],
  );

  const value: AppCtx = {
    profile,
    diary,
    currentWeek,
    daysToBirth,
    saveProfile,
    resetAll,
    toggleSymptomToday,
    advanceWeeks,
    consecutiveDaysWith,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppStateProvider');
  return ctx;
}
