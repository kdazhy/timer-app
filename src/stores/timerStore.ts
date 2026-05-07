import { create } from 'zustand';
import type { SessionRecord, Settings, TimerPhase, TimerStatus } from '../types';
import { pomodoroApi } from '../services/pomodoroApi';
import { nextPhase, phaseDuration, phaseLabel } from '../services/timerEngine';

interface TimerStore {
  phase: TimerPhase;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  completedWorkSessions: number;
  sessionStartedAt?: string;
  sessions: SessionRecord[];
  setSessions: (sessions: SessionRecord[]) => void;
  configure: (settings: Settings) => void;
  start: (settings: Settings) => void;
  pause: () => void;
  reset: (settings: Settings) => void;
  skip: (settings: Settings, taskId?: string, taskTitle?: string) => SessionRecord | undefined;
  tick: (settings: Settings, taskId?: string, taskTitle?: string) => SessionRecord | undefined;
}

let targetEndAt = 0;
let pausedRemaining = 0;

function persistSessions(sessions: SessionRecord[]) {
  void pomodoroApi.saveSessions(sessions);
}

function completeSession(
  state: TimerStore,
  settings: Settings,
  taskId: string | undefined,
  taskTitle: string | undefined,
  completed: boolean,
) {
  const isWork = state.phase === 'work';
  const completedWorkSessions = isWork && completed ? state.completedWorkSessions + 1 : state.completedWorkSessions;
  const endedAt = new Date();
  const startedAt = state.sessionStartedAt ?? new Date(endedAt.getTime() - state.totalSeconds * 1000).toISOString();
  const record: SessionRecord = {
    id: crypto.randomUUID(),
    taskId,
    taskTitle,
    phase: state.phase,
    startedAt,
    endedAt: endedAt.toISOString(),
    durationSeconds: state.totalSeconds,
    completed,
  };
  const phase = nextPhase(state.phase, completedWorkSessions, settings);
  const totalSeconds = phaseDuration(settings, phase);
  const shouldAutoStart = phase === 'work' ? settings.autoStartWork : settings.autoStartBreaks;
  targetEndAt = shouldAutoStart ? Date.now() + totalSeconds * 1000 : 0;
  return {
    record,
    nextState: {
      phase,
      status: shouldAutoStart ? 'running' as TimerStatus : 'idle' as TimerStatus,
      remainingSeconds: totalSeconds,
      totalSeconds,
      completedWorkSessions,
      sessionStartedAt: shouldAutoStart ? new Date().toISOString() : undefined,
    },
  };
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  phase: 'work',
  status: 'idle',
  remainingSeconds: 25 * 60,
  totalSeconds: 25 * 60,
  completedWorkSessions: 0,
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
  configure: (settings) => {
    const state = get();
    if (state.status !== 'idle') return;
    const totalSeconds = phaseDuration(settings, state.phase);
    set({ totalSeconds, remainingSeconds: totalSeconds });
  },
  start: (settings) => {
    const state = get();
    const remainingSeconds = state.status === 'paused' ? pausedRemaining : state.remainingSeconds || phaseDuration(settings, state.phase);
    targetEndAt = Date.now() + remainingSeconds * 1000;
    set({ status: 'running', remainingSeconds, sessionStartedAt: state.sessionStartedAt ?? new Date().toISOString() });
  },
  pause: () => {
    const remainingSeconds = Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000));
    pausedRemaining = remainingSeconds;
    targetEndAt = 0;
    set({ status: 'paused', remainingSeconds });
  },
  reset: (settings) => {
    const totalSeconds = phaseDuration(settings, get().phase);
    targetEndAt = 0;
    pausedRemaining = 0;
    set({ status: 'idle', remainingSeconds: totalSeconds, totalSeconds, sessionStartedAt: undefined });
  },
  skip: (settings, taskId, taskTitle) => {
    const state = get();
    const { record, nextState } = completeSession(state, settings, taskId, taskTitle, false);
    const sessions = [record, ...state.sessions];
    set({ ...nextState, sessions });
    persistSessions(sessions);
    void pomodoroApi.updateTray(phaseLabel(nextState.phase), `${Math.ceil(nextState.remainingSeconds / 60)} 分钟`);
    return record;
  },
  tick: (settings, taskId, taskTitle) => {
    const state = get();
    if (state.status !== 'running') return undefined;
    const remainingSeconds = Math.max(0, Math.ceil((targetEndAt - Date.now()) / 1000));
    if (remainingSeconds > 0) {
      set({ remainingSeconds });
      return undefined;
    }
    const { record, nextState } = completeSession(state, settings, taskId, taskTitle, true);
    const sessions = [record, ...state.sessions];
    set({ ...nextState, sessions });
    persistSessions(sessions);
    void pomodoroApi.updateTray(phaseLabel(nextState.phase), `${Math.ceil(nextState.remainingSeconds / 60)} 分钟`);
    return record;
  },
}));
