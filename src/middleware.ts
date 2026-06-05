import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase-middleware'

// Routes publiques (accessibles sans connexion)
const PUBLIC_ROUTES = ['/login', '/signup', '/auth/callback']

// Routes réservées aux admins
const ADMIN_ROUTES = ['/admin']

// Routes réservées aux accompagnateurs ET admins (pas aux startups seules)
// Les startups voient leurs propres projets via la vérification en DB, pas ici

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Laisser passer les routes publiques
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Laisser passer les fichiers statiques et API Next.js internes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })
  const supabase = createSupabaseMiddlewareClient(request, response)

  // Vérifier la session
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Pas connecté → redirection vers /login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Récupérer le rôle depuis la table profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'user_startup'

  // Protection des routes /admin → réservé aux admins uniquement
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Ajouter le rôle dans les headers pour les Server Components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-role', role)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    /*
     * Matcher sur toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}