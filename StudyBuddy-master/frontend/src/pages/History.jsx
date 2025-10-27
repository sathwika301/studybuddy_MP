import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState({ notes: [], quizzes: [], flashcards: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (type, id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Refresh history after deletion
        fetchHistory();
      } else {
        setError('Failed to delete history item');
      }
    } catch (err) {
      setError('Failed to delete history item');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderHistoryItem = (item, type) => {
    const getIcon = () => {
      switch (type) {
        case 'notes': return '📝';
        case 'quizzes': return '📋';
        case 'flashcards': return '🎴';
        default: return '📄';
      }
    };

    const getDetails = () => {
      switch (type) {
        case 'notes':
          return `${item.content?.substring(0, 100)}...`;
        case 'quizzes':
          return `${item.questionsCount} questions`;
        case 'flashcards':
          return `${item.cardsCount} cards`;
        default:
          return '';
      }
    };

    return (
      <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{getIcon()}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.subject} • {item.topic} • {item.difficulty}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {getDetails()}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                Generated on {formatDate(item.generatedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={() => deleteHistoryItem(type, item._id)}
            className="text-red-500 hover:text-red-700 p-1"
            title="Delete from history"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'notes', label: 'Notes', count: history.notes.length },
    { id: 'quizzes', label: 'Quizzes', count: history.quizzes.length },
    { id: 'flashcards', label: 'Flashcards', count: history.flashcards.length }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your generated study materials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {history[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start generating {activeTab} to see them here!
            </p>
          </div>
        ) : (
          history[activeTab].map(item => renderHistoryItem(item, activeTab))
        )}
      </div>
    </div>
  );
};

export default History;
