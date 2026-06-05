import { ipcMain, BrowserWindow, app } from 'electron';
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
  overlayWindow?.webContents.send(IPC.RECORDING_STATE, { state, message });

  // 回到 idle 時，短暫延遲後隱藏 overlay（讓錯誤/提示訊息有時間顯示）
  if (state === 'idle') {
    const delay = message ? 1500 : 400;
    setTimeout(() => {
      if (currentState === 'idle') overlayWindow?.hide();
    }, delay);
  }
}

export function setupRecorderIPC() {
  // Renderer 傳送錄音資料過來
  ipcMain.on(IPC.AUDIO_DATA, async (_event, audioBuffer: Buffer) => {
    if (currentState !== 'recording') return;

    broadcastState('processing', 'Transcribing...');

    try {
      const settings = getSettings();

      // Step 1: STT
      let rawText: string;
      if (settings.sttProvider === 'groq') {
        rawText = await transcribeWithGroq(audioBuffer, settings.groqApiKey, settings.language);
      } else if (settings.sttProvider === 'gemini') {
        rawText = await transcribeWithGemini(audioBuffer, settings.geminiApiKey, settings.language);
      } else {
        rawText = await transcribeWithOpenAI(audioBuffer, settings.openaiApiKey, settings.language);
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

      // Step 3: 注入文字
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

export function getCurrentState(): RecordingState {
  return currentState;
}

export function setRecordingState(state: RecordingState) {
  broadcastState(state);
}
