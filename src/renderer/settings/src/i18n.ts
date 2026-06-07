import type { UILanguage } from '../../../shared/types';

export const translations = {
  // 載入
  loading: { 'zh-Hant': '載入中...', en: 'Loading...' },

  // Header
  subtitle: { 'zh-Hant': 'AI 語音輸入工具設定', en: 'AI Voice Dictation Settings' },

  // 分頁標籤
  tab_api:     { 'zh-Hant': 'API 金鑰',  en: 'API Keys' },
  tab_stt:     { 'zh-Hant': '語音辨識',  en: 'Speech-to-Text' },
  tab_ai:      { 'zh-Hant': 'AI 修飾',   en: 'AI Refinement' },
  tab_output:  { 'zh-Hant': '輸出語言',  en: 'Output Language' },
  tab_vocab:   { 'zh-Hant': '詞彙表',    en: 'Vocabulary' },
  tab_hotkey:  { 'zh-Hant': '快捷鍵',   en: 'Hotkey' },
  tab_history: { 'zh-Hant': '歷史',      en: 'History' },
  tab_about:   { 'zh-Hant': '關於',      en: 'About' },

  // API 分頁
  api_title:   { 'zh-Hant': 'API 金鑰', en: 'API Keys' },
  api_desc:    { 'zh-Hant': '所有金鑰僅存在您的本機，不會上傳。', en: 'All keys are stored locally only and never uploaded.' },
  openai_hint: { 'zh-Hant': '用於 Whisper STT 及 GPT 文字修飾', en: 'For Whisper STT and GPT text refinement' },
  groq_hint:   { 'zh-Hant': '用於 Groq Whisper STT（速度最快）及 LLaMA 文字修飾', en: 'For Groq Whisper STT (fastest) and LLaMA text refinement' },
  gemini_hint: { 'zh-Hant': '用於 Gemini STT 及文字修飾', en: 'For Gemini STT and text refinement' },

  // STT 分頁
  stt_title:    { 'zh-Hant': '語音辨識設定', en: 'Speech Recognition Settings' },
  stt_provider: { 'zh-Hant': 'STT 供應商', en: 'STT Provider' },
  stt_lang:     { 'zh-Hant': '語言偏好', en: 'Language Preference' },
  lang_auto:    { 'zh-Hant': '🌐 自動偵測', en: '🌐 Auto Detect' },
  lang_zh:      { 'zh-Hant': '🇹🇼 中文（繁體）', en: '🇹🇼 Chinese (Traditional)' },
  lang_en:      { 'zh-Hant': '🇺🇸 English', en: '🇺🇸 English' },
  lang_ja:      { 'zh-Hant': '🇯🇵 日本語', en: '🇯🇵 Japanese' },
  lang_ko:      { 'zh-Hant': '🇰🇷 한국어', en: '🇰🇷 Korean' },
  stt_groq:     { 'zh-Hant': '⚡ Groq Whisper（推薦，速度最快）', en: '⚡ Groq Whisper (recommended, fastest)' },
  stt_gemini:   { 'zh-Hant': '💎 Google Gemini 2.0 Flash', en: '💎 Google Gemini 2.0 Flash' },
  stt_openai:   { 'zh-Hant': '🤖 OpenAI Whisper-1', en: '🤖 OpenAI Whisper-1' },

  // AI 修飾分頁
  ai_title:        { 'zh-Hant': 'AI 文字修飾', en: 'AI Text Refinement' },
  ai_enable:       { 'zh-Hant': '啟用 AI 修飾', en: 'Enable AI Refinement' },
  ai_enable_hint:  { 'zh-Hant': '自動移除語助詞、修正標點、讓文字更通順', en: 'Remove filler words, fix punctuation, improve fluency' },
  ai_provider:     { 'zh-Hant': 'AI 供應商', en: 'AI Provider' },
  ai_strength:     { 'zh-Hant': '修飾強度', en: 'Refinement Strength' },
  ai_light:        { 'zh-Hant': '🪶 輕度 — 只移除語助詞', en: '🪶 Light — remove filler words only' },
  ai_standard:     { 'zh-Hant': '⚡ 標準 — 修正標點與語句（推薦）', en: '⚡ Standard — fix punctuation and flow (recommended)' },
  ai_strong:       { 'zh-Hant': '✨ 強力 — 完整書面化改寫', en: '✨ Strong — full written-style rewrite' },
  ai_gemini:       { 'zh-Hant': '💎 Google Gemini 2.0 Flash（推薦）', en: '💎 Google Gemini 2.0 Flash (recommended)' },
  ai_openai:       { 'zh-Hant': '🤖 OpenAI GPT-4o Mini', en: '🤖 OpenAI GPT-4o Mini' },
  ai_groq:         { 'zh-Hant': '⚡ Groq LLaMA 3.3 70B', en: '⚡ Groq LLaMA 3.3 70B' },
  smart_format:      { 'zh-Hant': '✨ 智慧排版（自動條列／分段）', en: '✨ Smart formatting (auto lists & paragraphs)' },
  smart_format_hint: { 'zh-Hant': '列舉多個項目時自動變成清單，多主題時自動分段，效果類似 Typeless。', en: 'Turns enumerations into lists and splits topics into paragraphs, similar to Typeless.' },

  // 輸出語言分頁
  output_title:         { 'zh-Hant': '輸出語言', en: 'Output Language' },
  output_desc:          { 'zh-Hant': '決定語音最終要輸出成什麼語言。翻譯功能需開啟「AI 修飾」才會生效。', en: 'Set the final output language. Translation requires AI Refinement to be enabled.' },
  output_mode:          { 'zh-Hant': '輸出模式', en: 'Output Mode' },
  output_original_title:{ 'zh-Hant': '🗣 維持說話的原文', en: '🗣 Keep original language' },
  output_original_desc: { 'zh-Hant': '自動判斷你說的語言並維持原樣。說中文出中文、說英文出英文。', en: 'Auto-detect the spoken language and keep it as-is.' },
  output_fixed_title:   { 'zh-Hant': '🌐 永遠輸出指定語言', en: '🌐 Always output a fixed language' },
  output_fixed_desc:    { 'zh-Hant': '不管你說什麼語言，最後都翻譯成你選的語言。', en: 'Translate to the selected language regardless of what you speak.' },
  output_target:        { 'zh-Hant': '目標語言', en: 'Target Language' },
  output_ai_warn:       { 'zh-Hant': '⚠️ 翻譯需要 AI，請先到「AI 修飾」分頁啟用。', en: '⚠️ Translation requires AI Refinement — please enable it first.' },

  // 詞彙表分頁
  vocab_title:        { 'zh-Hant': '自訂詞彙表 / AI 指示', en: 'Custom Vocabulary / AI Prompt' },
  vocab_desc:         { 'zh-Hant': '幫助 AI 正確辨識人名、品牌、專業術語，並可加上你自己的修飾指示。需開啟「AI 修飾」才會生效。', en: 'Help the AI correctly recognise names, brands, and jargon, and add your own refinement instructions. Requires AI Refinement to be enabled.' },
  vocab_list_label:   { 'zh-Hant': '常用詞彙（每行一個）', en: 'Custom terms (one per line)' },
  vocab_list_ph:      { 'zh-Hant': '例如：\nJacky Never Type\n林志明\nKubernetes\nGroq', en: 'e.g.\nJacky Never Type\nLin Zhi-Ming\nKubernetes\nGroq' },
  vocab_list_hint:    { 'zh-Hant': '辨識結果若出現發音相近的錯字，AI 會自動改成這裡的正確寫法。', en: 'If the result has misheard words, the AI will correct them to the spellings listed here.' },
  vocab_prompt_label: { 'zh-Hant': '額外 AI 指示（選填）', en: 'Extra AI instruction (optional)' },
  vocab_prompt_ph:    { 'zh-Hant': '例如：請使用條列式整理重點；語氣保持正式；保留英文專有名詞不要翻譯。', en: 'e.g. Summarise as bullet points; keep a formal tone; keep English proper nouns untranslated.' },
  vocab_prompt_hint:  { 'zh-Hant': '這段指示會附加到 AI 修飾的提示詞，套用在每次輸出。', en: 'This instruction is appended to the AI refinement prompt for every output.' },
  vocab_ai_warn:      { 'zh-Hant': '⚠️ 詞彙表與指示需要 AI，請先到「AI 修飾」分頁啟用。', en: '⚠️ Vocabulary and instructions require AI — please enable it in the AI Refinement tab first.' },

  // 快捷鍵分頁
  hotkey_title:   { 'zh-Hant': '快捷鍵設定', en: 'Hotkey Settings' },
  hotkey_label:   { 'zh-Hant': '錄音熱鍵（單按開始/停止）', en: 'Recording hotkey (press once to start/stop)' },
  hotkey_hint:    { 'zh-Hant': '格式：CommandOrControl / Alt / Shift + 按鍵\n例如：CommandOrControl+Shift+Space', en: 'Format: CommandOrControl / Alt / Shift + Key\nExample: CommandOrControl+Shift+Space' },
  showlast_label: { 'zh-Hant': '叫出上一句熱鍵（顯示複製卡片）', en: 'Show last result hotkey (copy card)' },
  showlast_hint:  { 'zh-Hant': '若剛剛說的話沒貼進想要的地方，按這個鍵可叫出上一句的文字並一鍵複製。', en: 'If the last dictation did not land where you wanted, press this to bring up the text and copy it.' },
  port_label:     { 'zh-Hant': '設定頁面連接埠', en: 'Settings server port' },

  // 歷史分頁
  history_title:         { 'zh-Hant': '歷史記錄', en: 'History' },
  history_clear:         { 'zh-Hant': '🗑 清空', en: '🗑 Clear All' },
  history_clear_confirm: { 'zh-Hant': '確定要清空所有歷史記錄嗎？此動作無法復原。', en: 'Clear all history? This cannot be undone.' },
  history_desc:          { 'zh-Hant': '顯示最近 {n} 筆辨識結果，點「複製」即可取用。', en: 'Showing {n} recent results. Click Copy to use.' },
  history_empty:         { 'zh-Hant': '尚無歷史記錄，開始用語音輸入後會出現在這裡。', en: 'No history yet. Start using voice input and results will appear here.' },
  history_copy:          { 'zh-Hant': '📋 複製', en: '📋 Copy' },
  history_copied:        { 'zh-Hant': '✅ 已複製', en: '✅ Copied' },

  // 關於分頁
  about_title:   { 'zh-Hant': '關於 Jacky Never Type', en: 'About Jacky Never Type' },
  about_desc:    { 'zh-Hant': 'AI 語音輸入工具', en: 'AI Voice Dictation Tool' },
  about_version: { 'zh-Hant': '版本 1.1.0', en: 'Version 1.1.0' },
  about_stt:     { 'zh-Hant': '支援的 STT 供應商：', en: 'Supported STT providers:' },
  about_ai:      { 'zh-Hant': '支援的 AI 修飾供應商：', en: 'Supported AI refinement providers:' },
  about_groq_stt:{ 'zh-Hant': 'Groq Whisper Large V3 Turbo（速度最快）', en: 'Groq Whisper Large V3 Turbo (fastest)' },
  about_openai_stt: { 'zh-Hant': 'OpenAI Whisper-1', en: 'OpenAI Whisper-1' },

  // 儲存按鈕
  save_btn:  { 'zh-Hant': '儲存設定', en: 'Save Settings' },
  saved_btn: { 'zh-Hant': '✅ 已儲存！', en: '✅ Saved!' },

  // 介面語言切換
  ui_lang: { 'zh-Hant': '介面語言', en: 'Interface Language' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: UILanguage): string {
  return translations[key][lang];
}
