// Envieonment Variables
const { MODE, VITE_SERVER_PRO_URL, VITE_SERVER_DEV_URL } = import.meta.env;

const isProduction = MODE === 'production';

// Server Url
export const serverUrl = isProduction
  ? VITE_SERVER_PRO_URL
  : VITE_SERVER_DEV_URL;
