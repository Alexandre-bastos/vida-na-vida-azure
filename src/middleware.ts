import { getSession } from "auth-astro/server";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  const url = new URL(request.url);

  // Rotas públicas — não precisam de autenticação
  const publicPaths = ["/api/auth", "/login", "/definir-senha", "/manual", "/images", "/styles", "/favicon.ico", "/public", "/_astro", "/uploads"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return next();
  }

  // Reconstruir a URL correta caso esteja atrás do proxy da Azure
  let authRequest = request;
  const proto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('x-forwarded-host');
  
  if (proto && host) {
    const secureUrl = new URL(request.url);
    secureUrl.protocol = 'https:';
    secureUrl.host = host;
    authRequest = new Request(secureUrl.toString(), { headers: request.headers });
  }

  const session = await getSession(authRequest);

  // Sem sessão válida → redirecionar para login
  if (!session?.user?.id) {
    return new Response(null, {
      status: 302,
      headers: {
        location: "/login",
        "Cache-Control": "no-store",
      },
    });
  }

  // Popula locals.user com dados da sessão
  locals.user = {
    id: session.user.id as string,
    email: session.user.email ?? null,
    name: session.user.name ?? "",
    role: (session.user as any).role ?? "MEMBRO",
  };

  return next();
});

