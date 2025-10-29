const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// ✅ Trang bạn muốn load
const TARGET_URL = 'https://lmarena.ai/';
const ENABLE_LOG = false; // bật true để debug header

// Hàm chuẩn hóa header (chuyển hết về lowercase)
function normalizeHeaders(headers) {
  const out = {};
  for (const key of Object.keys(headers || {})) {
    out[key.toLowerCase()] = headers[key];
  }
  return out;
}

// ⚙️ Chặn và xóa các header bảo mật ngăn nhúng (X-Frame-Options, CSP)
function setupHeaderBypass() {
  const filter = { urls: ['<all_urls>'] };

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const raw = details.responseHeaders || {};
    const headersLower = normalizeHeaders(raw);

    if (ENABLE_LOG) {
      console.log('[onHeadersReceived] URL:', details.url);
      console.log('Headers before:', headersLower);
    }

    // Xóa các header gây chặn
    const removeList = [
      'x-frame-options',
      'frame-options',
      'content-security-policy'
    ];

    for (const h of removeList) {
      if (headersLower[h]) delete headersLower[h];
    }

    // Build lại header
    const newHeaders = {};
    for (const key of Object.keys(headersLower)) {
      newHeaders[key] = Array.isArray(headersLower[key])
        ? headersLower[key]
        : [String(headersLower[key])];
    }

    callback({ cancel: false, responseHeaders: newHeaders });
  });
}

// 🪟 Tạo cửa sổ chính
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#121212',
    title: 'Electron X-Frame-Bypass',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load trực tiếp trang mục tiêu
  win.loadURL(TARGET_URL);

  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('❌ Load failed:', code, desc);
  });

  win.webContents.on('did-finish-load', () => {
    console.log('✅ Page loaded:', TARGET_URL);
  });
}

// 🚀 Chạy app
app.whenReady().then(() => {
  setupHeaderBypass();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 🔚 Thoát app khi đóng cửa sổ (trừ macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
