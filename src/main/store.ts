import Store from 'electron-store';
import { AppSettings, DEFAULT_SETTINGS, HistoryEntry } from '../shared/types';

// electron-store v11+ 使用 Map-like 介面
const store = new Store<AppSettings>({
  defaults: DEFAULT_SETTINGS,
  encryptionKey: 'jnt-local-key-v1',
}) as unknown as {
  get<K extends keyof AppSettings>(key: K): AppSettings[K];
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
  store: AppSettings;
};

// 歷史記錄：獨立的 JSON 檔，不加密、永久保存
const historyStore = new Store<{ entries: HistoryEntry[] }>({
  name: 'history',
  defaults: { entries: [] },
}) as unknown as {
  get(key: 'entries'): HistoryEntry[];
  set(key: 'entries', value: HistoryEntry[]): void;
};

// 永久保存上限（防止無限成長；純文字 5000 筆也才約 1-2 MB）
const HISTORY_MAX = 5000;

export function addHistory(entry: HistoryEntry): void {
  const entries = historyStore.get('entries') ?? [];
  entries.unshift(entry); // 最新的放最前面
  if (entries.length > HISTORY_MAX) entries.length = HISTORY_MAX;
  historyStore.set('entries', entries);
}

export function getHistory(limit?: number): HistoryEntry[] {
  const entries = historyStore.get('entries') ?? [];
  return limit ? entries.slice(0, limit) : entries;
}

export function clearHistory(): void {
  historyStore.set('entries', []);
}

export function getSettings(): AppSettings {
  return {
    openaiApiKey: store.get('openaiApiKey'),
    groqApiKey: store.get('groqApiKey'),
    geminiApiKey: store.get('geminiApiKey'),
    sttProvider: store.get('sttProvider'),
    language: store.get('language'),
    aiEnabled: store.get('aiEnabled'),
    aiProvider: store.get('aiProvider'),
    aiStrength: store.get('aiStrength'),
    outputMode: store.get('outputMode'),
    outputLanguage: store.get('outputLanguage'),
    uiLanguage: store.get('uiLanguage'),
    hotkey: store.get('hotkey'),
    settingsPort: store.get('settingsPort'),
    startOnLogin: store.get('startOnLogin'),
  };
}

export function saveSettings(settings: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(settings)) {
    store.set(key as keyof AppSettings, value as AppSettings[keyof AppSettings]);
  }
}
