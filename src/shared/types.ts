// 共用型別定義

export type STTProvider = 'openai' | 'groq' | 'gemini';
export type AIProvider = 'openai' | 'gemini' | 'groq';

// 輸出語言模式
export type OutputMode = 'original' | 'fixed';
// 介面語言
export type UILanguage = 'zh-Hant' | 'en';

// 可選的輸出語言（fixed 模式時使用）
export const OUTPUT_LANGUAGES: { code: string; name: string }[] = [
  { code: 'zh-Hant', name: '繁體中文（台灣）' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

export interface AppSettings {
  // API Keys
  openaiApiKey: string;
  groqApiKey: string;
  geminiApiKey: string;

  // STT 設定
  sttProvider: STTProvider;
  language: string; // 'auto' | 'zh' | 'en' | 'ja' | 'ko'

  // AI 修飾設定
  aiEnabled: boolean;
  aiProvider: AIProvider;
  aiStrength: 'light' | 'standard' | 'strong';

  // 自訂詞彙表（人名／專業術語，每行一個）與額外 AI 指示
  customVocabulary: string;
  customPrompt: string;

  // 智慧排版（自動條列／分段，仿 Typeless）
  smartFormatting: boolean;

  // 輸出語言設定
  outputMode: OutputMode;      // 'original' 維持原文 / 'fixed' 永遠輸出指定語言
  outputLanguage: string;      // fixed 模式時的目標語言代碼

  // 介面語言
  uiLanguage: UILanguage;

  // 熱鍵
  hotkey: string; // 錄音開始/停止，e.g. 'F9'
  showLastHotkey: string; // 叫出上一句的複製卡片，e.g. 'F10'

  // 其他
  settingsPort: number;
  startOnLogin: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  openaiApiKey: '',
  groqApiKey: '',
  geminiApiKey: '',
  sttProvider: 'groq',
  language: 'auto',
  aiEnabled: true,
  aiProvider: 'groq',
  aiStrength: 'standard',
  customVocabulary: '',
  customPrompt: '',
  smartFormatting: true,
  outputMode: 'original',
  outputLanguage: 'zh-Hant',
  uiLanguage: 'zh-Hant',
  hotkey: 'F9',
  showLastHotkey: 'F10',
  settingsPort: 51789,
  startOnLogin: false,
};

// IPC 頻道名稱
export const IPC = {
  // 錄音控制
  TOGGLE_RECORDING: 'toggle-recording',
  RECORDING_STATE: 'recording-state',
  AUDIO_DATA: 'audio-data',

  // 設定
  GET_SETTINGS: 'get-settings',
  SAVE_SETTINGS: 'save-settings',
  OPEN_SETTINGS: 'open-settings',

  // 結果彈窗（找不到貼上位置時）
  SHOW_RESULT: 'show-result',
  COPY_RESULT: 'copy-result',
  CLOSE_RESULT: 'close-result',

  // 狀態通知
  STATUS_UPDATE: 'status-update',
  ERROR: 'error',
} as const;

export type RecordingState = 'idle' | 'recording' | 'processing';

export interface StatusUpdate {
  state: RecordingState;
  message?: string;
}

// 歷史記錄
export interface HistoryEntry {
  id: string;          // 唯一識別碼
  text: string;        // 最終輸出（AI 修飾後）的文字
  rawText: string;     // STT 原始文字（修飾前）
  timestamp: number;   // 建立時間（Unix ms）
  sttProvider: string; // 使用的 STT 供應商
}

// 設定頁顯示的歷史筆數
export const HISTORY_DISPLAY_LIMIT = 20;
