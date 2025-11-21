// routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const {
  createNoteValidator,
  updateNoteValidator,
  noteIdValidator,
} = require('../utils/noteValidators');

// Get routes with pagination
router.get('/', noteController.getAllNotes);
router.get('/archived', noteController.getArchivedNotes);
router.get('/trashed', noteController.getTrashedNotes);
router.get('/pinned', noteController.getPinnedNotes);
router.get('/:id', noteIdValidator, noteController.getNoteById);

// Action routes
router.post('/', createNoteValidator, noteController.createNote);
router.put('/:id', updateNoteValidator, noteController.updateNote);
router.put('/:id/archive', noteIdValidator, noteController.archiveNote);
router.put('/:id/unarchive', noteIdValidator, noteController.unarchiveNote);
router.put('/:id/trash', noteIdValidator, noteController.trashNote);
router.put('/:id/restore', noteIdValidator, noteController.restoreNote);
router.put('/:id/toggle-pin', noteIdValidator, noteController.togglePinNote);
router.delete('/:id', noteIdValidator, noteController.deleteNote);

module.exports = router;