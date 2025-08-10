# LawPilot Backend

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/lawpilot

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
REFRESH_JWT_SECRET=your_refresh_jwt_secret_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Create `.env` file with required variables
3. Start MongoDB service
4. Run development server: `npm run dev`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google-auth` - Google OAuth login
- `POST /auth/logout` - User logout
- `POST /auth/is-user-logged-in` - Check user session

### Legal Chat
- `POST /legal-chat` - Process legal chat messages with AI
- `GET /legal-chat/history` - Get chat history for a user
- `DELETE /legal-chat/history` - Clear chat history

## Legal Chat API Usage

### Send a Message
```bash
POST /legal-chat
Content-Type: application/json

{
  "message": "What are the basic requirements for forming a contract?",
  "userId": "user_id_here", // optional
  "conversationId": "conv_123" // optional
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "message": "AI response here...",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "conversationId": "conv_123",
    "userId": "user_id_here",
    "model": "gemini-1.5-flash",
    "tokens": 150
  }
}
```

### Get Chat History
```bash
GET /legal-chat/history?userId=user_id_here&limit=50
```

### Clear Chat History
```bash
DELETE /legal-chat/history
Content-Type: application/json

{
  "userId": "user_id_here",
  "conversationId": "conv_123" // optional, clears all if not provided
}
```

## Gemini AI Integration

This project now uses **Google Gemini AI** instead of OpenAI:
- **Model**: `gemini-1.5-flash` (fast and efficient)
- **Free Tier**: 60 requests per minute
- **Cost**: Very affordable compared to OpenAI
- **Quality**: Excellent for legal assistance tasks
