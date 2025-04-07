const { app, BrowserWindow,Menu } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // 简化示例，生产环境应启用隔离
    }
  })
  Menu.setApplicationMenu(null)

  win.loadFile('index.html')
})