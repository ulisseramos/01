import { MousePointerClick, Type, Code } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function PixelIntegracao() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ pixelId: '', token: '' });
  const [loadingIntegration, setLoadingIntegration] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setLoadingIntegration(true);
    supabase
      .from('integrations')
      .select('pixel_id')
      .eq('user_id', user.id)
      .eq('provider', 'facebook_pixel')
      .single()
      .then(({ data }) => {
        if (data) {
          setForm(prev => ({ ...prev, pixelId: data.pixel_id || '' }));
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
        provider: 'facebook_pixel',
        pixel_id: form.pixelId,
        api_token: '',
      }, { onConflict: 'user_id,provider' });
    setSaving(false);
    if (error) {
      toast.error('Erro ao salvar Pixel: ' + error.message);
    } else {
      toast.success('Pixel salvo com sucesso!');
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
            <div style={{ background: '#181c2a', borderRadius: 12, padding: 8, boxShadow: '0 2px 8px #7c3aed22' }}>
              <MousePointerClick size={28} color="#7c3aed" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 26, color: '#f8fafc', letterSpacing: -1 }}>Integração Facebook Ads</span>
          </div>
          <div style={{ color: '#a1a1aa', fontWeight: 500, fontSize: 16, marginBottom: 18, opacity: 0.95 }}>
            Configure sua integração com o Facebook Ads abaixo.
          </div>
          {/* Bloco mostrando o Pixel ID atual, se existir */}
          {form.pixelId && (
            <div style={{ marginBottom: 18, padding: 14, background: '#020204', borderRadius: 10, border: '1px solid #1A0938', color: '#f8fafc', fontSize: 15 }}>
              <span style={{ fontWeight: 700 }}>Pixel ID atual:</span> <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{form.pixelId}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>ID do Pixel*</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1A0938', borderRadius: 10, marginBottom: 18, padding: '0 14px' }}>
              <Type size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.pixelId}
                onChange={e => handleChange('pixelId', e.target.value)}
                placeholder="Ex: 409944439437496"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
                required
              />
            </div>
            <label style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 6, fontSize: 15 }}>Token (Opcional)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1A0938', borderRadius: 10, marginBottom: 28, padding: '0 14px' }}>
              <Code size={22} color="#a1a1aa" />
              <input
                type="text"
                value={form.token}
                onChange={e => handleChange('token', e.target.value)}
                placeholder="Ex: Seu token aqui"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: '#f8fafc', fontSize: 16, padding: 14 }}
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
      </div>
    </div>
  );
} 