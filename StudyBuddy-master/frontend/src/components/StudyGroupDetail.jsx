import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send, Smile, Paperclip, MoreVertical, Reply, Edit3,
  Trash2, Heart, ThumbsUp, Laugh, Angry, Sad, Check, CheckCheck
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const StudyGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const messagesEndRef = useRef(null);

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [newResource, setNewResource] = useState({ title: "", url: "", type: "article" });

  // WhatsApp-like features
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchMessages();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/study-groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(response.data.group);
    } catch (err) {
      setError("Failed to load group details");
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/group-chat/${id}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/study-groups/${id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join group");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const payload = { message: newMessage };

      // Include replyTo if replying
      if (replyingTo) {
        payload.replyTo = replyingTo._id;
      }

      const response = await axios.post(
        `http://localhost:5000/api/group-chat/${id}/messages`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages([...messages, response.data.message]);
      setNewMessage("");
      setReplyingTo(null); // Clear reply state
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/study-groups/${id}/resources`,
        newResource,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewResource({ title: "", url: "", type: "article" });
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add resource");
    }
  };

  const isMember = group?.members?.some(member => member.user._id === user?._id);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WhatsApp-like functions
  const handleReply = (message) => {
    setReplyingTo(message);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.message);
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/group-chat/${id}/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(messages.filter(msg => msg._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/group-chat/${id}/messages/${messageId}/reactions`,
        { emoji },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh messages to show updated reactions
      fetchMessages();
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'now'; // less than 1 minute
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`; // minutes
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`; // hours
    return date.toLocaleDateString(); // date
  };

  const getMessageStatus = (message) => {
    // Simple implementation - in real WhatsApp, this would track delivery/read status
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  if (loading) {
    return <div className="text-center mt-10">Loading group...</div>;
  }

  if (!group) {
    return <div className="text-center mt-10 text-red-600">Group not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/study-groups")}
        className="mb-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Groups
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-gray-600 mb-2">{group.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {group.subject}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                {group.difficulty}
              </span>
              {group.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          {!isMember && (
            <button
              onClick={handleJoinGroup}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Join Group
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{group.members.length} members</span>
          <span>•</span>
          <span>Max {group.maxMembers} members</span>
          <span>•</span>
          <span>{group.isPrivate ? "Private" : "Public"}</span>
        </div>
      </div>

      {isMember && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg">
              <div className="border-b p-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`px-4 py-2 rounded ${activeTab === "chat" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("resources")}
                    className={`px-4 py-2 rounded ${activeTab === "resources" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`px-4 py-2 rounded ${activeTab === "members" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Members
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === "chat" && (
                  <div className="flex flex-col h-[600px]">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
                      {messages.map(message => {
                        const isOwnMessage = message.sender._id === user?._id;
                        return (
                          <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200'
                            }`}>
                              {/* Reply indicator */}
                              {message.replyTo && (
                                <div className="text-xs opacity-70 mb-2 p-2 bg-black bg-opacity-10 rounded">
                                  Replying to: {message.replyTo.message.substring(0, 50)}...
                                </div>
                              )}

                              {/* Message content */}
                              <div className="text-sm">{message.message}</div>

                              {/* Reactions */}
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {message.reactions.map((reaction, idx) => (
                                    <span key={idx} className="text-xs bg-white bg-opacity-20 rounded px-1">
                                      {reaction.emoji} {reaction.count}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Message footer */}
                              <div className={`flex items-center justify-between mt-1 text-xs ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                <span>{formatTime(message.createdAt)}</span>
                                {isOwnMessage && getMessageStatus(message)}
                              </div>
                            </div>

                            {/* Message actions menu */}
                            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="relative">
                                <button
                                  onClick={() => setShowEmojiPicker(message._id)}
                                  className="p-1 hover:bg-gray-200 rounded-full"
                                >
                                  <Smile className="w-4 h-4" />
                                </button>

                                {/* Emoji picker */}
                                {showEmojiPicker === message._id && (
                                  <div className="absolute bottom-full mb-2 bg-white border rounded-lg p-2 shadow-lg">
                                    <div className="flex space-x-1">
                                      {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            handleReaction(message._id, emoji);
                                            setShowEmojiPicker(null);
                                          }}
                                          className="text-lg hover:bg-gray-100 rounded p-1"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleReply(message)}
                                className="p-1 hover:bg-gray-200 rounded-full block"
                              >
                                <Reply className="w-4 h-4" />
                              </button>

                              {message.sender._id === user?._id && (
                                <>
                                  <button
                                    onClick={() => handleEdit(message)}
                                    className="p-1 hover:bg-gray-200 rounded-full block"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(message._id)}
                                    className="p-1 hover:bg-red-200 rounded-full block text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Reply indicator */}
                    {replyingTo && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-blue-800">
                            Replying to {replyingTo.sender.name}
                          </div>
                          <div className="text-sm text-blue-600">
                            {replyingTo.message.substring(0, 100)}...
                          </div>
                        </div>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Message input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>

                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <Smile className="w-5 h-5" />
                        </button>

                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "resources" && (
                  <div>
                    <form onSubmit={handleAddResource} className="mb-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Resource title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <input
                        type="url"
                        placeholder="Resource URL"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="quiz">Quiz</option>
                        <option value="other">Other</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Add Resource
                      </button>
                    </form>

                    <div className="space-y-2">
                      {group.resources.map(resource => (
                        <div key={resource._id} className="border rounded p-3">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {resource.title}
                          </a>
                          <div className="text-sm text-gray-600">
                            {resource.type} • Added by {resource.addedBy?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "members" && (
                  <div>
                    {group.members.map(member => (
                      <div key={member.user._id} className="flex items-center space-x-3 mb-3">
                        <img
                          src={member.user.profileImage || "/default-avatar.png"}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold">{member.user.name}</div>
                          <div className="text-sm text-gray-600">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold mb-3">Group Rules</h3>
              {group.rules.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {group.rules.map((rule, index) => (
                    <li key={index} className="text-sm">{rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No rules specified</p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMember && (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-lg mb-4">Join this group to participate in discussions and access resources!</p>
          <button
            onClick={handleJoinGroup}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Join Study Group
          </button>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetail;
