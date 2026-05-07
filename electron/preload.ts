import { contextBridge, ipcRenderer } from 'electron';
import type { Settings, Task, SessionRecord } from './types.js';

contextBridge.exposeInMainWorld('pomodoro', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveSettings: (settings: Settings) => ipcRenderer.invoke('settings:save', settings),
  saveTasks: (tasks: Task[]) => ipcRenderer.invoke('tasks:save', tasks),
  saveSessions: (sessions: SessionRecord[]) => ipcRenderer.invoke('sessions:save', sessions),
  notify: (title: string, body: string) => ipcRenderer.invoke('notify', title, body),
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.invoke('window:always-on-top', enabled),
  updateTray: (label: string, detail: string) => ipcRenderer.invoke('tray:update', label, detail),
  onToggleShortcut: (callback: () => void) => {
    const listener = () => callback();
    ipcRenderer.on('shortcut:toggle', listener);
    return () => ipcRenderer.removeListener('shortcut:toggle', listener);
  },
});
