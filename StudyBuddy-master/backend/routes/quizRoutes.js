const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');
const { generateAIQuiz } = require('../controllers/quizController');

// Get public quizzes (must be defined before /:id routes)
router.get('/public', async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty, search } = req.query;
        const query = { isPublic: true };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const quizzes = await Quiz.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Quiz.countDocuments(query);

        res.json({
            success: true,
            quizzes,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all quizzes
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty, search } = req.query;
        const query = { author: req.user._id };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const quizzes = await Quiz.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Quiz.countDocuments(query);

        res.json({
            success: true,
            quizzes,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single quiz
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id })
            .populate('author', 'name email');

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.json({ success: true, quiz });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quiz history
router.get('/:id/history', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, author: req.user._id });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.json({ success: true, history: quiz.history || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new quiz
router.post('/', protect, async (req, res) => {
    try {
        const quiz = new Quiz({
            ...req.body,
            author: req.user._id
        });

        await quiz.save();

        // Update user progress
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'profile.progress.completedQuizzes': 1,
                'profile.progress.totalStudyTime': 20, // Assume 20 minutes per quiz
                'profile.completedTasks.quizzesThisWeek': 1,
                'profile.completedTasks.studyTimeThisWeek': 20
            },
            $set: {
                'profile.lastActiveDate': new Date()
            },
            $push: {
                'history.quizzes': {
                    contentId: quiz._id,
                    title: quiz.title,
                    topic: quiz.topic,
                    subject: quiz.subject,
                    questionsCount: quiz.questions.length,
                    generatedAt: new Date(),
                    difficulty: quiz.difficulty
                }
            }
        });

        res.status(201).json({ success: true, quiz });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update quiz
router.put('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }
        
        res.json({ success: true, quiz });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete quiz
router.delete('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, author: req.user._id });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate AI quiz questions
router.post('/generate-ai', protect, generateAIQuiz);

module.exports = router;
