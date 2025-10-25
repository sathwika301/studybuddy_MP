const express = require('express');
const { body, param } = require('express-validator');
const { subscribe, unsubscribe, getSubscriberStatus, updatePreferences } = require('../controllers/newsletterController');

const router = express.Router();

// Validation rules
const subscribeValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
];

const unsubscribeValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const updatePreferencesValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('preferences').isObject().withMessage('Preferences are required')
];

const emailParamValidation = [
  param('email').isEmail().withMessage('Please provide a valid email')
];

// Routes
router.post('/subscribe', subscribeValidation, subscribe);
router.post('/unsubscribe', unsubscribeValidation, unsubscribe);
router.get('/status/:email', emailParamValidation, getSubscriberStatus);
router.put('/preferences', updatePreferencesValidation, updatePreferences);

module.exports = router;
