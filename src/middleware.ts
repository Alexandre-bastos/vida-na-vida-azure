import { getSession } from "auth-astro/server";
import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async ({ request, locals }, next) => {
  const url = new URL(request.url);

  // Reconstruir a URL correta para o padrão Web (necessário para Auth.js)
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const host = request.headers.get('host') || 'comunidadevidanavida.com.br';
  
  const secureUrl = new URL(request.url);
  secureUrl.protocol = proto.endsWith(':') ? proto : `${proto}:`;
  secureUrl.host = host;

  // Criar uma nova requisição com a URL corrigida
  const authRequest = new Request(secureUrl.toString(), { 
    headers: request.headers,
    method: request.method,
    body: request.body,
    duplex: 'half'
  } as any);

  // Rotas públicas — não precisam de autenticação
  const publicPaths = ["/login", "/definir-senha", "/manual", "/images", "/styles", "/favicon.ico", "/public", "/_astro", "/uploads"];
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return next();
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

