const { app, BrowserWindow, Menu, ipcMain } = require('electron')

const path = require('path')
const fs = require('fs')

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


// 获取用户数据存储路径
const userDataPath = app.getPath('userData')
const storagePath = path.join(userDataPath, 'todo-data.json')

// 读取存储数据
function loadTodos() {
  try {
    const data = fs.readFileSync(storagePath, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return [] // 文件不存在时返回空数组
  }
}

// 写入数据
function saveTodos(todos) {
  fs.writeFileSync(storagePath, JSON.stringify(todos), 'utf-8')
}

ipcMain.handle('get-todos', () => loadTodos())
ipcMain.handle('save-todos', (event, todos) => saveTodos(todos))

