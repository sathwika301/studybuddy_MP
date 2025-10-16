import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send, Bot, User, Upload,
  ChevronDown, ChevronRight,
  History, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import DocumentUpload from './DocumentUpload';
import '../styles/ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    ai: true
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Chat list state
  const [chats, setChats] = useState({
    ai: [
      {
        id: 'ai-chat',
        name: 'StudyBuddy AI',
        type: 'ai',
        lastMessage: 'Hello! How can I help you study today?',
        unread: 0,
        timestamp: new Date(),
        avatar: <Bot className="chat-avatar-icon" />
      }
    ]
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-select AI chat on mount
  useEffect(() => {
    handleChatSelect(chats.ai[0]);
  }, []);

  // Fetch chat history when AI chat selected
  useEffect(() => {
    if (user?._id && selectedChat?.type === 'ai') {
      fetchChatHistory();
    }
  }, [user, selectedChat]);

  const fetchChatHistory = async () => {
    try {
      const response = await api.get(`/chat/history/${user._id}`);
      if (response.data.messages?.length > 0) {
        setMessages(
          response.data.messages.map(msg => ({
            id: msg._id,
            sender: msg.sender,
            message: msg.message,
            timestamp: new Date(msg.timestamp),
            type: msg.messageType || 'text'
          }))
        );
      }
    } catch (err) {
      setError('Error fetching chat history.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: inputMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat/send', {
        userId: user._id,
        message: userMessage.message
      });

      if (response.data.aiMessage) {
        const aiMessage = {
          id: response.data.aiMessage._id,
          sender: 'ai',
          message: response.data.aiMessage.message,
          timestamp: new Date(response.data.aiMessage.timestamp),
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete(`/chat/history/${user._id}`);
      setMessages([]);
    } catch (err) {
      setMessages([]);
      setError('Could not clear chat history on server. Cleared locally.');
    }
  };

  const handleViewHistory = async () => {
    try {
      await fetchChatHistory();
    } catch (err) {
      setError('Failed to load chat history.');
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    if (chat.type === 'ai') {
      setMessages([{
        id: 'welcome',
        sender: 'ai',
        message: `Hello ${user?.name || 'there'}! I'm your StudyBuddy AI. How can I help you with your studies today?`,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-interface">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header"><h3>Chats</h3></div>
        <div className="chat-section">
          <div className="section-header" onClick={() => toggleSection('ai')}>
            <div className="section-title"><Bot size={18} /><span>AI Chat</span></div>
            {expandedSections.ai ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          {expandedSections.ai && (
            <div className="section-content">
              {chats.ai.map(chat => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-avatar">{chat.avatar}</div>
                  <div className="chat-info">
                    <div className="chat-name">{chat.name}</div>
                    <div className="chat-last-message">{chat.lastMessage}</div>
                  </div>
                  <div className="chat-meta">
                    <div className="chat-time">{formatTime(chat.timestamp)}</div>
                    {chat.unread > 0 && <div className="unread-badge">{chat.unread}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="header-content" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div className="header-icon">{selectedChat.avatar}</div>
                <div className="header-text" style={{ flex: 1, marginLeft: 12 }}>
                  <h3 style={{ margin: 0 }}>{selectedChat.name}</h3>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                  <button
                    onClick={handleViewHistory}
                    title="View History"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#e0e7ff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      color: '#2563eb',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    <History size={18} />
                    History
                  </button>
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      color: '#dc2626',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    <Trash2 size={18} />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="messages-container">
              <div className="messages-list">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                  >
                    <div className="message-avatar">
                      {message.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.sender === 'ai' ? (
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => <h1 className="text-gray-900 dark:text-white" style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h1>,
                              h2: ({ children }) => <h2 className="text-gray-800 dark:text-gray-100" style={{ fontSize: '1.3em', fontWeight: 'bold', margin: '0.4em 0' }}>{children}</h2>,
                              h3: ({ children }) => <h3 className="text-gray-700 dark:text-gray-200" style={{ fontSize: '1.1em', fontWeight: 'bold', margin: '0.3em 0' }}>{children}</h3>,
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
                            {message.message}
                          </ReactMarkdown>
                        ) : (
                          message.message
                        )}
                      </div>
                      <div className="message-time">{formatTime(message.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {selectedChat.type === 'ai' && (
              <div className="input-container">
                <div className="input-wrapper">
                  <button
                    className="attachment-btn"
                    onClick={() => setShowDocumentUpload(true)}
                    title="Upload study documents"
                  >
                    <Upload size={20} />
                  </button>
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question here..."
                    disabled={isLoading}
                    rows={1}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? <div className="loading-spinner"></div> : <Send size={20} />}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="no-chat-selected">
            <Bot size={64} className="no-chat-icon" />
            <h2>Select a chat to start</h2>
            <p>Choose AI chat to begin your conversation.</p>
          </div>
        )}
      </div>

      {/* Login Prompt */}
      {showLoginPrompt && (
        <div className="login-prompt">
          <div className="login-content">
            <h3>Login Required</h3>
            <p>Please log in to start chatting with StudyBuddy AI.</p>
            <div className="login-actions">
              <button onClick={() => setShowLoginPrompt(false)}>Cancel</button>
              <button onClick={() => navigate('/login')}>Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="error-toast">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <DocumentUpload
          onClose={() => setShowDocumentUpload(false)}
          onUploadSuccess={() => {
            setShowDocumentUpload(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatInterface;