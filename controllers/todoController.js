// todoController.js
const { Todo, Task } = require('../models');

/**
 * Get all active todos for the authenticated user (excluding archived and trashed) with pagination
 */
exports.getAllTodos = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: todos } = await Todo.findAndCountAll({
      where: { 
        userId,
        isArchived: false,
        isTrash: false
      },
      include: [{ model: Task, as: 'tasks' }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      data: todos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        hasNext: pageNum < Math.ceil(count / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get archived todos with pagination
 */
exports.getArchivedTodos = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: todos } = await Todo.findAndCountAll({
      where: { 
        userId,
        isArchived: true,
        isTrash: false
      },
      include: [{ model: Task, as: 'tasks' }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      data: todos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        hasNext: pageNum < Math.ceil(count / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching archived todos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get trashed todos with pagination
 */
exports.getTrashedTodos = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: todos } = await Todo.findAndCountAll({
      where: { 
        userId,
        isTrash: true
      },
      include: [{ model: Task, as: 'tasks' }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      data: todos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        hasNext: pageNum < Math.ceil(count / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching trashed todos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get pinned todos with pagination
 */
exports.getPinnedTodos = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'DESC' 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: todos } = await Todo.findAndCountAll({
      where: { 
        userId,
        isPinned: true,
        isArchived: false,
        isTrash: false
      },
      include: [{ model: Task, as: 'tasks' }],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    res.status(200).json({ 
      success: true, 
      data: todos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        hasNext: pageNum < Math.ceil(count / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching pinned todos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get a single todo by ID (authenticated user only)
 */
exports.getTodoById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({
      where: { id: req.params.id, userId },
      include: [{ model: Task, as: 'tasks' }],
    });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Create a new todo
 */
exports.createTodo = async (req, res) => {
  try {
    const { title, due_date, tasks, isPinned = false } = req.body;
    const userId = req.user.user_id;

    if (!title)
      return res.status(400).json({ success: false, message: 'Title is required' });

    const todo = await Todo.create({ 
      title, 
      userId, 
      due_date,
      isArchived: false,
      isTrash: false,
      isPinned
    });

    // Create tasks if provided
    if (Array.isArray(tasks) && tasks.length > 0) {
      const taskData = tasks.map(task => ({
        todoId: todo.id,
        title: task.title,
        isCompleted: task.isCompleted || false,
      }));
      await Task.bulkCreate(taskData);
    }

    const todoWithTasks = await Todo.findByPk(todo.id, {
      include: [{ model: Task, as: 'tasks' }],
    });

    res.status(201).json({ success: true, data: todoWithTasks });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update a todo (authenticated user only)
 */
exports.updateTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update(req.body);
    res.status(200).json({ success: true, data: todo });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Archive todo
 */
exports.archiveTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update({ isArchived: true, isPinned: false });
    res.status(200).json({ success: true, message: 'Todo archived successfully', data: todo });
  } catch (error) {
    console.error('Error archiving todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Unarchive todo
 */
exports.unarchiveTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update({ isArchived: false });
    res.status(200).json({ success: true, message: 'Todo unarchived successfully', data: todo });
  } catch (error) {
    console.error('Error unarchiving todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Move todo to trash
 */
exports.trashTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update({ isTrash: true, isPinned: false, isArchived: false });
    res.status(200).json({ success: true, message: 'Todo moved to trash successfully', data: todo });
  } catch (error) {
    console.error('Error trashing todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Restore todo from trash
 */
exports.restoreTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update({ isTrash: false });
    res.status(200).json({ success: true, message: 'Todo restored successfully', data: todo });
  } catch (error) {
    console.error('Error restoring todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Toggle pin status
 */
exports.togglePinTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.update({ isPinned: !todo.isPinned });
    res.status(200).json({ 
      success: true, 
      message: `Todo ${todo.isPinned ? 'pinned' : 'unpinned'} successfully`, 
      data: todo 
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Delete a todo and its tasks (authenticated user only)
 */
exports.deleteTodo = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const todo = await Todo.findOne({ where: { id: req.params.id, userId } });

    if (!todo)
      return res.status(404).json({ success: false, message: 'Todo not found' });

    await todo.destroy(); // tasks will cascade-delete
    res.status(200).json({ success: true, message: 'Todo deleted permanently' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};