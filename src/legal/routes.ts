export type LegalPageKind = 'privacy' | 'support' | 'terms';

export function legalPageFromPath(pathname: string): LegalPageKind | null {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy') return 'privacy';
  if (path === '/support') return 'support';
  if (path === '/terms') return 'terms';
  return null;
}
