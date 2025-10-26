import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { newsletterAPI } from '../utils/api';

const Footer = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [showUpdates, setShowUpdates] = useState(false);
  const [latestUpdates, setLatestUpdates] = useState([]);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await newsletterAPI.subscribe({ email });
      setMessage(response.data.message);
      setMessageType('success');
      setEmail('');

      // Show latest updates after successful subscription
      setLatestUpdates([
        {
          id: 1,
          title: "New Study Groups Created",
          description: "5 new study groups available for Mathematics and Science subjects",
          time: "2 hours ago",
          type: "group"
        },
        {
          id: 2,
          title: "Enhanced Study Plans",
          description: "AI-powered personalized study plans now include progress tracking",
          time: "1 day ago",
          type: "plan"
        },
        {
          id: 3,
          title: "Skill Improvement Features",
          description: "New interactive quizzes and flashcards for better skill retention",
          time: "3 days ago",
          type: "skill"
        },
        {
          id: 4,
          title: "Collaborative Learning Tools",
          description: "Real-time group chat and file sharing now available",
          time: "1 week ago",
          type: "collaboration"
        }
      ]);
      setShowUpdates(true);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
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
              Transform your learning experience with personalized notes and smart quizzes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Home</a></li>
              <li><a href="/resources" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Resources</a></li>

              <li><a href="/login" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Login</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Connect With Us</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>studybuddy@gmail.com</p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Stay Updated</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>Get the latest features and updates</p>
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'} border focus:outline-none focus:border-blue-400 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {message && (
              <p className={`text-sm mt-2 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Latest Updates Notification */}
        {showUpdates && (
          <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} mt-8 pt-8`}>
            <div className="max-w-4xl mx-auto">
              <h3 className={`text-xl font-semibold mb-6 text-center ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                🎉 Welcome! Here are the Latest Updates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestUpdates.map((update) => (
                  <div
                    key={update.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 hover:bg-gray-750'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        update.type === 'group' ? 'bg-green-500 text-white' :
                        update.type === 'plan' ? 'bg-blue-500 text-white' :
                        update.type === 'skill' ? 'bg-purple-500 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {update.type === 'group' ? '👥' :
                         update.type === 'plan' ? '📚' :
                         update.type === 'skill' ? '🎯' : '🤝'}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {update.title}
                        </h4>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {update.description}
                        </p>
                        <span className={`text-xs mt-2 inline-block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {update.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowUpdates(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close Updates
                </button>
              </div>
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
