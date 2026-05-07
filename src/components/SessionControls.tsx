import type { TimerStatus } from '../types';

interface SessionControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function SessionControls({ status, onStart, onPause, onReset, onSkip }: SessionControlsProps) {
  return (
    <div className="session-controls">
      {status === 'running' ? (
        <button className="button button--primary" onClick={onPause}>暂停</button>
      ) : (
        <button className="button button--primary" onClick={onStart}>{status === 'paused' ? '继续' : '开始'}</button>
      )}
      <button className="button" onClick={onReset}>重置</button>
      <button className="button" onClick={onSkip}>跳过</button>
    </div>
  );
}
