import MainLayout from '../../components/MainLayout';
import { CreditCard, Edit, Trash2, Copy } from 'lucide-react';
import React, { useState } from 'react';

const mockCheckouts = [
  { id: 1, nome: 'Checkout 1', link: 'http://localhost:3000/checkout/1', criadoEm: '10/07/2025', status: 'ativo' },
  { id: 2, nome: 'Checkout 2', link: 'http://localhost:3000/checkout/2', criadoEm: '11/07/2025', status: 'inativo' },
  { id: 3, nome: 'Checkout 3', link: 'http://localhost:3000/checkout/3', criadoEm: '12/07/2025', status: 'ativo' },
];

export default function ListaCheckouts() {
  const [busca, setBusca] = useState('');
  const [checkouts, setCheckouts] = useState(mockCheckouts);

  return (
    <MainLayout>
      <div style={{ maxWidth: 1200, margin: '40px auto', background: '#09090B', borderRadius: 18, boxShadow: '0 4px 32px #0008', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <CreditCard size={36} style={{ color: '#a78bfa', marginRight: 12 }} />
          <div>
            <h1 style={{ color: '#fff', fontSize: 32, fontWeight: 800, margin: 0 }}>Checkouts</h1>
            <span style={{ color: '#b3b3b3', fontSize: 16 }}>Visualize e gerencie todos seus checkouts.</span>
          </div>
          <button style={{ marginLeft: 'auto', background: '#2d2250', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 10, padding: '0.7rem 1.6rem', cursor: 'pointer', transition: 'background 0.18s', boxShadow: '0 2px 8px #a78bfa22' }}>
            + Novo Checkout
          </button>
        </div>
        <div style={{ margin: '32px 0 18px 0', display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="Buscar checkout..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, background: '#1a1625', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 1.2rem', fontSize: 16 }}
          />
          <button style={{ background: '#2d2250', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '0.9rem 1.6rem', cursor: 'pointer', transition: 'background 0.18s' }}>
            + Novo Checkout
          </button>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 12, background: '#18122b', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ background: '#231a3a' }}>
                <th style={{ padding: '16px 8px', textAlign: 'left', fontWeight: 700, color: '#b3b3b3' }}>Nome</th>
                <th style={{ padding: '16px 8px', textAlign: 'left', fontWeight: 700, color: '#b3b3b3' }}>Link</th>
                <th style={{ padding: '16px 8px', textAlign: 'left', fontWeight: 700, color: '#b3b3b3' }}>Criado em</th>
                <th style={{ padding: '16px 8px', textAlign: 'center', fontWeight: 700, color: '#b3b3b3' }}>Status</th>
                <th style={{ padding: '16px 8px', textAlign: 'center', fontWeight: 700, color: '#b3b3b3' }}>Editar</th>
                <th style={{ padding: '16px 8px', textAlign: 'center', fontWeight: 700, color: '#b3b3b3' }}>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.map((checkout) => (
                <tr key={checkout.id} style={{ borderBottom: '1px solid #23233a' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{checkout.nome}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <input
                      type="text"
                      value={checkout.link}
                      readOnly
                      style={{ background: '#23233a', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 0.8rem', fontSize: 15, width: 220, marginRight: 8 }}
                    />
                    <button style={{ background: '#23233a', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="Copiar">
                      <Copy size={18} color="#fff" />
                    </button>
                  </td>
                  <td style={{ padding: '12px 8px', color: '#b3b3b3', fontSize: 15 }}>{checkout.criadoEm}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    {checkout.status === 'ativo' ? (
                      <span style={{ color: '#22c55e', fontSize: 20 }}>✔</span>
                    ) : (
                      <span style={{ color: '#facc15', fontSize: 20 }}>✖</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <button style={{ background: '#23233a', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="Editar">
                      <Edit size={18} color="#a78bfa" />
                    </button>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <button style={{ background: '#1a0918', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer' }} title="Excluir">
                      <Trash2 size={18} color="#f87171" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 32 }}>
          <button style={{ background: '#231a3a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontWeight: 600, cursor: 'pointer', opacity: 0.7 }}>Anterior</button>
          <span style={{ color: '#b3b3b3', fontWeight: 600 }}>Página 1 de 1</span>
          <button style={{ background: '#231a3a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.4rem', fontWeight: 600, cursor: 'pointer' }}>Próxima</button>
        </div>
      </div>
    </MainLayout>
  );
} 