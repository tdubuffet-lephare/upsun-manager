import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
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

function setupAutoUpdater() {
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`[updater] update available: v${info.version}`)
    new Notification({
      title: 'Mise à jour disponible',
      body: `Upsun Manager v${info.version} est en cours de téléchargement.`,
    }).show()
  })

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] no update available')
  })

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[updater] download progress: ${progress.percent.toFixed(1)}%`)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[updater] update downloaded: v${info.version}`)
    new Notification({
      title: 'Mise à jour prête',
      body: `Upsun Manager v${info.version} sera installée au prochain démarrage.`,
    }).show()
  })

  autoUpdater.on('error', (error) => {
    console.error('[updater] error:', error)
  })

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.error('[updater] initial check failed:', error)
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
  setupAutoUpdater()

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
