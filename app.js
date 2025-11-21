// app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/note');
const todoRoutes = require('./routes/todo');
const taskRoutes = require('./routes/task');
const homeRoutes = require('./routes/home');
const { authenticate } = require('./middlewares/auth');
const { swaggerDocument, swaggerUi, options } = require('./swagger');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

// Middleware
app.use(express.json());

// Swagger UI
// Swagger UI - Serve the documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));


// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/notes', authenticate, noteRoutes);
app.use('/api/todos', authenticate, todoRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/home', authenticate, homeRoutes);

// Health check
app.get('/', (req, res) => res.json({ success: true, message: 'Server is running' }));
app.get('/api', (req, res) => res.json({ success: true, message: 'API is active' }));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Something went wrong!' });
});

module.exports = app;