import { Link2, Save, Send } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

const UTMIFY_TOKEN_KEY = 'utmify_api_token';

export default function UTMifyIntegracao() {
  const router = useRouter();
  const { user } = useAuth();
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Buscar token salvo no banco ao entrar na página
  useEffect(() => {
    const fetchToken = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('integrations')
        .select('api_token')
        .eq('user_id', user.id)
        .eq('provider', 'utmify')
        .single();
      if (data?.api_token) {
        setToken(data.api_token);
        localStorage.setItem(UTMIFY_TOKEN_KEY, data.api_token);
      }
      setLoading(false);
    };
    fetchToken();
  }, [user]);

  // Salvar token no banco de dados
  const handleSaveToken = async () => {
    if (!token) {
      toast.error('Informe o token da API UTMify!');
      return;
    }
    if (!user) {
      toast.error('Usuário não autenticado!');
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'utmify', api_token: token }, { onConflict: 'user_id,provider' });
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar integração: ' + error.message);
    } else {
      localStorage.setItem(UTMIFY_TOKEN_KEY, token);
      toast.success('Token salvo com sucesso!');
    }
  };

  // Envia evento real ou de teste para a UTMify direto do frontend
  const handleSendToUtmify = async (isTest = true) => {
    setLoading(true);
    setTestResult(null);
    const payload = {
      orderId: isTest ? 'TESTE-UTMIFY-123' : 'PEDIDO-REAL-001',
      platform: 'SeuSistema',
      paymentMethod: 'pix',
      status: isTest ? 'waiting_payment' : 'paid',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      approvedDate: isTest ? null : new Date().toISOString().slice(0, 19).replace('T', ' '),
      refundedAt: null,
      customer: {
        name: isTest ? 'Teste UTMify' : 'Cliente Real',
        email: isTest ? 'teste@utmify.com' : 'cliente@exemplo.com',
        phone: null,
        document: null,
        country: 'BR',
        ip: '127.0.0.1',
      },
      products: [
        {
          id: isTest ? 'PROD-TESTE' : 'PROD-REAL',
          name: isTest ? 'Produto Teste' : 'Produto Real',
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: 1000,
        },
      ],
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null,
      },
      commission: {
        totalPriceInCents: 1000,
        gatewayFeeInCents: 0,
        userCommissionInCents: 1000,
        currency: 'BRL',
      },
      isTest,
    };
    try {
      const res = await fetch('https://api.utmify.com.br/api-credentials/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': token,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult('Enviado com sucesso! Resposta: ' + JSON.stringify(data));
        toast.success('Enviado para a UTMify!');
        console.log('Resposta da UTMify:', data);
      } else {
        setTestResult('Erro: ' + (data?.error || JSON.stringify(data)));
        toast.error('Erro ao enviar: ' + (data?.error || 'Verifique o token.'));
        console.error('Erro da UTMify:', data);
      }
    } catch (err: any) {
      setTestResult('Erro inesperado: ' + err.message);
      toast.error('Erro inesperado: ' + err.message);
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh + 5cm)', background: '#020204', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <div style={{ maxWidth: 600, width: '100%', background: '#020204', borderRadius: 22, border: '1px solid #1A0938', padding: 36 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <div style={{ background: '#000', borderRadius: 12, padding: 8 }}>
            <Link2 size={28} color="#1A0938" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 26, color: '#f8fafc', letterSpacing: -1 }}>Integração UTMify</span>
        </div>
        <div style={{ color: '#a1a1aa', fontWeight: 500, fontSize: 16, marginBottom: 18, opacity: 0.95 }}>
          Configure sua integração com a UTMify para rastreamento avançado de vendas e campanhas.
        </div>
        <form onSubmit={e => { e.preventDefault(); handleSaveToken(); }} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>Token da API UTMify*</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1A0938', borderRadius: 10, marginBottom: 18, padding: '0 14px' }}>
            <Link2 size={22} color="#1A0938" />
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Cole aqui seu token da UTMify"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
              required
            />
            <button type="submit" style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer' }} title="Salvar integração" disabled={saving}>
              <Save size={22} color={saving ? '#a1a1aa' : '#22c55e'} />
            </button>
          </div>
          <button
            type="button"
            onClick={handleSaveToken}
            disabled={saving || !token}
            style={{
              background: '#1A0938',
              color: '#fff',
              fontWeight: 800,
              fontSize: 18,
              borderRadius: 12,
              border: '1px solid #1A0938',
              padding: '14px 0',
              cursor: saving || !token ? 'not-allowed' : 'pointer',
              minWidth: 160,
              marginBottom: 10,
              boxShadow: '0 2px 12px #1A093822',
              transition: 'all 0.18s',
              width: '100%',
              letterSpacing: 0.5,
              opacity: saving || !token ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#120624'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#1A0938'; e.currentTarget.style.transform = 'none'; }}
          >
            <Save size={22} /> Salvar
          </button>
        </form>
        <button
          type="button"
          onClick={() => handleSendToUtmify(true)}
          disabled={loading || !token}
          style={{
            background: 'linear-gradient(90deg, #a78bfa 0%, #23233a 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
            borderRadius: 12,
            border: 'none',
            padding: '14px 0',
            cursor: loading || !token ? 'not-allowed' : 'pointer',
            minWidth: 160,
            marginTop: 10,
            boxShadow: '0 2px 12px #a78bfa22',
            transition: 'background 0.2s',
            width: '100%',
            letterSpacing: 0.5,
            opacity: loading || !token ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Send size={22} /> {loading ? 'Testando...' : 'Testar conexão'}
        </button>
        <button
          type="button"
          onClick={() => handleSendToUtmify(false)}
          disabled={loading || !token}
          style={{
            background: 'linear-gradient(90deg, #7c3aed 0%, #23233a 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 18,
            borderRadius: 12,
            border: 'none',
            padding: '14px 0',
            cursor: loading || !token ? 'not-allowed' : 'pointer',
            minWidth: 160,
            marginTop: 10,
            boxShadow: '0 2px 12px #7c3aed22',
            transition: 'background 0.2s',
            width: '100%',
            letterSpacing: 0.5,
            opacity: loading || !token ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <Send size={22} /> {loading ? 'Enviando...' : 'Enviar evento real'}
        </button>
        {testResult && (
          <div style={{ background: '#181c2a', borderRadius: 10, border: '1.5px solid #a78bfa', color: '#fff', padding: 18, fontSize: 15, fontWeight: 500, marginTop: 18, wordBreak: 'break-all' }}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
} 