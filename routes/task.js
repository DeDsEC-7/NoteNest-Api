const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { createTaskValidator, updateTaskValidator, taskIdValidator } = require('../utils/taskValidators');

router.get('/', taskController.getTasks);
router.get('/:id', taskIdValidator, taskController.getTask);
router.post('/', createTaskValidator, taskController.createTask);
router.put('/:id', updateTaskValidator, taskController.updateTask);
router.delete('/:id', taskIdValidator, taskController.deleteTask);

module.exports = router;
