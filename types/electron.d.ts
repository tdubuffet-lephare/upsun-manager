interface ElectronAPI {
  getToken: () => Promise<string | null>
  setToken: (token: string) => Promise<void>
  hasToken: () => Promise<boolean>
  clearToken: () => Promise<void>
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
