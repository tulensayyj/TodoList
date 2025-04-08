const { ipcRenderer } = require('electron')

// DOM元素引用
const taskInput = document.getElementById('task-input')
const addBtn = document.getElementById('add-btn')
const taskList = document.getElementById('task-list')

// 任务数据
let todos = []

// 初始化：加载存储的数据
async function init() {
  todos = await ipcRenderer.invoke('get-todos') || []
  renderTodos()
}
init()

// 渲染任务列表
function renderTodos() {
  taskList.innerHTML = ''
  
  todos.forEach((todo, index) => {
    const taskItem = document.createElement('li')
    taskItem.className = 'task-item'
    taskItem.innerHTML = `
      <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
      <button class="delete-btn" data-index="${index}">❌</button>
      <button class="toggle-btn" data-index="${index}">
        ${todo.completed ? '✅' : '⬜'}
      </button>
    `
    taskList.appendChild(taskItem)
  })
}

// 添加任务
function addTask() {
  const text = taskInput.value.trim()
  if (text) {
    todos.push({
      text,
      completed: false,
      createdAt: new Date().toISOString()
    })
    taskInput.value = ''
    renderTodos()
    // 保存更新后的数据
    saveTodos()
  }
}

// 删除任务
function deleteTask(index) {
  todos.splice(index, 1)
  renderTodos()
  // 保存更新后的数据
  saveTodos()
}

// 切换任务状态
function toggleTask(index) {
  todos[index].completed = !todos[index].completed
  renderTodos()
  // 保存更新后的数据
  saveTodos()
}

// 保存数据到本地
function saveTodos() {
  ipcRenderer.invoke('save-todos', todos)
}

// 事件委托（优化性能）
taskList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    deleteTask(Number(e.target.dataset.index))
  }
  if (e.target.classList.contains('toggle-btn')) {
    toggleTask(Number(e.target.dataset.index))
  }
})

// 事件监听
addBtn.addEventListener('click', addTask)
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask()
})
