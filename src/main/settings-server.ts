import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { BrowserWindow } from 'electron';
import { getSettings, saveSettings, getHistory, clearHistory } from './store';
import { HISTORY_DISPLAY_LIMIT } from '../shared/types';

let server: http.Server | null = null;
let settingsWindow: BrowserWindow | null = null;

function openSettingsWindow(port: number): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 860,
    height: 760,
    minWidth: 720,
    minHeight: 600,
    title: 'Jacky Never Type — 設定',
    resizable: true,
    minimizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  settingsWindow.loadURL(`http://localhost:${port}`);
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

export function openSettingsServer(): void {
  const settings = getSettings();
  const port = settings.settingsPort;

  if (server) {
    openSettingsWindow(port);
    return;
  }

  server = http.createServer((req, res) => {
    const url = new URL(req.url!, `http://localhost:${port}`);

    // API: GET /api/settings
    if (url.pathname === '/api/settings' && req.method === 'GET') {
      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify(getSettings()));
      return;
    }

    // API: GET /api/history（顯示最近 N 筆）
    if (url.pathname === '/api/history' && req.method === 'GET') {
      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify(getHistory(HISTORY_DISPLAY_LIMIT)));
      return;
    }

    // API: POST /api/history/clear（清空歷史）
    if (url.pathname === '/api/history/clear' && req.method === 'POST') {
      clearHistory();
      res.writeHead(200, corsHeaders('application/json'));
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    // API: POST /api/settings
    if (url.pathname === '/api/settings' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          const newSettings = JSON.parse(body);
          saveSettings(newSettings);
          res.writeHead(200, corsHeaders('application/json'));
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400, corsHeaders('application/json'));
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // Serve settings UI (靜態 HTML)
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const htmlPath = path.join(__dirname, '../../dist/renderer/settings.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath));
      } else {
        // 開發模式：回傳簡單提示
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<html><body><h2>設定頁面開發中...</h2><p>請先執行 npm run build</p></body></html>`);
      }
      return;
    }

    // 靜態資源
    const distPath = path.join(__dirname, '../../dist/renderer', url.pathname);
    if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
      const ext = path.extname(distPath);
      const contentType = getContentType(ext);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(distPath));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`[Settings] 伺服器啟動在 http://localhost:${port}`);
    openSettingsWindow(port);
  });
}

function corsHeaders(contentType: string) {
  return {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
  };
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };
  return types[ext] ?? 'application/octet-stream';
}

export function stopSettingsServer(): void {
  server?.close();
  server = null;
}
