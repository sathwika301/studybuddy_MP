const Quiz = require('../models/Quiz');
const { generateAIResponse } = require('../config/aiConfig');

// Generate AI-powered quiz questions
const generateAIQuiz = async (req, res) => {
    try {
        const { subject, topic, numQuestions = 5, questionType = 'mixed', difficulty = 'medium' } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'Topic is required'
            });
        }

        const subjects = [
            'Accounting', 'Actuarial Science', 'Aerospace Engineering', 'Agriculture', 'Algorithms', 'Anatomy', 'Anthropology', 'Archaeology', 'Art', 'Artificial Intelligence', 'Assembly Language', 'Astronomy', 'Bash/Shell Scripting', 'Biochemistry', 'Biology', 'Biomedical Engineering', 'Blockchain', 'Business Studies', 'C', 'C#', 'C++', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Cloud Computing', 'Computer Engineering', 'Computer Graphics', 'Computer Networks', 'Computer Science', 'Constitutional Law', 'Corporate Law', 'Creative Writing', 'Criminal Justice', 'Cultural Studies', 'Cybersecurity', 'Dance', 'Data Science', 'Data Structures', 'Database Management Systems', 'Dentistry', 'DevOps', 'Dietetics', 'Discrete Mathematics', 'Ecology', 'Economics', 'Education', 'Electrical Engineering', 'English', 'Entrepreneurship', 'Environmental Law', 'Environmental Science', 'Ethics', 'Fashion Design', 'Film Studies', 'Finance', 'Fine Arts', 'Forestry', 'Game Development', 'Gender Studies', 'Genetics', 'Geography', 'Geology', 'Go', 'Graphic Design', 'Haskell', 'Health Education', 'History', 'Hospitality Management', 'HTML/CSS', 'Human Resources', 'Human Rights Law', 'Human-Computer Interaction', 'Industrial Engineering', 'Information Systems', 'Inorganic Chemistry', 'International Business', 'International Law', 'Internet of Things (IoT)', 'Java', 'JavaScript', 'Journalism', 'Kotlin', 'Law', 'Library Science', 'Linguistics', 'Literature', 'Lua', 'Machine Learning', 'Management', 'Marketing', 'Materials Science', 'Mathematics', 'MATLAB', 'Mechanical Engineering', 'Media Studies', 'Medicine', 'Meteorology', 'Microbiology', 'Mobile Development', 'Music', 'Nursing', 'Nutrition', 'Oceanography', 'Operations Management', 'Operating Systems', 'Organic Chemistry', 'Pathology', 'Perl', 'Pharmacology', 'Philosophy', 'Photography', 'Physical Chemistry', 'Physical Education', 'Physics', 'Physiology', 'Political Science', 'Programming Languages', 'Psychology', 'Public Health', 'Public Relations', 'Python', 'Quantum Physics', 'R', 'Religious Studies', 'Ruby', 'Rust', 'Scala', 'Sociology', 'Software Engineering', 'Software Testing', 'Sports Science', 'SQL', 'Statistics', 'Supply Chain Management', 'Swift', 'Theater', 'Theory of Computation', 'Thermodynamics', 'Tourism', 'TypeScript', 'Urban Planning', 'Veterinary Science', 'Web Development'
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

        // Create a comprehensive prompt for question generation based on selected type
        let typeInstructions = '';
        if (questionType === 'multiple-choice') {
            typeInstructions = `All questions must be Multiple Choice with exactly 4 options, one correct answer.`;
        } else if (questionType === 'true-false') {
            typeInstructions = `All questions must be True/False with options ["True", "False"] and correctAnswer as "True" or "False".`;
        } else if (questionType === 'short-answer') {
            typeInstructions = `All questions must be Short Answer requiring a brief written response (no options).`;
        } else if (questionType === 'essay') {
            typeInstructions = `All questions must be Essay requiring detailed written responses (no options).`;
        }

        const prompt = `Generate ${numQuestions} quiz questions about "${topic}" in the subject "${subject}".

Requirements:
- Create questions that are natural, engaging, and topic-relevant
- Avoid repetitive patterns or fixed structures (no "What is the definition of...", "What are the characteristics of...", etc.)
- ${typeInstructions}
- Vary difficulty levels: some easy, some moderate, some challenging
- Make questions engaging and relevant to real-world applications
- Adapt questions to the actual content and context of the topic

Difficulty Variation:
- Easy: Basic recall and recognition
- Medium: Understanding and application
- Hard: Analysis, evaluation, and synthesis

Format each question as JSON with this structure:
{
    "question": "The question text",
    "type": "${questionType}",
    "options": ${questionType === 'multiple-choice' ? '["option1", "option2", "option3", "option4"]' : '[] // only for multiple-choice'},
    "correctAnswer": "The correct answer text",
    "explanation": "Brief explanation of why this is correct",
    "points": 1-5, // based on difficulty
    "difficulty": "easy|medium|hard"
}

Return only a valid JSON array of questions, no additional text.`;

        // Generate questions using AI
        const aiResponse = await generateAIResponse(prompt, [], {}, [], {
            maxTokens: 3000,
            temperature: 0.8 // Higher creativity for varied questions
        });

        if (aiResponse.metadata.error) {
            return res.status(500).json({
                success: false,
                error: 'AI service unavailable',
                fallback: generateFallbackQuestions(subject, topic, numQuestions, questionType, difficulty)
            });
        }

        // Parse AI response as JSON
        let questions;
        try {
            // Extract JSON from response (AI might add extra text)
            const jsonMatch = aiResponse.message.match(/\[[\s\S]*\]/);
            questions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse.message);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Fallback to basic questions if parsing fails
            questions = generateFallbackQuestions(subject, topic, numQuestions, questionType, difficulty);
        }

        // Validate and format questions to match schema
        const formattedQuestions = questions.map(q => {
            let formattedQuestion = {
                question: q.question,
                type: q.type || questionType,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                points: 1, // Assign 1 mark for each question
                timeLimit: 60
            };

            // Handle options based on question type
            if (q.type === 'multiple-choice') {
                formattedQuestion.options = q.options.map(opt => ({ text: opt, isCorrect: false }));
                // Set correct option for multiple choice
                const correctIndex = formattedQuestion.options.findIndex(opt => opt.text === q.correctAnswer);
                if (correctIndex !== -1) {
                    formattedQuestion.options[correctIndex].isCorrect = true;
                }
            } else if (q.type === 'true-false') {
                formattedQuestion.options = [
                    { text: 'True', isCorrect: q.correctAnswer === 'True' },
                    { text: 'False', isCorrect: q.correctAnswer === 'False' }
                ];
            } else {
                // short-answer and essay don't have options
                formattedQuestion.options = [];
            }

            return formattedQuestion;
        });

        res.json({
            success: true,
            questions: formattedQuestions,
            metadata: {
                aiGenerated: true,
                model: aiResponse.metadata.model,
                processingTime: aiResponse.metadata.processingTime,
                confidence: aiResponse.metadata.confidence
            }
        });

    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: generateFallbackQuestions(req.body.subject, req.body.topic, req.body.numQuestions, req.body.questionType, req.body.difficulty)
        });
    }
};

