import { createServer, type Server } from 'node:http'
import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { getToken } from './token-store'

let server: Server | null = null

export async function startNitroServer(): Promise<number> {
  const token = getToken()
  if (token) {
    process.env.NUXT_UPSUN_API_TOKEN = token
  }

  process.env.ELECTRON_RUNNING = 'true'

  const dataDir = join(app.getPath('userData'), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  process.env.NITRO_STORAGE_DATA_BASE = dataDir

  const outputPath = app.isPackaged
    ? join(process.resourcesPath, 'output', 'server', 'index.mjs')
    : join(__dirname, '..', '.output', 'server', 'index.mjs')

  const nitroExports = await import(outputPath)
  const listener = nitroExports.listener || nitroExports.handler || nitroExports.default
  server = createServer(listener)

  return new Promise((resolve, reject) => {
    server!.listen(0, '127.0.0.1', () => {
      const addr = server!.address()
      if (addr && typeof addr === 'object') {
        resolve(addr.port)
      } else {
        reject(new Error('Failed to get server port'))
      }
    })
    server!.on('error', reject)
  })
}

export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (server) {
      server.close(() => resolve())
    } else {
      resolve()
    }
  })
}
