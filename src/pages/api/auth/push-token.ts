import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Acesso não autorizado. Faça login primeiro.' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const token = body.token?.toString();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'O token é obrigatório.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upsert: cria se não existir, atualiza a associação do usuário se já existir
    const savedToken = await prisma.pushtoken.upsert({
      where: { token: token },
      update: { userId: user.id },
      create: {
        token: token,
        userId: user.id,
      },
    });

    console.log(`[PUSH-REGISTER] Token registrado para o usuário ${user.name} (${user.id}):`, token);

    return new Response(
      JSON.stringify({ success: true, message: 'Token registrado com sucesso.', data: savedToken }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[PUSH-REGISTER] Erro crítico ao processar registro de token:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor ao registrar token.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
