const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const { protect } = require('../middleware/auth');
const { generateAIResponse } = require('../config/aiConfig');

// Get all flashcards
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty, search } = req.query;
        const query = { author: req.user._id };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'cards.front': { $regex: search, $options: 'i' } },
                { 'cards.back': { $regex: search, $options: 'i' } }
            ];
        }

        const flashcards = await Flashcard.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Flashcard.countDocuments(query);

        res.json({
            success: true,
            flashcards,
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

// Get single flashcard
router.get('/:id', protect, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOne({ _id: req.params.id, author: req.user._id })
            .populate('author', 'name email');

        if (!flashcard) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }

        res.json({ success: true, flashcard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get flashcard history
router.get('/:id/history', protect, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOne({ _id: req.params.id, author: req.user._id });

        if (!flashcard) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }

        res.json({ success: true, history: flashcard.history || [] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new flashcard
router.post('/', protect, async (req, res) => {
    try {
        const flashcard = new Flashcard({
            ...req.body,
            author: req.user._id
        });

        await flashcard.save();

        // Update user progress
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'profile.progress.createdFlashcards': 1,
                'profile.progress.totalStudyTime': 10 // Assume 10 minutes per flashcard set
            }
        });

        res.status(201).json({ success: true, flashcard });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update flashcard
router.put('/:id', protect, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOneAndUpdate(
            { _id: req.params.id, author: req.user._id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!flashcard) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }
        
        res.json({ success: true, flashcard });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete flashcard
router.delete('/:id', protect, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOneAndDelete({ _id: req.params.id, author: req.user._id });
        
        if (!flashcard) {
            return res.status(404).json({ success: false, error: 'Flashcard not found' });
        }
        
        res.json({ success: true, message: 'Flashcard deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get public flashcards
router.get('/public', async (req, res) => {
    try {
        const { page = 1, limit = 10, subject, difficulty, search } = req.query;
        const query = { isPublic: true };
        
        if (subject) query.subject = subject;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { 'cards.front': { $regex: search, $options: 'i' } },
                { 'cards.back': { $regex: search, $options: 'i' } }
            ];
        }

        const flashcards = await Flashcard.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Flashcard.countDocuments(query);

        res.json({
            success: true,
            flashcards,
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

// Generate AI flashcards
router.post('/generate', protect, async (req, res) => {
    try {
        const { topic, subject, difficulty = 'intermediate', numCards = 5 } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: 'Topic is required' });
        }

        const subjects = [
            'Accounting', 'Actuarial Science', 'Agriculture', 'Algorithms', 'Anatomy', 'Anthropology', 'Archaeology', 'Architecture', 'Art', 'Artificial Intelligence', 'Assembly Language', 'Astronomy', 'Bash/Shell Scripting', 'Biochemistry', 'Biology', 'Biomedical Engineering', 'Blockchain', 'Business Studies', 'C', 'C#', 'C++', 'Calculus', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Cloud Computing', 'Communication', 'Compiler Design', 'Computer Engineering', 'Computer Graphics', 'Computer Networks', 'Computer Science', 'Constitutional Law', 'Control Systems', 'Corporate Law', 'Creative Writing', 'Criminal Justice', 'Cultural Studies', 'Cybersecurity', 'Dance', 'Data Science', 'Data Structures', 'Database Management Systems', 'Dentistry', 'DevOps', 'Dietetics', 'Discrete Mathematics', 'Ecology', 'Economics', 'Education', 'Electrical Engineering', 'Electromagnetism', 'English', 'Entrepreneurship', 'Environmental Law', 'Environmental Science', 'Ethics', 'Fashion Design', 'Film Studies', 'Finance', 'Fine Arts', 'Fisheries', 'Forestry', 'Game Development', 'Gender Studies', 'Genetics', 'Geography', 'Geology', 'Go', 'Graphic Design', 'Haskell', 'Health Education', 'Hindi', 'History', 'Hospitality Management', 'HTML/CSS', 'Human Resources', 'Human Rights Law', 'Human-Computer Interaction', 'Industrial Engineering', 'Information Systems', 'Inorganic Chemistry', 'International Business', 'International Law', 'Internet of Things (IoT)', 'Java', 'JavaScript', 'Journalism', 'Kotlin', 'Law', 'Library Science', 'Linguistics', 'Linear Algebra', 'Literature', 'Logic', 'Lua', 'Machine Learning', 'Management', 'Marketing', 'Materials Science', 'Mathematics', 'MATLAB', 'Mechanical Engineering', 'Media Studies', 'Medicine', 'Meteorology', 'Microbiology', 'Mobile Development', 'Music', 'Nanotechnology', 'Nursing', 'Nutrition', 'Oceanography', 'Operations Management', 'Operating Systems', 'Organic Chemistry', 'Pathology', 'Perl', 'Pharmacology', 'Philosophy', 'Photography', 'Physical Chemistry', 'Physical Education', 'Physics', 'Physiology', 'Political Science', 'Probability', 'Programming Languages', 'Project Management', 'Psychology', 'Public Administration', 'Public Health', 'Public Relations', 'Python', 'Quality Assurance', 'Quantum Physics', 'R', 'Religious Studies', 'Research Methods', 'Robotics', 'Ruby', 'Rust', 'Scala', 'Social Work', 'Sociology', 'Software Engineering', 'Software Testing', 'Spanish', 'Sports Science', 'SQL', 'Statistics', 'Supply Chain Management', 'Swift', 'Teaching', 'Theater', 'Theory of Computation', 'Thermodynamics', 'Tourism', 'TypeScript', 'Urban Planning', 'Veterinary Science', 'Web Development'
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

        // Create a focused prompt for diverse, natural flashcard generation
        const prompt = `Create ${numCards} diverse and natural flashcards for the topic "${topic}" in ${selectedSubject}.

Generate flashcards that reflect actual key points, facts, or concepts from the topic. Do NOT follow a fixed question pattern or template. Make each flashcard unique and context-aware.

Requirements:
- Create exactly ${numCards} flashcards
- Include different types: factual, conceptual, comparison-based, or example-based questions
- Keep questions and answers concise and learner-friendly
- Make them topic-relevant and realistic like real educational flashcards
- Vary the question formats naturally

Return the flashcards in this exact JSON format:
{
  "flashcards": [
    {
      "front": "Question text here",
      "back": "Answer text here",
      "hint": "Optional brief hint",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Ensure the questions are varied and don't repeat similar patterns. Focus on creating engaging, educational flashcards that would actually help students learn the topic effectively.`;

        // Generate flashcards using AI
        const aiResponse = await generateAIResponse(prompt, [], {}, [], { maxTokens: 3000 });

        if (!aiResponse.message) {
            return res.status(500).json({ success: false, error: 'Failed to generate flashcards' });
        }

        // Parse the AI response to extract flashcards
        let generatedCards = [];
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiResponse.message.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                generatedCards = parsed.flashcards || [];
            } else {
                // Fallback: try to parse the entire response as JSON
                const parsed = JSON.parse(aiResponse.message);
                generatedCards = parsed.flashcards || [];
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            return res.status(500).json({ success: false, error: 'Failed to parse generated flashcards' });
        }

        // Validate and ensure we have the right number of cards
        if (!Array.isArray(generatedCards) || generatedCards.length === 0) {
            return res.status(500).json({ success: false, error: 'No valid flashcards generated' });
        }

        // Ensure each card has required fields
        const validatedCards = generatedCards.slice(0, numCards).map((card, index) => ({
            front: card.front || `Question ${index + 1}`,
            back: card.back || 'Answer not available',
            hint: card.hint || '',
            difficulty: card.difficulty || 'medium',
            tags: Array.isArray(card.tags) ? card.tags : []
        }));

        res.json({
            success: true,
            flashcards: validatedCards,
            metadata: {
                topic,
                subject: selectedSubject,
                difficulty,
                numCards: validatedCards.length,
                generatedAt: new Date(),
                aiModel: aiResponse.metadata.model
            }
        });

    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate flashcards',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
