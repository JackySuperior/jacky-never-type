import { app } from 'electron';

/**
 * 設定開機自動啟動（跨平台：Windows + macOS）
 */
export function applyStartOnLogin(enabled: boolean): void {
  if (process.platform === 'win32' || process.platform === 'darwin') {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true, // macOS：背景啟動，不顯示 Dock
    });
  }
}

/**
 * 取得系統目前的「開機啟動」狀態
 */
export function getStartOnLoginActual(): boolean {
  const settings = app.getLoginItemSettings();
  return settings.openAtLogin;
}
