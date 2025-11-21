// routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const { authenticate } = require('../middlewares/auth');

// All home routes are protected
router.get('/dashboard', authenticate, homeController.getHomeData);
router.get('/search', authenticate, homeController.searchItems);
router.get('/pinned', authenticate, homeController.getPinnedItems);

module.exports = router;