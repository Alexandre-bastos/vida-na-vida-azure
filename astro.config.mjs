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
    ssr: {
      noExternal: ['@prisma/client', '@auth/prisma-adapter'],
      external: ['@prisma-generated']
    }
  },
  integrations: [react(), auth()],
  adapter: node({
    mode: 'middleware'
  }),
  output: 'server',
});