// Fallback function for when AI is unavailable
function generateFallbackQuestions(subject, topic, numQuestions = 5, questionType = 'mixed', difficulty = 'medium') {
    const questions = [];

    // Filter templates based on questionType
    let availableTemplates = [];
    if (questionType === 'multiple-choice') {
        availableTemplates = [
            {
                question: `Which of the following best describes ${topic} in ${subject}?`,
                type: 'multiple-choice',
                options: ['A basic concept', 'An advanced theory', 'A practical application', 'A historical development'],
                correctAnswer: 'A basic concept',
                explanation: `${topic} is fundamental to ${subject}.`,
                points: 1
            }
        ];
    } else if (questionType === 'true-false') {
        availableTemplates = [
            {
                question: `True or False: ${topic} is an important concept in ${subject}.`,
                type: 'true-false',
                correctAnswer: 'True',
                explanation: `${topic} plays a significant role in understanding ${subject}.`,
                points: 1
            }
        ];
    } else if (questionType === 'short-answer') {
        availableTemplates = [
            {
                question: `How does ${topic} relate to broader concepts in ${subject}?`,
                type: 'short-answer',
                correctAnswer: 'It connects through fundamental principles and applications',
                explanation: `${topic} builds upon core ${subject} concepts.`,
                points: 1
            },
            {
                question: `What practical applications does ${topic} have in ${subject}?`,
                type: 'short-answer',
                correctAnswer: 'Various real-world applications depending on context',
                explanation: `${topic} has numerous practical uses in ${subject}.`,
                points: 1
            }
        ];
    } else if (questionType === 'essay') {
        availableTemplates = [
            {
                question: `Discuss the significance of ${topic} in ${subject} and provide examples.`,
                type: 'essay',
                correctAnswer: 'Detailed explanation covering key concepts and examples',
                explanation: `${topic} has significant implications in ${subject}.`,
                points: 1
            }
        ];
    } else {
        // mixed type - use all templates
        availableTemplates = [
            {
                question: `How does ${topic} relate to broader concepts in ${subject}?`,
                type: 'short-answer',
                correctAnswer: 'It connects through fundamental principles and applications',
                explanation: `${topic} builds upon core ${subject} concepts.`,
                points: 1
            },
            {
                question: `True or False: ${topic} is an important concept in ${subject}.`,
                type: 'true-false',
                correctAnswer: 'True',
                explanation: `${topic} plays a significant role in understanding ${subject}.`,
                points: 1
            },
            {
                question: `Which of the following best describes ${topic} in ${subject}?`,
                type: 'multiple-choice',
                options: ['A basic concept', 'An advanced theory', 'A practical application', 'A historical development'],
                correctAnswer: 'A basic concept',
                explanation: `${topic} is fundamental to ${subject}.`,
                points: 1
            }
        ];
    }

    for (let i = 0; i < numQuestions; i++) {
        const template = availableTemplates[i % availableTemplates.length];
        questions.push({
            question: template.question,
            type: template.type,
            options: template.type === 'multiple-choice' ? template.options.map(opt => ({ text: opt, isCorrect: opt === template.correctAnswer })) : [],
            correctAnswer: template.correctAnswer,
            explanation: template.explanation,
            points: template.points,
            timeLimit: 60
        });
    }

    return questions;
}

module.exports = {
    generateAIQuiz
};
