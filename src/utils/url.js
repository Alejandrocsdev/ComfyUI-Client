// Envieonment Variables
const { MODE, VITE_SERVER_URL, VITE_SERVER_PORT } = import.meta.env;

const isProduction = MODE === 'production';

// Server Url
export const serverUrl = isProduction
  ? VITE_SERVER_URL
  : `http://localhost:${VITE_SERVER_PORT}`;
