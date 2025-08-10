const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const { GEMINI_API_KEY } = require('../config/config');

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const legalChatController = {
  // POST /legal-chat - Process legal chat messages
  processLegalChat: async (req, res) => {
    try {
      const { message, userId, conversationId } = req.body;

      // Validate input
      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Legal assistant system prompt
      const systemPrompt = `You are a helpful legal assistant AI. Your role is to provide SIMPLE, CLEAR, and CONCISE legal information.

RESPONSE GUIDELINES:
- Keep responses SHORT and EASY to understand
- Use simple language, avoid complex legal jargon
- Provide a brief summary first, then key points if needed
- Use bullet points for multiple concepts
- Limit responses to 2-3 sentences for simple questions
- For complex topics, provide a brief overview in 4-5 sentences maximum

IMPORTANT:
- This is for general information only, not legal advice
- Always suggest consulting a qualified attorney for specific legal matters
- Keep it simple and user-friendly`;

      // Prepare the conversation for Gemini
      const prompt = `${systemPrompt}\n\nUser Question: ${message}`;

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      if (!aiResponse) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate AI response'
        });
      }

      // Generate conversation ID if not provided
      const currentConversationId = conversationId || `conv_${Date.now()}`;

      // Save chat history to database if userId is provided
      if (userId) {
        try {
          await Chat.findOneAndUpdate(
            { userId, conversationId: currentConversationId },
            {
              $push: {
                messages: [
                  { role: 'user', content: message },
                  { role: 'assistant', content: aiResponse }
                ]
              },
              $inc: { totalTokens: aiResponse.length }, // Approximate token count
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.warn('Failed to save chat history:', dbError);
          // Don't fail the request if saving history fails
        }
      }

      // Return the response in JSON format
      res.json({
        success: true,
        data: {
          message: aiResponse,
          timestamp: new Date().toISOString(),
          conversationId: currentConversationId,
          userId: userId,
          model: 'gemini-1.5-flash',
          tokens: aiResponse.length // Approximate token count
        }
      });

    } catch (error) {
      console.error('Legal chat error:', error);
      
      // Handle Gemini API errors specifically
      if (error.message?.includes('quota')) {
        return res.status(429).json({
          success: false,
          message: 'API quota exceeded. Please try again later.'
        });
      }
      
      if (error.message?.includes('API key') || error.message?.includes('authentication')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid API configuration'
        });
      }

      // Handle model access issues
      if (error.message?.includes('model') || error.message?.includes('not found')) {
        return res.status(400).json({
          success: false,
          message: 'Model access issue. Please check your Gemini API configuration.',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /legal-chat/history - Get chat history
  getChatHistory: async (req, res) => {
    try {
      const { userId, conversationId, limit = 50 } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      let query = { userId };
      
      if (conversationId) {
        query.conversationId = conversationId;
      }

      const chats = await Chat.find(query)
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .select('-__v');

      res.json({
        success: true,
        data: {
          conversations: chats,
          total: chats.length
        }
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve chat history'
      });
    }
  },

  // DELETE /legal-chat/history - Clear chat history
  clearChatHistory: async (req, res) => {
    try {
      const { userId, conversationId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      let query = { userId };
      
      if (conversationId) {
        query.conversationId = conversationId;
      }

      const result = await Chat.deleteMany(query);

      res.json({
        success: true,
        message: conversationId 
          ? 'Conversation deleted successfully' 
          : 'All conversations deleted successfully',
        deletedCount: result.deletedCount
      });

    } catch (error) {
      console.error('Clear chat history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear chat history'
      });
    }
  }
};

module.exports = legalChatController;
