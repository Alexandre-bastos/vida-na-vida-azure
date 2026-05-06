import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const agents = defineCollection({
    loader: glob({ base: './src/content/config', pattern: '**/*' }),
    schema: z.any(), // Aceita qualquer estrutura por enquanto
});

export const collections = {
    'config': agents,
};
