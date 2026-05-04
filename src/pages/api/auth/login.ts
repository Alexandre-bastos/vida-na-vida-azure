import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionToken } from '../../../lib/auth-manual';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 401 });
    }

    if (!user.active) {
      return new Response(JSON.stringify({ error: 'Sua conta está inativa' }), { status: 403 });
    }

    // Validar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401 });
    }

    // Criar Token de Sessão
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Definir Cookie
    cookies.set('session_token', token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), { status: 500 });
  }
};
