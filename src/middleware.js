import { NextResponse } from 'next/server';
const { cookies } = require('next/headers');

export async function middleware(req) {
    const cookieStore = cookies();
    const token = cookieStore.get("Token");

  // Verifica si el token existe
  if (!token) {
    // Si no hay token, redirige a la página de login
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Si el token está presente, continúa con la solicitud
  return NextResponse.next();
}

// Definir las rutas que deben pasar por este middleware
export const config = {
  matcher: ['/dashboard/:path*'], // Rutas protegidas
};