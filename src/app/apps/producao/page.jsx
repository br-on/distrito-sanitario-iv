"use client";

import { useState, useEffect, useCallback } from 'react';

// Helper function to get the start date (Monday) of the week for a given date
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

export default function ProducaoPage() {
  const [weekStartDate, setWeekStartDate] = useState(getWeekStartDate(new Date()));
  const [housesVisited, setHousesVisited] = useState(0);
  const [newPeopleRegistered, setNewPeopleRegistered] = useState(0);
  const [observations, setObservations] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch production history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const response = await fetch('/api/production', { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific errors like 403 Forbidden
        if (response.status === 403) {
            setError('Acesso não autorizado. Esta área é apenas para Agentes Comunitários de Saúde.');
            // Optionally redirect or disable form
            return; 
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(`Erro ao carregar histórico: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!weekStartDate) {
        setError('Por favor, selecione a data de início da semana.');
        setSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          week_start_date: weekStartDate,
          houses_visited: housesVisited,
          new_people_registered: newPeopleRegistered,
          observations: observations,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
         if (response.status === 403) {
            setError('Erro de permissão: Apenas Agentes Comunitários de Saúde podem registrar produção.');
         } else {
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
         }
      } else {
          setSuccess('Registro de produção salvo com sucesso!');
          // Clear form for next entry (optional: keep week start date?)
          // setWeekStartDate(getWeekStartDate(new Date())); 
          setHousesVisited(0);
          setNewPeopleRegistered(0);
          setObservations('');
          // Refresh history
          fetchHistory();
      }
    } catch (err) {
      // Avoid setting generic error if specific 403 error was already set
      if (!error) {
          setError(`Erro ao salvar registro: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Render form only if no critical error occurred during history fetch (like 403)
  const canShowForm = !error || !error.includes('Acesso não autorizado');

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <h2>Minha Produção Semanal</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Form for new record */} 
      {canShowForm && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
            <h3>Registrar Produção da Semana</h3>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="weekStartDate">Semana Iniciando em (Segunda-feira):</label>
              <input
                type="date"
                id="weekStartDate"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)} // Allow user to change week if needed
                required
                style={{ width: '100%', padding: '8px', color: 'black' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
               <div style={{ flex: 1 }}>
                <label htmlFor="housesVisited">Casas Visitadas:</label>
                <input
                  type="number"
                  id="housesVisited"
                  value={housesVisited}
                  onChange={(e) => setHousesVisited(Number(e.target.value) || 0)}
                  min="0"
                  style={{ width: '100%', padding: '8px', color: 'black' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="newPeopleRegistered">Novas Pessoas Cadastradas:</label>
                <input
                  type="number"
                  id="newPeopleRegistered"
                  value={newPeopleRegistered}
                  onChange={(e) => setNewPeopleRegistered(Number(e.target.value) || 0)}
                  min="0"
                  style={{ width: '100%', padding: '8px', color: 'black' }}
                />
              </div>
              {/* Add more input fields here based on the table structure */}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="observations">Observações (opcional):</label>
              <textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px', color: 'black' }}
              />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '10px 15px', cursor: 'pointer' }}>
              {submitting ? 'Salvando...' : 'Salvar Produção da Semana'}
            </button>
          </form>
      )}

      {/* Production History */} 
      <div>
        <h3>Histórico de Produção</h3>
        {loadingHistory ? (
          <p>Carregando histórico...</p>
        ) : history.length === 0 && !error ? (
          <p>Nenhum registro de produção encontrado.</p>
        ) : history.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Semana (Início)</th>
                <th style={tableHeaderStyle}>Casas Visitadas</th>
                <th style={tableHeaderStyle}>Novos Cadastros</th>
                {/* Add more headers corresponding to fields */}
                <th style={tableHeaderStyle}>Registrado em</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={tableCellStyle}>{new Date(item.week_start_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td style={tableCellStyle}>{item.houses_visited}</td>
                  <td style={tableCellStyle}>{item.new_people_registered}</td>
                  {/* Add more cells corresponding to fields */}
                  <td style={tableCellStyle}>{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null /* Don't show table if there was an error loading history */}
      </div>
    </div>
  );
}

// Basic styles for table (reuse from FeriasPage or define globally)
const tableHeaderStyle = {
  borderBottom: '2px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  backgroundColor: '#f9f9f9',
  color: 'black'
};

const tableCellStyle = {
  borderBottom: '1px solid #eee',
  padding: '10px',
};

