import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Settings, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import RightDrawerModal from './RightDrawerModal';

interface IntegrationFormProps {
  type: 'pushinpay' | 'pixel';
  onSuccess?: () => void;
}

export default function IntegrationForm({ type, onSuccess }: IntegrationFormProps) {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  // Facebook Pixel
  const [pixelId, setPixelId] = useState('');
  const [pixelMsg, setPixelMsg] = useState('');
  const [pixelLoading, setPixelLoading] = useState(false);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'pushinpay' | 'pixel' | null>(null);

  useEffect(() => {
    if (!user) return;
    setInitialLoading(true);
    if (type === 'pushinpay') {
      const fetchPushinPay = async () => {
        const { data: integration } = await supabase
          .from('integrations')
          .select('pushinpay_api_key, is_active')
          .eq('user_id', user.id)
          .eq('provider', 'pushinpay')
          .single();
        if (integration?.pushinpay_api_key) {
          setApiKey(integration.pushinpay_api_key);
          setActive(!!integration.is_active);
        } else {
          setApiKey('');
          setActive(false);
        }
        setInitialLoading(false);
      };
      fetchPushinPay();
    } else if (type === 'pixel') {
      const fetchPixel = async () => {
        const { data: pixelIntegration } = await supabase
          .from('integrations')
          .select('pixel_id')
          .eq('user_id', user.id)
          .eq('provider', 'facebook_pixel')
          .single();
        if (pixelIntegration?.pixel_id) {
          setPixelId(pixelIntegration.pixel_id);
        } else {
          setPixelId('');
        }
        setInitialLoading(false);
      };
      fetchPixel();
    }
  }, [user, type]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, pushinpay_api_key: apiKey, api_token: apiKey, is_active: active, provider: 'pushinpay' }, { onConflict: 'user_id' });
    if (error) setMessage(error.message);
    else {
      setMessage('Chave salva!');
      localStorage.setItem('pushinpay_api_key', apiKey);
      toast.success('Chave salva com sucesso!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    }
    setLoading(false);
  };

  const handleSavePixel = async () => {
    setPixelLoading(true);
    setPixelMsg('');
    const { error } = await supabase
      .from('integrations')
      .upsert({ user_id: user.id, provider: 'facebook_pixel', pixel_id: pixelId, api_token: '', }, { onConflict: 'user_id' });
    if (error) setPixelMsg(error.message);
    else {
      setPixelMsg('Pixel salvo!');
      toast.success('Pixel salvo com sucesso!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    }
    setPixelLoading(false);
  };

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  if (initialLoading && user) {
    return <div className="w-full max-w-md mx-auto py-6 text-center text-zinc-400">Carregando integração...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto py-6" style={{ background: '#09090B', borderRadius: 18, border: '1.5px solid #7E22CE', boxShadow: '0 2px 16px #1A093822', padding: 32 }}>
      {/* Bloco de informações atuais da integração */}
      {type === 'pushinpay' && apiKey && (
        <div className="mb-4 p-4 rounded-xl" style={{ background: '#09090B', border: '1px solid #7E22CE', color: '#a1a1aa' }}>
          <div className="mb-1 font-semibold">Chave atual:</div>
          <div className="font-mono text-indigo-400 text-sm select-all">
            {apiKey.slice(0, 4) + '****' + apiKey.slice(-4)}
          </div>
          <div className="mt-2">Status: <span className={active ? 'text-green-400' : 'text-red-400'}>{active ? 'Ativo' : 'Inativo'}</span></div>
        </div>
      )}
      {type === 'pixel' && pixelId && (
        <div className="mb-4 p-4 rounded-xl" style={{ background: '#09090B', border: '1px solid #7E22CE', color: '#a1a1aa' }}>
          <div className="mb-1 font-semibold">Pixel ID atual:</div>
          <div className="font-mono text-blue-400 text-sm select-all">{pixelId}</div>
        </div>
      )}
      {type === 'pushinpay' && (
        <form
          className="flex flex-col gap-6"
          onSubmit={e => { e.preventDefault(); handleSave(); }}
        >
          <label className="text-zinc-200 text-base font-semibold">Chave de API PushinPay</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Cole sua chave de API PushinPay aqui"
            className="px-5 py-3 rounded-xl bg-black border text-zinc-100 focus:outline-none text-lg placeholder:text-zinc-500 shadow-md"
            style={{ border: '1.5px solid #7E22CE', color: '#fff', background: '#000' }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#7E22CE', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 17, padding: '13px 0', marginTop: 4, transition: 'all 0.18s', boxShadow: '0 1px 8px #7E22CE22', width: '100%' }}
            onMouseOver={e => { e.currentTarget.style.background = '#5b1a99'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#7E22CE'; e.currentTarget.style.transform = 'none'; }}
            className="flex items-center justify-center gap-2"
          >
            {loading ? 'Salvando...' : (<><Save size={20} /> Salvar Chave</>)}
          </button>
          <p className="text-zinc-400 text-sm mt-2">
            Exemplo: <span className="font-mono text-indigo-400">pk_live_xxxxxxxxxxxxxxxxxxxxx</span>
          </p>
          {message && <p className="text-green-400 text-sm mt-2 font-semibold">{message}</p>}
        </form>
      )}
      {type === 'pixel' && (
        <form
          className="flex flex-col gap-6"
          onSubmit={e => { e.preventDefault(); handleSavePixel(); }}
        >
          <label className="text-zinc-200 text-base font-semibold">Pixel ID do Facebook</label>
          <input
            type="text"
            value={pixelId}
            onChange={e => setPixelId(e.target.value)}
            placeholder="Cole seu Pixel ID do Facebook aqui"
            className="px-5 py-3 rounded-xl bg-black border text-zinc-100 focus:outline-none text-lg placeholder:text-zinc-500 shadow-md"
            style={{ border: '1.5px solid #7E22CE', color: '#fff', background: '#000' }}
            required
          />
          <button
            type="submit"
            disabled={pixelLoading}
            style={{ background: '#7E22CE', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 17, padding: '13px 0', marginTop: 4, transition: 'all 0.18s', boxShadow: '0 1px 8px #7E22CE22', width: '100%' }}
            onMouseOver={e => { e.currentTarget.style.background = '#5b1a99'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#7E22CE'; e.currentTarget.style.transform = 'none'; }}
            className="flex items-center justify-center gap-2"
          >
            {pixelLoading ? 'Salvando...' : (<><Save size={20} /> Salvar Pixel</>)}
          </button>
          <p className="text-zinc-400 text-sm mt-2">
            Exemplo: <span className="font-mono text-blue-400">123456789012345</span>
          </p>
          {pixelMsg && <p className="text-green-400 text-sm mt-2 font-semibold">{pixelMsg}</p>}
        </form>
      )}
    </div>
  );
} 