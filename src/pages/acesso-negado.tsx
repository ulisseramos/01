import React from 'react';

export default function AcessoNegadoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#020204',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      padding: 32,
    }}>
      <h1 style={{ fontSize: 38, fontWeight: 900, color: '#f87171', marginBottom: 12 }}>Acesso Negado</h1>
      <p style={{ fontSize: 20, color: '#fff', marginBottom: 32 }}>
        Você não tem permissão para acessar este recurso.<br/>
        Se acha que isso é um erro, entre em contato com o suporte.
      </p>
    </div>
  );
} 