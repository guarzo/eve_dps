// File: src/main/index.js
import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

import { dpsEmitter } from './event-bus.js';
import { computeDpsByCharacter } from './dps-calculator.js';
import { startWatchingLogs } from './watch-logs.js';
import { startEmittingDps } from './dps-emitter.js';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,

    // ----- CUSTOM FRAMELESS WINDOW -----
    frame: false,               // remove OS chrome
    titleBarStyle: 'hidden',    // Mac-specific style
    // On macOS, you might use 'hiddenInset'. On Windows/Linux, 'frame: false' is enough.

    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the remote URL for development or the local HTML file for production
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Example test IPC
  ipcMain.on('ping', () => console.log('pong'));

  // We'll also listen for a "close-app" message from the renderer
  ipcMain.on('close-app', () => {
    // On Windows/Linux, we can just quit
    // On macOS, we might do a more nuanced approach, but this is fine
    app.quit();
  });

  // Create our main window
  const mainWindow = createWindow();

  // Start watching EVE logs (which will call parseLineForDamage whenever new lines appear)
  startWatchingLogs();

  // Start regularly emitting short/long DPS so the renderer gets continuous updates
  startEmittingDps();

  // Forward the short/long events to the renderer
  dpsEmitter.on('dps-by-character-updated-short', (data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dps-by-character-updated-short', data);
    }
  });

  dpsEmitter.on('dps-by-character-updated-long', (data) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dps-by-character-updated-long', data);
    }
  });

  // On macOS, re-create a window if the dock icon is clicked and there are no open windows
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except macOS behavior)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
