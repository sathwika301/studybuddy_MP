import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle, Mail, BookOpen, Users, Zap, TrendingUp } from 'lucide-react';

const Footer = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);

  // Sample realistic updates that students might receive
  const sampleUpdates = [
    {
      id: 1,
      icon: Zap,
      title: "New AI Feature: Smart Study Plans",
      description: "Generate personalized study schedules based on your learning patterns and upcoming exams.",
      date: "2 hours ago",
      type: "feature"
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Study Tip: Active Recall Techniques",
      description: "Learn how to use active recall to improve memory retention by 40%. Try our new flashcard quiz mode!",
      date: "1 day ago",
      type: "tip"
    },
    {
      id: 3,
      icon: Users,
      title: "New Study Group: Advanced Calculus",
      description: "Join our new study group for advanced calculus. Weekly problem-solving sessions with AI assistance.",
      date: "2 days ago",
      type: "group"
    },
    {
      id: 4,
      icon: TrendingUp,
      title: "Performance Analytics Update",
      description: "Track your study progress with enhanced analytics. See your improvement over time with detailed charts.",
      date: "3 days ago",
      type: "update"
    },
    {
      id: 5,
      icon: Mail,
      title: "Weekly Study Digest",
      description: "Get a weekly summary of your study activities, achievements, and personalized recommendations.",
      date: "1 week ago",
      type: "newsletter"
    }
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setShowUpdates(true);
    }, 2000);
  };

  return (
    <footer className={`bg-gradient-to-r ${isDark ? 'from-gray-900 to-gray-800' : 'from-white to-white'} ${isDark ? 'text-white' : 'text-gray-900'} py-12 mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              StudyBuddy AI
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>
              Your intelligent study companion powered by <b>cutting-edge AI technology</b>. <br />
              Transform your learning experience with personalized notes, smart quizzes, and collaborative study groups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Home</a></li>
              <li><a href="/resources" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Resources</a></li>
              <li><a href="/study-groups" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Study Groups</a></li>
              <li><a href="/login" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Login</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Connect With Us</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>studybuddy@gmail.com</p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Stay Updated</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>Get the latest features and updates</p>
            <div className="flex flex-col space-y-2">
              {!isSubscribed ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'} border focus:outline-none focus:border-blue-400 transition-colors duration-200`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={isLoading || !email.trim()}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 transform ${
                      isLoading || !email.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-105'
                    } text-white`}
                  >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Successfully subscribed!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Updates Section - Show after subscription */}
        {showUpdates && (
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} mt-8 pt-8`}>
            <div className="text-center mb-8">
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                Latest Updates & Study Tips
              </h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                Here are some recent updates you would receive via email
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleUpdates.map((update) => {
                const IconComponent = update.icon;
                return (
                  <div
                    key={update.id}
                    className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        update.type === 'feature' ? 'bg-blue-100 text-blue-600' :
                        update.type === 'tip' ? 'bg-green-100 text-green-600' :
                        update.type === 'group' ? 'bg-purple-100 text-purple-600' :
                        update.type === 'update' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {update.title}
                        </h4>
                        <p className={`text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {update.description}
                        </p>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {update.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} mt-8 pt-8 text-center`}>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            © 2025 StudyBuddy AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
