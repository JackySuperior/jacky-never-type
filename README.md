# 🎤 Jacky Never Type

> AI-powered voice dictation tool for Windows and macOS — speak, and your words appear wherever your cursor is.

![Electron](https://img.shields.io/badge/Electron-42-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey)
![License](https://img.shields.io/badge/license-ISC-green)

---

## ✨ Features

- **One hotkey** — press `F9` to start/stop recording from anywhere
- **Fast STT** — powered by Groq Whisper, OpenAI Whisper, or Google Gemini
- **AI text cleanup** — removes filler words, fixes punctuation, restructures sentences
  - Light / Standard / Strong modes (Strong mode mimics Typeless-style intelligent cleanup)
  - Detects self-corrections and keeps only the intended version
- **Output language** — keep original language, or always translate to a target language (EN / 繁中 / 日本語 / 한국어)
- **Interface language** — switch between 繁體中文 and English in Settings
- **Auto-paste** — refined text is automatically pasted into any focused input field
- **History** — last 20 results shown in settings; all entries saved permanently as JSON
- **Lives in the system tray / menu bar** — no taskbar clutter; floating overlay shows recording status
- **Settings window** — clean UI, no browser required

---

## 📦 Download

Pre-built portable app:

👉 **[Download from Releases](../../releases)**

- **Windows x64** — extract the zip, double-click `Jacky Never Type.exe`. No installation required.
- **macOS** — open the `.dmg`, drag to Applications.

---

## 🚀 Quick Start (Free — Groq)

Groq provides a **free API** with fast Whisper inference and generous rate limits.

### Step 1 — Create a Groq account
Go to **[console.groq.com](https://console.groq.com)** and sign up with Google, GitHub, or email.

### Step 2 — Generate an API key
1. In the Groq Console, click **API Keys** in the left sidebar
2. Click **Create API Key**, give it a name (e.g. `Jacky Never Type`)
3. Copy the key — it starts with `gsk_`
   > ⚠️ Groq only shows the key once. Save it somewhere safe.

### Step 3 — Enter the key in settings
1. Launch Jacky Never Type (the icon appears in the system tray / menu bar)
2. Click the tray icon → ⚙️ **Settings**
3. Go to **API Keys** tab → paste into **Groq API Key**
4. Settings save automatically

### Step 4 — Verify it works
1. **Speech-to-Text** tab → select **Groq Whisper**
2. **AI Refinement** tab → enable → select **Groq LLaMA**
3. Press `F9`, speak a sentence, press `F9` again
4. Your refined text appears in the focused app within ~1 second ✅

---

## 🛠 Build from Source

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Windows 10/11 or macOS 12+

### Setup

```bash
git clone https://github.com/JackySuperior/jacky-never-type.git
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

- **Windows output:** `release/win-unpacked/`
- **macOS output:** `release/` (DMG + ZIP) — must be run on a Mac

> 💡 **Automated builds:** Pushing a `v*` git tag (e.g. `v1.1`) triggers a GitHub Actions
> workflow that builds **both Windows and macOS** in the cloud and attaches the installers
> to the matching GitHub Release. No Mac required to produce the macOS DMG.

---

## ⚙️ Configuration

On first launch, click the **system tray / menu bar icon → Settings**.

### API Keys (at least one required)

| Provider | Used for | Get key |
|----------|----------|---------|
| **Groq** | STT + AI (recommended, free) | [console.groq.com](https://console.groq.com) |
| OpenAI | STT (Whisper) + AI (GPT-4o Mini) | [platform.openai.com](https://platform.openai.com) |
| Google Gemini | STT + AI (free) | [aistudio.google.com](https://aistudio.google.com/apikey) |

> All keys are stored **locally only** and never uploaded anywhere.

---

## 🎯 Usage

| Action | How |
|--------|-----|
| Start recording | Press `F9` |
| Stop & transcribe | Press `F9` again |
| Open settings | Tray icon → ⚙️ Settings |
| Switch UI language | Settings → top-right corner → **繁中** / **EN** |
| View history | Settings → 📜 History |
| Change hotkey | Settings → ⌨️ Hotkey |

---

## 🍎 macOS Notes

### Opening an unsigned app (first time)
The macOS build is **not code-signed** (no paid Apple Developer account), so Gatekeeper
will block it the first time. To open it:

1. In Finder, **right-click** (or Control-click) **Jacky Never Type.app** → **Open**
2. In the warning dialog, click **Open** again
3. macOS remembers your choice — afterwards it launches normally

> If you don't see an Open button, go to **System Settings → Privacy & Security**,
> scroll down, and click **Open Anyway**.

### First launch — Accessibility permission
On first run, macOS will show a dialog asking for **Accessibility** permission.
This is required so the app can simulate Cmd+V to paste text into other apps.

1. Click **Open System Settings** in the dialog
2. Go to **Privacy & Security → Accessibility**
3. Toggle **Jacky Never Type** to ON

### Default hotkey on Mac
`F9` works on Mac. Alternatively use `CommandOrControl+Shift+Space` (if not taken by Spotlight) — change it in Settings → Hotkey.

### Known macOS limitation
Text injection uses AppleScript (`System Events keystroke`). Some heavily sandboxed App Store apps may not accept simulated keystrokes.

---

## 🔧 Known Issues

- **Hotkey conflicts** — If `F9` conflicts with another app, change it in Settings → Hotkey (e.g. `F8` or `CommandOrControl+Shift+F9`)
- **Simplified Chinese output** — Groq Whisper occasionally outputs simplified Chinese; the AI refinement step corrects it to Traditional Chinese automatically
- **Text injection (Windows)** — Uses `Ctrl+V` via PowerShell; may not work in UAC-elevated windows

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
