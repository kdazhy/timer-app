import type { PomodoroApi, SessionRecord, Settings, StoredData, Task } from '../types';

const storageKey = 'focus-harbor-data';

const defaultData: StoredData = {
  settings: {
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
  },
  tasks: [],
  sessions: [],
};

function readData(): StoredData {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return defaultData;

  try {
    const data = JSON.parse(raw) as Partial<StoredData>;
    return {
      settings: { ...defaultData.settings, ...data.settings },
      tasks: data.tasks ?? [],
      sessions: data.sessions ?? [],
    };
  } catch {
    return defaultData;
  }
}

function writeData(data: StoredData) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

const fallbackApi: PomodoroApi = {
  loadData: async () => readData(),
  saveSettings: async (settings: Settings) => {
    writeData({ ...readData(), settings });
    return settings;
  },
  saveTasks: async (tasks: Task[]) => {
    writeData({ ...readData(), tasks });
    return tasks;
  },
  saveSessions: async (sessions: SessionRecord[]) => {
    writeData({ ...readData(), sessions });
    return sessions;
  },
  notify: async (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  setAlwaysOnTop: async () => undefined,
  updateTray: async () => undefined,
  onToggleShortcut: () => () => undefined,
};

export const pomodoroApi = window.pomodoro ?? fallbackApi;
