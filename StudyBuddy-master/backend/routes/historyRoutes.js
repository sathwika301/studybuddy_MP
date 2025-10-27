const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    saveHistory,
    getHistory,
    deleteHistoryItem,
    getAllHistory
} = require('../controllers/historyController');

// Save history item
router.post('/', protect, saveHistory);

// Get all history
router.get('/', protect, getAllHistory);

// Get history by type
router.get('/:type', protect, getHistory);

// Delete history item
router.delete('/:type/:id', protect, deleteHistoryItem);

module.exports = router;
