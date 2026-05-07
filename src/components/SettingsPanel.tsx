import { useSettingsStore } from '../stores/settingsStore';
import type { Settings } from '../types';

const numberFields: Array<[keyof Settings, string, number, number]> = [
  ['workMinutes', '专注时长', 1, 180],
  ['shortBreakMinutes', '短休息', 1, 60],
  ['longBreakMinutes', '长休息', 1, 120],
  ['longBreakEvery', '长休间隔', 1, 12],
];

const toggleFields: Array<[keyof Settings, string]> = [
  ['autoStartBreaks', '自动开始休息'],
  ['autoStartWork', '自动开始专注'],
  ['notifications', '系统通知'],
  ['sound', '提示音'],
  ['alwaysOnTop', '窗口置顶'],
  ['minimizeToTray', '关闭时最小化到托盘'],
];

export function SettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <section className="panel settings-panel">
      <div className="panel__heading">
        <span>自定义设置</span>
        <strong>高级</strong>
      </div>
      <div className="settings-grid">
        {numberFields.map(([field, label, min, max]) => (
          <label className="setting-field" key={field}>
            <span>{label}</span>
            <input
              min={min}
              max={max}
              type="number"
              value={settings[field] as number}
              onChange={(event) => updateSettings({ [field]: Number(event.target.value) } as Partial<Settings>)}
            />
          </label>
        ))}
      </div>
      <div className="toggle-grid">
        {toggleFields.map(([field, label]) => (
          <label className="toggle" key={field}>
            <input
              type="checkbox"
              checked={settings[field] as boolean}
              onChange={(event) => updateSettings({ [field]: event.target.checked } as Partial<Settings>)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <label className="setting-field setting-field--wide">
        <span>全局快捷键</span>
        <input value={settings.globalShortcut} onChange={(event) => updateSettings({ globalShortcut: event.target.value })} />
      </label>
      <label className="setting-field setting-field--wide">
        <span>主题颜色</span>
        <input type="color" value={settings.accentColor} onChange={(event) => updateSettings({ accentColor: event.target.value })} />
      </label>
    </section>
  );
}
