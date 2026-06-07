import { Tray, Menu, app, nativeImage } from 'electron';
import * as path from 'path';
import { openSettingsServer } from './settings-server';

let tray: Tray | null = null;

export function createTray(): Tray {
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) icon = nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip('Jacky Never Type — AI Voice Input（雙擊開設定 / double-click for settings）');

  // 左鍵雙擊：直接開啟設定頁
  tray.on('double-click', () => {
    openSettingsServer();
  });

  updateTrayMenu();

  return tray;
}

export function updateTrayMenu(_isRecording = false) {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '⚙️ 設定 / Settings',
      click: () => openSettingsServer(),
    },
    { type: 'separator' },
    {
      label: '🚪 離開 / Exit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function getTray(): Tray | null {
  return tray;
}
