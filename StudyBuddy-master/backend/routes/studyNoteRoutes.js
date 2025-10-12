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

        const subjects = [
            'Algorithms', 'Art', 'Biology', 'Business Studies', 'Chemistry', 'Computer Networks',
            'Computer Science', 'Data Structures', 'Database Management Systems', 'Discrete Mathematics',
            'Economics', 'English', 'Environmental Science', 'Geography', 'History', 'Literature',
            'Mathematics', 'Music', 'Operating Systems', 'Philosophy', 'Physics', 'Political Science',
            'Programming Languages', 'Psychology', 'Sociology', 'Software Engineering', 'Theory of Computation',
            'Web Development'
        ];

        let selectedSubject = subject;

        // Auto-select subject if not provided
        if (!selectedSubject) {
            const classificationPrompt = `Classify the following topic into one of these subjects: ${subjects.join(', ')}. Topic: "${topic}". Respond with only the subject name that best fits. If it doesn't fit any, respond with "General".`;

            const classificationResponse = await generateAIResponse(classificationPrompt, [], {}, []);

            if (classificationResponse.message) {
                const classified = classificationResponse.message.trim();
                selectedSubject = subjects.includes(classified) ? classified : 'General';
            } else {
                selectedSubject = 'General';
            }
        }

        // Create a focused prompt for reliable note generation with structured format
        const prompt = `Create complete study notes for "${topic}" in ${selectedSubject}.

For ${difficulty} learners, provide a clear and structured response:

**${topic} (${selectedSubject})**

**Overview**
Brief introduction and importance (2-3 sentences).

**Key Concepts**
- Core definition
- 4-6 essential terms with brief explanations
- Fundamental principles

**Detailed Explanation**
Break down into 2-4 logical sections with step-by-step explanations and examples.

**Practical Examples**
3-4 real-world examples with clear explanations.

**Practice Exercises**
${difficulty === 'beginner' ? '3-4' : difficulty === 'intermediate' ? '4-5' : '5-6'} practice problems/questions with detailed solutions.

**Key Takeaways**
Summary of main points in bullet form.

**Additional Resources**
Suggest 2-3 related topics or further reading.

Format with clear headings, bullet points, and numbered lists where appropriate. Ensure explanations are comprehensive yet concise. Use markdown for formatting.`;

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
                subject: selectedSubject,
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
