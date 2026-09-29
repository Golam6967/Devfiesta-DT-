// Single source of truth for the backend's base URL.
// Set VITE_API_URL in production (e.g. your Render backend URL + /api).
// Falls back to localhost so local development needs no .env changes.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// The socket server runs on the same origin as the API, without the trailing "/api".
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');
