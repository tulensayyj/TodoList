// DOM元素引用
const taskInput = document.getElementById('task-input')
const addBtn = document.getElementById('add-btn')
const taskList = document.getElementById('task-list')

// 添加任务函数
function addTask() {
  const taskText = taskInput.value.trim()
  if (taskText) {
    const taskItem = document.createElement('li')
    taskItem.className = 'task-item'
    taskItem.innerHTML = `
      <span>${taskText}</span>
      <button class="delete-btn">❌</button>
    `
    taskList.appendChild(taskItem)
    taskInput.value = ''
    
    // 绑定删除事件
    taskItem.querySelector('.delete-btn').addEventListener('click', () => {
      taskItem.remove()
    })
  }
}

// 事件监听
addBtn.addEventListener('click', addTask)
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask()
})
