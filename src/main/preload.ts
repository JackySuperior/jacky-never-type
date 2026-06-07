import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '../shared/types';

contextBridge.exposeInMainWorld('jnt', {
  // 錄音控制
  toggleRecording: () => ipcRenderer.send(IPC.TOGGLE_RECORDING),
  sendAudioData: (buffer: ArrayBuffer) => ipcRenderer.send(IPC.AUDIO_DATA, Buffer.from(buffer)),

  // 狀態監聽
  onRecordingState: (cb: (data: { state: string; message?: string }) => void) => {
    ipcRenderer.on(IPC.RECORDING_STATE, (_event, data) => cb(data));
  },
  onStopRecording: (cb: () => void) => {
    ipcRenderer.on('stop-recording', () => cb());
  },
  onToggleFromTray: (cb: () => void) => {
    ipcRenderer.on('toggle-from-tray', () => cb());
  },

  // 結果彈窗（找不到貼上位置時）
  onShowResult: (cb: (data: { text: string }) => void) => {
    ipcRenderer.on(IPC.SHOW_RESULT, (_event, data) => cb(data));
  },
  copyResult: (text: string) => ipcRenderer.send(IPC.COPY_RESULT, text),
  closeResult: () => ipcRenderer.send(IPC.CLOSE_RESULT),

  // 設定
  getSettings: () => ipcRenderer.invoke(IPC.GET_SETTINGS),
  saveSettings: (settings: unknown) => ipcRenderer.send(IPC.SAVE_SETTINGS, settings),
  openSettings: () => ipcRenderer.send(IPC.OPEN_SETTINGS),
});
