import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return new Response(JSON.stringify({ error: 'Token e nova senha são obrigatórios' }), { status: 400 });
    }

    // 1. Validar Token no Banco
    const verificationToken = await prisma.verificationtoken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return new Response(JSON.stringify({ error: 'Token inválido ou já utilizado' }), { status: 400 });
    }

    // 2. Verificar Expiração
    if (new Date() > verificationToken.expires) {
      // Deleta o token expirado
      await prisma.verificationtoken.delete({ where: { token } });
      return new Response(JSON.stringify({ error: 'Este link expirou. Solicite um novo.' }), { status: 400 });
    }

    // 3. Atualizar a Senha do Usuário
    // No forgot-password, usamos o e-mail como identifier
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    });

    // 4. Deletar Token utilizado
    await prisma.verificationtoken.delete({
      where: { token }
    });

    return new Response(JSON.stringify({ success: true, message: 'Senha redefinida com sucesso!' }), { status: 200 });

  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Erro ao redefinir senha' }), { status: 500 });
  }
};
