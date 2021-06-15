'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production'
const compressing = require("compressing");
const updateManager = require("./common/updater.js");

console.log('updateManager',updateManager);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  const win = new BrowserWindow({
    width: 1186,
    height: 733,
    minWidth: 1186,
    minHeight: 733,
    maxWidth: 1186,
    maxHeight: 733,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


app.on('ready', async () => {
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.handle("compress-folder", async (event, arg) => {
  await compressing.zip.compressDir(arg, arg + ".zip");
  return arg + ".zip";
})

ipcMain.handle("compress-folder-list", async (event, arg) => {
  for (let i = 0; i < arg.length; i++) {
    await compressing.zip.compressDir(arg[i], arg[i] + ".zip");
  }
  return arg.map(ele => ele + ".zip");
})

