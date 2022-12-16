
export function electronStoreGet(key: string): any {
  return window.electron.ipcRenderer.sendMessageSync("ipc-core", ["electron-store-get", key])
}

export function electronStoreSet(key: string, value: any): void {
  window.electron.ipcRenderer.sendMessage("ipc-core", ["electron-store-set", { key, value }])
}

export function electronStoreClear(): void {
  window.electron.ipcRenderer.sendMessage("ipc-core", ["electron-store-clear"])
}

export function titlebarControl(control: string): any {
  return window.electron.ipcRenderer.sendMessageSync("ipc-core", ["titlebar-control", control])
}
export function demoControl(control: string): any {
  return window.electron.ipcRenderer.sendMessage("ipc-core", ["titlebar-control", control])
}
