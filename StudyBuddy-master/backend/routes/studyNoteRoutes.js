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

        // Update user progress
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'profile.progress.createdNotes': 1,
                'profile.progress.totalStudyTime': 15, // Assume 15 minutes per note
                'profile.completedTasks.notesThisWeek': 1,
                'profile.completedTasks.studyTimeThisWeek': 15
            },
            $set: {
                'profile.lastActiveDate': new Date()
            },
            $push: {
                'history.notes': {
                    contentId: note._id,
                    title: note.title,
                    topic: note.topic,
                    subject: note.subject,
                    content: note.content,
                    generatedAt: new Date(),
                    difficulty: note.difficulty
                }
            }
        });

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

        // Create a focused prompt for reliable note generation with structured format
        const prompt = `Create complete study notes for "${topic}" in ${selectedSubject}.

For ${difficulty} learners, provide a clear and structured response using markdown formatting:

# ${topic} (${selectedSubject})

## Overview
Brief introduction and importance (2-3 sentences).

## Key Concepts
- **Core definition**: [definition here]
- **Essential terms**: 4-6 key terms with brief explanations
- **Fundamental principles**: Main principles explained

## Detailed Explanation
Break down into 2-4 logical sections with step-by-step explanations and examples.

### Section 1: [First major concept]
[Step-by-step explanation with examples]

### Section 2: [Second major concept]
[Step-by-step explanation with examples]

## Practical Examples
${difficulty === 'beginner' ? '3-4' : difficulty === 'intermediate' ? '4-5' : '5-6'} real-world examples with clear explanations.

## Practice Exercises
${difficulty === 'beginner' ? '3-4' : difficulty === 'intermediate' ? '4-5' : '5-6'} practice problems/questions with detailed solutions.

## Key Takeaways
- [Main point 1]
- [Main point 2]
- [Main point 3]

## Additional Resources
Here are some recommended resources to deepen your understanding:

### 📚 Related Topics to Explore
- **Topic 1**: Brief description of why this related topic is important
- **Topic 2**: Brief description of why this related topic is important
- **Topic 3**: Brief description of why this related topic is important

### 🔍 Further Reading
- **Book/Article 1**: "Title of recommended book or article" - Brief explanation of its relevance
- **Book/Article 2**: "Title of recommended book or article" - Brief explanation of its relevance

### 🌐 Online Resources
- **Website/Resource 1**: Brief description and why it's helpful
- **Website/Resource 2**: Brief description and why it's helpful

Use proper markdown formatting with headings, bold text for emphasis, bullet points, numbered lists, and code blocks where appropriate. Make it educational and easy to follow for students.`;

        // Generate notes using AI with increased max tokens
        const aiResponse = await generateAIResponse(prompt, [], {}, [], { maxTokens: 4000 });

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
