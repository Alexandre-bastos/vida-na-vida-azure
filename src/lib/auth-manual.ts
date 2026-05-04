import * as jose from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'uma-chave-padrao-muito-segura-para-desenvolvimento-123'
);

export async function createSessionToken(user: { id: string; email: string | null; name: string; role: string }) {
  const token = await new jose.SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Sessão de 24 horas
    .sign(SECRET);
  
  return token;
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, SECRET);
    return payload as { id: string; email: string | null; name: string; role: string };
  } catch (error) {
    return null;
  }
}
