const { ipcRenderer } = require('electron')

// DOM元素引用
const taskInput = document.getElementById('task-input')
const addBtn = document.getElementById('add-task-btn')
const taskList = document.getElementById('task-list')
const sidebarList = document.getElementById('sidebar-list')
const categoryInput = document.getElementById('category-input')
const addCategoryBtn = document.getElementById('add-category-btn')

// 数据结构改为按分类存储
let todoData = {
  categories: ['默认分类'], // 初始分类
  todos: {
    '默认分类': []
  }
}

// 初始化
async function init() {
  const data = await ipcRenderer.invoke('get-todos')
  if (data) {
    todoData = data
  }
  renderCategories()
  renderTodos()
}

// 渲染分类列表
function renderCategories() {
  sidebarList.innerHTML = ''
  todoData.categories.forEach((category, index) => {
    const item = document.createElement('li')
    item.className = 'sidebar-item' + (index === 0 ? ' active' : '')
    item.innerHTML = `
      <input type="radio" id="category-${index}" name="sidebar-options" 
             ${index === 0 ? 'checked' : ''} data-category="${category}">
      <label for="category-${index}">${category} (${getTodoCount(category)})</label>
    `
    // 将事件监听移到整个item上
    item.addEventListener('click', (e) => {
      // 防止点击radio时触发两次
      if(e.target.tagName !== 'INPUT') {
        const radio = item.querySelector('input')
        radio.checked = true
        radio.dispatchEvent(new Event('change'))
      }
    })
    
    // 保留radio的change事件处理
    item.querySelector('input').addEventListener('change', () => {
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'))
      item.classList.add('active')
      renderTodos()
    })
    
    sidebarList.appendChild(item)
  })
}

// 获取当前选中分类
function getCurrentCategory() {
  const selected = document.querySelector('input[name="sidebar-options"]:checked')
  return selected ? selected.dataset.category : todoData.categories[0]
}

// 渲染任务列表
function renderTodos() {
  taskList.innerHTML = ''
  const currentCategory = getCurrentCategory()
  const todos = todoData.todos[currentCategory] || []
  
  todos.forEach((todo, index) => {
    const taskItem = document.createElement('li')
    taskItem.className = 'task-item'
    taskItem.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${todo.completed ? 'checked' : ''}>
      <label class="task-label ${todo.completed ? 'completed' : ''}">${todo.text}</label>
      <button class="delete-btn" data-index="${index}">❌</button>
    `
    taskList.appendChild(taskItem)
  })
}

// 添加分类
function addCategory() {
  const name = categoryInput.value.trim()
  if (name && !todoData.categories.includes(name)) {
    todoData.categories.push(name)
    todoData.todos[name] = []
    categoryInput.value = ''
    renderCategories()
    
    // 自动选中新添加的分类
    const newIndex = todoData.categories.length - 1
    const newItem = document.querySelector(`#category-${newIndex}`)
    if (newItem) {
      newItem.checked = true
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'))
      newItem.parentElement.classList.add('active')
      renderTodos()
    }
    
    saveTodos()
  }
}

// 添加任务（修改现有函数）
function addTask() {
  const text = taskInput.value.trim()
  if (text) {
    const currentCategory = getCurrentCategory()
    if (!todoData.todos[currentCategory]) {
      todoData.todos[currentCategory] = []
    }
    todoData.todos[currentCategory].push({
      text,
      completed: false,
      createdAt: new Date().toISOString()
    })
    taskInput.value = ''
    renderTodos()
    // 只更新当前分类的任务计数，不重新渲染整个分类列表
    updateCategoryCount(currentCategory)
    saveTodos()
  }
}

// 新增辅助函数，只更新指定分类的计数
function updateCategoryCount(category) {
  const item = document.querySelector(`input[data-category="${category}"]`)
  if (item) {
    const label = item.nextElementSibling
    label.textContent = `${category} (${getTodoCount(category)})`
  }
}

// 获取分类的任务计数
function getTodoCount(category) {
  const todos = todoData.todos[category] || []
  const completed = todos.filter(t => t.completed).length
  return `${completed}/${todos.length}`
}

// 保存数据（修改现有函数）
function saveTodos() {
  ipcRenderer.invoke('save-todos', todoData)
}

// 初始化
init()

// 事件监听
addBtn.addEventListener('click', addTask)
addCategoryBtn.addEventListener('click', addCategory)
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask()
})
categoryInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addCategory()
})

// 任务操作事件委托
taskList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const index = Number(e.target.dataset.index)
    const currentCategory = getCurrentCategory()
    todoData.todos[currentCategory].splice(index, 1)
    renderTodos()
    updateCategoryCount(currentCategory)
    saveTodos()
  }
  
  if (e.target.classList.contains('task-checkbox')) {
    const index = Number(e.target.parentElement.querySelector('.delete-btn').dataset.index)
    const currentCategory = getCurrentCategory()
    todoData.todos[currentCategory][index].completed = e.target.checked
    renderTodos()
    updateCategoryCount(currentCategory)
    saveTodos()
  }
})

// 在init函数后添加
// 修改toggle事件处理
document.querySelector('.sidebar-toggle').addEventListener('click', function() {
  const sidebar = document.querySelector('.sidebar');
  const isCollapsed = sidebar.classList.contains('collapsed');
  
  sidebar.classList.toggle('collapsed');
  this.textContent = isCollapsed ? '◀' : '▶';
});