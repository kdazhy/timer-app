import type { Settings, TimerPhase } from '../types';

export function phaseDuration(settings: Settings, phase: TimerPhase) {
  if (phase === 'work') return settings.workMinutes * 60;
  if (phase === 'shortBreak') return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

export function nextPhase(current: TimerPhase, completedWorkSessions: number, settings: Settings): TimerPhase {
  if (current !== 'work') return 'work';
  return completedWorkSessions > 0 && completedWorkSessions % settings.longBreakEvery === 0 ? 'longBreak' : 'shortBreak';
}

export function phaseLabel(phase: TimerPhase) {
  if (phase === 'work') return '专注';
  if (phase === 'shortBreak') return '短休息';
  return '长休息';
}

export function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const restSeconds = safeSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${restSeconds.toString().padStart(2, '0')}`;
}
