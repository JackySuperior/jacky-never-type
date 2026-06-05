import { useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, STTProvider, AIProvider, HistoryEntry, OUTPUT_LANGUAGES } from '../../../shared/types';

type Tab = 'api' | 'stt' | 'ai' | 'output' | 'hotkey' | 'history' | 'about';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>('api');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  // 切換到歷史分頁時載入資料
  useEffect(() => {
    if (activeTab === 'history') loadHistory();
  }, [activeTab]);

  function loadHistory() {
    fetch('/api/history')
      .then(r => r.json())
      .then(setHistory);
  }

  async function copyEntry(entry: HistoryEntry) {
    try {
      await navigator.clipboard.writeText(entry.text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // 後備方案：用隱藏 textarea 複製
      const ta = document.createElement('textarea');
      ta.value = entry.text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  async function clearAllHistory() {
    if (!confirm('確定要清空所有歷史記錄嗎？此動作無法復原。')) return;
    await fetch('/api/history/clear', { method: 'POST' });
    setHistory([]);
  }

  function formatTime(ts: number): string {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      persist(next); // 自動儲存
      return next;
    });
  }

  async function persist(data: AppSettings) {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleSave() {
    await persist(settings);
  }

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🎙 Jacky Never Type</div>
        <p className="subtitle">AI 語音輸入工具設定</p>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {(['api', 'stt', 'ai', 'output', 'hotkey', 'history', 'about'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabIcon(tab)} {tabLabel(tab)}
            </button>
          ))}
        </nav>

        <main className="content">
          {activeTab === 'api' && (
            <section>
              <h2>API 金鑰</h2>
              <p className="desc">所有金鑰僅存在您的本機，不會上傳。</p>

              <div className="form-group">
                <label>OpenAI API Key</label>
                <input
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={e => update('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                />
                <span className="hint">用於 Whisper STT 及 GPT 文字修飾</span>
              </div>

              <div className="form-group">
                <label>Groq API Key</label>
                <input
                  type="password"
                  value={settings.groqApiKey}
                  onChange={e => update('groqApiKey', e.target.value)}
                  placeholder="gsk_..."
                />
                <span className="hint">用於 Groq Whisper STT（速度最快）及 LLaMA 文字修飾</span>
              </div>

              <div className="form-group">
                <label>Gemini API Key</label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={e => update('geminiApiKey', e.target.value)}
                  placeholder="AIza..."
                />
                <span className="hint">用於 Gemini 文字修飾</span>
              </div>
            </section>
          )}

          {activeTab === 'stt' && (
            <section>
              <h2>語音辨識設定</h2>

              <div className="form-group">
                <label>STT 供應商</label>
                <div className="radio-group">
                  {(['groq', 'gemini', 'openai'] as STTProvider[]).map(p => (
                    <label key={p} className="radio-label">
                      <input
                        type="radio"
                        name="sttProvider"
                        value={p}
                        checked={settings.sttProvider === p}
                        onChange={() => update('sttProvider', p)}
                      />
                      <span>{sttProviderLabel(p)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>語言偏好</label>
                <select
                  value={settings.language}
                  onChange={e => update('language', e.target.value)}
                >
                  <option value="auto">🌐 自動偵測</option>
                  <option value="zh">🇹🇼 中文（繁體）</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="ko">🇰🇷 한국어</option>
                </select>
              </div>
            </section>
          )}

          {activeTab === 'ai' && (
            <section>
              <h2>AI 文字修飾</h2>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.aiEnabled}
                    onChange={e => update('aiEnabled', e.target.checked)}
                  />
                  <span>啟用 AI 修飾</span>
                </label>
                <span className="hint">自動移除語助詞、修正標點、讓文字更通順</span>
              </div>

              {settings.aiEnabled && (
                <>
                  <div className="form-group">
                    <label>AI 供應商</label>
                    <div className="radio-group">
                      {(['gemini', 'openai', 'groq'] as AIProvider[]).map(p => (
                        <label key={p} className="radio-label">
                          <input
                            type="radio"
                            name="aiProvider"
                            value={p}
                            checked={settings.aiProvider === p}
                            onChange={() => update('aiProvider', p)}
                          />
                          <span>{aiProviderLabel(p)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>修飾強度</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="light"
                          checked={settings.aiStrength === 'light'}
                          onChange={() => update('aiStrength', 'light')} />
                        <span>🪶 輕度 — 只移除語助詞</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="standard"
                          checked={settings.aiStrength === 'standard'}
                          onChange={() => update('aiStrength', 'standard')} />
                        <span>⚡ 標準 — 修正標點與語句（推薦）</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="strong"
                          checked={settings.aiStrength === 'strong'}
                          onChange={() => update('aiStrength', 'strong')} />
                        <span>✨ 強力 — 完整書面化改寫</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'output' && (
            <section>
              <h2>輸出語言</h2>
              <p className="desc">決定語音最終要輸出成什麼語言。翻譯功能需開啟「AI 修飾」才會生效。</p>

              <div className="form-group">
                <label>輸出模式</label>
                <div className="radio-group">
                  <label className={`lang-card ${settings.outputMode === 'original' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="outputMode"
                      checked={settings.outputMode === 'original'}
                      onChange={() => update('outputMode', 'original')}
                    />
                    <div className="lang-card-body">
                      <div className="lang-card-title">🗣 維持說話的原文</div>
                      <div className="lang-card-desc">自動判斷你說的語言並維持原樣。說中文出中文、說英文出英文。</div>
                    </div>
                  </label>

                  <label className={`lang-card ${settings.outputMode === 'fixed' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="outputMode"
                      checked={settings.outputMode === 'fixed'}
                      onChange={() => update('outputMode', 'fixed')}
                    />
                    <div className="lang-card-body">
                      <div className="lang-card-title">🌐 永遠輸出指定語言</div>
                      <div className="lang-card-desc">不管你說什麼語言，最後都翻譯成你選的語言。</div>
                    </div>
                  </label>
                </div>
              </div>

              {settings.outputMode === 'fixed' && (
                <div className="form-group">
                  <label>目標語言</label>
                  <select
                    value={settings.outputLanguage}
                    onChange={e => update('outputLanguage', e.target.value)}
                  >
                    {OUTPUT_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                  {!settings.aiEnabled && (
                    <span className="hint" style={{ color: '#ff9f43' }}>
                      ⚠️ 翻譯需要 AI，請先到「AI 修飾」分頁啟用。
                    </span>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'hotkey' && (
            <section>
              <h2>快捷鍵設定</h2>

              <div className="form-group">
                <label>錄音熱鍵（單按開始/停止）</label>
                <input
                  type="text"
                  value={settings.hotkey}
                  onChange={e => update('hotkey', e.target.value)}
                  placeholder="CommandOrControl+Shift+Space"
                />
                <span className="hint">
                  格式：CommandOrControl / Alt / Shift + 按鍵<br />
                  例如：CommandOrControl+Shift+Space
                </span>
              </div>

              <div className="form-group">
                <label>設定頁面連接埠</label>
                <input
                  type="number"
                  value={settings.settingsPort}
                  onChange={e => update('settingsPort', Number(e.target.value))}
                  min={1024}
                  max={65535}
                />
              </div>
            </section>
          )}

          {activeTab === 'history' && (
            <section>
              <div className="history-header">
                <h2>歷史記錄</h2>
                {history.length > 0 && (
                  <button className="btn-clear" onClick={clearAllHistory}>🗑 清空</button>
                )}
              </div>
              <p className="desc">顯示最近 {history.length} 筆辨識結果，點「複製」即可取用。</p>

              {history.length === 0 ? (
                <div className="history-empty">尚無歷史記錄，開始用語音輸入後會出現在這裡。</div>
              ) : (
                <div className="history-list">
                  {history.map(entry => (
                    <div key={entry.id} className="history-item">
                      <div className="history-text">{entry.text}</div>
                      <div className="history-meta">
                        <span className="history-time">{formatTime(entry.timestamp)}</span>
                        <button
                          className={`btn-copy ${copiedId === entry.id ? 'copied' : ''}`}
                          onClick={() => copyEntry(entry)}
                        >
                          {copiedId === entry.id ? '✅ 已複製' : '📋 複製'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'about' && (
            <section>
              <h2>關於 Jacky Never Type</h2>
              <div className="about-card">
                <p>🎙 <strong>Jacky Never Type</strong> — AI 語音輸入工具</p>
                <p>版本 1.0.0</p>
                <br />
                <p>支援的 STT 供應商：</p>
                <ul>
                  <li>Groq Whisper Large V3 Turbo（速度最快）</li>
                  <li>OpenAI Whisper-1</li>
                </ul>
                <br />
                <p>支援的 AI 修飾供應商：</p>
                <ul>
                  <li>Google Gemini 2.0 Flash</li>
                  <li>OpenAI GPT-4o Mini</li>
                  <li>Groq LLaMA 3.3 70B</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className="footer">
        <button className="btn-save" onClick={handleSave}>
          {saved ? '✅ 已儲存！' : '儲存設定'}
        </button>
      </footer>
    </div>
  );
}

function tabIcon(tab: Tab): string {
  return { api: '🔑', stt: '🎙', ai: '✨', output: '🌐', hotkey: '⌨️', history: '📜', about: 'ℹ️' }[tab];
}

function tabLabel(tab: Tab): string {
  return { api: 'API 金鑰', stt: '語音辨識', ai: 'AI 修飾', output: '輸出語言', hotkey: '快捷鍵', history: '歷史', about: '關於' }[tab];
}

function sttProviderLabel(p: STTProvider): string {
  return {
    groq: '⚡ Groq Whisper（推薦，速度最快）',
    gemini: '💎 Google Gemini 2.0 Flash',
    openai: '🤖 OpenAI Whisper-1',
  }[p];
}

function aiProviderLabel(p: AIProvider): string {
  return {
    gemini: '💎 Google Gemini 2.0 Flash（推薦）',
    openai: '🤖 OpenAI GPT-4o Mini',
    groq: '⚡ Groq LLaMA 3.3 70B',
  }[p];
}
