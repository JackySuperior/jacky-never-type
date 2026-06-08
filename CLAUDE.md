# Jacky Never Type — AI 語音輸入工具

## 專案概述

Jacky Never Type 是一個 AI 驅動的語音輸入工具，讓使用者透過語音快速輸入文字，並結合 AI 進行智慧修正與格式化。

## 技術棧

- Frontend: React 19 + Vite 8（Electron 渲染層）
- App 框架: Electron 42
- 語音辨識: Groq Whisper Large V3 Turbo / OpenAI Whisper / Google Gemini
- AI 處理: Groq LLaMA 3.3 70B / OpenAI GPT-4o Mini / Gemini 2.0 Flash
- 語言: TypeScript 5
- 設定儲存: electron-store v11
- 文字注入: PowerShell SendKeys

## 指令設定

**所有回應請使用繁體中文。**

### 暫停 / 休息 指令

當使用者說「暫停」或「休息」時：
1. 立即停止當前實作任務
2. 記錄目前進度、未完成事項、下一步行動到本檔案的「工作進度記錄」區塊
3. 更新 CLAUDE.md 後回報摘要給使用者

---

## 工作進度記錄

> 此區塊由 Claude 在收到「暫停」或「休息」指令時自動更新。

### 最後更新：2026-06-08

**目前階段：** v1.3.1 完成 ✅，已上傳 GitHub 並建立 Release（CI building）

**GitHub：** https://github.com/JackySuperior/jacky-never-type

---

### v1.0 功能（基礎版）
- Electron 主程序架構（熱鍵、Overlay、系統匣）
- STT 三選一：Groq / OpenAI Whisper / Gemini（預設 Groq）
- AI 文字修飾（Groq / OpenAI / Gemini，三種強度：輕度 / 標準 / 強力）
- 強力模式：說錯改口辨識、自動分段、書面化
- 文字注入（PowerShell SendKeys Windows / AppleScript Mac）
- 設定頁面（Electron 視窗，860×760，自動儲存）
- 本機設定儲存（electron-store）
- 歷史記錄（設定頁「歷史」分頁，顯示20筆、可複製、JSON 永久保存於 history.json）
- 輸出語言設定：維持原文 / 永遠輸出指定語言（繁中 / EN / 日語 / 韓語）
- Overlay 懸浮提示：螢幕底部置中

### v1.2 新增
- 熱鍵錄製 UI（點擊錄製，不用手動輸入字串）
- 自訂 AI Prompt + 詞彙表（人名/術語修正）
- 智慧排版（smartFormatting）：自動條列/分段

### v1.3.1 修正（2026-06-08）
- **STT 語言偵測修正**（`src/main/stt/groq.ts`）：`zhHint`（中文提示語）只在 `language === 'zh'` 時加入，`auto` 模式不加，避免 Whisper 把英文偏向辨識成中文
- **AI 不把語音當對話**（`src/main/ai/refiner.ts`）：加入 `CORE_RULE`（絕對禁止回應語音內容）、`<transcript>` 標籤包裹使用者輸入，防止 LLM 把語音指令當對話回應
- **英文語言保留**（`src/main/ai/refiner.ts`）：
  - `buildLanguageRule()` 在輸入是英文時加入英文錨定指令（`CRITICAL: ...MUST remain in English`）
  - 純英文輸入但輸出中文 > 50% → 自動用純英文 prompt 重試 → 失敗則退回 STT 原文
- **凍結英文技術**（`src/main/ai/refiner.ts`）：中英混合時，先把英文片段替換為佔位符 `[[E0]]`、`[[E1]]`，AI 只整理中文部分，完成後還原英文，確保夾在中文裡的英文單字不被翻譯
- **Mac Bundle ID 修正**（`package.json`）：`appId` 從 `com.jackynevertype.app` 改為 `io.jackysuperior.nevertype`，解決舊版 TCC 記錄干擾 Accessibility 授權的問題
- **Mac Automation 權限引導**（`src/main/injector.ts`）：貼字失敗時（錯誤碼 1743 / "not allowed"）顯示引導對話框，說明需要在 System Settings → Privacy → Automation 啟用 System Events
- **Mac NSMicrophoneUsageDescription**（`package.json`）：加入麥克風使用說明，避免 macOS 拒絕麥克風存取

---

### 已知問題與重要筆記

**語音辨識（Whisper）：**
- Whisper `auto` 模式在前面大量中文輸入後，偶爾會把英文語音誤認成亂碼中文（hallucination）。這是 Whisper 已知限制，無法從應用層修復
  - 緩解：連續說英文時，在設定把 STT 語言改成「English」
  - 緩解：偶爾出錯時，按 F10 叫出複製卡片手動修改
- 凍結英文技術只在「輸出語言 = 維持原文 + 輸入是中英混合」時啟動，純英文輸入走一般路徑

**Mac 權限：**
- macOS TCC 用 Bundle ID 識別 app。若安裝過舊版（`com.jackynevertype.app`），需執行：
  ```
  tccutil reset Accessibility io.jackysuperior.nevertype
  tccutil reset AppleEvents io.jackysuperior.nevertype
  tccutil reset Accessibility com.jackynevertype.app
  tccutil reset AppleEvents com.jackynevertype.app
  ```
  然後重新開啟 app 並授權 Accessibility + Automation → System Events
- Mac app 未簽署（個人散布），每次系統更新後可能需要重新授權

**打包：**
- 路徑含空格會導致 sandbox preload 載入失敗 → 已用 `sandbox: false` 解決
- 打包版 userData = `%APPDATA%\Jacky Never Type`（與開發版 `jacky-never-type` 分開），API key 需在打包版重新輸入
- NSIS 安裝檔失敗：winCodeSign 需「開發者模式」→ 以免安裝版替代
- 重新打包流程：`npm run package`（NSIS 失敗無妨）→ 複製 `release/win-unpacked` 到 `A:\JackyNeverType`

**Groq 免費額度：**
- 每日上限 100,000 tokens。密集測試容易耗盡，AI 修飾會失敗並直接輸出 STT 原文（行為正確，不會 crash）

---

### 下一步（待實作）
1. Whisper 語言自動偵測改善：用 `verbose_json` 取得 Whisper 偵測到的語言，若不符預期可重試
2. 更多 STT 供應商測試：OpenAI / Gemini STT 是否有同樣的語言幻覺問題
3. Windows 安裝版（需開發者模式或 EV 憑證）

---

## 功能規劃

- [x] 語音錄製與即時轉錄
- [x] AI 智慧修正（標點、語氣詞去除）
- [x] 多語言支援（中英文，含輸出語言切換）
- [x] 快捷鍵控制（F9 開始/停止錄音）
- [x] 歷史記錄（永久保存 JSON）
- [ ] 自訂 AI Prompt + 詞彙表
- [ ] 熱鍵錄製 UI

## 開發規範

- Commit 訊息使用英文
- 元件命名使用 PascalCase
- 檔案命名使用 kebab-case
