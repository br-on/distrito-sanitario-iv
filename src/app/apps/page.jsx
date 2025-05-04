"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUmbrellaBeach, FaClipboardList } from 'react-icons/fa'; // Importando os ícones


export default function AppsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific errors like 401 Unauthorized
        if (response.status === 401) {
            router.push('/login');
            return; // Stop execution if redirecting
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(`Erro ao carregar dados do usuário: ${err.message}`);
      // Optional: redirect on other critical errors if needed
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <p>Carregando aplicativos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!profile) {
    // This case might occur if fetchProfile completes without error but profile is still null
    return <p>Não foi possível carregar as informações do perfil para exibir os aplicativos.</p>;
  }

  // Determine user type from profile
  const userType = profile.cargo; // Using 'cargo' as the user type field

  // Define available apps and their required user types
  const apps = [
    {
      name: 'Minhas Férias',
      path: '/apps/ferias',
      allowedTypes: ['all'], // Accessible to everyone
      icon: <FaUmbrellaBeach />
    },
    {
      name: 'Minha Produção',
      path: '/apps/producao',
      allowedTypes: ['Agente Comunitário de Saúde'], // Specific type
      icon: <FaClipboardList />
    },
    // Add more apps here as needed
  ];

  // Filter apps based on user type
  const accessibleApps = apps.filter(app => 
    app.allowedTypes.includes('all') || app.allowedTypes.includes(userType)
  );

  return (
    <div>
      <Link href="/">
        <Button variant="secondary"> Voltar </Button>
      </Link>
      <br /><br />
      <h2 className="text-brand-400">Hub de Aplicativos</h2>
      {accessibleApps.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {accessibleApps.map(app => {
            // Encontrar o ícone correspondente ao aplicativo
            const userApp = apps.find(application => application.name === app.name);
  
            return (
              <li key={app.path} style={{ marginBottom: '10px' }}>
                <Link
                  href={app.path}
                  className="block w-full p-4 rounded-xl border border-border bg-brand-100 text-brand-400 hover:bg-brand-400 hover:text-brand-50 transition-colors shadow-sm"
                >
                  <span
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',  // Alinha os itens à esquerda
                      alignItems: 'center',          // Alinha verticalmente
                    }}
                  >
                    {userApp && (
                      <span style={{ marginRight: '10px', fontSize: '20px' }}>
                        {userApp.icon} {/* Ícone à esquerda e um pouco maior */}
                      </span>
                    )}
                    <span>{app.name}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nenhum aplicativo disponível para o seu tipo de usuário ({userType}).</p>
      )}
      <div style={{ marginTop: '20px' }}></div>
    </div>
  );
}

