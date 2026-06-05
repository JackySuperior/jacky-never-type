# Jacky Never Type — AI 語音輸入工具

## 專案概述

Jacky Never Type 是一個 AI 驅動的語音輸入工具，讓使用者透過語音快速輸入文字，並結合 AI 進行智慧修正與格式化。

## 技術棧（待確認）

- Frontend: React + Vite（或 Electron 桌面應用）
- 語音辨識: Web Speech API / OpenAI Whisper
- AI 處理: Claude API（Anthropic SDK）
- 語言: TypeScript

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

### 最後更新：2026-06-05

**目前階段：** 完整流程測試通過 ✅，可正常使用

**已完成：**
- Electron 主程序架構（熱鍵、Overlay、系統匣）
- STT 三選一：Groq / OpenAI Whisper / Gemini
- AI 文字修飾（Gemini / OpenAI / Groq，三種強度）
- 文字注入（PowerShell SendKeys，已修正換行 bug）
- 設定頁面（改為 Electron 視窗，非瀏覽器）
- 本機設定儲存（electron-store）
- **完整流程實測通過**：錄音 → Groq STT → AI 修飾 → 自動貼上
- Overlay 懸浮提示：螢幕底部置中、英文文字（Recording / Transcribing）

**已知問題與重要筆記：**
- 熱鍵預設為 F9（Ctrl+Shift+Space、Alt+Shift、Ctrl+Alt 都被 Windows/輸入法佔用）
- 路徑含空格會導致 sandbox preload 載入失敗 → 已用 `sandbox: false` 解決
- 麥克風實測：Razer Seiren Mini 正常

**打包資訊：**
- 已產生免安裝版於 `A:\JackyNeverType\`（exe + app-icon.ico）
- 桌面捷徑已建立，雙擊啟動、不自動開機
- 注意：打包版 userData = `%APPDATA%\Jacky Never Type`（與開發版 `jacky-never-type` 分開），API key 需在打包版重新輸入一次
- NSIS 安裝檔失敗原因：winCodeSign 解壓 macOS 符號連結需「開發者模式」權限（暫以免安裝版替代）

**下一步（優先順序）：**
1. ✅ 打包（免安裝版完成）
2. ✅ 歷史記錄（設定頁「歷史」分頁，顯示20筆、可複製、JSON 永久保存於 history.json）
3. ✅ 強化「強力模式」prompt（加入說錯改口辨識、自動分段，貼近 Typeless）
4. 自訂 AI Prompt + 詞彙表（人名/術語修正）
5. 熱鍵錄製 UI（避免手動輸入字串）

**Typeless 研究筆記：**
- Typeless 不依文字長度切換模式，固定一套「智慧清理＋排版」，唯一自動切換是依目標 App 調整語氣
- 我們的「強力模式」已對應其效果（清理＋書面化＋分段，但不摘要濃縮）
- 重新打包流程：npm run package（NSIS 會失敗無妨）→ 複製 release/win-unpacked 到 A:\JackyNeverType

---

## 功能規劃（草稿）

- [ ] 語音錄製與即時轉錄
- [ ] AI 智慧修正（標點、語氣詞去除）
- [ ] 多語言支援（中英文）
- [ ] 快捷鍵控制（開始/停止錄音）
- [ ] 輸出格式選擇（純文字、Markdown）
- [ ] 歷史記錄

## 開發規範

- Commit 訊息使用英文
- 元件命名使用 PascalCase
- 檔案命名使用 kebab-case
