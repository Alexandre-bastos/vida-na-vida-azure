import { verifySessionToken } from "./lib/auth-manual";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ url, locals, cookies }, next) => {
  // 1. Rotas públicas — SEMPRE ignorar verificação de sessão
  const publicPaths = ["/api/auth", "/login", "/definir-senha", "/manual", "/images", "/styles", "/favicon.ico", "/public", "/_astro", "/uploads"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return next();
  }

  // 2. Verificar Sessão Manual
  try {
    const sessionToken = cookies.get('session_token')?.value;
    const user = sessionToken ? await verifySessionToken(sessionToken) : null;

    if (!user) {
      // Evitar loop se já estiver no login (segurança extra)
      if (url.pathname === "/login") return next();
      
      return new Response(null, {
        status: 302,
        headers: {
          location: "/login",
          "Cache-Control": "no-store",
        },
      });
    }

    // 3. Usuário autenticado -> Popular locals
    locals.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error('[MIDDLEWARE ERROR]', error);
    return next(); // Em caso de erro crítico, deixa passar para não travar o site
  }
});
