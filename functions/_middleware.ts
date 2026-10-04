/**
 * Live site: permanently redirect the production pages.dev address and www to
 * https://nazirco.com, keeping path and query. REDIRECT_TO (Cloudflare Pages
 * variable) overrides the target. Preview deployments (<hash>.nazir-and-company.pages.dev)
 * are not redirected, so older deployments stay reachable for rollback checks.
 * Which paths reach this middleware is controlled by _routes.json (see postbuild).
 */
interface Ctx {
  request: Request;
  env: { REDIRECT_TO?: string };
  next: () => Promise<Response>;
}

const FROM = new Set(['nazir-and-company.pages.dev', 'www.nazirco.com']);

export const onRequest = async ({ request, env, next }: Ctx): Promise<Response> => {
  const url = new URL(request.url);
  if (FROM.has(url.hostname)) {
    const to = new URL(url.pathname + url.search, env.REDIRECT_TO || 'https://nazirco.com');
    return Response.redirect(to.href, 301);
  }
  return next();
};
