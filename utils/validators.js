const { body, validationResult } = require('express-validator');

// Central validation handler
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// Registration validation
const registerValidator = [
  body('firstname').trim().notEmpty().withMessage('First Name is required'),
  body('lastname').trim().notEmpty().withMessage('Last Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  validateRequest
];

// Login validation
const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

// Profile update validation
const updateProfileValidator = [
  body('firstname').optional().trim().notEmpty().withMessage('First Name cannot be empty'),
  body('lastname').optional().trim().notEmpty().withMessage('Last Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  validateRequest
];

// Change password validation
const changePasswordValidator = [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  validateRequest
];

// AutoSave toggle validation
const autosaveValidator = [
  body('autosave').isBoolean().withMessage('AutoSave must be true or false'),
  validateRequest
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  autosaveValidator
};
