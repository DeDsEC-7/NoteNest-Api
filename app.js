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
const allowedOrigins = [  // FIXED: Changed from allowedOrigals
  'http://localhost:5173',
  'https://note-nest-client.vercel.app',
  'https://notenest-api-cgul.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {  // FIXED: Changed from allowedOrigals
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// Public Routes
app.use('/api/auth', authRoutes);

// Health check with database connection test
app.get('/health', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    res.json({ 
      success: true, 
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      message: error.message 
    });
  }
});

// Protected Routes
app.use('/api/notes', authenticate, noteRoutes);
app.use('/api/todos', authenticate, todoRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/api/home', authenticate, homeRoutes);

// Root endpoints
app.get('/', (req, res) => res.json({ 
  success: true, 
  message: 'NoteNest API Server is running',
  documentation: '/api-docs'
}));

app.get('/api', (req, res) => res.json({ 
  success: true, 
  message: 'NoteNest API is active',
  version: '1.0.0'
}));

// 404 handler
app.use('*', (req, res) => res.status(404).json({ 
  success: false, 
  error: 'Route not found',
  path: req.originalUrl 
}));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  
  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      success: false, 
      error: 'CORS Error',
      message: err.message 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

module.exports = app;