import { ipcMain, BrowserWindow, app, clipboard, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { IPC, RecordingState } from '../shared/types';
import { getSettings, addHistory } from './store';
import { transcribeWithOpenAI } from './stt/whisper';
import { transcribeWithGroq } from './stt/groq';
import { transcribeWithGemini } from './stt/gemini';
import { refineText } from './ai/refiner';
import { injectText } from './injector';

let overlayWindow: BrowserWindow | null = null;
let currentState: RecordingState = 'idle';
let lastResultText = ''; // 最近一次輸出的文字（供「叫出上一句」熱鍵使用）

// 除錯記錄檔（寫到使用者資料夾）
function debugLog(line: string) {
  try {
    const p = path.join(app.getPath('userData'), 'jnt-debug.log');
    fs.appendFileSync(p, `[${new Date().toISOString()}] ${line}\n`);
  } catch { /* 忽略 */ }
}

export function setOverlayWindow(win: BrowserWindow) {
  overlayWindow = win;
}

function broadcastState(state: RecordingState, message?: string) {
  currentState = state;

  // 開始錄音時，把 overlay 還原成小尺寸（可能上次停在結果彈窗的大尺寸）
  if (state === 'recording' && overlayWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const w = 280;
    overlayWindow.setBounds({ x: Math.floor((width - w) / 2), y: height - 120, width: w, height: 80 });
  }

  overlayWindow?.webContents.send(IPC.RECORDING_STATE, { state, message });

  // 回到 idle 時，短暫延遲後隱藏 overlay（讓錯誤/提示訊息有時間顯示）
  if (state === 'idle') {
    const delay = message ? 1500 : 400;
    setTimeout(() => {
      if (currentState === 'idle') overlayWindow?.hide();
    }, delay);
  }
}

// 顯示「結果彈窗」：把 overlay 放大、置中靠下，送出文字讓使用者複製
function showResultPopup(text: string) {
  debugLog(`showResultPopup 被呼叫，overlayWindow=${overlayWindow ? '存在' : 'null'}`);
  currentState = 'idle'; // 讓 F9 可以再次錄音
  if (!overlayWindow) return;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const w = 420;
  const h = 240;
  overlayWindow.setBounds({
    x: Math.floor((width - w) / 2),
    y: height - h - 60,
    width: w,
    height: h,
  });
  overlayWindow.showInactive();
  overlayWindow.webContents.send(IPC.SHOW_RESULT, { text });
}

// 關閉結果彈窗：把 overlay 還原成小尺寸並隱藏
function resetOverlay() {
  if (!overlayWindow) return;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const w = 280;
  const h = 80;
  overlayWindow.setBounds({
    x: Math.floor((width - w) / 2),
    y: height - 120,
    width: w,
    height: h,
  });
  overlayWindow.hide();
}

export function setupRecorderIPC() {
  // 結果彈窗：複製文字（由主進程寫剪貼簿，不需 renderer 焦點）
  ipcMain.on(IPC.COPY_RESULT, (_e, text: string) => {
    clipboard.writeText(text ?? '');
  });

  // 結果彈窗：關閉
  ipcMain.on(IPC.CLOSE_RESULT, () => {
    resetOverlay();
  });

  // Renderer 傳送錄音資料過來
  ipcMain.on(IPC.AUDIO_DATA, async (_event, audioBuffer: Buffer) => {
    if (currentState !== 'recording') return;

    broadcastState('processing', 'Transcribing...');

    try {
      const settings = getSettings();

      // Step 1: STT
      let rawText: string;
      const vocab = settings.customVocabulary;
      if (settings.sttProvider === 'groq') {
        rawText = await transcribeWithGroq(audioBuffer, settings.groqApiKey, settings.language, vocab);
      } else if (settings.sttProvider === 'gemini') {
        rawText = await transcribeWithGemini(audioBuffer, settings.geminiApiKey, settings.language, vocab);
      } else {
        rawText = await transcribeWithOpenAI(audioBuffer, settings.openaiApiKey, settings.language, vocab);
      }

      console.log('[STT] 原始文字:', rawText);

      if (!rawText.trim()) {
        broadcastState('idle', 'No speech detected');
        return;
      }

      // Step 2: AI 修飾
      debugLog(`設定: aiEnabled=${settings.aiEnabled}, aiProvider=${settings.aiProvider}, outputMode=${settings.outputMode}, outputLanguage=${settings.outputLanguage}`);
      debugLog(`STT原文: ${rawText}`);
      const refinedText = await refineText(rawText, settings);
      debugLog(`AI輸出: ${refinedText}`);
      console.log('[AI] 修飾後:', refinedText);

      // 記住這次的輸出，供「叫出上一句」熱鍵使用
      lastResultText = refinedText;

      // Step 3: 注入文字（一律自動貼上）
      await injectText(refinedText);

      // 存入歷史記錄
      addHistory({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: refinedText,
        rawText,
        timestamp: Date.now(),
        sttProvider: settings.sttProvider,
      });

      broadcastState('idle');
    } catch (err: unknown) {
      console.error('[Recorder] 處理失敗:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      broadcastState('idle', `Error: ${message}`);
    }
  });
}

// 手動叫出「上一句」的複製卡片（第二個熱鍵觸發）
export function showLastResult() {
  if (!lastResultText.trim()) return;
  showResultPopup(lastResultText);
}

export function getCurrentState(): RecordingState {
  return currentState;
}

export function setRecordingState(state: RecordingState) {
  broadcastState(state);
}
