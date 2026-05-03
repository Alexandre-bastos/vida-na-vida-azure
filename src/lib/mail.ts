import { Resend } from 'resend';


export async function sendInviteEmail(email: string, name: string, token: string) {
  const domain = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  const inviteLink = `${domain}/definir-senha?token=${token}&email=${email}`;

  // Se não houver API Key, apenas logamos o link para teste
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
    console.log('--- [MOCK EMAIL] ---');
    console.log(`Para: ${name} (${email})`);
    console.log(`Link de Convite: ${inviteLink}`);
    console.log('--------------------');
    return { success: true, mocked: true };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Vida na Vida <onboarding@resend.dev>', // No futuro você pode usar seu domínio próprio
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

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Erro inesperado no envio:', err);
    return { success: false, error: err };
  }
}

