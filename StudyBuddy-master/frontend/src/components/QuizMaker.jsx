import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Trash2, Save, Play, Sparkles, Loader2, Eye, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import QuizList from './QuizList';

const QuizMaker = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [timeLimit, setTimeLimit] = useState(0);
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [questions, setQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showList, setShowList] = useState(false);

    const subjects = [
        'Accounting', 'Actuarial Science', 'Agriculture', 'Algorithms', 'Anatomy', 'Anthropology', 'Archaeology', 'Architecture', 'Art', 'Artificial Intelligence', 'Assembly Language', 'Astronomy', 'Bash/Shell Scripting', 'Biochemistry', 'Biology', 'Biomedical Engineering', 'Blockchain', 'Business Studies', 'C', 'C#', 'C++', 'Calculus', 'Chemical Engineering', 'Chemistry', 'Civil Engineering', 'Cloud Computing', 'Communication', 'Compiler Design', 'Computer Engineering', 'Computer Graphics', 'Computer Networks', 'Computer Science', 'Constitutional Law', 'Control Systems', 'Corporate Law', 'Creative Writing', 'Criminal Justice', 'Cultural Studies', 'Cybersecurity', 'Dance', 'Data Science', 'Data Structures', 'Database Management Systems', 'Dentistry', 'DevOps', 'Dietetics', 'Discrete Mathematics', 'Ecology', 'Economics', 'Education', 'Electrical Engineering', 'Electromagnetism', 'English', 'Entrepreneurship', 'Environmental Law', 'Environmental Science', 'Ethics', 'Fashion Design', 'Film Studies', 'Finance', 'Fine Arts', 'Fisheries', 'Forestry', 'Game Development', 'Gender Studies', 'Genetics', 'Geography', 'Geology', 'Go', 'Graphic Design', 'Haskell', 'Health Education', 'Hindi', 'History', 'Hospitality Management', 'HTML/CSS', 'Human Resources', 'Human Rights Law', 'Human-Computer Interaction', 'Industrial Engineering', 'Information Systems', 'Inorganic Chemistry', 'International Business', 'International Law', 'Internet of Things (IoT)', 'Java', 'JavaScript', 'Journalism', 'Kotlin', 'Law', 'Library Science', 'Linguistics', 'Linear Algebra', 'Literature', 'Logic', 'Lua', 'Machine Learning', 'Management', 'Marketing', 'Materials Science', 'Mathematics', 'MATLAB', 'Mechanical Engineering', 'Media Studies', 'Medicine', 'Meteorology', 'Microbiology', 'Mobile Development', 'Music', 'Nanotechnology', 'Nursing', 'Nutrition', 'Oceanography', 'Operations Management', 'Operating Systems', 'Organic Chemistry', 'Pathology', 'Perl', 'Pharmacology', 'Philosophy', 'Photography', 'Physical Chemistry', 'Physical Education', 'Physics', 'Physiology', 'Political Science', 'Probability', 'Programming Languages', 'Project Management', 'Psychology', 'Public Administration', 'Public Health', 'Public Relations', 'Python', 'Quality Assurance', 'Quantum Physics', 'R', 'Religious Studies', 'Research Methods', 'Robotics', 'Ruby', 'Rust', 'Scala', 'Social Work', 'Sociology', 'Software Engineering', 'Software Testing', 'Spanish', 'Sports Science', 'SQL', 'Statistics', 'Supply Chain Management', 'Swift', 'Teaching', 'Theater', 'Theory of Computation', 'Thermodynamics', 'Tourism', 'TypeScript', 'Urban Planning', 'Veterinary Science', 'Web Development'
    ];

    // Automatically suggest subject based on topic
    useEffect(() => {
        if (topic.trim()) {
            const lowerTopic = topic.toLowerCase();
            let suggestedSubject = '';

            // STEM subjects
            if (lowerTopic.includes('algebra') || lowerTopic.includes('calculus') || lowerTopic.includes('geometry') || lowerTopic.includes('equation') || lowerTopic.includes('math')) {
                suggestedSubject = 'Mathematics';
            } else if (lowerTopic.includes('statistics') || lowerTopic.includes('probability') || lowerTopic.includes('data analysis')) {
                suggestedSubject = 'Statistics';
            } else if (lowerTopic.includes('data science') || lowerTopic.includes('big data') || lowerTopic.includes('analytics')) {
                suggestedSubject = 'Data Science';
            } else if (lowerTopic.includes('machine learning') || lowerTopic.includes('neural network') || lowerTopic.includes('deep learning')) {
                suggestedSubject = 'Machine Learning';
            } else if (lowerTopic.includes('artificial intelligence') || lowerTopic.includes('ai') || lowerTopic.includes('robotics')) {
                suggestedSubject = 'Artificial Intelligence';
            } else if (lowerTopic.includes('force') || lowerTopic.includes('energy') || lowerTopic.includes('quantum') || lowerTopic.includes('physics') || lowerTopic.includes('thermodynamics') || lowerTopic.includes('electromagnetism')) {
                suggestedSubject = 'Physics';
            } else if (lowerTopic.includes('chemical') || lowerTopic.includes('reaction') || lowerTopic.includes('molecule') || lowerTopic.includes('chemistry') || lowerTopic.includes('organic') || lowerTopic.includes('inorganic')) {
                suggestedSubject = 'Chemistry';
            } else if (lowerTopic.includes('cell') || lowerTopic.includes('dna') || lowerTopic.includes('biology') || lowerTopic.includes('organism') || lowerTopic.includes('genetics') || lowerTopic.includes('microbiology')) {
                suggestedSubject = 'Biology';
            } else if (lowerTopic.includes('programming') || lowerTopic.includes('algorithm') || lowerTopic.includes('computer') || lowerTopic.includes('code')) {
                suggestedSubject = 'Computer Science';
            } else if (lowerTopic.includes('sorting') || lowerTopic.includes('searching') || lowerTopic.includes('graph') || lowerTopic.includes('tree')) {
                suggestedSubject = 'Algorithms';
            } else if (lowerTopic.includes('array') || lowerTopic.includes('linked list') || lowerTopic.includes('stack') || lowerTopic.includes('queue')) {
                suggestedSubject = 'Data Structures';
            } else if (lowerTopic.includes('operating system') || lowerTopic.includes('process') || lowerTopic.includes('thread') || lowerTopic.includes('memory')) {
                suggestedSubject = 'Operating Systems';
            } else if (lowerTopic.includes('database') || lowerTopic.includes('sql') || lowerTopic.includes('relational') || lowerTopic.includes('query')) {
                suggestedSubject = 'Database Management Systems';
            } else if (lowerTopic.includes('network') || lowerTopic.includes('tcp') || lowerTopic.includes('ip') || lowerTopic.includes('protocol')) {
                suggestedSubject = 'Computer Networks';
            } else if (lowerTopic.includes('software engineering') || lowerTopic.includes('design pattern') || lowerTopic.includes('agile') || lowerTopic.includes('testing')) {
                suggestedSubject = 'Software Engineering';
            } else if (lowerTopic.includes('automata') || lowerTopic.includes('computability') || lowerTopic.includes('complexity') || lowerTopic.includes('turing')) {
                suggestedSubject = 'Theory of Computation';
            } else if (lowerTopic.includes('javascript') || lowerTopic.includes('python') || lowerTopic.includes('java') || lowerTopic.includes('language')) {
                suggestedSubject = 'Programming Languages';
            } else if (lowerTopic.includes('web') || lowerTopic.includes('html') || lowerTopic.includes('css') || lowerTopic.includes('react')) {
                suggestedSubject = 'Web Development';
            } else if (lowerTopic.includes('discrete') || lowerTopic.includes('combinatorics') || lowerTopic.includes('graph theory') || lowerTopic.includes('logic')) {
                suggestedSubject = 'Discrete Mathematics';
            } else if (lowerTopic.includes('geology') || lowerTopic.includes('earth') || lowerTopic.includes('rocks')) {
                suggestedSubject = 'Geology';
            } else if (lowerTopic.includes('astronomy') || lowerTopic.includes('stars') || lowerTopic.includes('galaxy')) {
                suggestedSubject = 'Astronomy';
            } else if (lowerTopic.includes('environmental') || lowerTopic.includes('ecology') || lowerTopic.includes('sustainability')) {
                suggestedSubject = 'Environmental Science';
            } else if (lowerTopic.includes('biotechnology') || lowerTopic.includes('biotech')) {
                suggestedSubject = 'Biotechnology';
            }

            // Engineering subjects
            else if (lowerTopic.includes('mechanical engineering') || lowerTopic.includes('mechanics') || lowerTopic.includes('thermodynamics')) {
                suggestedSubject = 'Mechanical Engineering';
            } else if (lowerTopic.includes('electrical engineering') || lowerTopic.includes('circuits') || lowerTopic.includes('electronics')) {
                suggestedSubject = 'Electrical Engineering';
            } else if (lowerTopic.includes('civil engineering') || lowerTopic.includes('structures') || lowerTopic.includes('construction')) {
                suggestedSubject = 'Civil Engineering';
            } else if (lowerTopic.includes('chemical engineering') || lowerTopic.includes('process engineering')) {
                suggestedSubject = 'Chemical Engineering';
            } else if (lowerTopic.includes('aerospace engineering') || lowerTopic.includes('aerodynamics') || lowerTopic.includes('aviation')) {
                suggestedSubject = 'Aerospace Engineering';
            } else if (lowerTopic.includes('biomedical engineering') || lowerTopic.includes('medical devices')) {
                suggestedSubject = 'Biomedical Engineering';
            } else if (lowerTopic.includes('computer engineering') || lowerTopic.includes('hardware')) {
                suggestedSubject = 'Computer Engineering';
            } else if (lowerTopic.includes('information technology') || lowerTopic.includes('it') || lowerTopic.includes('cybersecurity')) {
                suggestedSubject = 'Information Technology';
            } else if (lowerTopic.includes('materials science') || lowerTopic.includes('materials')) {
                suggestedSubject = 'Materials Science';
            } else if (lowerTopic.includes('nanotechnology') || lowerTopic.includes('nano')) {
                suggestedSubject = 'Nanotechnology';
            } else if (lowerTopic.includes('control systems') || lowerTopic.includes('automation')) {
                suggestedSubject = 'Control Systems';
            }

            // Humanities and Arts
            else if (lowerTopic.includes('war') || lowerTopic.includes('civilization') || lowerTopic.includes('history') || lowerTopic.includes('empire')) {
                suggestedSubject = 'History';
            } else if (lowerTopic.includes('map') || lowerTopic.includes('continent') || lowerTopic.includes('geography') || lowerTopic.includes('climate')) {
                suggestedSubject = 'Geography';
            } else if (lowerTopic.includes('poem') || lowerTopic.includes('novel') || lowerTopic.includes('literature') || lowerTopic.includes('author')) {
                suggestedSubject = 'Literature';
            } else if (lowerTopic.includes('philosophy') || lowerTopic.includes('ethics') || lowerTopic.includes('logic')) {
                suggestedSubject = 'Philosophy';
            } else if (lowerTopic.includes('art') || lowerTopic.includes('painting') || lowerTopic.includes('sculpture')) {
                suggestedSubject = 'Art';
            } else if (lowerTopic.includes('music') || lowerTopic.includes('note') || lowerTopic.includes('melody')) {
                suggestedSubject = 'Music';
            } else if (lowerTopic.includes('theater') || lowerTopic.includes('drama') || lowerTopic.includes('acting')) {
                suggestedSubject = 'Theater';
            } else if (lowerTopic.includes('film') || lowerTopic.includes('cinema') || lowerTopic.includes('movie')) {
                suggestedSubject = 'Film Studies';
            } else if (lowerTopic.includes('graphic design') || lowerTopic.includes('design')) {
                suggestedSubject = 'Graphic Design';
            } else if (lowerTopic.includes('architecture') || lowerTopic.includes('building design')) {
                suggestedSubject = 'Architecture';
            } else if (lowerTopic.includes('english') || lowerTopic.includes('grammar') || lowerTopic.includes('writing')) {
                suggestedSubject = 'English';
            } else if (lowerTopic.includes('spanish') || lowerTopic.includes('french') || lowerTopic.includes('german') || lowerTopic.includes('language')) {
                if (lowerTopic.includes('spanish')) suggestedSubject = 'Spanish';
                else if (lowerTopic.includes('french')) suggestedSubject = 'French';
                else if (lowerTopic.includes('german')) suggestedSubject = 'German';
                else suggestedSubject = 'Programming Languages'; // fallback for generic language
            }

            // Social Sciences
            else if (lowerTopic.includes('market') || lowerTopic.includes('economy') || lowerTopic.includes('finance') || lowerTopic.includes('economics')) {
                suggestedSubject = 'Economics';
            } else if (lowerTopic.includes('business') || lowerTopic.includes('management') || lowerTopic.includes('marketing')) {
                suggestedSubject = 'Business Studies';
            } else if (lowerTopic.includes('mind') || lowerTopic.includes('behavior') || lowerTopic.includes('psychology') || lowerTopic.includes('cognitive')) {
                suggestedSubject = 'Psychology';
            } else if (lowerTopic.includes('society') || lowerTopic.includes('social') || lowerTopic.includes('sociology') || lowerTopic.includes('culture')) {
                suggestedSubject = 'Sociology';
            } else if (lowerTopic.includes('political') || lowerTopic.includes('government') || lowerTopic.includes('politics')) {
                suggestedSubject = 'Political Science';
            } else if (lowerTopic.includes('anthropology') || lowerTopic.includes('culture') || lowerTopic.includes('ethnography')) {
                suggestedSubject = 'Anthropology';
            } else if (lowerTopic.includes('criminology') || lowerTopic.includes('crime') || lowerTopic.includes('criminal justice')) {
                suggestedSubject = 'Criminology';
            } else if (lowerTopic.includes('international relations') || lowerTopic.includes('diplomacy')) {
                suggestedSubject = 'International Relations';
            } else if (lowerTopic.includes('public administration') || lowerTopic.includes('policy')) {
                suggestedSubject = 'Public Administration';
            } else if (lowerTopic.includes('social work') || lowerTopic.includes('welfare')) {
                suggestedSubject = 'Social Work';
            } else if (lowerTopic.includes('urban planning') || lowerTopic.includes('city planning')) {
                suggestedSubject = 'Urban Planning';
            } else if (lowerTopic.includes('demography') || lowerTopic.includes('population')) {
                suggestedSubject = 'Demography';
            }

            // Professional and Applied
            else if (lowerTopic.includes('medicine') || lowerTopic.includes('medical') || lowerTopic.includes('health')) {
                suggestedSubject = 'Medicine';
            } else if (lowerTopic.includes('nursing') || lowerTopic.includes('patient care')) {
                suggestedSubject = 'Nursing';
            } else if (lowerTopic.includes('pharmacy') || lowerTopic.includes('drugs') || lowerTopic.includes('pharmacology')) {
                suggestedSubject = 'Pharmacy';
            } else if (lowerTopic.includes('dentistry') || lowerTopic.includes('dental')) {
                suggestedSubject = 'Dentistry';
            } else if (lowerTopic.includes('veterinary') || lowerTopic.includes('animals')) {
                suggestedSubject = 'Veterinary Science';
            } else if (lowerTopic.includes('law') || lowerTopic.includes('legal') || lowerTopic.includes('court')) {
                suggestedSubject = 'Law';
            } else if (lowerTopic.includes('accounting') || lowerTopic.includes('audit') || lowerTopic.includes('financial statements')) {
                suggestedSubject = 'Accounting';
            } else if (lowerTopic.includes('finance') || lowerTopic.includes('investment') || lowerTopic.includes('banking')) {
                suggestedSubject = 'Finance';
            } else if (lowerTopic.includes('human resources') || lowerTopic.includes('hr') || lowerTopic.includes('personnel')) {
                suggestedSubject = 'Human Resources';
            } else if (lowerTopic.includes('education') || lowerTopic.includes('teaching') || lowerTopic.includes('pedagogy')) {
                suggestedSubject = 'Education';
            } else if (lowerTopic.includes('journalism') || lowerTopic.includes('news') || lowerTopic.includes('reporting')) {
                suggestedSubject = 'Journalism';
            } else if (lowerTopic.includes('communication') || lowerTopic.includes('media') || lowerTopic.includes('public speaking')) {
                suggestedSubject = 'Communication';
            } else if (lowerTopic.includes('hospitality') || lowerTopic.includes('hotel') || lowerTopic.includes('tourism')) {
                suggestedSubject = 'Hospitality Management';
            } else if (lowerTopic.includes('sports science') || lowerTopic.includes('exercise') || lowerTopic.includes('fitness')) {
                suggestedSubject = 'Sports Science';
            } else if (lowerTopic.includes('nutrition') || lowerTopic.includes('diet') || lowerTopic.includes('food science')) {
                suggestedSubject = 'Nutrition';
            } else if (lowerTopic.includes('agriculture') || lowerTopic.includes('farming') || lowerTopic.includes('crops')) {
                suggestedSubject = 'Agriculture';
            } else if (lowerTopic.includes('forestry') || lowerTopic.includes('forest') || lowerTopic.includes('wood')) {
                suggestedSubject = 'Forestry';
            } else if (lowerTopic.includes('fisheries') || lowerTopic.includes('fish') || lowerTopic.includes('aquaculture')) {
                suggestedSubject = 'Fisheries';
            }

            // Other
            else if (lowerTopic.includes('critical thinking') || lowerTopic.includes('reasoning')) {
                suggestedSubject = 'Critical Thinking';
            } else if (lowerTopic.includes('research methods') || lowerTopic.includes('methodology')) {
                suggestedSubject = 'Research Methods';
            } else if (lowerTopic.includes('project management') || lowerTopic.includes('project planning')) {
                suggestedSubject = 'Project Management';
            } else if (lowerTopic.includes('quality assurance') || lowerTopic.includes('qa') || lowerTopic.includes('quality control')) {
                suggestedSubject = 'Quality Assurance';
            } else if (lowerTopic.includes('supply chain') || lowerTopic.includes('logistics')) {
                suggestedSubject = 'Supply Chain Management';
            }

            if (suggestedSubject) {
                setSubject(suggestedSubject);
            }
        }
    }, [topic]);

    const addQuestion = () => {
        setQuestions([...questions, {
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: '',
            explanation: '',
            points: 1
        }]);
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const generateQuiz = async () => {
        if (!title.trim() || !subject || questions.length === 0) {
            setError('Please fill in title, subject, and add at least one question');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    subject,
                    difficulty,
                    timeLimit,
                    questions: questions.map(q => {
                        const questionData = {
                            question: q.question,
                            type: q.type,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            points: q.points
                        };
                        if (q.type === 'multiple-choice') {
                            questionData.options = q.options;
                        }
                        return questionData;
                    }),
                    settings: {
                        randomizeQuestions: true,
                        randomizeOptions: true,
                        showCorrectAnswers: true,
                        allowRetakes: true,
                        passingScore: 70
                    }
                })
            });

            if (response.ok) {
                setSuccess('Quiz created successfully!');
                setTitle('');
                setDescription('');
                setSubject('');
                setQuestions([]);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                setError(`Failed to create quiz: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            setError('Failed to create quiz');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAIQuiz = async () => {
        if (!title.trim() || !subject || !topic.trim()) {
            setError('Please enter a title, select a subject, and enter a topic');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:5000/api/quizzes/generate-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    subject,
                    topic,
                    numQuestions,
                    questionType,
                    difficulty
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Transform backend questions to frontend format
                    const formattedQuestions = data.questions.map(q => ({
                        question: q.question,
                        type: q.type,
                        options: q.type === 'multiple-choice' ? q.options.map(opt => opt.text) : q.type === 'true-false' ? ['True', 'False'] : [],
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        points: q.points
                    }));

                    setQuestions(formattedQuestions);
                    setSuccess(`${numQuestions} AI-generated questions added!`);
                } else {
                    setError(data.error || 'Failed to generate questions');
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                setError(`Failed to generate questions: ${errorData.message || response.statusText}`);
            }
        } catch (err) {
            setError('Failed to generate AI questions. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Quiz Maker
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Create custom quizzes or let AI generate questions for you
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Quiz Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter quiz title"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Search or select subject"
                                list="subjects-list"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <datalist id="subjects-list">
                                <option value="" />
                                {subjects.map(subj => (
                                    <option key={subj} value={subj} />
                                ))}
                            </datalist>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter specific topic"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Number of Questions
                            </label>
                            <input
                                type="number"
                                value={numQuestions}
                                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                max="20"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Time Limit (minutes)
                            </label>
                            <input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0"
                                placeholder="0 for no limit"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question Type
                            </label>
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="multiple-choice">Multiple Choice</option>
                                <option value="true-false">True/False</option>
                                <option value="short-answer">Short Answer</option>
                                <option value="essay">Essay</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of the quiz"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-4 mb-4">
                        <button
                            onClick={generateAIQuiz}
                            disabled={isGenerating || !title.trim() || !subject || !topic.trim()}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Generate AI Questions
                        </button>
                        <button
                            onClick={() => {
                                const previewQuiz = {
                                    title: title || 'Untitled Quiz',
                                    description: description || '',
                                    subject: subject || '',
                                    questions: questions,
                                    timeLimit: timeLimit,
                                    difficulty: difficulty
                                };
                                navigate('/quiz-environment', { state: { quiz: previewQuiz } });
                            }}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview Quiz Environment
                        </button>
                    </div>

                    <button
                        onClick={generateQuiz}
                        disabled={isGenerating || !title.trim() || !subject || questions.length === 0}
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                                Creating Quiz...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 inline mr-2" />
                                Create Quiz
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <p className="text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                        <p className="text-green-700 dark:text-green-400">{success}</p>
                    </div>
                )}

                {questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Question {qIndex + 1}
                            </h3>
                            <button
                                onClick={() => removeQuestion(qIndex)}
                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={question.question}
                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                    placeholder="Enter your question"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Type
                                </label>
                                <select
                                    value={question.type}
                                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="multiple-choice">Multiple Choice</option>
                                    <option value="true-false">True/False</option>
                                    <option value="short-answer">Short Answer</option>
                                    <option value="essay">Essay</option>
                                </select>
                            </div>

                            {question.type === 'multiple-choice' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Options
                                    </label>
                                    {question.options.map((option, oIndex) => (
                                        <input
                                            key={oIndex}
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            placeholder={`Option ${oIndex + 1}`}
                                            className="w-full px-4 py-2 mb-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        />
                                    ))}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Correct Answer
                                </label>
                                <input
                                    type="text"
                                    value={question.correctAnswer}
                                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                    placeholder="Enter correct answer"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Explanation (Optional)
                                </label>
                                <textarea
                                    value={question.explanation}
                                    onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                    placeholder="Explain why this is the correct answer"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Points
                                </label>
                                <input
                                    type="number"
                                    value={question.points}
                                    onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                                    min="1"
                                    className="w-20 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizMaker;
