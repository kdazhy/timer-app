export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  notifications: boolean;
  sound: boolean;
  alwaysOnTop: boolean;
  minimizeToTray: boolean;
  globalShortcut: string;
  accentColor: string;
}

export interface Task {
  id: string;
  title: string;
  targetPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  isFocus: boolean;
  createdAt: string;
}

export interface SessionRecord {
  id: string;
  taskId?: string;
  taskTitle?: string;
  phase: TimerPhase;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  completed: boolean;
}

export interface StoredData {
  settings: Settings;
  tasks: Task[];
  sessions: SessionRecord[];
}

export interface TimerSnapshot {
  phase: TimerPhase;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  completedWorkSessions: number;
  phaseStartedAt?: number;
  pausedAt?: number;
}

export interface PomodoroApi {
  loadData: () => Promise<StoredData>;
  saveSettings: (settings: Settings) => Promise<Settings>;
  saveTasks: (tasks: Task[]) => Promise<Task[]>;
  saveSessions: (sessions: SessionRecord[]) => Promise<SessionRecord[]>;
  notify: (title: string, body: string) => Promise<void>;
  setAlwaysOnTop: (enabled: boolean) => Promise<void>;
  updateTray: (label: string, detail: string) => Promise<void>;
  onToggleShortcut: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    pomodoro: PomodoroApi;
  }
}
