const express = require('express');
const router = express.Router();
const StudyNote = require('../models/StudyNote');
const { protect } = require('../middleware/auth');
const { generateAIResponse } = require('../config/aiConfig');

// Get public study notes (must be defined before /:id routes)
router.get('/public', async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, topic, search } = req.query;
        const query = { isPublic: true };
        
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const notes = await StudyNote.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudyNote.countDocuments(query);

        res.json({
            success: true,
            notes,
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

// Get all study notes
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, topic, type, search } = req.query;
        const query = { author: req.user._id };
        
        if (subject) query.subject = subject;
        if (topic) query.topic = topic;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const notes = await StudyNote.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await StudyNote.countDocuments(query);

        res.json({
            success: true,
            notes,
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

// Get single study note
router.get('/:id', protect, async (req, res) => {
    try {
        const note = await StudyNote.findOne({ _id: req.params.id, author: req.user._id })
            .populate('author', 'name email');
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        res.json({ success: true, note });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new study note
router.post('/', protect, async (req, res) => {
    try {
        const note = new StudyNote({
            ...req.body,
            author: req.user._id
        });
        
        await note.save();
        res.status(201).json({ success: true, note });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update study note
router.put('/:id', protect, async (req, res) => {
    try {
        const note = await StudyNote.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }
        
        res.json({ success: true, note });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete study note
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await StudyNote.findOneAndDelete({ _id: req.params.id, author: req.user._id });

        if (!note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        res.json({ success: true, message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate AI notes
router.post('/generate', protect, async (req, res) => {
    try {
        const { topic, subject, difficulty = 'intermediate' } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        // Create a focused prompt for reliable note generation
        const prompt = `Create complete study notes for "${topic}"${subject ? ` in ${subject}` : ''}.

For ${difficulty} learners, provide:

# ${topic}

## Overview
What it is and why it matters (2-3 sentences).

## Key Concepts
- Definition
- 4-5 important terms
- Main principles

## Explanation
Break into 2-3 main parts with clear explanations and examples.

## Examples
2-3 practical examples with explanations.

## Practice
${difficulty === 'beginner' ? '2-3' : difficulty === 'intermediate' ? '3-4' : '4-5'} practice problems with answers.

## Summary
Key points in bullets.

Keep complete but concise. No truncation.`;

        // Generate notes using AI
        const aiResponse = await generateAIResponse(prompt, [], {}, []);

        if (!aiResponse.message) {
            return res.status(500).json({ success: false, error: 'Failed to generate notes' });
        }

        res.json({
            success: true,
            notes: aiResponse.message,
            metadata: {
                topic,
                subject: subject || 'General',
                difficulty,
                generatedAt: new Date(),
                aiModel: aiResponse.metadata.model
            }
        });

    } catch (error) {
        console.error('Error generating notes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate notes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
