import { AstroAuth } from 'auth-astro/server';
import authConfig from '../../../../auth.config.mjs';

export const { GET, POST } = AstroAuth(authConfig);
