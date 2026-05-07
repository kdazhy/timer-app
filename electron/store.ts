import Store from 'electron-store';
import type { Settings, StoredData, Task, SessionRecord } from './types.js';

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

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function normalizeSettings(settings: Settings): Settings {
  return {
    ...settings,
    workMinutes: clampNumber(settings.workMinutes, 1, 180),
    shortBreakMinutes: clampNumber(settings.shortBreakMinutes, 1, 60),
    longBreakMinutes: clampNumber(settings.longBreakMinutes, 1, 120),
    longBreakEvery: clampNumber(settings.longBreakEvery, 1, 12),
    globalShortcut: settings.globalShortcut.trim(),
  };
}

const store = new Store<StoredData>({
  name: 'focus-harbor-data',
  defaults: {
    settings: defaultSettings,
    tasks: [],
    sessions: [],
  },
});

export function loadData(): StoredData {
  return {
    settings: normalizeSettings({ ...defaultSettings, ...store.get('settings') }),
    tasks: store.get('tasks', []) as Task[],
    sessions: store.get('sessions', []) as SessionRecord[],
  };
}

export function saveSettings(settings: Settings): Settings {
  const merged = normalizeSettings({ ...defaultSettings, ...settings });
  store.set('settings', merged);
  return merged;
}

export function saveTasks(tasks: Task[]): Task[] {
  store.set('tasks', tasks);
  return tasks;
}

export function saveSessions(sessions: SessionRecord[]): SessionRecord[] {
  store.set('sessions', sessions);
  return sessions;
}
