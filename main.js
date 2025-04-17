const { app, BrowserWindow, Menu, ipcMain } = require('electron')

const path = require('path')
const fs = require('fs')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1000,  // 从900增加到1000
    height: 650,
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
// 修改loadTodos和saveTodos函数
function loadTodos() {
  try {
    const data = fs.readFileSync(storagePath, 'utf-8')
    const parsed = JSON.parse(data)
    // 兼容旧数据格式
    if (Array.isArray(parsed)) {
      return {
        categories: ['默认分类'],
        todos: {
          '默认分类': parsed
        }
      }
    }
    return parsed
  } catch (err) {
    return {
      categories: ['默认分类'],
      todos: {
        '默认分类': []
      }
    }
  }
}

// 写入数据
function saveTodos(todos) {
  fs.writeFileSync(storagePath, JSON.stringify(todos), 'utf-8')
}

ipcMain.handle('get-todos', () => loadTodos())
ipcMain.handle('save-todos', (event, todos) => saveTodos(todos))

