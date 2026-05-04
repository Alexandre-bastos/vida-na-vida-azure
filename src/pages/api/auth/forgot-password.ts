import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';
import { sendResetPasswordEmail } from '../../../lib/mail';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'E-mail é obrigatório' }), { status: 400 });
    }

    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Por segurança, se o usuário não existir, não informamos ao atacante.
    // Apenas retornamos sucesso genérico.
    if (!user) {
      return new Response(JSON.stringify({ success: true, message: 'Se este e-mail estiver cadastrado, você receberá um link de recuperação.' }), { status: 200 });
    }

    // 2. Gerar Token Único
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hora de validade

    // 3. Salvar Token no Banco (ou atualizar se já existir para este e-mail)
    // No model verificationtoken, o identifier é o e-mail
    await prisma.verificationtoken.upsert({
      where: {
        identifier_token: {
          identifier: email,
          token: token
        }
      },
      update: {
        token,
        expires
      },
      create: {
        identifier: email,
        token,
        expires
      }
    });

    // 4. Enviar E-mail
    await sendResetPasswordEmail(email, user.name || 'Membro', token);

    return new Response(JSON.stringify({ success: true, message: 'E-mail de recuperação enviado com sucesso!' }), { status: 200 });

  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), { status: 500 });
  }
};
