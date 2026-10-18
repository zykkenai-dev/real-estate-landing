export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    // Next may normalize Request.url's hostname; Host retains the browser's authority.
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    if (/[\\/?#@\s]/.test(host)) return false;
    return origin === new URL(`${url.protocol}//${host}`).origin;
  } catch {
    return false;
  }
}
