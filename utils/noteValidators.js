// validators/noteValidator.js
const { body, param, validationResult } = require('express-validator');

// Shared validation error handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// Create Note Validator
const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),

 

  handleValidation,
];

// Update Note Validator
const updateNoteValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid note ID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string'),

  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),

  body('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be boolean'),

  body('isTrash')
    .optional()
    .isBoolean()
    .withMessage('isTrash must be boolean'),

  handleValidation,
];

// Get/Delete Note Validator (for :id param)
const noteIdValidator = [
  param('id').isUUID().withMessage('Invalid note ID'),
  handleValidation,
];

module.exports = {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
};
