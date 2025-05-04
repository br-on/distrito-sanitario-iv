'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const [cpf, setCpf] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      const loggedUser = session?.user ?? null;
      setUser(loggedUser);

      if (loggedUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profile')
          .select('cpf')
          .eq('id', loggedUser.id)
          .single();


        if (profileError) {
          console.error('Erro ao buscar CPF:', profileError.message);
          setCpf('Não encontrado');
        } else {
          setCpf(profileData?.cpf ?? 'Não encontrado');
        }
      } else {
        setCpf(null);  // Caso não esteja logado, limpar o CPF
      }

      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedUser = session?.user ?? null;
      setUser(loggedUser);

      if (loggedUser) {
        supabase
          .from('profile')
          .select('cpf')
          .eq('id', loggedUser.id)
          .single()
          .then(({ data, error }) => {
            if (!error) {
              setCpf(data?.cpf ?? 'Não encontrado');
            }
          });
      } else {
        setCpf(null);  // Caso o usuário saia, limpa o CPF
      }

      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {user ? (
        <div>
          <span>CPF: {cpf || 'Não encontrado'}</span>
          <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '5px 10px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      ) : (
        <span>Você não está logado. <a href="/login">Entrar</a> ou <a href="/signup">Cadastrar</a></span>
      )}
    </div>
  );
}
