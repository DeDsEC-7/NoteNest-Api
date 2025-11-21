// homeController.js
const { Note, Todo, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get paginated todos and notes with pinned items
 */
exports.getHomeData = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      page = 1, 
      limit = 10, 
      type = 'all', // 'notes', 'todos', or 'all'
      keyword 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get pinned items
    const pinnedNotes = await Note.findAll({
      where: { 
        userId,
        isPinned: true,
        isArchived: false,
        isTrash: false
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    const pinnedTodos = await Todo.findAll({
      where: { 
        userId,
        isPinned: true,
        isArchived: false,
        isTrash: false
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // Build search condition if keyword is provided
    let searchCondition = {};
    if (keyword) {
      searchCondition = {
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } }
          // Only search by title for todos since they don't have content field
        ]
      };
    }

    let notes = [];
    let todos = [];
    let totalNotes = 0;
    let totalTodos = 0;

    // Fetch notes if requested
    if (type === 'all' || type === 'notes') {
      const noteWhere = {
        userId,
        isArchived: false,
        isTrash: false,
        ...(keyword ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${keyword}%` } },
            { content: { [Op.iLike]: `%${keyword}%` } }
          ]
        } : {})
      };

      totalNotes = await Note.count({ where: noteWhere });
      
      notes = await Note.findAll({
        where: noteWhere,
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset
      });
    }

    // Fetch todos if requested
    if (type === 'all' || type === 'todos') {
      const todoWhere = {
        userId,
        isArchived: false,
        isTrash: false,
        ...(keyword ? {
          title: { [Op.iLike]: `%${keyword}%` }
        } : {})
      };

      totalTodos = await Todo.count({ where: todoWhere });
      
      todos = await Todo.findAll({
        where: todoWhere,
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset
      });
    }

    const response = {
      success: true,
      data: {
        pinned: {
          notes: pinnedNotes,
          todos: pinnedTodos
        },
        items: {
          notes,
          todos
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalNotes: type === 'all' || type === 'notes' ? totalNotes : undefined,
          totalTodos: type === 'all' || type === 'todos' ? totalTodos : undefined,
          totalPages: {
            notes: type === 'all' || type === 'notes' ? Math.ceil(totalNotes / limitNum) : undefined,
            todos: type === 'all' || type === 'todos' ? Math.ceil(totalTodos / limitNum) : undefined
          }
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching home data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching home data' 
    });
  }
};

/**
 * Search across notes and todos with advanced filtering
 */
exports.searchItems = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      keyword, 
      type = 'all', // 'notes', 'todos', or 'all'
      category = 'all', // 'pinned', 'archived', 'trash', 'active', 'all'
      page = 1, 
      limit = 20 
    } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is required'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build base where condition
    const baseWhere = { userId };
    
    // Add category filter
    switch (category) {
      case 'pinned':
        baseWhere.isPinned = true;
        baseWhere.isArchived = false;
        baseWhere.isTrash = false;
        break;
      case 'archived':
        baseWhere.isArchived = true;
        baseWhere.isTrash = false;
        break;
      case 'trash':
        baseWhere.isTrash = true;
        break;
      case 'active':
        baseWhere.isArchived = false;
        baseWhere.isTrash = false;
        break;
      default:
        // 'all' - no additional filters
        break;
    }

    let notes = [];
    let todos = [];
    let totalNotes = 0;
    let totalTodos = 0;

    // Search notes (search by title AND content)
    if (type === 'all' || type === 'notes') {
      const noteWhere = {
        ...baseWhere,
        [Op.or]: [
          { title: { [Op.iLike]: `%${keyword}%` } },
          { content: { [Op.iLike]: `%${keyword}%` } }
        ]
      };

      totalNotes = await Note.count({ where: noteWhere });
      
      notes = await Note.findAll({
        where: noteWhere,
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset
      });
    }

    // Search todos (search by title ONLY - todos don't have content field)
    if (type === 'all' || type === 'todos') {
      const todoWhere = {
        ...baseWhere,
        title: { [Op.iLike]: `%${keyword}%` }
      };

      totalTodos = await Todo.count({ where: todoWhere });
      
      todos = await Todo.findAll({
        where: todoWhere,
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset: offset
      });
    }

    const totalItems = (type === 'all' || type === 'notes' ? totalNotes : 0) + 
                      (type === 'all' || type === 'todos' ? totalTodos : 0);

    const response = {
      success: true,
      data: {
        notes,
        todos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
          totalNotes,
          totalTodos
        },
        search: {
          keyword,
          type,
          category
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error searching items:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while searching' 
    });
  }
};

/**
 * Get only pinned items (notes and todos)
 */
exports.getPinnedItems = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [pinnedNotes, pinnedTodos] = await Promise.all([
      Note.findAll({
        where: { 
          userId,
          isPinned: true,
          isArchived: false,
          isTrash: false
        },
        order: [['created_at', 'DESC']]
      }),
      Todo.findAll({
        where: { 
          userId,
          isPinned: true,
          isArchived: false,
          isTrash: false
        },
        order: [['created_at', 'DESC']]
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notes: pinnedNotes,
        todos: pinnedTodos
      }
    });
  } catch (error) {
    console.error('Error fetching pinned items:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching pinned items' 
    });
  }
};