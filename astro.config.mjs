// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import auth from 'auth-astro';
import node from '@astrojs/node';



// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 4321,
    strictPort: true,
  },
  ssr: {
    noExternal: ['@prisma/client', '@auth/prisma-adapter'],
  },
  integrations: [react(), auth()],
  adapter: node({
    mode: 'middleware'
  }),
  output: 'server',
});