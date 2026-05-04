import { Resend } from 'resend';


export async function sendInviteEmail(email: string, name: string, token: string) {
  const domain = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const inviteLink = `${domain}/definir-senha?token=${token}&email=${email}`;

  // Se não houver API Key, apenas logamos o link para teste
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
    console.log('--- [MOCK EMAIL: CONVITE] ---');
    console.log(`Para: ${name} (${email})`);
    console.log(`Link: ${inviteLink}`);
    console.log('-----------------------------');
    return { success: true, mocked: true };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Vida na Vida <onboarding@resend.dev>',
      to: [email],
      subject: 'Bem-vindo(a) à Família Vida na Vida! 🌱',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3c5c;">Olá, ${name}!</h1>
          <p>Você foi convidado(a) para participar do sistema de gestão de células da <strong>Comunidade Cristã Vida na Vida</strong>.</p>
          <p>Para ativar sua conta e definir sua senha, clique no botão abaixo:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #5270ac; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Ativar Minha Conta</a>
          <p style="color: #666; font-size: 12px;">Se o botão não funcionar, copie e cole este link no seu navegador:<br>${inviteLink}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999;">Este link expira em 48 horas.</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function sendResetPasswordEmail(email: string, name: string, token: string) {
  const domain = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const resetLink = `${domain}/reset-password?token=${token}`;

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
    console.log('--- [MOCK EMAIL: RESET] ---');
    console.log(`Para: ${name} (${email})`);
    console.log(`Link: ${resetLink}`);
    console.log('---------------------------');
    return { success: true, mocked: true };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Vida na Vida <onboarding@resend.dev>',
      to: [email],
      subject: 'Recuperação de Senha - Vida na Vida 🛡️',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3c5c;">Recuperação de Senha</h1>
          <p>Olá, ${name}. Recebemos uma solicitação para redefinir sua senha no sistema <strong>Vida na Vida</strong>.</p>
          <p>Se foi você, clique no botão abaixo para escolher uma nova senha:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Redefinir Minha Senha</a>
          <p><strong>Atenção:</strong> Este link é válido por apenas 1 hora.</p>
          <p style="color: #666; font-size: 12px;">Se você não solicitou a troca de senha, pode ignorar este e-mail com segurança.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999;">Equipe de Suporte - Vida na Vida</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}

