const User = require('../models/User');

// Save history item
const saveHistory = async (req, res) => {
    try {
        const { type, contentId, title, topic, subject, content, questionsCount, cardsCount, difficulty } = req.body;

        if (!type || !['notes', 'quizzes', 'flashcards'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid history type' });
        }

        const historyItem = {
            contentId,
            title,
            topic,
            subject,
            generatedAt: new Date(),
            difficulty
        };

        // Add type-specific fields
        if (type === 'notes') {
            historyItem.content = content;
        } else if (type === 'quizzes') {
            historyItem.questionsCount = questionsCount;
        } else if (type === 'flashcards') {
            historyItem.cardsCount = cardsCount;
        }

        // Add to user's history array
        const updatePath = `history.${type}`;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { [updatePath]: historyItem } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, message: 'History item saved successfully' });
    } catch (error) {
        console.error('Save history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get history by type
const getHistory = async (req, res) => {
    try {
        const { type } = req.params;

        if (!['notes', 'quizzes', 'flashcards'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid history type' });
        }

        const user = await User.findById(req.user._id).select(`history.${type}`);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const history = user.history[type] || [];
        // Sort by generatedAt descending (most recent first)
        history.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

        res.json({ success: true, history });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete history item
const deleteHistoryItem = async (req, res) => {
    try {
        const { type, id } = req.params;

        if (!['notes', 'quizzes', 'flashcards'].includes(type)) {
            return res.status(400).json({ success: false, error: 'Invalid history type' });
        }

        const updatePath = `history.${type}`;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { [updatePath]: { _id: id } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, message: 'History item deleted successfully' });
    } catch (error) {
        console.error('Delete history item error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get all history
const getAllHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('history');

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const allHistory = {
            notes: user.history.notes || [],
            quizzes: user.history.quizzes || [],
            flashcards: user.history.flashcards || []
        };

        // Sort each history array by generatedAt descending
        Object.keys(allHistory).forEach(type => {
            allHistory[type].sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
        });

        res.json({ success: true, history: allHistory });
    } catch (error) {
        console.error('Get all history error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    saveHistory,
    getHistory,
    deleteHistoryItem,
    getAllHistory
};
