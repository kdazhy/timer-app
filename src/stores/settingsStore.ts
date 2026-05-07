import { create } from 'zustand';
import { pomodoroApi } from '../services/pomodoroApi';
import type { Settings } from '../types';

export const defaultSettings: Settings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  notifications: true,
  sound: true,
  alwaysOnTop: false,
  minimizeToTray: true,
  globalShortcut: 'CommandOrControl+Alt+Space',
  accentColor: '#e05a47',
};

const ranges = {
  workMinutes: [1, 180],
  shortBreakMinutes: [1, 60],
  longBreakMinutes: [1, 120],
  longBreakEvery: [1, 12],
} satisfies Record<keyof Pick<Settings, 'workMinutes' | 'shortBreakMinutes' | 'longBreakMinutes' | 'longBreakEvery'>, [number, number]>;

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeSettings(settings: Settings): Settings {
  return {
    ...settings,
    workMinutes: clampNumber(settings.workMinutes, ...ranges.workMinutes),
    shortBreakMinutes: clampNumber(settings.shortBreakMinutes, ...ranges.shortBreakMinutes),
    longBreakMinutes: clampNumber(settings.longBreakMinutes, ...ranges.longBreakMinutes),
    longBreakEvery: clampNumber(settings.longBreakEvery, ...ranges.longBreakEvery),
    globalShortcut: settings.globalShortcut.trim(),
  };
}

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  setSettings: (settings) => set({ settings: normalizeSettings({ ...defaultSettings, ...settings }) }),
  updateSettings: (next) => {
    const settings = normalizeSettings({ ...get().settings, ...next });
    set({ settings });
    void pomodoroApi.saveSettings(settings);
    void pomodoroApi.setAlwaysOnTop(settings.alwaysOnTop);
  },
}));
