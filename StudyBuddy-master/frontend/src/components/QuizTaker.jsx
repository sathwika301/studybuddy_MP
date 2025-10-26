import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QuizTaker = ({ quiz, onBack }) => {
    const { user } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(quiz.settings?.timeLimit || 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [timeUp, setTimeUp] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setTimeUp(true);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = () => {
        let totalScore = 0;
        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            if (userAnswer === question.correctAnswer) {
                totalScore += question.points;
            }
        });
        setScore(totalScore);
        setIsSubmitted(true);
        setShowResults(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (showResults) {
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = Math.round((score / totalPoints) * 100);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Quiz Results
                            </h1>
                            <div className="text-6xl mb-4">
                                {percentage >= 70 ? (
                                    <CheckCircle className="text-green-500 mx-auto" />
                                ) : (
                                    <XCircle className="text-red-500 mx-auto" />
                                )}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                {quiz.title}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                                Score: {score} / {totalPoints} ({percentage}%)
                            </p>
                            {percentage >= quiz.settings?.passingScore || 70 ? (
                                <p className="text-green-600 font-semibold">Passed!</p>
                            ) : (
                                <p className="text-red-600 font-semibold">Failed - Try again!</p>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            {quiz.questions.map((question, index) => {
                                const userAnswer = answers[index];
                                const isCorrect = userAnswer === question.correctAnswer;
                                return (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            Question {index + 1}: {question.question}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Your answer: {userAnswer || 'Not answered'}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Correct answer: {question.correctAnswer}
                                        </p>
                                        {question.explanation && (
                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                Explanation: {question.explanation}
                                            </p>
                                        )}
                                        <div className="flex items-center mt-2">
                                            {isCorrect ? (
                                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                            )}
                                            <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                {isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={onBack}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 inline mr-2" />
                                Back to Quiz List
                            </button>
                            {quiz.settings?.allowRetakes && (
                                <button
                                    onClick={() => {
                                        setAnswers({});
                                        setCurrentQuestion(0);
                                        setTimeLeft(quiz.settings?.timeLimit || 0);
                                        setIsSubmitted(false);
                                        setShowResults(false);
                                        setTimeUp(false);
                                    }}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Retake Quiz
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {quiz.title}
                        </h1>
                        {timeLeft > 0 && (
                            <div className="flex items-center text-lg font-semibold">
                                <Clock className="w-5 h-5 mr-2 text-red-500" />
                                <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-900 dark:text-white'}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        )}
                    </div>

                    {timeUp && (
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-red-700 dark:text-red-400">Time's up! Quiz submitted automatically.</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                            <span>Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            {quiz.questions[currentQuestion].question}
                        </h2>

                        {quiz.questions[currentQuestion].type === 'multiple-choice' && (
                            <div className="space-y-3">
                                {quiz.questions[currentQuestion].options.map((option, index) => (
                                    <label key={index} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion}`}
                                            value={option.text}
                                            checked={answers[currentQuestion] === option.text}
                                            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-gray-900 dark:text-white">{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {quiz.questions[currentQuestion].type === 'true-false' && (
                            <div className="space-y-3">
                                {['True', 'False'].map((option) => (
                                    <label key={option} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion}`}
                                            value={option}
                                            checked={answers[currentQuestion] === option}
                                            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                                            className="mr-3"
                                        />
                                        <span className="text-gray-900 dark:text-white">{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {(quiz.questions[currentQuestion].type === 'short-answer' || quiz.questions[currentQuestion].type === 'essay') && (
                            <textarea
                                value={answers[currentQuestion] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                                placeholder="Enter your answer here..."
                                rows={quiz.questions[currentQuestion].type === 'essay' ? 6 : 3}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                            />
                        )}
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {currentQuestion < quiz.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitted}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizTaker;
