import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Vérifier si la route est de déconnexion, dans ce cas laisser passer
  if (request.nextUrl.pathname === '/auth/logout') {
    return NextResponse.next();
  }

  // Lister les routes protégées explicitement
  const protectedRoutes = ['/create', '/dashboard', '/stories'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );
  
  // Vérifier si c'est une route protégée ou dans le dossier (protected)
  const requiresAuth = isProtectedRoute || request.nextUrl.pathname.startsWith('/(protected)');
  
  // Si ce n'est pas une route protégée, laisser passer
  if (!requiresAuth) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Vérifier la session de manière stricte
  const { data: { session }, error } = await supabase.auth.getSession()

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!session || error) {
    console.log('Middleware: Session non valide pour route protégée:', request.nextUrl.pathname);
    
    // Nettoyer TOUS les cookies de session
    for (const cookie of request.cookies.getAll()) {
      response.cookies.set({
        name: cookie.name,
        value: '',
        expires: new Date(0),
        path: '/',
      });
    }

    // Ajouter le paramètre de redirection pour revenir après la connexion
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname.replace('/(protected)', ''))
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/(protected)/:path*', 
    '/auth/logout',
    '/create',
    '/create/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/stories',
    '/stories/:path*'
  ],
} 