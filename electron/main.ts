import { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, Notification, Tray } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadData, saveSessions, saveSettings, saveTasks } from './store.js';
import type { Settings } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let trayLabel = 'Focus Harbor';
let trayDetail = '准备开始专注';
let currentSettings: Settings = loadData().settings;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#f5efe6',
    show: false,
    title: 'Focus Harbor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(currentSettings.alwaysOnTop);
  mainWindow.once('ready-to-show', () => mainWindow?.show());

  mainWindow.on('close', (event) => {
    if (currentSettings.minimizeToTray && !isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    { label: trayLabel, enabled: false },
    { label: trayDetail, enabled: false },
    { type: 'separator' },
    {
      label: '显示窗口',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: '隐藏窗口',
      click: () => mainWindow?.hide(),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAMklEQVR42mNk+M+ABzAyMjL8Z2BgYPjPwMDA8J+BgYGBkYGB4T8DAwPDfwYGAKUeBBBrOzcAAAAAAElFTkSuQmCC',
  );
  tray = new Tray(icon);
  tray.setToolTip('Focus Harbor');
  tray.setContextMenu(buildTrayMenu());
  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function registerShortcut(shortcut: string) {
  globalShortcut.unregisterAll();
  if (!shortcut.trim()) return;
  globalShortcut.register(shortcut, () => {
    mainWindow?.webContents.send('shortcut:toggle');
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcut(currentSettings.globalShortcut);

  ipcMain.handle('data:load', () => loadData());
  ipcMain.handle('settings:save', (_event, settings: Settings) => {
    currentSettings = saveSettings(settings);
    mainWindow?.setAlwaysOnTop(currentSettings.alwaysOnTop);
    registerShortcut(currentSettings.globalShortcut);
    return currentSettings;
  });
  ipcMain.handle('tasks:save', (_event, tasks) => saveTasks(tasks));
  ipcMain.handle('sessions:save', (_event, sessions) => saveSessions(sessions));
  ipcMain.handle('notify', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });
  ipcMain.handle('window:always-on-top', (_event, enabled: boolean) => {
    mainWindow?.setAlwaysOnTop(enabled);
  });
  ipcMain.handle('tray:update', (_event, label: string, detail: string) => {
    trayLabel = label;
    trayDetail = detail;
    tray?.setToolTip(`${label} - ${detail}`);
    tray?.setContextMenu(buildTrayMenu());
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
