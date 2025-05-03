import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Mantenha esta importação

// GET: Fetch production records for the logged-in agent
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

    // Fetch profile to verify user type (although RLS should handle security)
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('cargo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Erro ao buscar perfil ou perfil não encontrado.' }, { status: 500 });
    }

    if (profile.cargo !== 'Agente Comunitário de Saúde') {
        return NextResponse.json({ error: 'Acesso não autorizado para este tipo de usuário.' }, { status: 403 });
    }

    // Fetch production records ordered by week start date (newest first)
    const { data: records, error: fetchError } = await supabase
      .from('production_records')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });

    if (fetchError) {
      console.error('Production Fetch Error:', fetchError);
      return NextResponse.json({ error: 'Erro ao buscar registros de produção', details: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(records || []); // Return empty array if no records found

  } catch (error) {
    console.error('Unexpected GET Error:', error);
    return NextResponse.json({ error: 'Erro inesperado no servidor ao buscar produção', details: error.message }, { status: 500 });
  }
}

// POST: Create a new production record
export async function POST(request) {
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

    // Verify user type before allowing insertion (double check with RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('cargo')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Erro ao buscar perfil ou perfil não encontrado.' }, { status: 500 });
    }

    if (profile.cargo !== 'Agente Comunitário de Saúde') {
        return NextResponse.json({ error: 'Acesso não autorizado para registrar produção.' }, { status: 403 });
    }

    const requestData = await request.json();

    // Basic validation
    const { week_start_date, houses_visited, new_people_registered, observations } = requestData;
    if (!week_start_date) {
      return NextResponse.json({ error: 'Campo obrigatório (Data de início da semana) não fornecido.' }, { status: 400 });
    }

    // Ensure numeric fields are numbers or default to 0
    const housesVisitedNum = Number(houses_visited) || 0;
    const newPeopleRegisteredNum = Number(new_people_registered) || 0;

    const newRecord = {
      user_id: userId,
      week_start_date,
      houses_visited: housesVisitedNum,
      new_people_registered: newPeopleRegisteredNum,
      observations: observations || null,
      // Add other fields from requestData here if they exist
    };

    const { data, error: insertError } = await supabase
      .from('production_records')
      .insert(newRecord)
      .select()
      .single(); // Expecting a single row insert

    if (insertError) {
      console.error('Production Insert Error:', insertError);
      if (insertError.code === '42501') { // RLS violation error code
          return NextResponse.json({ error: 'Erro de permissão ao registrar produção. Verifique seu tipo de usuário.', details: insertError.message }, { status: 403 });
      }
      return NextResponse.json({ error: 'Erro ao registrar produção semanal', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 }); // Return created record with 201 status

  } catch (error) {
    console.error('Unexpected POST Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Formato JSON inválido no corpo da requisição' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro inesperado no servidor ao registrar produção', details: error.message }, { status: 500 });
  }
}
