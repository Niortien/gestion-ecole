import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

// Role-based route access map
const ROLE_ROUTES: Record<string, string[]> = {
  '/utilisateurs': ['ADMIN'],
  '/rapports': ['DIRECTEUR', 'ADMIN'],
  '/caisse': ['COMPTABLE', 'ADMIN'],
  '/depenses': ['COMPTABLE', 'ADMIN'],
  '/notes': ['MAITRE', 'DIRECTEUR', 'ADMIN'],
  '/devoirs': ['MAITRE', 'DIRECTEUR', 'ADMIN'],
  '/presences': ['MAITRE', 'DIRECTEUR', 'ADMIN'],
  '/paiements': ['COMPTABLE', 'DIRECTEUR', 'ADMIN'],
  '/frais-scolarite': ['COMPTABLE', 'DIRECTEUR', 'ADMIN'],
  '/maitres': ['DIRECTEUR', 'ADMIN'],
  '/classes': ['MAITRE', 'DIRECTEUR', 'ADMIN'],
  '/eleves': ['MAITRE', 'DIRECTEUR', 'ADMIN', 'PARENT'],
  '/parents': ['DIRECTEUR', 'ADMIN'],
  '/matieres': ['DIRECTEUR', 'ADMIN'],
  '/examens': ['MAITRE', 'DIRECTEUR', 'ADMIN'],
  '/annee-scolaire': ['DIRECTEUR', 'ADMIN'],
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT to get role for route-level access control
  const payload = decodeJwtPayload(token);
  const role = payload?.role as string | undefined;

  if (role) {
    for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

