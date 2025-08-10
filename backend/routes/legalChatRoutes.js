const express = require('express');
const legalChatController = require('../controllers/legalChatController');
const { body } = require('express-validator');

const router = express.Router();

// Validation middleware for legal chat messages
const legalChatValidator = [
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('conversationId')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Conversation ID must be less than 100 characters')
];

// Validation for clearing chat history
const clearHistoryValidator = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
  body('conversationId')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Conversation ID must be less than 100 characters')
];

// POST /legal-chat - Process legal chat messages
router.post('/', legalChatValidator, legalChatController.processLegalChat);

// GET /legal-chat/history - Get chat history
router.get('/history', legalChatController.getChatHistory);

// DELETE /legal-chat/history - Clear chat history
router.delete('/history', clearHistoryValidator, legalChatController.clearChatHistory);

module.exports = router;
