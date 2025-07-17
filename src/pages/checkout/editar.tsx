/**
 * Melhorias visuais: cabeçalho destacado, botões e ícones maiores, tabela com linhas alternadas e hover, espaçamento e tipografia modernos.
 */
import MainLayout from '../../components/MainLayout';
import { CreditCard, Edit, Trash2, Copy } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { nanoid } from 'nanoid';

const PAGE_SIZE = 5;

export default function EditarCheckout() {
  const router = useRouter();
  const { user } = useAuth();
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  // Remover o estado do modal e produto selecionado
  const [showSelectProduto, setShowSelectProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const creatingRef = React.useRef(false);

  useEffect(() => {
    async function fetchProdutos() {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setProdutos(data || []);
      setLoading(false);
    }
    fetchProdutos();
  }, [user]);

  useEffect(() => {
    // Resetar o formulário ao acessar a página de criação
    setBusca("");
    // Se você tiver um estado para o formulário de criação, resete ele aqui também
    // Exemplo: setForm({ campo1: '', campo2: '', ... })
  }, []);

  const produtosFiltrados = produtos.filter(produto =>
    produto.is_checkout && produto.name && produto.name.toLowerCase().includes(busca.toLowerCase())
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / PAGE_SIZE);
  const produtosPagina = produtosFiltrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  function handleAnterior() {
    setPagina((p) => Math.max(1, p - 1));
  }
  function handleProxima() {
    setPagina((p) => Math.min(totalPaginas, p + 1));
  }

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(1);
  }, [totalPaginas]);

  return (
    <MainLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '12px 0 32px 0', paddingLeft: 8, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
        <CreditCard size={38} style={{ color: '#a78bfa' }} />
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 600, textAlign: 'left', margin: 0, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Editar Checkout</h1>
      </div>
      <div style={{ maxWidth: 1200, margin: '40px auto', background: '#050509', borderRadius: 22, boxShadow: '0 8px 40px #000a', padding: 40, border: '2px solid #1A0938', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
        <div style={{ background: 'transparent', border: '2px solid #1A0938', borderRadius: 12, padding: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 12px #0004', transition: 'box-shadow 0.18s', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, background: '#1A0938', color: '#fff', border: '2px solid #1A0938', borderRadius: 10, padding: '1.2rem 1.5rem', fontSize: 16, fontWeight: 400, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: 0.15, boxShadow: 'none', outline: 'none', transition: 'border 0.18s, box-shadow 0.18s' }}
            onFocus={e => e.target.style.border = '2px solid #a78bfa'}
            onBlur={e => e.target.style.border = '2px solid #1A0938'}
          />
          <button 
            onClick={() => {
              router.push('/checkout/editar/novo');
            }}
            style={{ background: '#1A0938', color: '#fff', fontWeight: 600, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: 17, letterSpacing: 0.15, border: '2px solid #1A0938', borderRadius: 10, padding: '1.1rem 2.4rem', cursor: 'pointer', boxShadow: '0 2px 8px #0003', transition: 'background 0.18s, box-shadow 0.18s', display: 'flex', alignItems: 'center', gap: 10 }}
            onMouseOver={e => { e.currentTarget.style.background = '#18122B'; e.currentTarget.style.boxShadow = '0 4px 16px #a78bfa44'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#1A0938'; e.currentTarget.style.boxShadow = '0 2px 8px #0003'; }}
          >
            <span style={{ fontSize: 22, fontWeight: 600, marginRight: 6, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>+</span> Novo checkout
          </button>
        </div>
        <div style={{ borderRadius: 12, background: '#231a3a', marginTop: 0, boxShadow: 'none', padding: 0, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, color: '#fff', borderRadius: 12, overflow: 'hidden', border: '2px solid #1A0938', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
            <thead>
              <tr style={{ background: '#1A0938' }}>
                <th style={{ padding: '16px 10px', textAlign: 'left', fontWeight: 600, color: '#b3b3b3', fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Nome</th>
                <th style={{ padding: '16px 10px', textAlign: 'left', fontWeight: 600, color: '#b3b3b3', fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Link</th>
                <th style={{ padding: '16px 10px', textAlign: 'center', fontWeight: 600, color: '#b3b3b3', fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Status</th>
                <th style={{ padding: '16px 10px', textAlign: 'center', fontWeight: 600, color: '#b3b3b3', fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Editar</th>
                <th style={{ padding: '16px 10px', textAlign: 'center', fontWeight: 600, color: '#b3b3b3', fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#b3b3b3', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 400, fontSize: 16 }}>Carregando...</td></tr>
              ) : produtosPagina.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#b3b3b3', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 400, fontSize: 16 }}>Nenhum produto encontrado.</td></tr>
              ) : (
                produtosPagina.map((produto, idx) => {
                  const linkCheckout = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + `/checkout/${produto.public_id}`;
                  return (
                    <tr key={produto.id} style={{ borderBottom: '1px solid #18122b', background: '#050509', transition: 'background 0.18s', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                      <td style={{ padding: '14px 10px', fontWeight: 600, fontSize: 16, letterSpacing: 0.1, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{produto.offer_title || 'Sem título'}</td>
                      <td style={{ padding: '14px 10px', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                        <a
                          href={`/checkout/${produto.public_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#a78bfa', textDecoration: 'underline', fontWeight: 600, fontSize: 15, marginRight: 8, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}
                        >
                          Abrir checkout
                        </a>
                        <input
                          type="text"
                          value={linkCheckout}
                          readOnly
                          style={{ background: '#F4F4F5', color: '#18181B', border: 'none', borderRadius: 12, padding: '0.7rem 1.1rem', fontSize: 15, width: 240, marginRight: 10, fontWeight: 500, letterSpacing: 0.1, outline: 'none', boxShadow: 'none', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}
                        />
                        <button
                          style={{ background: '#F4F4F5', border: 'none', borderRadius: 12, padding: 8, cursor: 'pointer', transition: 'background 0.18s', display: 'flex', alignItems: 'center' }}
                          title="Copiar"
                          onClick={() => navigator.clipboard.writeText(linkCheckout)}
                        >
                          <Copy size={20} color="#18181B" />
                        </button>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '50%' }} title="Aprovado">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                            <path d="M8 12.5L11 15.5L16 10.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                        <button
                          style={{ background: '#1A0938', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', transition: 'background 0.18s', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 600, fontSize: 15 }}
                          title="Editar Checkout"
                          onClick={() => router.push(`/checkout/editar/${produto.id}`)}
                        >
                          <Edit size={20} color="#b3b3b3" />
                          <span style={{ color: '#b3b3b3', fontWeight: 600, fontSize: 15, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Editar Checkout</span>
                        </button>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
                        <button 
                          style={{ background: '#1A0938', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', transition: 'background 0.18s', fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }} 
                          title="Excluir"
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir este checkout?')) {
                              await supabase.from('products').delete().eq('id', produto.id);
                              // Atualiza a lista após excluir
                              const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                              setProdutos(data || []);
                            }
                          }}
                        >
                          <Trash2 size={20} color="#b71c1c" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 36, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
          <button onClick={handleAnterior} disabled={pagina === 1} style={{ background: '#1A0938', color: '#b3b3b3', border: 'none', borderRadius: 8, padding: '0.9rem 2.1rem', fontWeight: 600, fontSize: 16, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', cursor: 'pointer', opacity: pagina === 1 ? 0.5 : 1, transition: 'all 0.18s' }}>Anterior</button>
          <span style={{ color: '#b3b3b3', fontWeight: 600, fontSize: 16, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Página {pagina} de {totalPaginas}</span>
          <button onClick={handleProxima} disabled={pagina === totalPaginas} style={{ background: '#1A0938', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9rem 2.1rem', fontWeight: 600, fontSize: 16, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', cursor: 'pointer', opacity: pagina === totalPaginas ? 0.5 : 1, transition: 'all 0.18s' }}>Próxima</button>
        </div>
      </div>
      {modalOpen && produtoSelecionado && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl p-0 bg-[#18122b] border-2 border-[#1A0938] rounded-2xl shadow-2xl text-white font-inter">
            {/* Botão de fechar já incluso no DialogContent */}
            {/* Coloque aqui o seu formulário de edição/criação de checkout para o produtoSelecionado */}
            <div style={{ padding: 32 }}>
              <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 24 }}>Editar Checkout de: {produtos.find(p => p.id === produtoSelecionado)?.name}</h2>
              {/* ...seu formulário real aqui... */}
              <div style={{ color: '#fff', fontSize: 16 }}>
                <div><b>ID:</b> {produtoSelecionado}</div>
                {/* Adicione os campos de edição reais aqui */}
              </div>
              <button onClick={() => setModalOpen(false)} style={{ marginTop: 32, background: '#a78bfa', color: '#18122b', border: 'none', borderRadius: 8, padding: '0.7rem 1.3rem', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Fechar</button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
} 