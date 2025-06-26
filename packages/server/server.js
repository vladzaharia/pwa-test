const express = require('express')
const cors = require('cors')
const path = require('path')

const app = express()

// Environment configuration
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const CORS_ORIGIN = process.env.CORS_ORIGIN || FRONTEND_URL

// Log startup info
console.log(`🚀 PWA Demo Server starting in ${NODE_ENV} mode`)
console.log(`🌐 CORS_ORIGIN: ${CORS_ORIGIN}`)
console.log(`📂 FRONTEND_URL: ${FRONTEND_URL}`)

// Middleware
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Serve static files from frontend build (in production)
if (NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(frontendPath))
  console.log(`📁 Serving static files from: ${frontendPath}`)
}

// In-memory storage for todos
let todos = [
  { id: 1, title: 'Learn about PWAs', completed: false },
  { id: 2, title: 'Test offline functionality', completed: false },
  { id: 3, title: 'Install the PWA', completed: true },
  { id: 4, title: 'Share the app with friends', completed: false },
  { id: 5, title: 'Explore background sync', completed: false },
]

let nextId = 6

// Routes

// GET /api/todos - Get all todos
app.get('/api/todos', (req, res) => {
  // Simulate network delay
  setTimeout(() => {
    res.json(todos)
  }, 500)
})

// POST /api/todos - Create a new todo
app.post('/api/todos', (req, res) => {
  const { title } = req.body

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' })
  }

  const newTodo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  }

  todos.unshift(newTodo)

  // Simulate network delay
  setTimeout(() => {
    res.status(201).json(newTodo)
  }, 300)
})

// PUT /api/todos/:id - Update a todo
app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { title, completed } = req.body

  const todoIndex = todos.findIndex((todo) => todo.id === id)

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  if (title !== undefined) {
    todos[todoIndex].title = title.trim()
  }

  if (completed !== undefined) {
    todos[todoIndex].completed = completed
  }

  // Simulate network delay
  setTimeout(() => {
    res.json(todos[todoIndex])
  }, 300)
})

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const todoIndex = todos.findIndex((todo) => todo.id === id)

  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' })
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0]

  // Simulate network delay
  setTimeout(() => {
    res.json(deletedTodo)
  }, 300)
})

// DELETE /api/todos - Clear all todos
app.delete('/api/todos', (req, res) => {
  todos = []
  nextId = 1

  // Simulate network delay
  setTimeout(() => {
    res.json({ message: 'All todos cleared' })
  }, 300)
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    todos: todos.length,
  })
})

// Catch-all handler for SPA routing (must be last)
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found' })
    } else {
      const frontendPath = path.join(__dirname, '../frontend/dist')
      res.sendFile(path.join(frontendPath, 'index.html'))
    }
  })
}

app.listen(PORT, () => {
  console.log(`🚀 PWA Demo Server running on port ${PORT}`)
  console.log(`📋 API available at http://localhost:${PORT}/api/todos`)
  console.log(`🌐 Frontend available at http://localhost:${PORT}`)
  console.log(`💾 Todos in memory: ${todos.length}`)
})

module.exports = app
