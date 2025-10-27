import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, BookOpen, Brain, Clock, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProgressAnalytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`http://localhost:5000/api/auth/${user.email}/learning-progress`);
        const progress = response.data.progress;

        // Transform the data to match the expected format
        const transformedData = {
          studyTime: Math.round((progress.totalStudyTime || 0) / 60 * 10) / 10, // Convert minutes to hours
          flashcardsReviewed: progress.flashcards || 0,
          quizzesCompleted: progress.quizzesTaken || 0,
          averageScore: 85, // This would need to be calculated from quiz results
          studyStreak: progress.studyStreak || 0,
          weeklyGoalProgress: progress.weeklyGoalProgress?.overall || 0,
          subjects: [
            { name: 'Study Notes', time: Math.round((progress.totalStudyTime || 0) / 60 * 10) / 10, flashcards: progress.flashcards || 0, quizzes: progress.quizzesTaken || 0, score: 85 }
          ],
          dailyProgress: [
            { day: 'Mon', time: 3.2, flashcards: 18, quizzes: 1 },
            { day: 'Tue', time: 4.1, flashcards: 25, quizzes: 2 },
            { day: 'Wed', time: 2.8, flashcards: 15, quizzes: 1 },
            { day: 'Thu', time: 5.2, flashcards: 32, quizzes: 2 },
            { day: 'Fri', time: 4.5, flashcards: 28, quizzes: 1 },
            { day: 'Sat', time: 2.9, flashcards: 20, quizzes: 1 },
            { day: 'Sun', time: 1.8, flashcards: 18, quizzes: 0 }
          ]
        };

        setAnalyticsData(transformedData);
      } catch (err) {
        console.error('Failed to fetch progress data:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [user?.email]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BarChart = ({ data, title, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
              {item.day}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${color}`}
                    style={{ width: `${(item.time / Math.max(...data.map(d => d.time))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                  {item.time.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SubjectProgress = ({ subjects }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subject Performance</h3>
      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{subject.score}% avg</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{subject.time}h studied</span>
              <span>{subject.flashcards} cards</span>
              <span>{subject.quizzes} quizzes</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${subject.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Progress Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Track your learning journey and performance insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Study Time"
            value={`${analyticsData.studyTime}h`}
            subtitle={`${timeRange === 'week' ? 'this week' : 'this month'}`}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={BookOpen}
            title="Flashcards Reviewed"
            value={analyticsData.flashcardsReviewed}
            subtitle="total cards"
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={Brain}
            title="Quizzes Completed"
            value={analyticsData.quizzesCompleted}
            subtitle="total quizzes"
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Award}
            title="Average Score"
            value={`${analyticsData.averageScore}%`}
            subtitle="quiz performance"
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <BarChart
            data={analyticsData.dailyProgress}
            title={`Daily Study Time (${timeRange})`}
            color="from-blue-500 to-cyan-500"
          />
          <SubjectProgress subjects={analyticsData.subjects} />
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Strengths</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Consistent study schedule maintained</li>
                  <li>• Strong performance in Mathematics</li>
                  <li>• Good flashcard retention rate</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Goals</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Increase Physics study time by 20%</li>
                  <li>• Complete 2 more quizzes this week</li>
                  <li>• Review 50 additional flashcards</li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Areas for Improvement</h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Physics scores could be improved</li>
                  <li>• Weekend study time is lower</li>
                  <li>• Quiz frequency could be increased</li>
                </ul>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">Next Steps</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Focus on Physics weak areas</li>
                  <li>• Schedule weekend study sessions</li>
                  <li>• Set daily flashcard goals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
