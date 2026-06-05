# 🎤 Jacky Never Type

> AI-powered voice dictation tool for Windows — speak, and your words appear wherever your cursor is.

![Electron](https://img.shields.io/badge/Electron-42-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-ISC-green)

---

## ✨ Features

- **One hotkey** — press `F9` to start/stop recording from anywhere
- **Fast STT** — powered by Groq Whisper, OpenAI Whisper, or Google Gemini
- **AI text cleanup** — removes filler words, fixes punctuation, restructures sentences
  - Light / Standard / Strong modes (Strong mode mimics Typeless-style intelligent cleanup)
  - Detects self-corrections and keeps only the intended version
- **Output language** — keep original language, or always translate to a target language (EN / 繁中 / 日本語 / 한국어)
- **Auto-paste** — refined text is automatically pasted into any focused input field
- **History** — last 20 results shown in settings; all entries saved permanently as JSON
- **Lives in the system tray** — no taskbar clutter; floating overlay shows recording status
- **Settings window** — clean UI, no browser required

---

## 📦 Download

Pre-built portable app (Windows x64):

👉 **[Download from Releases](../../releases)**

Extract the zip and double-click `Jacky Never Type.exe`. No installation required.

---

## 🛠 Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Windows 10/11 (text injection uses PowerShell)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/jacky-never-type.git
cd jacky-never-type
npm install
```

### Run in development

```bash
npm run dev
```

### Build & package

```bash
npm run package
```

Output will be in `release/win-unpacked/`.

---

## ⚙️ Configuration

On first launch, click the **system tray icon → Settings**.

### API Keys (at least one required)

| Provider | Used for | Get key |
|----------|----------|---------|
| **Groq** | STT + AI (recommended) | [console.groq.com](https://console.groq.com) — free |
| OpenAI | STT (Whisper) + AI (GPT-4o Mini) | [platform.openai.com](https://platform.openai.com) |
| Google Gemini | STT + AI | [aistudio.google.com](https://aistudio.google.com/apikey) — free |

> All keys are stored **locally only** and never uploaded anywhere.

### Recommended setup (free)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a free API key
3. Paste it into Settings → API Keys → Groq API Key
4. Settings → Speech-to-Text → select **Groq Whisper**
5. Settings → AI Refinement → select **Groq** as provider

---

## 🎯 Usage

| Action | How |
|--------|-----|
| Start recording | Press `F9` |
| Stop & transcribe | Press `F9` again |
| Open settings | System tray icon → left-click → ⚙️ Settings |
| View history | Settings → 📜 History |
| Change hotkey | Settings → ⌨️ Hotkey |

> **Note:** `Ctrl+Shift+Space` and `Alt+Shift` are reserved by Windows IME on most systems. `F9` works reliably.

---

## 🔧 Known Issues

- **Hotkey conflicts** — If `F9` conflicts with another app, change it in Settings → Hotkey (type the key string manually, e.g. `F8` or `CommandOrControl+Shift+F9`)
- **Simplified Chinese output** — Groq Whisper occasionally outputs simplified Chinese; the AI refinement step corrects it to Traditional Chinese automatically
- **Text injection** — Uses `Ctrl+V` simulation via PowerShell; works in most apps but may not work in UAC-elevated windows

---

## 🏗 Tech Stack

| Layer | Tech |
|-------|------|
| App framework | Electron 42 |
| UI | React 19 + Vite 8 |
| Language | TypeScript 5 |
| STT | Groq Whisper / OpenAI Whisper / Google Gemini |
| AI refinement | Groq LLaMA 3.3 70B / OpenAI GPT-4o Mini / Google Gemini 2.0 Flash |
| Settings storage | electron-store |
| Text injection | PowerShell SendKeys (Windows) / AppleScript (macOS) |

---

## 📄 License

ISC © Jacky
