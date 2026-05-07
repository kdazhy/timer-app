import { getLastSevenDays, getTodayStats } from '../services/stats';
import { useTimerStore } from '../stores/timerStore';

export function StatsPanel() {
  const sessions = useTimerStore((state) => state.sessions);
  const today = getTodayStats(sessions);
  const days = getLastSevenDays(sessions);
  const max = Math.max(1, ...days.map((day) => day.count));

  return (
    <section className="panel stats-panel">
      <div className="panel__heading">
        <span>专注统计</span>
        <strong>7 天</strong>
      </div>
      <div className="stats-grid">
        <div>
          <span>今日番茄</span>
          <strong>{today.pomodoros}</strong>
        </div>
        <div>
          <span>今日专注</span>
          <strong>{Math.round(today.focusSeconds / 60)} 分钟</strong>
        </div>
      </div>
      <div className="bar-chart">
        {days.map((day) => (
          <div className="bar-chart__item" key={day.label}>
            <span style={{ height: `${Math.max(8, (day.count / max) * 88)}px` }} />
            <small>{day.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
