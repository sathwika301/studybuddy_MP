const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // Fetch the complete user data (excluding password)
    const fullUser = await User.findById(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: fullUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Hash and store refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    // Fetch the complete user data (excluding password)
    const fullUser = await User.findById(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: fullUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar file upload
    if (req.file) {
      // Delete old avatar file if exists and not default
      const user = await User.findById(req.user.id);
      if (user.avatar && !user.avatar.includes('ui-avatars.com')) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      // Save new avatar path relative to backend root
      updateData.avatar = '/uploads/avatars/' + req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret-key');

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || !user.refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Verify the refresh token matches the stored hash
    const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValidRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = user.generateAccessToken();

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear refresh token from database
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user avatar
// @route   DELETE /api/auth/profile/avatar
// @access  Private
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete avatar file if exists and not default
    if (user.avatar && !user.avatar.includes('ui-avatars.com')) {
      const avatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Reset to default avatar
    user.avatar = 'https://ui-avatars.com/api/?background=3b82f6&color=fff&name=' + encodeURIComponent(user.name);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user progress and stats
// @route   GET /api/auth/progress
// @access  Private
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get counts from different collections
    const StudyNote = require('../models/StudyNote');
    const Quiz = require('../models/Quiz');
    const Flashcard = require('../models/Flashcard');

    const notesCount = await StudyNote.countDocuments({ author: req.user.id });
    const quizzesTaken = await Quiz.countDocuments({ author: req.user.id });
    const flashcardsCount = await Flashcard.countDocuments({ author: req.user.id });

    // Calculate weekly progress (mock for now - in real app, track actual study time)
    const weeklyProgress = Math.min(notesCount * 5 + quizzesTaken * 10 + flashcardsCount * 2, 100);

    const progress = {
      notesCount,
      quizzesTaken,
      flashcardsCount,
      studyStreak: user.profile?.progress?.streak || 0,
      weeklyProgress,
      totalStudyTime: user.profile?.progress?.totalStudyTime || 0,
      completedQuizzes: user.profile?.progress?.completedQuizzes || 0,
      createdNotes: user.profile?.progress?.createdNotes || 0,
      createdFlashcards: user.profile?.progress?.createdFlashcards || 0
    };

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user learning progress by email
// @route   GET /api/auth/:email/learning-progress
// @access  Private
const getUserLearningProgress = async (req, res) => {
  try {
    const { email } = req.params;

    // Check if user is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get counts from different collections
    const StudyNote = require('../models/StudyNote');
    const Quiz = require('../models/Quiz');
    const Flashcard = require('../models/Flashcard');

    const notesCount = await StudyNote.countDocuments({ author: user._id });
    const quizzesTaken = await Quiz.countDocuments({ author: user._id });
    const flashcardsCount = await Flashcard.countDocuments({ author: user._id });

    // Calculate study streak
    const studyStreak = calculateStudyStreak(user.profile.lastActiveDate);

    // Calculate weekly goal progress
    const weeklyProgress = calculateWeeklyGoalProgress(user);

    const progress = {
      studyNotes: notesCount,
      quizzesTaken,
      flashcards: flashcardsCount,
      studyStreak,
      weeklyGoalProgress: weeklyProgress,
      totalStudyTime: user.profile?.progress?.totalStudyTime || 0
    };

    res.status(200).json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to calculate study streak
const calculateStudyStreak = (lastActiveDate) => {
  if (!lastActiveDate) return 0;

  const now = new Date();
  const lastActive = new Date(lastActiveDate);
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If last active was today or yesterday, streak continues
  if (diffDays <= 1) {
    return 1; // Simplified - in real app, track consecutive days properly
  }

  // If gap is more than 1 day, streak is broken
  return 0;
};

// Helper function to calculate weekly goal progress
const calculateWeeklyGoalProgress = (user) => {
  const profile = user.profile;
  const goals = profile.weeklyGoals;
  const completed = profile.completedTasks;

  // Check if we need to reset weekly counters (new week)
  const now = new Date();
  const currentWeekStart = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
  currentWeekStart.setDate(diff);
  currentWeekStart.setHours(0, 0, 0, 0);

  const storedWeekStart = new Date(profile.completedTasks.weekStartDate);
  storedWeekStart.setHours(0, 0, 0, 0);

  // If it's a new week, reset counters
  if (currentWeekStart > storedWeekStart) {
    // Reset would happen here, but for calculation we use current values
  }

  // Calculate progress for each category
  const notesProgress = Math.min((completed.notesThisWeek / goals.notes) * 100, 100);
  const quizzesProgress = Math.min((completed.quizzesThisWeek / goals.quizzes) * 100, 100);
  const flashcardsProgress = Math.min((completed.flashcardsThisWeek / goals.flashcards) * 100, 100);
  const studyTimeProgress = Math.min((completed.studyTimeThisWeek / goals.studyTime) * 100, 100);

  // Overall progress (average of all categories)
  const overallProgress = (notesProgress + quizzesProgress + flashcardsProgress + studyTimeProgress) / 4;

  return {
    overall: Math.round(overallProgress),
    notes: Math.round(notesProgress),
    quizzes: Math.round(quizzesProgress),
    flashcards: Math.round(flashcardsProgress),
    studyTime: Math.round(studyTimeProgress)
  };
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  deleteAvatar,
  logout,
  refreshToken,
  getUserProgress,
  getUserLearningProgress
};
