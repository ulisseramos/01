import { Zap, Type, Code, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function PushinPayIntegracao() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ nome: '', apiKey: '' });
  const [search, setSearch] = useState('');
  const [loadingIntegration, setLoadingIntegration] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setLoadingIntegration(true);
    // Buscar integração do Supabase
    supabase
      .from('integrations')
      .select('name, pushinpay_api_key')
      .eq('user_id', user.id)
      .eq('provider', 'pushinpay')
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            nome: data.name || '',
            apiKey: data.pushinpay_api_key || '',
          });
        }
        setLoadingIntegration(false);
      });
  }, [user]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('integrations')
      .upsert({
        user_id: user.id,
        provider: 'pushinpay',
        name: form.nome,
        pushinpay_api_key: form.apiKey,
        api_token: form.apiKey,
      }, { onConflict: 'user_id,provider' });
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar integração: ' + error.message);
    } else {
      toast.success('Chave atualizada com sucesso!');
      // O estado já está atualizado, então o bloco "Chave atual" reflete o novo valor
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh + 5cm)',
      background: '#020204',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }}>
      <div style={{ maxWidth: 1240, width: '100%' }}>
        {/* Botão de voltar */}
        <button
          type="button"
          onClick={() => router.push('/integracao')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#1A0938', fontWeight: 700, fontSize: 16, marginBottom: 24, cursor: 'pointer', padding: 0, transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#fff')}
          onMouseOut={e => (e.currentTarget.style.color = '#1A0938')}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          Voltar
        </button>
        {/* Card principal */}
        <div style={{ background: '#000', borderRadius: 22, border: '1px solid #1A0938', padding: 36, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div style={{ background: '#181c2a', borderRadius: 12, padding: 8, boxShadow: '0 2px 8px #7c3aed22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="https://i.imgur.com/Z0wei2J.png" alt="PushinPay Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8, background: '#fff', marginRight: 8 }} />
              <Zap size={28} color="#7c3aed" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, color: '#f8fafc', letterSpacing: -1 }}>Integração PushinPay</span>
          </div>
          <div style={{ color: '#a1a1aa', fontWeight: 500, fontSize: 16, marginBottom: 18, opacity: 0.95 }}>
            Configure sua integração com a PushinPay abaixo.
          </div>
          {/* Bloco mostrando a chave atual, se existir */}
          {form.apiKey && (
            <div style={{ marginBottom: 18, padding: 14, background: '#000', borderRadius: 10, border: '1px solid #1A0938', color: '#f8fafc', fontSize: 15 }}>
              <span style={{ fontWeight: 700 }}>Chave atual:</span> <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{form.apiKey.slice(0, 4) + '****' + form.apiKey.slice(-4)}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>Nome da conta*</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1A0938', borderRadius: 10, marginBottom: 18, padding: '0 14px' }}>
              <Type size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.nome}
                onChange={e => handleChange('nome', e.target.value)}
                placeholder="Ex: Conta do João, BM e etc"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
                required
              />
            </div>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>Cole aqui a Api key da PushinPay*</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1A0938', borderRadius: 10, marginBottom: 28, padding: '0 14px' }}>
              <Code size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.apiKey}
                onChange={e => handleChange('apiKey', e.target.value)}
                placeholder="Ex: 1234567890"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#1A0938',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                borderRadius: 12,
                border: '1px solid #1A0938',
                padding: '14px 0',
                cursor: saving ? 'not-allowed' : 'pointer',
                minWidth: 160,
                marginTop: 10,
                boxShadow: '0 2px 12px #1A093822',
                transition: 'all 0.18s',
                width: '100%',
                letterSpacing: 0.5,
                opacity: saving ? 0.7 : 1,
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#120624'; e.currentTarget.style.transform = 'scale(1.04)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#1A0938'; e.currentTarget.style.transform = 'none'; }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>
        {/* Seção de tokens/dados (exemplo) */}
        <div style={{ background: '#10121b', borderRadius: 18, boxShadow: '0 2px 16px #0006', padding: 32, border: '1.5px solid #23233a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>Tokens de integração</span>
            <button style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 10, border: 'none', padding: '10px 28px', cursor: 'pointer', boxShadow: '0 2px 8px #7c3aed22', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={20} /> Adicionar
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por palavra-chave"
              style={{ flex: 1, borderRadius: 8, border: '1.5px solid #23233a', padding: '10px 14px', fontSize: 15, background: '#181c2a', color: '#f8fafc' }}
            />
            <button style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Search size={20} color="#fff" />
            </button>
          </div>
          <div style={{ border: '1.5px solid #23233a', borderRadius: 10, overflow: 'hidden', background: '#181c2a' }}>
            <div style={{ display: 'flex', fontWeight: 700, color: '#f8fafc', fontSize: 15, background: '#181c2a', padding: '12px 18px' }}>
              <div style={{ flex: 2 }}>DESCRIÇÃO</div>
              <div style={{ flex: 2 }}>TOKEN</div>
            </div>
            <div style={{ color: '#a1a1aa', fontWeight: 600, fontSize: 16, textAlign: 'center', padding: '32px 0' }}>
              Sem dados para exibir no momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 