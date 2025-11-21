const { body, param, validationResult } = require('express-validator');

// Shared validation handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ✅ Create Task Validator
const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('todoId')
    .notEmpty()
    .withMessage('Todo ID is required')
    .isUUID()
    .withMessage('Todo ID must be a valid UUID'),

  handleValidation,
];

// ✅ Update Task Validator
const updateTaskValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid Task ID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string'),

  body('isCompleted')
    .optional()
    .isBoolean()
    .withMessage('isCompleted must be a boolean'),

  handleValidation,
];

// ✅ Get/Delete Task Validator (for :id param)
const taskIdValidator = [
  param('id').isUUID().withMessage('Invalid Task ID'),
  handleValidation,
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
};
