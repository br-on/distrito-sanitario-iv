"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/profile', { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Format date fields for input type="date"
      if (data.data_nascimento) {
        data.data_nascimento = data.data_nascimento.split('T')[0];
      }
      if (data.data_admissao) {
        data.data_admissao = data.data_admissao.split('T')[0];
      }
      setProfile(data);
    } catch (err) {
      setError(`Erro ao carregar perfil: ${err.message}`);
      if (err.message.includes('Usuário não autenticado')) {
        router.push('/login'); // Redirect if not authenticated
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const updatedProfile = await response.json();
       // Re-format date fields after update if necessary
      if (updatedProfile.data_nascimento) {
        updatedProfile.data_nascimento = updatedProfile.data_nascimento.split('T')[0];
      }
      if (updatedProfile.data_admissao) {
        updatedProfile.data_admissao = updatedProfile.data_admissao.split('T')[0];
      }
      setProfile(updatedProfile);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(`Erro ao salvar perfil: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Carregando perfil...</p>;
  }

  if (error && !profile) {
    // Show error only if profile couldn't be loaded at all
    return <p style={{ color: 'red' }}>{error}</p>;
  }
  
  if (!profile) {
      // Handle case where profile is null after loading without specific error
      // This might happen if the API returns 404 but fetchProfile catches it generically
      return <p>Não foi possível carregar o perfil. Tente recarregar a página.</p>;
  }

  // Define field labels for better readability
  const fieldLabels = {
    unidade_saude: 'Unidade de Saúde',
    cnes: 'CNES',
    equipe: 'Equipe',
    ine: 'INE (Identificador Nacional de Equipe)',
    microarea: 'Microárea',
    nome_completo: 'Nome Completo',
    cpf: 'CPF',
    data_nascimento: 'Data de Nascimento',
    contato_telefone: 'Contato (Telefone)',
    email_secundario: 'Email Secundário',
    matricula: 'Matrícula',
    cargo: 'Cargo (Tipo de Usuário)',
    vinculo: 'Vínculo',
    data_admissao: 'Data de Admissão',
  };

  return (
    <div style={{ maxWidth: '700px', margin: '20px auto' }}>
      <Link href="/">
      <Button variant="secondary">  
        Voltar </Button>
      </Link>
      <center><h1>Meu Perfil</h1></center>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'black' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {Object.keys(fieldLabels).map((key) => (
          <div key={key}>
            <label htmlFor={key} style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color:'black' }}>
              {fieldLabels[key]}:
            </label>
            <input
              type={key.includes('data_') ? 'date' : key.includes('email') ? 'email' : 'text'}
              id={key}
              name={key}
              value={profile[key] || ''} // Handle null/undefined values
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', color: 'blue' }}
              // Disable cargo field for now, assuming it's set by admin?
              // Or add logic based on user role if needed
              disabled={key === 'cargo'} 
            />
             {key === 'cargo' && <small style={{display: 'block', marginTop: '3px'}}>O cargo é definido pelo administrador.</small>}
          </div>
        ))}

        <button type="submit" disabled={saving} style={{ padding: '10px 15px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}

