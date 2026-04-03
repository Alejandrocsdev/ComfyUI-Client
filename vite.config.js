import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite Configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.info('Mode:', mode);

  return {
    plugins: [react()],
    server: { host: true, port: Number(env.PORT) },
  };
});
