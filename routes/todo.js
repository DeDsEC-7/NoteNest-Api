// routes/todoRoutes.js
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { 
  createTodoValidator, 
  updateTodoValidator, 
  todoIdValidator 
} = require('../utils/todoValidators');

// Get routes with pagination
router.get('/', todoController.getAllTodos);
router.get('/archived', todoController.getArchivedTodos);
router.get('/trashed', todoController.getTrashedTodos);
router.get('/pinned', todoController.getPinnedTodos);
router.get('/:id', todoIdValidator, todoController.getTodoById);

// Action routes
router.post('/', createTodoValidator, todoController.createTodo);
router.put('/:id', updateTodoValidator, todoController.updateTodo);
router.put('/:id/archive', todoIdValidator, todoController.archiveTodo);
router.put('/:id/unarchive', todoIdValidator, todoController.unarchiveTodo);
router.put('/:id/trash', todoIdValidator, todoController.trashTodo);
router.put('/:id/restore', todoIdValidator, todoController.restoreTodo);
router.put('/:id/toggle-pin', todoIdValidator, todoController.togglePinTodo);
router.delete('/:id', todoIdValidator, todoController.deleteTodo);

module.exports = router;