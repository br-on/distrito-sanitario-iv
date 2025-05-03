import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Mantenha esta importação

export async function GET(request) {
  const cookieStore = await cookies(); // Obtenha o cookieStore aqui

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value; // Use o cookieStore obtido
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options }); // Use o cookieStore obtido
          } catch (error) {}
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options }); // Use o cookieStore obtido
          } catch (error) {}
        },
      },
    }
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session Error:', sessionError);
      return NextResponse.json({ error: 'Erro ao obter sessão do usuário', details: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') { 
        return NextResponse.json({ error: 'Perfil não encontrado para este usuário.' }, { status: 404 });
      }
      console.error('Profile Fetch Error:', profileError);
      return NextResponse.json({ error: 'Erro ao buscar perfil do usuário', details: profileError.message }, { status: 500 });
    }

    if (!profile) {
        return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Unexpected GET Error:', error);
    return NextResponse.json({ error: 'Erro inesperado no servidor ao buscar perfil', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  const cookieStore = await cookies(); // Obtenha o cookieStore aqui

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value; // Use o cookieStore obtido
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options }); // Use o cookieStore obtido
          } catch (error) {}
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options }); // Use o cookieStore obtido
          } catch (error) {}
        },
      },
    }
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session Error:', sessionError);
      return NextResponse.json({ error: 'Erro ao obter sessão do usuário', details: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const profileData = await request.json();

    // Remove id and updated_at from the update payload
    const { id, updated_at, email, ...updateData } = profileData;
    
    if (updateData.cargo !== undefined && updateData.cargo === '') {
        delete updateData.cargo;
    }

    const { data, error: updateError } = await supabase
      .from('profile')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Profile Update Error:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar perfil do usuário', details: updateError.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Unexpected PATCH Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Formato JSON inválido no corpo da requisição' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro inesperado no servidor ao atualizar perfil', details: error.message }, { status: 500 });
  }
}
