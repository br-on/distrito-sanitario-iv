'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        // Add options for email confirmation if needed
        // options: {
        //   emailRedirectTo: `${window.location.origin}/`,
        // },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmação.');
        // Optionally redirect or just show message
      } else if (data.session) {
        setMessage('Cadastro realizado com sucesso! Redirecionando...');
        // Redirect to a protected page or dashboard after successful signup
        router.push('/'); // Redirect to home for now
        router.refresh(); // Refresh server components
      } else {
         setMessage('Cadastro realizado! Verifique seu e-mail para confirmação, se aplicável.');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Cadastro</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="email">Email:</label><br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
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
            minLength={6} // Supabase requires a minimum password length
            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>Erro: {error}</p>}
        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
      </form>
      {/* Add link to Login page */}
      <p style={{ marginTop: '15px' }}>
        Já tem uma conta? <a href="/login">Faça login</a>
      </p>
    </div>
  );
}

