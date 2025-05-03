'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) throw error;
      // Redirect to a protected page or dashboard after successful login
      router.push('/'); // Redirect to home for now
      router.refresh(); // Refresh server components
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label><br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px', color: 'black' }}
          />
        </div>
        <div>
          <label htmlFor="password">Senha:</label><br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '15px', color: 'black' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {error}</p>}
      </form>
      // Add link to Signup page
      <p style={{ marginTop: '15px' }}>
        Não tem uma conta? <a href="/signup">Cadastre-se</a>
      </p>
    </div>
  );
}