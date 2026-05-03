import { app, safeStorage } from 'electron'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

interface StoredConfig {
  upsunApiToken: string
  encrypted: boolean
}

function configPath(): string {
  return join(app.getPath('userData'), 'config.json')
}

function readConfig(): StoredConfig | null {
  try {
    const raw = readFileSync(configPath(), 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeConfig(config: StoredConfig): void {
  const p = configPath()
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, JSON.stringify(config, null, 2), 'utf-8')
}

export function getToken(): string | null {
  const config = readConfig()
  if (!config) return null

  if (config.encrypted) {
    try {
      return safeStorage.decryptString(Buffer.from(config.upsunApiToken, 'base64'))
    } catch {
      return null
    }
  }
  return config.upsunApiToken
}

export function setToken(token: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(token)
    writeConfig({ upsunApiToken: encrypted.toString('base64'), encrypted: true })
  } else {
    writeConfig({ upsunApiToken: token, encrypted: false })
  }
}

export function hasToken(): boolean {
  return getToken() !== null && getToken() !== ''
}

export function clearToken(): void {
  writeConfig({ upsunApiToken: '', encrypted: false })
}
