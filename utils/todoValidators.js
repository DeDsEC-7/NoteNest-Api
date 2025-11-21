const { body, param, validationResult } = require('express-validator');

// Shared validation handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ✅ Create Todo Validator
const createTodoValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  handleValidation,
];

// ✅ Update Todo Validator
const updateTodoValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid Todo ID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),

  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean'),

  body('isTrash')
    .optional()
    .isBoolean()
    .withMessage('isTrash must be a boolean'),

  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  handleValidation,
];

// ✅ Get/Delete Todo Validator (for :id param)
const todoIdValidator = [
  param('id').isUUID().withMessage('Invalid Todo ID'),
  handleValidation,
];

module.exports = {
  createTodoValidator,
  updateTodoValidator,
  todoIdValidator,
};
