const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    // Check if email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Email is already subscribed to our newsletter'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        if (preferences) {
          existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
        }
        await existingSubscriber.save();

        return res.status(200).json({
          success: true,
          message: 'Subscription reactivated successfully'
        });
      }
    }

    // Create new subscription
    const subscriber = await Newsletter.create({
      email,
      preferences: preferences || {
        updates: true,
        features: true,
        promotions: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed to our newsletter'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { isActive: false },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get subscriber status
// @route   GET /api/newsletter/status/:email
// @access  Public
const getSubscriberStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(200).json({
        success: true,
        subscribed: false
      });
    }

    res.status(200).json({
      success: true,
      subscribed: subscriber.isActive,
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update subscriber preferences
// @route   PUT /api/newsletter/preferences
// @access  Public
const updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { preferences },
      { new: true, runValidators: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      subscriber: {
        email: subscriber.email,
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  subscribe,
  unsubscribe,
  getSubscriberStatus,
  updatePreferences
};
