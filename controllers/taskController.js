const { Task, Todo } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Create a new task
 */
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { title, todoId } = req.body;
    const userId = req.user.user_id;

    const todo = await Todo.findOne({ where: { id: todoId, userId } });
    if (!todo)
      return res.status(404).json({ message: 'Todo not found or unauthorized' });

    const task = await Task.create({ title, todoId });
    res.status(201).json({ success: true, message: 'Task created', task });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all tasks (optionally filtered by todo)
 */
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { todoId } = req.query;

    const where = todoId ? { todoId } : {};
    const tasks = await Task.findAll({
      include: {
        model: Todo,
        as: 'todo',
        where: { userId },
        attributes: ['id', 'title'],
      },
      where,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get a single task
 */
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const task = await Task.findOne({
      where: { id },
      include: {
        model: Todo,
        as: 'todo',
        where: { userId },
        attributes: ['id', 'title'],
      },
    });

    if (!task)
      return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update a task
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isCompleted } = req.body;
    const userId = req.user.user_id;

    const task = await Task.findOne({
      where: { id },
      include: { model: Todo, as: 'todo', where: { userId } },
    });

    if (!task)
      return res.status(404).json({ message: 'Task not found' });

    await task.update({ title, isCompleted });
    res.status(200).json({ success: true, message: 'Task updated', task });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete a task
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const task = await Task.findOne({
      where: { id },
      include: { model: Todo, as: 'todo', where: { userId } },
    });

    if (!task)
      return res.status(404).json({ message: 'Task not found' });

    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
