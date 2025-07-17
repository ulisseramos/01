import Link from 'next/link';
import IntegrationsHeader from '../../components/IntegrationsHeader';
import { Zap, MousePointerClick, Link2, CheckCircle, Settings } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function IntegracoesPage() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState({ pushinpay: false, pixel: false, utmify: false });
  const [summary, setSummary] = useState({ ativas: 0, disponiveis: 0, emBreve: 0, recente: '' });
  const [loadingSummary, setLoadingSummary] = useState(true);
  // Estados para header funcional
  const [search, setSearch] = useState('');
  const [showDisponiveis, setShowDisponiveis] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const mainRef = useRef<HTMLDivElement>(null);

  // Lista de integrações (apenas as 3 permitidas)
  const allIntegrations = [
    {
      key: 'pushinpay',
      name: 'PushinPay',
      desc: 'Automatize pagamentos e integrações com a PushinPay.',
      status: 'disponivel',
      img: 'https://i.imgur.com/j4SjJw2.png',
      link: '/integracao/pushinpay',
    },
    {
      key: 'pixel',
      name: 'Facebook Pixel',
      desc: 'Configure o Pixel do Facebook Ads para rastreamento avançado.',
      status: 'disponivel',
      img: 'https://i.imgur.com/9fTxUzk.png',
      link: '/integracao/pixel',
    },
    {
      key: 'utmify',
      name: 'Utmify',
      desc: 'Gere e gerencie links UTM facilmente, rastreando...',
      status: 'disponivel',
      img: 'https://i.imgur.com/lXk5Fw0.png',
      link: '/integracao/utmify',
    },
  ];
  // Filtro funcional
  const filteredIntegrations = allIntegrations.filter(i => {
    if (showDisponiveis && i.status !== 'disponivel') return false;
    if (search.trim() && !(`${i.name} ${i.desc}`.toLowerCase().includes(search.trim().toLowerCase()))) return false;
    return true;
  });

  useEffect(() => {
    if (!user) return;
    setLoadingSummary(true);
    (async () => {
      const allProviders = [
        { key: 'pushinpay', name: 'PushinPay', status: 'disponivel' },
        { key: 'pixel', name: 'Facebook Pixel', status: 'disponivel' },
        { key: 'utmify', name: 'Utmify', status: 'disponivel' },
      ];
      let ativas = 0;
      let disponiveis = 0;
      let emBreve = 0;
      let recente = '';
      // Buscar integrações do usuário
      const { data, error } = await supabase
        .from('integrations')
        .select('provider, updated_at')
        .eq('user_id', user.id);
      // Só considera "ativa" se o provider está no allProviders e não é "em breve"
      const validProviders = allProviders.filter(p => p.status === 'disponivel').map(p => p.key);
      const activeProviders = (data || []).filter(i => validProviders.includes(i.provider));
      ativas = activeProviders.length;
      disponiveis = allProviders.filter(p => p.status === 'disponivel').length;
      emBreve = allProviders.filter(p => p.status === 'embreve').length;
      // Recente: só considera integrações válidas
      if (activeProviders.length > 0) {
        const sorted = [...activeProviders].sort((a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime());
        const last = sorted[0];
        const found = allProviders.find(p => p.key === last.provider);
        recente = found ? found.name : last.provider;
      }
      setSummary({ ativas, disponiveis, emBreve, recente });
      setLoadingSummary(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Busca integrações ativas do usuário no Supabase
      const { data, error } = await supabase
        .from('integrations')
        .select('provider')
        .eq('user_id', user.id);
      const active = (data || []).map(i => i.provider);
      setIntegrations({
        pushinpay: active.includes('pushinpay'),
        pixel: active.includes('pixel'),
        utmify: active.includes('utmify'),
      });
    })();
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined' && mainRef.current) {
      const html = document.documentElement;
      if (html.classList.contains('light')) {
        mainRef.current.style.background = '#fff';
      } else {
        mainRef.current.style.background = '#000';
      }
    }
    const observer = new MutationObserver(() => {
      if (mainRef.current) {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
          mainRef.current.style.background = '#fff';
        } else {
          mainRef.current.style.background = '#000';
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style jsx global>{`
        .visaoGeralResumoPreto {
          background: #020204;
          border: 2px solid #1A0938;
          border-radius: 22px;
          box-shadow: 0 6px 32px 0 rgba(26,9,56,0.10);
          padding: 20px 36px;
          margin: 32px 0 24px 0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          box-sizing: border-box;
        }
        .visaoGeralResumoPreto,
        .visaoGeralResumoPreto * {
          color: #fff !important;
        }
        .visaoGeralResumoPreto .resumoBadge {
          background: #020204;
          color: #a78bfa;
          border: 2px solid #a78bfa;
          border-radius: 12px;
          padding: 5px 22px;
          font-weight: 700;
          font-size: 16px;
          min-width: 70px;
          text-align: center;
          box-shadow: 0 2px 8px #1A093822;
          letter-spacing: 0.2px;
          display: inline-block;
        }
        @media (max-width: 600px) {
          .visaoGeralResumoPreto {
            padding: 16px 8px !important;
            flex-direction: column;
            gap: 18px;
          }
          .visaoGeralResumoPreto .resumoNumeros {
            gap: 18px;
          }
          .visaoGeralResumoPreto .resumoBadge {
            padding: 5px 12px;
            font-size: 15px;
            min-width: 50px;
          }
        }
      `}</style>
      <div ref={mainRef} style={{ minHeight: 'calc(100vh + 5cm)', background: '#000000', paddingBottom: 40 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>
          {/* Header de filtros e busca acima do bloco Visão Geral */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginBottom: 32,
            marginTop: 8,
            gap: 24,
          }}>
            {/* Título + ícone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Zap size={32} color="#a259f7" style={{ marginRight: 2 }} />
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', flex: 'none' }}>Integrações</h1>
            </div>
            {/* Filtros e busca */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end' }}>
              {/* Campo de busca funcional */}
              <div style={{
                position: 'relative',
                minWidth: 260,
                maxWidth: 340,
                width: 320,
                background: '#fff',
                borderRadius: 8,
                border: '1.5px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px 0 rgba(26,9,56,0.04)',
              }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontSize: 18 }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="7"/><line x1="17" y1="17" x2="13.5" y2="13.5"/></svg>
                <input
                  type="text"
                  placeholder="Buscar integrações..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#222',
                    fontSize: 16,
                    fontWeight: 500,
                    padding: '0.7rem 1rem 0.7rem 2.2rem',
                    borderRadius: 8,
                    width: '100%',
                  }}
                />
              </div>
              {/* Toggle Disponíveis funcional */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#222', fontSize: 15 }}>
                <input type="checkbox" checked={showDisponiveis} onChange={e => setShowDisponiveis(e.target.checked)} style={{ accentColor: '#a259f7', width: 22, height: 22, margin: 0 }} />
                Disponíveis
              </label>
              {/* Botões de visualização funcionais */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => setView('grid')} style={{ background: view === 'grid' ? '#a259f7' : '#fff', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: view === 'grid' ? '#fff' : '#a259f7', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #a259f733' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="5"/><rect x="10" y="3" width="5" height="5"/><rect x="3" y="10" width="5" height="5"/><rect x="10" y="10" width="5" height="5"/></svg>
                </button>
                <button onClick={() => setView('list')} style={{ background: view === 'list' ? '#a259f7' : '#fff', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: view === 'list' ? '#fff' : '#a259f7', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #a259f733' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="12" height="3"/><rect x="3" y="11" width="12" height="3"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="visaoGeralResumoPreto">
            <div style={{ display: 'flex', gap: 38, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Visão Geral</div>
              <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 24 }}>{loadingSummary ? '-' : summary.ativas}</span>
                  <span style={{ fontWeight: 500, fontSize: 16, marginLeft: 4 }}>Ativas</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 24 }}>{loadingSummary ? '-' : summary.disponiveis}</span>
                  <span style={{ fontWeight: 500, fontSize: 16, marginLeft: 4 }}>Disponíveis</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 24 }}>{loadingSummary ? '-' : summary.emBreve}</span>
                  <span style={{ fontWeight: 500, fontSize: 16, marginLeft: 4 }}>Em breve</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 500, marginRight: 8 }}>Recentes:</span>
              <span className="resumoBadge">{loadingSummary ? '-' : summary.recente || '-'}</span>
            </div>
          </div>
          {/* Renderização dos cards de integração, agora usando filteredIntegrations e view */}
          <div style={{ display: view === 'grid' ? 'flex' : 'block', flexWrap: view === 'grid' ? 'nowrap' : undefined, gap: 32, justifyContent: 'center', alignItems: 'flex-start', marginTop: 48, overflowX: view === 'grid' ? 'auto' : undefined }}>
            {filteredIntegrations.length === 0 && (
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 18, padding: 32 }}>Nenhuma integração encontrada.</div>
            )}
            {filteredIntegrations.map(i => (
              <Link key={i.key} href={i.link} passHref legacyBehavior>
                <a style={{
                  background: '#000',
                  borderRadius: 22,
                  border: '2px solid #1A0938',
                  boxShadow: '0 6px 32px 0 rgba(26,9,56,0.10)',
                  width: view === 'grid' ? 370 : '100%',
                  maxWidth: '100%',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: view === 'grid' ? 'column' : 'row',
                  alignItems: view === 'grid' ? 'flex-start' : 'center',
                  padding: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 180,
                  marginBottom: 24,
                }}>
                  {/* Badge de integração ativa no canto superior direito */}
                  {integrations[i.key] && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: '#052e16',
                      color: '#22c55e',
                      border: '1.5px solid #22c55e',
                      borderRadius: 8,
                      padding: '4px 16px',
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: '0 2px 8px #22c55e22',
                      zIndex: 3,
                    }}>
                      Ativa
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: view === 'grid' ? '20px 20px 0 20px' : '20px', width: view === 'grid' ? '100%' : 320 }}>
                    {i.img && (
                      <div style={{ position: 'relative', marginRight: 10, background: '#000', borderRadius: 12, border: '2.5px solid #1A0938', boxShadow: '0 2px 8px #1A093822', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={i.img} alt={i.name + ' Logo'} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        {i.status === 'disponivel' && <span style={{ position: 'absolute', top: -10, left: -8, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 11, borderRadius: 6, padding: '2px 8px', letterSpacing: 0.2, boxShadow: '0 1px 6px #22c55e33', zIndex: 2 }}>Disponível</span>}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.name}</div>
                      <div style={{ color: '#fff', fontWeight: 400, fontSize: 15, opacity: 0.95, maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.desc}</div>
                    </div>
                  </div>
                  {/* Botão e status só para disponíveis */}
                  {i.status === 'disponivel' && (
                    <div style={{ width: view === 'grid' ? '100%' : 220, padding: view === 'grid' ? '14px 20px 20px 20px' : '0 20px', marginTop: view === 'grid' ? 'auto' : 0, display: 'flex', justifyContent: 'center' }}>
                      <button
                        style={{ width: '70%', minWidth: 120, maxWidth: 220, background: '#1A0938', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 1px 8px #1A093822', margin: view === 'grid' ? '0 auto 0 1cm' : '0', transition: 'all 0.18s' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#120624'; e.currentTarget.style.transform = 'scale(1.04)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#1A0938'; e.currentTarget.style.transform = 'none'; }}
                      >
                        <Settings size={18} style={{ marginRight: 4 }} /> Gerenciar
                      </button>
                    </div>
                  )}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 