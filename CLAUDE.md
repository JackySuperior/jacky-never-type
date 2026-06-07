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

### 最後更新：2026-06-06

**目前階段：** v1.0 完成 ✅，已上傳 GitHub 並建立 Release

**GitHub：** https://github.com/JackySuperior/jacky-never-type

**已完成（v1.0）：**
- Electron 主程序架構（熱鍵、Overlay、系統匣）
- STT 三選一：Groq / OpenAI Whisper / Gemini（預設 Groq）
- AI 文字修飾（Groq / OpenAI / Gemini，三種強度：輕度 / 標準 / 強力）
- 強力模式：說錯改口辨識、自動分段、書面化（貼近 Typeless 效果）
- 文字注入（PowerShell SendKeys，已修正換行 bug）
- 設定頁面（Electron 視窗，860×760，自動儲存）
- 本機設定儲存（electron-store）
- 歷史記錄（設定頁「歷史」分頁，顯示20筆、可複製、JSON 永久保存於 history.json）
- 輸出語言設定：維持原文 / 永遠輸出指定語言（繁中 / EN / 日語 / 韓語）
- Overlay 懸浮提示：螢幕底部置中、英文文字（Recording / Processing）
- 打包：免安裝版於 `A:\JackyNeverType\`，桌面捷徑
- README.md（英文，含安裝說明、API key 申請、使用方式）
- GitHub Release v1.0（含 ZIP 免安裝版下載）

**已知問題與重要筆記：**
- 熱鍵預設為 F9（Ctrl+Shift+Space、Alt+Shift、Ctrl+Alt 都被 Windows/輸入法佔用）
- 路徑含空格會導致 sandbox preload 載入失敗 → 已用 `sandbox: false` 解決
- 打包版 userData = `%APPDATA%\Jacky Never Type`（與開發版 `jacky-never-type` 分開），API key 需在打包版重新輸入
- NSIS 安裝檔失敗：winCodeSign 需「開發者模式」→ 以免安裝版替代
- 重新打包流程：`npm run package`（NSIS 失敗無妨）→ 複製 `release/win-unpacked` 到 `A:\JackyNeverType`

**下一步（待實作）：**
1. 自訂 AI Prompt + 詞彙表（人名/術語修正）
2. 熱鍵錄製 UI（點擊錄製，不用手動輸入字串）

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
