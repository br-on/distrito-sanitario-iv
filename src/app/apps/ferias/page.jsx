"use client";

import { useState, useEffect, useCallback } from 'react';

export default function FeriasPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modality, setModality] = useState('30 dias'); // Default modality
  const [requestDetails, setRequestDetails] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch vacation history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const response = await fetch('/api/vacations', { credentials: 'include' });
      if (!response.ok) {
        const errorData = await response.json();
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

    // Basic client-side validation
    if (!startDate || !endDate) {
        setError('Por favor, preencha as datas de início e fim.');
        setSubmitting(false);
        return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
        setError('A data de fim deve ser posterior à data de início.');
        setSubmitting(false);
        return;
    }
    // TODO: Add more complex validation based on modality (e.g., 15 days duration)

    try {
      const response = await fetch('/api/vacations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ start_date: startDate, end_date: endDate, modality, request_details: requestDetails }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setSuccess('Solicitação de férias registrada com sucesso!');
      // Clear form
      setStartDate('');
      setEndDate('');
      setModality('30 dias');
      setRequestDetails('');
      // Refresh history
      fetchHistory(); 
    } catch (err) {
      setError(`Erro ao registrar solicitação: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <h2>Minhas Férias</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* Form for new request */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h3>Registrar Nova Solicitação</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="startDate">Data de Início:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', color: 'black' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="endDate">Data de Fim:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', color: 'black' }}
            />
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="modality">Modalidade:</label>
          <select
            id="modality"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', color:'black' }}
          >
            <option value="30 dias">30 dias corridos</option>
            <option value="15 dias (1/2)">15 dias (1ª parcela)</option>
            <option value="15 dias (2/2)">15 dias (2ª parcela)</option>
            <option value="10 dias (1/3)">10 dias (1ª parcela)</option>
            <option value="10 dias (2/3)">10 dias (2ª parcela)</option>
            <option value="10 dias (3/3)">10 dias (3ª parcela)</option>
            {/* Add more options if needed */}
          </select>
        </div>
         <div style={{ marginBottom: '15px' }}>
            <label htmlFor="requestDetails">Observações (opcional):</label>
            <textarea
              id="requestDetails"
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', color:'black' }}
            />
          </div>
        <button type="submit" disabled={submitting} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          {submitting ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </form>

      {/* Vacation History */}
      <div>
        <h3>Histórico de Solicitações</h3>
        {loadingHistory ? (
          <p>Carregando histórico...</p>
        ) : history.length === 0 ? (
          <p>Nenhuma solicitação de férias encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Início</th>
                <th style={tableHeaderStyle}>Fim</th>
                <th style={tableHeaderStyle}>Modalidade</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Solicitado em</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td style={tableCellStyle}>{new Date(item.start_date).toLocaleDateString('pt-BR')}</td>
                  <td style={tableCellStyle}>{new Date(item.end_date).toLocaleDateString('pt-BR')}</td>
                  <td style={tableCellStyle}>{item.modality}</td>
                  <td style={tableCellStyle}>{item.status}</td>
                  <td style={tableCellStyle}>{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Basic styles for table
const tableHeaderStyle = {
  borderBottom: '2px solid #ddd',
  padding: '10px',
  textAlign: 'left',
  backgroundColor: '#f9f9f9'
};

const tableCellStyle = {
  borderBottom: '1px solid #eee',
  padding: '10px',
};

