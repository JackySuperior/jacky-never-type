import { clipboard } from 'electron';
import { execSync } from 'child_process';

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
  execSync(`osascript -e 'tell application "System Events" to keystroke "v" using command down'`, {
    timeout: 2000,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
