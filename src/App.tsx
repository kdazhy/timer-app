import { useEffect } from 'react';
import { SessionControls } from './components/SessionControls';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { TaskPanel } from './components/TaskPanel';
import { TimerCircle } from './components/TimerCircle';
import { pomodoroApi } from './services/pomodoroApi';
import { formatTime, phaseLabel } from './services/timerEngine';
import { useSettingsStore } from './stores/settingsStore';
import { useTaskStore } from './stores/taskStore';
import { useTimerStore } from './stores/timerStore';

function playCompletionSound() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(784, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.22);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.38);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.42);
  oscillator.addEventListener('ended', () => void audioContext.close());
}

export function App() {
  const settings = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setTasks = useTaskStore((state) => state.setTasks);
  const focusTask = useTaskStore((state) => state.focusTask);
  const incrementFocusTask = useTaskStore((state) => state.incrementFocusTask);
  const phase = useTimerStore((state) => state.phase);
  const status = useTimerStore((state) => state.status);
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const totalSeconds = useTimerStore((state) => state.totalSeconds);
  const completedWorkSessions = useTimerStore((state) => state.completedWorkSessions);
  const setSessions = useTimerStore((state) => state.setSessions);
  const configure = useTimerStore((state) => state.configure);
  const startTimer = useTimerStore((state) => state.start);
  const pauseTimer = useTimerStore((state) => state.pause);
  const resetTimer = useTimerStore((state) => state.reset);
  const skipTimer = useTimerStore((state) => state.skip);
  const tick = useTimerStore((state) => state.tick);

  useEffect(() => {
    void pomodoroApi.loadData().then((data) => {
      setSettings(data.settings);
      setTasks(data.tasks);
      setSessions(data.sessions);
      configure(data.settings);
      document.documentElement.style.setProperty('--accent', data.settings.accentColor);
      void pomodoroApi.setAlwaysOnTop(data.settings.alwaysOnTop);
    });
  }, [configure, setSettings, setSessions, setTasks]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    configure(settings);
  }, [configure, settings]);

  useEffect(() => {
    return pomodoroApi.onToggleShortcut(() => {
      const currentSettings = useSettingsStore.getState().settings;
      const currentTimer = useTimerStore.getState();
      if (currentTimer.status === 'running') {
        currentTimer.pause();
        return;
      }
      currentTimer.start(currentSettings);
    });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const completed = tick(settings, focusTask?.id, focusTask?.title);
      const currentTimer = useTimerStore.getState();

      if (!completed) {
        void pomodoroApi.updateTray(phaseLabel(currentTimer.phase), formatTime(currentTimer.remainingSeconds));
        return;
      }

      if (completed.completed && completed.phase === 'work') incrementFocusTask();
      if (settings.notifications) {
        const nextLabel = phaseLabel(currentTimer.phase);
        void pomodoroApi.notify('Focus Harbor', `${phaseLabel(completed.phase)}已完成，接下来是${nextLabel}`);
      }
      if (settings.sound) {
        playCompletionSound();
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [focusTask?.id, focusTask?.title, incrementFocusTask, settings, tick]);

  const start = () => startTimer(settings);
  const pause = () => pauseTimer();
  const reset = () => resetTimer(settings);
  const skip = () => skipTimer(settings, focusTask?.id, focusTask?.title);

  return (
    <main className={`app app--${phase}`}>
      <section className="hero panel">
        <div className="brand">
          <span>Focus Harbor</span>
          <strong>桌面番茄钟</strong>
        </div>
        <TimerCircle phase={phase} remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
        <SessionControls status={status} onStart={start} onPause={pause} onReset={reset} onSkip={skip} />
        <div className="quick-settings">
          <span>已完成 {completedWorkSessions} 个专注周期</span>
          <span>{settings.autoStartBreaks || settings.autoStartWork ? '自动流转已启用' : '手动流转模式'}</span>
        </div>
      </section>

      <section className="workspace">
        <TaskPanel />
        <StatsPanel />
        <SettingsPanel />
      </section>
    </main>
  );
}
