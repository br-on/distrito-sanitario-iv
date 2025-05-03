'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh(); // Ensure server components re-render
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {user ? (
        <div>
          <span>Logado como: {user.email}</span>
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

