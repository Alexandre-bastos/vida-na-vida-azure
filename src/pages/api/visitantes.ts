import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, invitedById, cellId } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400 });
    }

    const newVisitor = await prisma.visitor.create({
      data: {
        name,
        phone,
        invitedById: invitedById || null,
        cellId: cellId || null
      }
    });

    return new Response(JSON.stringify(newVisitor), { status: 201 });
  } catch (error) {
    console.error('Erro ao criar visitante via API:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao criar visitante' }), { status: 500 });
  }
};
