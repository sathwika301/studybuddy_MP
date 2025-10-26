import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, Copy, Sparkles, Loader2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

const NotesGenerator = () => {
    const { user } = useAuth();
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [difficulty, setDifficulty] = useState('intermediate');
    const [generatedNotes, setGeneratedNotes] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [notesHistory, setNotesHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const subjects = [
        // Core Academic Subjects
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography',
        'Economics', 'Political Science', 'Sociology', 'Psychology', 'Philosophy', 'Literature',
        'Environmental Science', 'Art', 'Music', 'Physical Education', 'Health Education',

        // Computer Science and Programming
        'Computer Science', 'Programming Languages', 'Algorithms', 'Data Structures',
        'Database Management Systems', 'Operating Systems', 'Computer Networks',
        'Software Engineering', 'Web Development', 'Mobile Development', 'Cybersecurity',
        'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Cloud Computing',
        'Blockchain', 'Internet of Things (IoT)', 'Game Development', 'DevOps',
        'Discrete Mathematics', 'Theory of Computation', 'Compiler Design', 'Computer Graphics',
        'Human-Computer Interaction', 'Information Systems', 'Software Testing',

        // Programming Languages
        'Python', 'JavaScript', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin',
        'Go', 'Rust', 'TypeScript', 'R', 'MATLAB', 'Scala', 'Perl', 'Haskell', 'Lua',
        'Assembly Language', 'SQL', 'HTML/CSS', 'Bash/Shell Scripting',

        // Engineering
        'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering',
        'Chemical Engineering', 'Aerospace Engineering', 'Biomedical Engineering',
        'Computer Engineering', 'Industrial Engineering', 'Materials Science',

        // Business and Finance
        'Business Studies', 'Finance', 'Accounting', 'Marketing', 'Management',
        'Entrepreneurship', 'International Business', 'Supply Chain Management',
        'Human Resources', 'Operations Management',

        // Medicine and Health Sciences
        'Medicine', 'Nursing', 'Pharmacology', 'Anatomy', 'Physiology', 'Microbiology',
        'Pathology', 'Public Health', 'Dentistry', 'Veterinary Science',

        // Law and Legal Studies
        'Law', 'Criminal Justice', 'International Law', 'Constitutional Law',
        'Corporate Law', 'Environmental Law', 'Human Rights Law',

        // Social Sciences and Humanities
        'Anthropology', 'Archaeology', 'Linguistics', 'Religious Studies',
        'Ethics', 'Cultural Studies', 'Gender Studies', 'Media Studies',

        // Sciences
        'Astronomy', 'Geology', 'Oceanography', 'Meteorology', 'Ecology',
        'Genetics', 'Biochemistry', 'Organic Chemistry', 'Inorganic Chemistry',
        'Physical Chemistry', 'Quantum Physics', 'Thermodynamics',

        // Arts and Design
        'Fine Arts', 'Graphic Design', 'Fashion Design', 'Interior Design',
        'Photography', 'Film Studies', 'Theater', 'Dance', 'Creative Writing',

        // Other Specialized Fields
        'Agriculture', 'Forestry', 'Urban Planning', 'Education', 'Library Science',
        'Journalism', 'Public Relations', 'Tourism', 'Hospitality Management',
        'Sports Science', 'Nutrition', 'Dietetics', 'Statistics', 'Actuarial Science'
    ];

    // Use api utility for generating notes
    const generateNotes = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/study-notes/generate', {
                topic: topic.trim(),
                subject: subject || undefined,
                difficulty
            });

            const data = response.data;

            if (data.success && data.notes) {
                setGeneratedNotes(data.notes);
                // Auto-set the subject if it was not manually selected
                if (!subject && data.metadata && data.metadata.subject) {
                    setSubject(data.metadata.subject);
                }
                setSuccess('Notes generated successfully!');
            } else {
                setError(data.error || 'Failed to generate notes');
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to generate notes. Please try again.'
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // Use api utility for saving notes
    const saveNotes = async () => {
        if (!generatedNotes) return;

        try {
            const response = await api.post('/study-notes', {
                title: `Notes on ${topic}`,
                content: generatedNotes,
                subject: subject || 'General',
                topic: topic,
                type: 'note',
                aiGenerated: true
            });

            if (response.status === 201 || response.data.success) {
                setSuccess('Notes saved to your library!');
                // Reload notes history to include the newly saved note
                loadNotesHistory();
            } else {
                setError(response.data.error || 'Failed to save notes');
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to save notes'
            );
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedNotes);
        setSuccess('Copied to clipboard!');
    };

    const downloadNotes = () => {
        const blob = new Blob([generatedNotes], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic}-notes.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Load notes history
    const loadNotesHistory = async () => {
        if (!user) return;

        setIsLoadingHistory(true);
        try {
            const response = await api.get('/study-notes');
            if (response.data.success) {
                const historyItems = response.data.notes
                    .filter(note => note.aiGenerated) // Only show AI-generated notes
                    .map(note => ({
                        id: note._id,
                        title: note.title,
                        subject: note.subject,
                        topic: note.topic,
                        content: note.content,
                        generatedAt: new Date(note.createdAt),
                        difficulty: note.difficulty
                    }))
                    .sort((a, b) => b.generatedAt - a.generatedAt);
                setNotesHistory(historyItems);
            }
        } catch (err) {
            console.error('Failed to load notes history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Toggle history view
    const toggleHistory = () => {
        setShowHistory(!showHistory);
        if (!showHistory && notesHistory.length === 0) {
            loadNotesHistory();
        }
    };

    // Select a note from history
    const selectNote = (note) => {
        setSelectedNote(note);
        setGeneratedNotes(note.content);
        setTopic(note.topic);
        setSubject(note.subject);
        setDifficulty(note.difficulty);
        setSuccess('Note loaded from history!');
    };

    // Close selected note view
    const closeSelectedNote = () => {
        setSelectedNote(null);
        setGeneratedNotes('');
        setTopic('');
        setSubject('');
        setDifficulty('intermediate');
    };

    // Load history on component mount
    useEffect(() => {
        if (user) {
            loadNotesHistory();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        AI Notes Generator
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Generate comprehensive study notes on any topic with AI assistance
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Generate New Notes</h2>
                        <button
                            onClick={toggleHistory}
                            className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <History className="w-4 h-4 mr-2" />
                            {showHistory ? 'Hide History' : 'Show History'}
                            {showHistory ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter topic (e.g., Photosynthesis, Linear Algebra)"
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
                                Difficulty Level
                            </label>
                            <select
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={generateNotes}
                        disabled={isGenerating || !topic.trim()}
                        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                                Generating Notes...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 inline mr-2" />
                                Generate Notes
                            </>
                        )}
                    </button>
                </div>

                {showHistory && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes History</h3>
                        {isLoadingHistory ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading history...</span>
                            </div>
                        ) : notesHistory.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No notes history found.</p>
                        ) : (
                            <div className="space-y-4">
                                {notesHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() => selectNote(item)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.generatedAt.toLocaleDateString()} {item.generatedAt.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Subject: {item.subject} | Topic: {item.topic}
                                        </p>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                                            {item.content ? (
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ children }) => <h1 className="text-sm font-bold">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-sm font-bold">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-sm font-bold">{children}</h3>,
                                                        p: ({ children }) => <p className="text-sm">{children}</p>,
                                                        ul: ({ children }) => <ul className="text-sm ml-4">{children}</ul>,
                                                        ol: ({ children }) => <ol className="text-sm ml-4">{children}</ol>,
                                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                                    }}
                                                >
                                                    {item.content.substring(0, 300)}...
                                                </ReactMarkdown>
                                            ) : (
                                                'Content preview not available'
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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

                {generatedNotes && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Generated Notes
                            </h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={downloadNotes}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    title="Download as markdown"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={saveNotes}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Save to Library
                                </button>
                            </div>
                        </div>
                        
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => <h1 className="text-gray-900 dark:text-white" style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-gray-800 dark:text-gray-100" style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.4em 0' }}>{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-gray-700 dark:text-gray-200" style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0.3em 0' }}>{children}</h3>,
                                    p: ({ children }) => <p className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', lineHeight: '1.6' }}>{children}</p>,
                                    ul: ({ children }) => <ul className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>,
                                    ol: ({ children }) => <ol className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>,
                                    li: ({ children }) => <li className="text-gray-700 dark:text-gray-300" style={{ margin: '0.2em 0' }}>{children}</li>,
                                    strong: ({ children }) => <strong className="text-gray-900 dark:text-white font-bold">{children}</strong>,
                                    em: ({ children }) => <em className="text-gray-600 dark:text-gray-400 italic">{children}</em>,
                                    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-medium font-mono">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-4 rounded-lg overflow-auto my-2 border border-gray-200 dark:border-gray-700">{children}</pre>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-gray-600 dark:text-gray-400 italic pl-4 my-2">{children}</blockquote>,
                                }}
                            >
                                {generatedNotes}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesGenerator;
