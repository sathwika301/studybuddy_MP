import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QuizEnvironment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const quiz = location.state?.quiz;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState((quiz?.timeLimit || 10) * 60); // Use quiz timeLimit or default 10 minutes
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeUp, setTimeUp] = useState(false);

    useEffect(() => {
        if (!quiz) {
            navigate('/quiz-maker');
            return;
        }

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
    }, [timeLeft, quiz, navigate]);

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
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPerformanceFeedback = (percentage) => {
        if (percentage >= 90) return "Excellent! Outstanding performance!";
        if (percentage >= 80) return "Great job! Very good understanding.";
        if (percentage >= 70) return "Good work! Solid performance.";
        if (percentage >= 60) return "Fair attempt. Room for improvement.";
        return "Keep studying! You can do better next time.";
    };

    if (!quiz) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Questions to Preview</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Please add some questions to your quiz before previewing.</p>
                        <button
                            onClick={() => navigate('/quiz-maker')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Back to Quiz Maker
                        </button>
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-white py-8">
            <div className="container mx-auto px-4 max-w-4xl flex justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {quiz.title}
                        </h1>
                        <div className="flex items-center text-lg font-semibold">
                            <Clock className="w-5 h-5 mr-2 text-red-500" />
                            <span className={timeLeft < 300 ? 'text-red-500' : 'text-gray-900'}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {timeUp && (
                        <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-red-700">Time's up! Quiz submitted automatically.</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                            <span>Progress: {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {quiz.questions[currentQuestion].question}
                        </h2>

                        {quiz.questions[currentQuestion].type === 'multiple-choice' && (
                            <div className="space-y-3">
                                {quiz.questions[currentQuestion].options.map((option, index) => (
                                    <label key={index} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === option ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion}`}
                                            value={option}
                                            checked={answers[currentQuestion] === option}
                                            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                                            disabled={isSubmitted}
                                            className="mr-3"
                                        />
                                        <span className="text-gray-900">{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {quiz.questions[currentQuestion].type === 'true-false' && (
                            <div className="space-y-3">
                                {['True', 'False'].map((option) => (
                                    <label key={option} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[currentQuestion] === option ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion}`}
                                            value={option}
                                            checked={answers[currentQuestion] === option}
                                            onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                                            disabled={isSubmitted}
                                            className="mr-3"
                                        />
                                        <span className="text-gray-900">{option}</span>
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
                                disabled={isSubmitted}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 resize-none"
                            />
                        )}
                    </div>

                    {isSubmitted && (
                        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Completed!</h3>
                            <p className="text-gray-700">Your total score: <span className="font-bold text-primary-600">{score} / {quiz.questions.reduce((sum, q) => sum + q.points, 0)}</span></p>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0 || isSubmitted}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {currentQuestion < quiz.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                disabled={isSubmitted}
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitted}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitted ? 'Submitted' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizEnvironment;
