import type { SessionRecord } from '../types';

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayStats(sessions: SessionRecord[]) {
  const today = dayKey(new Date());
  const todaySessions = sessions.filter((session) => dayKey(new Date(session.endedAt)) === today && session.completed);
  return {
    pomodoros: todaySessions.filter((session) => session.phase === 'work').length,
    focusSeconds: todaySessions
      .filter((session) => session.phase === 'work')
      .reduce((sum, session) => sum + session.durationSeconds, 0),
  };
}

export function getLastSevenDays(sessions: SessionRecord[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = dayKey(date);
    const count = sessions.filter(
      (session) => dayKey(new Date(session.endedAt)) === key && session.completed && session.phase === 'work',
    ).length;
    return { label: `${date.getMonth() + 1}/${date.getDate()}`, count };
  });
}
