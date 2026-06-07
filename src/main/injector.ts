import { clipboard, systemPreferences, dialog, shell, app } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 把文字貼到目前焦點處（一律自動貼上）。
 * 找不到落點時的補救：使用者可按第二個熱鍵叫出「上一句」的複製卡片。
 */
export async function injectText(text: string): Promise<void> {
  const previousClipboard = clipboard.readText();

  // 寫入剪貼簿
  clipboard.writeText(text);

  // 等一下讓剪貼簿生效
  await sleep(80);

  // 模擬 Ctrl+V（Windows）或 Cmd+V（Mac）貼上
  try {
    const platform = process.platform;
    if (platform === 'win32') {
      simulatePasteWindows();
    } else if (platform === 'darwin') {
      simulatePasteMac();
    }
  } catch (err) {
    console.error('[Injector] 注入失敗:', err);
  }

  // 短暫延遲後還原剪貼簿
  await sleep(300);
  clipboard.writeText(previousClipboard);
}

function simulatePasteWindows(): void {
  // 使用 PowerShell 模擬 Ctrl+V，指令間用分號分隔
  const script = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')`;
  execSync(`powershell -NoProfile -Command "${script}"`, { timeout: 3000 });
}

function simulatePasteMac(): void {
  // 使用 AppleScript 模擬 Cmd+V
  try {
    execSync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`, {
      timeout: 2000,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // 寫入 debug log
    try {
      const logPath = path.join(app.getPath('userData'), 'jnt-debug.log');
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Mac 貼字失敗: ${msg}\n`);
    } catch { /* ignore */ }

    // 錯誤碼 1743 或 "not allowed" = Automation 權限被拒
    const isAutomationDenied = msg.includes('1743') || msg.toLowerCase().includes('not allowed')
      || msg.toLowerCase().includes('assistive') || msg.toLowerCase().includes('automation');

    if (isAutomationDenied) {
      dialog.showMessageBox({
        type: 'warning',
        title: 'Automation Permission Required',
        message: 'Jacky Never Type cannot paste text — Automation permission is denied.',
        detail:
          'Please go to:\n' +
          'System Settings → Privacy & Security → Automation\n\n' +
          'Then enable "System Events" under "Jacky Never Type".\n\n' +
          'Also ensure "Accessibility" is enabled in the same Privacy & Security section.',
        buttons: ['Open System Settings', 'OK'],
        defaultId: 0,
      }).then(({ response }) => {
        if (response === 0) {
          shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Automation');
        }
      });
    }

    throw err; // 讓上層 catch 繼續處理
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 檢查 macOS Accessibility 權限（貼字功能需要）
 * 在 App 啟動後呼叫，若未授權則顯示引導對話框
 */
export function checkMacAccessibility(): void {
  if (process.platform !== 'darwin') return;

  // false = 只檢查，不主動觸發系統詢問
  const trusted = systemPreferences.isTrustedAccessibilityClient(false);
  if (!trusted) {
    dialog.showMessageBox({
      type: 'warning',
      title: 'Accessibility Permission Required',
      message: 'Jacky Never Type needs Accessibility access to paste text into other apps.',
      detail:
        'Step 1: Open System Settings → Privacy & Security → Accessibility\n' +
        'Enable "Jacky Never Type".\n\n' +
        'Step 2: Also check Privacy & Security → Automation\n' +
        'Enable "System Events" under "Jacky Never Type".\n\n' +
        'Restart the app after granting both permissions.',
      buttons: ['Open System Settings', 'Later'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) {
        shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
      }
    });
  }
}
