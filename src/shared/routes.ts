const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;

export interface SharedRoute {
  token: string | null;
}
/**
 * Match the public, bearer-link route without turning malformed /s paths into
 * the marketing landing page. A malformed token still belongs to the shared
 * surface, where it receives the same unavailable state as an expired link.
 */
export function sharedRouteFromPath(pathname: string): SharedRoute | null {
  const match = pathname.match(/^\/s(?:\/([^/]+))?\/?$/);
  if (!match) return null;

  if (!match[1]) return { token: null };

  try {
    const token = decodeURIComponent(match[1]);
    return { token: SHARE_TOKEN_PATTERN.test(token) ? token : null };
  } catch {
    return { token: null };
  }
}
