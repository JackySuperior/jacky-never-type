import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import * as path from 'path';
import { createTray, updateTrayMenu } from './tray';
import { setupRecorderIPC, setOverlayWindow, setRecordingState, getCurrentState, showLastResult } from './recorder';
import { getSettings, saveSettings } from './store';
import { openSettingsServer, stopSettingsServer } from './settings-server';
import { checkMacAccessibility } from './injector';
import { applyStartOnLogin } from './login-item';
import { IPC } from '../shared/types';

let overlayWindow: BrowserWindow | null = null;

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}

function createOverlayWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const winWidth = 280;
  const win = new BrowserWindow({
    width: winWidth,
    height: 80,
    x: Math.floor((width - winWidth) / 2), // 水平置中
    y: height - 120,                        // 靠近螢幕底部
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false, // 不搶焦點，讓文字注入到正確視窗
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // 路徑含空格時 sandbox preload 會載入失敗，故關閉
    },
  });

  // 載入 overlay UI
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173/overlay.html');
  } else {
    win.loadFile(path.join(__dirname, '../../dist/renderer/overlay.html'));
  }

  win.setAlwaysOnTop(true, 'screen-saver'); // 最高層級，蓋過全螢幕程式

  win.webContents.on('did-fail-load', (_e, code, desc) => {
    console.error(`[Overlay] 載入失敗: ${code} ${desc}`);
  });

  return win;
}

async function main() {
  await app.whenReady();

  // 隱藏 Dock（Mac）
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  // 建立 overlay 視窗
  overlayWindow = createOverlayWindow();
  setOverlayWindow(overlayWindow);

  // 建立系統匣
  createTray();

  // 設定 IPC
  setupRecorderIPC();

  // 設定 IPC：取得/儲存設定
  ipcMain.handle(IPC.GET_SETTINGS, () => getSettings());
  ipcMain.on(IPC.SAVE_SETTINGS, (_event, settings) => saveSettings(settings));
  ipcMain.on(IPC.OPEN_SETTINGS, () => openSettingsServer());

  // 同步開機自動啟動設定
  applyStartOnLogin(getSettings().startOnLogin);

  // Mac：延遲 500ms 再檢查 Accessibility 權限（等系統匣出現後再跳對話框）
  setTimeout(() => checkMacAccessibility(), 500);

  // 熱鍵：單按切換錄音
  registerHotkey();

  // 監聽 overlay 的切換請求
  ipcMain.on(IPC.TOGGLE_RECORDING, () => handleToggleRecording());

  // 啟動後直接顯示設定頁（關掉設定即縮回系統匣）
  openSettingsServer();
}

function registerHotkey() {
  const settings = getSettings();
  const hotkey = settings.hotkey;

  globalShortcut.unregisterAll();

  const registered = globalShortcut.register(hotkey, () => {
    handleToggleRecording();
  });

  if (!registered) {
    console.error(`[Hotkey] 無法註冊熱鍵: ${hotkey}`);
  } else {
    console.log(`[Hotkey] 已註冊: ${hotkey}`);
  }

  // 第二個熱鍵：叫出上一句的複製卡片
  if (settings.showLastHotkey && settings.showLastHotkey !== hotkey) {
    const ok = globalShortcut.register(settings.showLastHotkey, () => {
      showLastResult();
    });
    if (!ok) console.error(`[Hotkey] 無法註冊熱鍵: ${settings.showLastHotkey}`);
    else console.log(`[Hotkey] 已註冊(叫出上一句): ${settings.showLastHotkey}`);
  }
}

function handleToggleRecording() {
  const state = getCurrentState();
  console.log(`[Toggle] 目前狀態: ${state}, overlayWindow: ${overlayWindow ? '存在' : '不存在'}`);

  if (state === 'idle') {
    // 開始錄音（setRecordingState 內部已會廣播狀態，不要重複 send）
    updateTrayMenu(true);
    overlayWindow?.showInactive();
    setRecordingState('recording');
    console.log('[Toggle] 已發送 recording 狀態到 overlay');
  } else if (state === 'recording') {
    // 停止錄音（通知 renderer 送出音訊）
    overlayWindow?.webContents.send('stop-recording');
    console.log('[Toggle] 已發送 stop-recording 到 overlay');
  }
  // 若 processing 中，忽略按鍵
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopSettingsServer();
});

app.on('window-all-closed', () => {
  // 保持在系統匣，不關閉 app
});

// 單一執行個體：再次點擊桌面 icon 時，不開新視窗，改成叫出設定頁
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    openSettingsServer();
  });
  main();
}
