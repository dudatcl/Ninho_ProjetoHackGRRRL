import type { DiaryEntry, ProfileData } from './types';

const PROFILE_KEY = 'gmi:profile:v1';
const DIARY_KEY = 'gmi:diary:v1';

export const storage = {
  getProfile(): ProfileData | null {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? (JSON.parse(raw) as ProfileData) : null;
    } catch {
      return null;
    }
  },
  setProfile(p: ProfileData) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  },
  clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
  },
  getDiary(): DiaryEntry[] {
    try {
      const raw = localStorage.getItem(DIARY_KEY);
      return raw ? (JSON.parse(raw) as DiaryEntry[]) : [];
    } catch {
      return [];
    }
  },
  setDiary(entries: DiaryEntry[]) {
    localStorage.setItem(DIARY_KEY, JSON.stringify(entries));
  },
  clearAll() {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(DIARY_KEY);
  },
};

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
