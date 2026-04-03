// Environment Variables
const { MODE } = import.meta.env;

const isDev = MODE === 'development';

// Development Log
export const devLog = (...args) => isDev && console.log(...args);

// Development Error
export const devErr = (...args) => isDev && console.error(...args);
