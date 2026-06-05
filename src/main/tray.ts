import { Tray, Menu, app, nativeImage } from 'electron';
import * as path from 'path';
import { openSettingsServer } from './settings-server';

let tray: Tray | null = null;

export function createTray(): Tray {
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) icon = nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Jacky Never Type — AI 語音輸入（右鍵開選單）');

  // Windows 左鍵點擊也顯示選單
  tray.on('click', () => {
    tray?.popUpContextMenu();
  });

  updateTrayMenu();

  return tray;
}

export function updateTrayMenu(isRecording = false) {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: isRecording ? '⏹ 停止錄音' : '🎙 開始錄音',
      click: () => {
        // 觸發熱鍵邏輯（透過 overlay window）
        const { getOverlayWindow } = require('./index');
        const win = getOverlayWindow();
        win?.webContents.send('toggle-from-tray');
      },
    },
    { type: 'separator' },
    {
      label: '⚙️ 設定',
      click: () => openSettingsServer(),
    },
    { type: 'separator' },
    {
      label: '離開',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function getTray(): Tray | null {
  return tray;
}
