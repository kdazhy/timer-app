import { formatTime, phaseLabel } from '../services/timerEngine';
import type { TimerPhase } from '../types';

interface TimerCircleProps {
  phase: TimerPhase;
  remainingSeconds: number;
  totalSeconds: number;
}

export function TimerCircle({ phase, remainingSeconds, totalSeconds }: TimerCircleProps) {
  const progress = totalSeconds === 0 ? 0 : 1 - remainingSeconds / totalSeconds;
  const circumference = 2 * Math.PI * 132;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section className={`timer-circle timer-circle--${phase}`}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <circle className="timer-circle__track" cx="160" cy="160" r="132" />
        <circle
          className="timer-circle__progress"
          cx="160"
          cy="160"
          r="132"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="timer-circle__content">
        <span>{phaseLabel(phase)}</span>
        <strong>{formatTime(remainingSeconds)}</strong>
        <small>{Math.round(progress * 100)}% 完成</small>
      </div>
    </section>
  );
}
