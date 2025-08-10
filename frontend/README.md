# LawPilot Frontend

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Setup Instructions

1. Install dependencies: `npm install`
2. Create `.env` file with required variables
3. Start development server: `npm run dev`
4. Build for production: `npm run build`

## Features

- User authentication (email/password)
- Google OAuth integration
- Responsive design with Tailwind CSS
- Redux state management
- React Router navigation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
