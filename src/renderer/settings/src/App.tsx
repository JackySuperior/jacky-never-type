import { useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, STTProvider, AIProvider, HistoryEntry, OUTPUT_LANGUAGES } from '../../../shared/types';
import { t } from './i18n';

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
    if (!confirm(t('history_clear_confirm', lang))) return;
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

  // 從設定讀取介面語言，每次 render 自動更新
  const lang = settings.uiLanguage;

  if (loading) return <div className="loading">載入中... / Loading...</div>;

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="logo">🎙 Jacky Never Type</div>
          <div className="lang-switcher">
            <button
              className={`lang-btn${lang === 'zh-Hant' ? ' active' : ''}`}
              onClick={() => update('uiLanguage', 'zh-Hant')}
            >繁中</button>
            <button
              className={`lang-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => update('uiLanguage', 'en')}
            >EN</button>
          </div>
        </div>
        <p className="subtitle">{t('subtitle', lang)}</p>
      </header>

      <div className="layout">
        <nav className="sidebar">
          {(['api', 'stt', 'ai', 'output', 'hotkey', 'history', 'about'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabIcon(tab)} {t(`tab_${tab}` as Parameters<typeof t>[0], lang)}
            </button>
          ))}
        </nav>

        <main className="content">
          {activeTab === 'api' && (
            <section>
              <h2>{t('api_title', lang)}</h2>
              <p className="desc">{t('api_desc', lang)}</p>

              <div className="form-group">
                <label>OpenAI API Key</label>
                <input
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={e => update('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                />
                <span className="hint">{t('openai_hint', lang)}</span>
              </div>

              <div className="form-group">
                <label>Groq API Key</label>
                <input
                  type="password"
                  value={settings.groqApiKey}
                  onChange={e => update('groqApiKey', e.target.value)}
                  placeholder="gsk_..."
                />
                <span className="hint">{t('groq_hint', lang)}</span>
              </div>

              <div className="form-group">
                <label>Gemini API Key</label>
                <input
                  type="password"
                  value={settings.geminiApiKey}
                  onChange={e => update('geminiApiKey', e.target.value)}
                  placeholder="AIza..."
                />
                <span className="hint">{t('gemini_hint', lang)}</span>
              </div>
            </section>
          )}

          {activeTab === 'stt' && (
            <section>
              <h2>{t('stt_title', lang)}</h2>

              <div className="form-group">
                <label>{t('stt_provider', lang)}</label>
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
                      <span>{t(`stt_${p}` as Parameters<typeof t>[0], lang)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>{t('stt_lang', lang)}</label>
                <select
                  value={settings.language}
                  onChange={e => update('language', e.target.value)}
                >
                  <option value="auto">{t('lang_auto', lang)}</option>
                  <option value="zh">{t('lang_zh', lang)}</option>
                  <option value="en">{t('lang_en', lang)}</option>
                  <option value="ja">{t('lang_ja', lang)}</option>
                  <option value="ko">{t('lang_ko', lang)}</option>
                </select>
              </div>
            </section>
          )}

          {activeTab === 'ai' && (
            <section>
              <h2>{t('ai_title', lang)}</h2>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.aiEnabled}
                    onChange={e => update('aiEnabled', e.target.checked)}
                  />
                  <span>{t('ai_enable', lang)}</span>
                </label>
                <span className="hint">{t('ai_enable_hint', lang)}</span>
              </div>

              {settings.aiEnabled && (
                <>
                  <div className="form-group">
                    <label>{t('ai_provider', lang)}</label>
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
                          <span>{t(`ai_${p}` as Parameters<typeof t>[0], lang)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('ai_strength', lang)}</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="light"
                          checked={settings.aiStrength === 'light'}
                          onChange={() => update('aiStrength', 'light')} />
                        <span>{t('ai_light', lang)}</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="standard"
                          checked={settings.aiStrength === 'standard'}
                          onChange={() => update('aiStrength', 'standard')} />
                        <span>{t('ai_standard', lang)}</span>
                      </label>
                      <label className="radio-label">
                        <input type="radio" name="aiStrength" value="strong"
                          checked={settings.aiStrength === 'strong'}
                          onChange={() => update('aiStrength', 'strong')} />
                        <span>{t('ai_strong', lang)}</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === 'output' && (
            <section>
              <h2>{t('output_title', lang)}</h2>
              <p className="desc">{t('output_desc', lang)}</p>

              <div className="form-group">
                <label>{t('output_mode', lang)}</label>
                <div className="radio-group">
                  <label className={`lang-card ${settings.outputMode === 'original' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="outputMode"
                      checked={settings.outputMode === 'original'}
                      onChange={() => update('outputMode', 'original')}
                    />
                    <div className="lang-card-body">
                      <div className="lang-card-title">{t('output_original_title', lang)}</div>
                      <div className="lang-card-desc">{t('output_original_desc', lang)}</div>
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
                      <div className="lang-card-title">{t('output_fixed_title', lang)}</div>
                      <div className="lang-card-desc">{t('output_fixed_desc', lang)}</div>
                    </div>
                  </label>
                </div>
              </div>

              {settings.outputMode === 'fixed' && (
                <div className="form-group">
                  <label>{t('output_target', lang)}</label>
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
                      {t('output_ai_warn', lang)}
                    </span>
                  )}
                </div>
              )}
            </section>
          )}

          {activeTab === 'hotkey' && (
            <section>
              <h2>{t('hotkey_title', lang)}</h2>

              <div className="form-group">
                <label>{t('hotkey_label', lang)}</label>
                <input
                  type="text"
                  value={settings.hotkey}
                  onChange={e => update('hotkey', e.target.value)}
                  placeholder="CommandOrControl+Shift+Space"
                />
                <span className="hint" style={{ whiteSpace: 'pre-line' }}>
                  {t('hotkey_hint', lang)}
                </span>
              </div>

              <div className="form-group">
                <label>{t('port_label', lang)}</label>
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
                <h2>{t('history_title', lang)}</h2>
                {history.length > 0 && (
                  <button className="btn-clear" onClick={clearAllHistory}>
                    {t('history_clear', lang)}
                  </button>
                )}
              </div>
              <p className="desc">
                {t('history_desc', lang).replace('{n}', String(history.length))}
              </p>

              {history.length === 0 ? (
                <div className="history-empty">{t('history_empty', lang)}</div>
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
                          {copiedId === entry.id ? t('history_copied', lang) : t('history_copy', lang)}
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
              <h2>{t('about_title', lang)}</h2>
              <div className="about-card">
                <p>🎙 <strong>Jacky Never Type</strong> — {t('about_desc', lang)}</p>
                <p>{t('about_version', lang)}</p>
                <br />
                <p>{t('about_stt', lang)}</p>
                <ul>
                  <li>{t('about_groq_stt', lang)}</li>
                  <li>{t('about_openai_stt', lang)}</li>
                </ul>
                <br />
                <p>{t('about_ai', lang)}</p>
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
          {saved ? t('saved_btn', lang) : t('save_btn', lang)}
        </button>
      </footer>
    </div>
  );
}

function tabIcon(tab: Tab): string {
  return { api: '🔑', stt: '🎙', ai: '✨', output: '🌐', hotkey: '⌨️', history: '📜', about: 'ℹ️' }[tab];
}
