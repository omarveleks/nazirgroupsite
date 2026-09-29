/**
 * Live mode only: permanently redirect the *.pages.dev address to the custom
 * domain, keeping path and query. Set REDIRECT_TO (e.g. https://nazirandco.com)
 * in Cloudflare Pages when the domain is attached. Without it this does nothing.
 * Which paths reach this middleware is controlled by _routes.json (see postbuild).
 */
interface Ctx {
  request: Request;
  env: { REDIRECT_TO?: string };
  next: () => Promise<Response>;
}

export const onRequest = async ({ request, env, next }: Ctx): Promise<Response> => {
  const target = env.REDIRECT_TO;
  if (target) {
    const url = new URL(request.url);
    if (url.hostname.endsWith('.pages.dev')) {
      const to = new URL(url.pathname + url.search, target);
      return Response.redirect(to.href, 301);
    }
  }
  return next();
};
