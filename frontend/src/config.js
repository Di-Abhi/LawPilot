export const serverEndpoint = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validate required environment variables
if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
}