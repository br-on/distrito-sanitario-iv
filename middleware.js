import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Importar cookies daqui

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieStore = await cookies(); // Obter cookieStore com await

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value; // Usar cookieStore
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options }); // Usar cookieStore
          } catch (error) {
            // Em um ambiente somente leitura como o middleware, erros de 'set' podem ocorrer
            // mas geralmente podem ser ignorados se a intenção principal é ler/validar
          }
        },
        remove(name, options) {
          try {
            // Tentar remover usando cookieStore
            cookieStore.set({ name, value: '', ...options }); // Usar cookieStore para remover
          } catch (error) {
            // Ignorar erros em ambiente somente leitura
          }
        },
      },
    }
  );

  // Refresh session - crucial step!
  // Isso tentará ler o cookie via 'get' e potencialmente atualizar via 'set'/'remove'
  await supabase.auth.getSession();

  // Lógica de redirecionamento removida para simplificar

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
