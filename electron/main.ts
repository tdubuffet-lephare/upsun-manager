import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { getToken, setToken, hasToken, clearToken } from './token-store'
import { startNitroServer, stopServer } from './nitro-server'

let mainWindow: BrowserWindow | null = null
let serverPort: number | null = null

;(globalThis as any).__electronTokenCallback = (token: string) => {
  setToken(token)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Upsun Manager',
    icon: join(__dirname, '..', 'electron', 'resources', 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#15171e',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.loadURL(`http://127.0.0.1:${serverPort}`)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function registerIpcHandlers() {
  ipcMain.handle('token:get', () => getToken())
  ipcMain.handle('token:set', (_event, token: string) => {
    setToken(token)
    process.env.NUXT_UPSUN_API_TOKEN = token
  })
  ipcMain.handle('token:has', () => hasToken())
  ipcMain.handle('token:clear', () => {
    clearToken()
    delete process.env.NUXT_UPSUN_API_TOKEN
  })
}

app.whenReady().then(async () => {
  registerIpcHandlers()

  try {
    serverPort = await startNitroServer()
    console.log(`Nitro server started on port ${serverPort}`)
  } catch (err) {
    console.error('Failed to start Nitro server:', err)
    app.quit()
    return
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await stopServer()
})
