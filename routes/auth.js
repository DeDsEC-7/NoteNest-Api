const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth'); // JWT middleware
const {
  register,
  login,
  updateProfile,
  changePassword,
  setAutoSave,
  deleteAccount
} = require('../controllers/authController');

const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
  autosaveValidator,
  
} = require('../utils/validators');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.put('/profile', authenticate, updateProfileValidator, updateProfile);
router.put('/password', authenticate, changePasswordValidator, changePassword);
router.put('/autosave', authenticate, autosaveValidator, setAutoSave);
router.delete('/delete', authenticate, deleteAccount);

module.exports = router;
