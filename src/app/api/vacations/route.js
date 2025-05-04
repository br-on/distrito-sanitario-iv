import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Mantenha esta importação

// GET: Fetch vacation history for the logged-in user
export async function GET(request) {
  const cookieStore = await cookies(); // Obtenha o cookieStore aqui

  // Log para ver se o cookie do Supabase está presente
  const authToken = cookieStore.get("sb-rveslwkklqnrkupfvjlp-auth-token")?.value;

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
      console.error("Erro ao obter sessão:", sessionError); // Log 4
      console.error('Session Error:', sessionError);
      return NextResponse.json({ error: 'Erro ao obter sessão do usuário', details: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch vacations ordered by creation date (newest first)
    const { data: vacations, error: fetchError } = await supabase
      .from('vacations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Vacation Fetch Error:', fetchError);
      return NextResponse.json({ error: 'Erro ao buscar histórico de férias', details: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(vacations || []); // Return empty array if no vacations found

  } catch (error) {
    console.error('Unexpected GET Error:', error);
    return NextResponse.json({ error: 'Erro inesperado no servidor ao buscar férias', details: error.message }, { status: 500 });
  }
}

// POST: Create a new vacation request
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
    const requestData = await request.json();

    // Basic validation
    const { start_date, end_date, modality, request_details } = requestData;
    if (!start_date || !end_date || !modality) {
      return NextResponse.json({ error: 'Campos obrigatórios (data de início, data de fim, modalidade) não fornecidos.' }, { status: 400 });
    }

    // TODO: Add more validation (e.g., date logic, modality options)
    if (new Date(end_date) <= new Date(start_date)) {
        return NextResponse.json({ error: 'A data de fim deve ser posterior à data de início.' }, { status: 400 });
    }

    const newVacation = {
      user_id: userId,
      start_date,
      end_date,
      modality,
      request_details: request_details || null,
      status: 'Solicitado',
    };

    const { data, error: insertError } = await supabase
      .from('vacations')
      .insert(newVacation)
      .select()
      .single();

    if (insertError) {
      console.error('Vacation Insert Error:', insertError);
      return NextResponse.json({ error: 'Erro ao registrar solicitação de férias', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Unexpected POST Error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Formato JSON inválido no corpo da requisição' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro inesperado no servidor ao registrar férias', details: error.message }, { status: 500 });
  }
}