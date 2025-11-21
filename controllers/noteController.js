// noteController.js
const { Note } = require('../models');

// Get all active notes (filtered by logged-in user, excluding archived and trashed) with pagination
exports.getAllNotes = async (req, res) => {
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

    const { count, rows: notes } = await Note.findAndCountAll({
      where: { 
        userId,
        isArchived: false,
        isTrash: false
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({ 
      success: true, 
      data: notes,
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
    console.error('Error fetching notes:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get archived notes with pagination
exports.getArchivedNotes = async (req, res) => {
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

    const { count, rows: notes } = await Note.findAndCountAll({
      where: { 
        userId,
        isArchived: true,
        isTrash: false
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({ 
      success: true, 
      data: notes,
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
    console.error('Error fetching archived notes:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get trashed notes with pagination
exports.getTrashedNotes = async (req, res) => {
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

    const { count, rows: notes } = await Note.findAndCountAll({
      where: { 
        userId,
        isTrash: true
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({ 
      success: true, 
      data: notes,
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
    console.error('Error fetching trashed notes:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get pinned notes with pagination
exports.getPinnedNotes = async (req, res) => {
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

    const { count, rows: notes } = await Note.findAndCountAll({
      where: { 
        userId,
        isPinned: true,
        isArchived: false,
        isTrash: false
      },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limitNum,
      offset: offset
    });

    return res.status(200).json({ 
      success: true, 
      data: notes,
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
    console.error('Error fetching pinned notes:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single note (ensure it belongs to logged-in user)
exports.getNoteById = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error fetching note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, isPinned = false } = req.body;
    const userId = req.user.user_id;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const note = await Note.create({ 
      title, 
      content, 
      userId,
      isArchived: false,
      isTrash: false,
      isPinned
    });
    return res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update note (only if it belongs to the logged-in user)
exports.updateNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update(req.body);
    return res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Archive note
exports.archiveNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update({ isArchived: true, isPinned: false });
    return res.status(200).json({ success: true, message: 'Note archived successfully', data: note });
  } catch (error) {
    console.error('Error archiving note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Unarchive note
exports.unarchiveNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update({ isArchived: false });
    return res.status(200).json({ success: true, message: 'Note unarchived successfully', data: note });
  } catch (error) {
    console.error('Error unarchiving note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Move note to trash
exports.trashNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update({ isTrash: true, isPinned: false, isArchived: false });
    return res.status(200).json({ success: true, message: 'Note moved to trash successfully', data: note });
  } catch (error) {
    console.error('Error trashing note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Restore note from trash
exports.restoreNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update({ isTrash: false });
    return res.status(200).json({ success: true, message: 'Note restored successfully', data: note });
  } catch (error) {
    console.error('Error restoring note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle pin status
exports.togglePinNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.update({ isPinned: !note.isPinned });
    return res.status(200).json({ 
      success: true, 
      message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`, 
      data: note 
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete note permanently (only if it belongs to the logged-in user)
exports.deleteNote = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const note = await Note.findOne({ where: { id: req.params.id, userId } });

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    await note.destroy();
    return res.status(200).json({ success: true, message: 'Note deleted permanently' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};