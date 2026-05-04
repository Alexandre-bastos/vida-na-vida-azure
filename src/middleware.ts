import { verifySessionToken } from "./lib/auth-manual";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ request, locals, cookies }, next) => {
  const url = new URL(request.url);

  // Rotas públicas — não precisam de verificação de sessão
  const publicPaths = ["/api/auth", "/login", "/definir-senha", "/manual", "/images", "/styles", "/favicon.ico", "/public", "/_astro", "/uploads"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return next();
  }

  try {
    const sessionToken = cookies.get('session_token')?.value;
    const user = sessionToken ? await verifySessionToken(sessionToken) : null;

    // Sem sessão válida → redirecionar para login
    if (!user) {
      return new Response(null, {
        status: 302,
        headers: {
          location: "/login",
          "Cache-Control": "no-store",
        },
      });
    }

    // Popula locals.user com os dados do token
    locals.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error('[MIDDLEWARE ERROR]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

