export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

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
