import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import MainLayout from '../../../components/MainLayout';
import { useAuth } from '../../../context/AuthContext';
import { User, Smartphone, IdCard, ArrowLeft, Check, ChevronsUpDown, AlarmClock } from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { cn } from '../../../lib/utils';
import styles from '../../../styles/relatorio.module.css';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import Head from 'next/head';
import EditarCheckout from '../editar';
import { nanoid } from 'nanoid';

function AccordionSection({ title, open, onClick, children }) {
  return (
    <div style={{ borderBottom: '1px solid #23243a', marginBottom: 2 }}>
      <button type="button" onClick={onClick} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: '#a78bfa', fontWeight: 700, fontSize: 18, padding: '12px 0', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{open ? '▼' : '▶'}</span> {title}
      </button>
      {open && <div style={{ padding: '8px 0 18px 0' }}>{children}</div>}
    </div>
  );
}

function TwoColGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 18,
      marginBottom: 0,
      alignItems: 'flex-start',
      width: '100%',
      maxWidth: '100%',
    }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.9rem', // era 1.1rem
  borderRadius: 10,
  border: 'none',
  background: '#18122b',
  color: '#fff',
  fontSize: 15, // era 17
  fontWeight: 500,
  boxShadow: '0 1px 8px #00000022',
  outline: 'none',
  marginTop: 2,
  marginBottom: 2,
  letterSpacing: 0.2,
  transition: 'border 0.18s, box-shadow 0.18s',
};

const labelStyle = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 2,
  letterSpacing: 0.1,
};

const sectionTitleStyle = {
  color: '#fff',
  fontWeight: 800,
  fontSize: 24,
  margin: '32px 0 18px 0',
  letterSpacing: -1,
  fontFamily: 'Inter, sans-serif',
};
const inputLightStyle = {
  width: '100%',
  padding: '0.9rem', // era 1.1rem
  borderRadius: 8,
  border: 'none',
  background: '#fff',
  color: '#18122b',
  fontSize: 14, // era 16
  fontWeight: 500,
  boxShadow: '0 1px 8px #00000008',
  outline: 'none',
  marginTop: 2,
  marginBottom: 2,
  letterSpacing: 0.2,
  transition: 'border 0.18s, box-shadow 0.18s',
  fontFamily: 'Inter, sans-serif',
};
const labelLightStyle = {
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  marginBottom: 2,
  letterSpacing: 0.1,
  fontFamily: 'Inter, sans-serif',
};

const ORDER_BUMPS_OPTIONS = [
  'Bump 1',
  'Bump 2',
  'Bump 3',
];

// Componente de teste para forçar o uso do CSS module
function TesteCssModule() {
  return (
    <div className={styles.timerCard}>
    </div>
  );
}

export default function EditarCheckoutId() {
  useEffect(() => {
    // Remove o zoom e o background preto do zoom.css apenas nesta página
    const html = document.documentElement;
    const originalZoom = html.style.zoom;
    const originalBg = html.style.background;
    html.style.zoom = '1';
    html.style.background = '';
    return () => {
      html.style.zoom = originalZoom || '';
      html.style.background = originalBg || '';
    };
  }, []);
  const router = useRouter();
  const { id } = router.query;
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    offer_title: '',
    checkout_name: '',
    metric_capture: '',
    email_method: '',
    banner_url: '',
    redirect_url: '',
    main_product: '',
    order_bumps: [],
    author_name: '',
    ask_name: false,
    ask_phone: false,
    ask_cpf: false,
    info_field_text: '',
    timer_text: '',
    timer_value: '',
    price: '',
    description: '',
    payment_type: '',
    accept_pix: false,
    accept_boleto: false,
    accept_card: false,
    max_installments: '',
    has_offers: false,
    novo_produto: '',
    tracking_integration: '',
    foto_cliente: '',
  });
  // Corrigir tipo do estado activeTab para aceitar string genérica (evita erro de comparação de tipos)
  const [activeTab, setActiveTab] = useState<string>('geral');
  const { user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [openProduto, setOpenProduto] = useState(false);
  const [openProdutoNovo, setOpenProdutoNovo] = useState(false);
  // 1. Adicione o estado para os pixels do Facebook e o controle do popover:
  const [pixels, setPixels] = useState([]);
  const [openPixel, setOpenPixel] = useState(false);
  // 1. Adicione o estado para integrações de taqueamento e o controle do popover:
  const [trackings, setTrackings] = useState([]);
  const [openTracking, setOpenTracking] = useState(false);
  const [checkoutLink, setCheckoutLink] = useState('');

  useEffect(() => {
    if (!id || id === 'novo') {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase.from('products').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) {
        setError('Checkout não encontrado.');
        setLoading(false);
        return;
      }
      setForm({
        offer_title: data.offer_title || '',
        checkout_name: data.checkout_name || '',
        metric_capture: data.metric_capture || '',
        email_method: data.email_method || '',
        banner_url: data.banner_url || '',
        redirect_url: data.redirect_url || '',
        main_product: data.main_product || '',
        order_bumps: data.order_bumps || [],
        author_name: data.author_name || '',
        ask_name: !!data.ask_name,
        ask_phone: !!data.ask_phone,
        ask_cpf: !!data.ask_cpf,
        info_field_text: data.info_field_text || '',
        timer_text: data.timer_text || '',
        timer_value: data.timer_value || '',
        price: data.price || '',
        description: data.description || '',
        payment_type: data.payment_type || '',
        accept_pix: !!data.accept_pix,
        accept_boleto: !!data.accept_boleto,
        accept_card: !!data.accept_card,
        max_installments: data.max_installments || '',
        has_offers: !!data.has_offers,
        novo_produto: '',
        tracking_integration: data.tracking_integration || '',
        foto_cliente: data.foto_cliente || '',
      });
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    // Buscar apenas produtos reais (is_checkout: false ou null)
    supabase.from('products').select('id, name, price, description')
      .eq('user_id', user.id)
      .or('is_checkout.is.false,is_checkout.is.null')
      .then(({ data }) => {
        if (data) setProdutos(data);
      });
  }, [user]);

  // 2. Busque os pixels do Facebook do usuário:
  useEffect(() => {
    if (!user) return;
    supabase.from('integrations').select('pixel_id').eq('user_id', user.id).eq('provider', 'facebook_pixel').then(({ data }) => {
      if (data) setPixels(data.filter(p => p.pixel_id));
    });
  }, [user]);

  // 2. Busque as integrações UTMify do usuário:
  useEffect(() => {
    if (!user) return;
    supabase.from('integrations').select('api_token').eq('user_id', user.id).eq('provider', 'utmify').then(({ data }) => {
      if (data) setTrackings(data.filter(t => t.api_token));
    });
  }, [user]);

  useEffect(() => {
    // Seleciona automaticamente o primeiro produto ao abrir, se não houver produto selecionado
    if (produtos.length > 0 && !form.novo_produto) {
      const prod = produtos[0];
      setForm(f => ({
        ...f,
        offer_title: prod.name || '',
        description: prod.description || '',
        price: prod.price !== undefined && prod.price !== null ? (typeof prod.price === 'number' ? prod.price.toFixed(2) : Number(prod.price).toFixed(2)) : '',
        main_product: prod.id,
        novo_produto: prod.id,
        // Adicione outros campos do produto conforme necessário
      }));
    }
  }, [produtos]);

  // Atualizar campos automaticamente ao selecionar um produto, inclusive ao abrir a página
  useEffect(() => {
    if (form.novo_produto) {
      const prod = produtos.find(p => p.id === form.novo_produto);
      if (prod) {
        setForm(f => ({
          ...f,
          price: prod.price !== undefined && prod.price !== null ? (typeof prod.price === 'number' ? prod.price.toFixed(2) : Number(prod.price).toFixed(2)) : '',
          description: prod.description || f.description,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.novo_produto, produtos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else if (name === 'order_bumps') {
      const options = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value);
      setForm({ ...form, order_bumps: options });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Função para formatar valor como moeda brasileira
  function formatBRL(value) {
    if (!value) return '';
    const numeric = value.toString().replace(/\D/g, '');
    const float = (parseInt(numeric, 10) / 100).toFixed(2);
    return Number(float).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function handlePriceChange(e) {
    const raw = e.target.value.replace(/\D/g, '');
    // Só aplica lógica de centavos se o usuário estiver digitando manualmente
    setForm(f => ({ ...f, price: raw ? (parseInt(raw, 10) / 100).toFixed(2) : '' }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    if (id === 'novo') {
      // Verificar se o produto já está vinculado a outro checkout
      const { data: checkoutsComMesmoProduto, error: errorBusca } = await supabase
        .from('products')
        .select('id')
        .eq('main_product', form.novo_produto)
        .eq('is_checkout', true);
      if (errorBusca) {
        setError('Erro ao verificar produto principal: ' + errorBusca.message);
        setSaving(false);
        return;
      }
      if (checkoutsComMesmoProduto && checkoutsComMesmoProduto.length > 0) {
        setError('Este produto já está vinculado como principal em outro checkout. Escolha outro produto.');
        setSaving(false);
        return;
      }
      // Criar novo checkout no banco
      const publicId = nanoid(12);
      // Corrigir o valor de price para número puro
      let price = form.price;
      if (typeof price === 'string') {
        const numeric = price.replace(/\D/g, '');
        price = numeric ? (parseInt(numeric, 10) / 100).toString() : '0';
      }
      const camposValidos = {
        ...form,
        name: form.offer_title || 'Checkout sem nome',
        user_id: user.id,
        is_checkout: true,
        public_id: publicId,
        price,
        max_installments: form.max_installments !== '' && form.max_installments !== undefined ? Number(form.max_installments) : null,
      };
      const { data, error } = await supabase.from('products').insert([camposValidos]).select().single();
      if (error) {
        setError('Erro ao criar checkout: ' + error.message);
        setSaving(false);
        return;
      }
      setSuccess('Checkout criado com sucesso!');
      router.replace(`/checkout/editar/${data.id}`);
      setSaving(false);
      return;
    }
    // Update checkout existente
    const camposValidos = {
      offer_title: form.offer_title || null,
      checkout_name: form.checkout_name || null,
      order_bumps: form.order_bumps || null,
      ask_name: !!form.ask_name,
      ask_phone: !!form.ask_phone,
      ask_cpf: !!form.ask_cpf,
      price: form.price !== '' && form.price !== undefined ? Number(form.price) : null,
      accept_pix: !!form.accept_pix,
      accept_boleto: !!form.accept_boleto,
      accept_card: !!form.accept_card,
      max_installments: form.max_installments !== '' && form.max_installments !== undefined ? Number(form.max_installments) : null,
      has_offers: !!form.has_offers,
      info_field_text: form.info_field_text || null,
      timer_text: form.timer_text || null,
      timer_value: form.timer_value || null,
      metric_capture: form.metric_capture || null,
      email_method: form.email_method || null,
      banner_url: form.banner_url || null,
      redirect_url: form.redirect_url || null,
      main_product: form.main_product || null,
      novo_produto: form.novo_produto || null,
      author_name: form.author_name || null,
      description: form.description || null,
      payment_type: form.payment_type || null,
      tracking_integration: form.tracking_integration || null,
      foto_cliente: form.foto_cliente || null,
    };
    const { error } = await supabase.from('products').update(camposValidos).eq('id', id);
    if (error) {
      setError('Erro ao salvar: ' + error.message + (error.details ? ' | Detalhes: ' + JSON.stringify(error.details) : '') + (error.hint ? ' | Hint: ' + error.hint : '') + (error.code ? ' | Código: ' + error.code : '') + ' | Objeto: ' + JSON.stringify(error));
    } else {
      setSuccess('Checkout atualizado com sucesso!');
      setCheckoutLink(`${window.location.origin}/checkout/${id}`);
    }
    setSaving(false);
  };

  // Debug: mostrar nomes dos produtos no console
  console.log('Nomes dos produtos:', produtos.map(p => p.name));
  // Debug visual: mostrar nomes dos produtos na tela
  const produtoSelecionado = (() => {
    if (!form.novo_produto) return '';
    const prod = produtos.find((p) => p.id === form.novo_produto);
    return prod ? prod.name : '';
  })();
  // Antes do map dos produtos em OrderBumps, filtre para não mostrar o produto selecionado como Produto principal
  const produtosOrderBumps = produtos.filter(p => p.id !== form.novo_produto);

  // Novo componente de cronômetro fixo estilo "grudado" laranja
  function CronometroTopo() {
    if (!form.timer_text && !form.timer_value) return null;
    // Parse timer_value (esperado formato mm:ss ou hh:mm:ss)
    const parts = (form.timer_value || '').split(':').map(Number);
    let horas = 0, minutos = 0, segundos = 0;
    if (parts.length === 3) {
      [horas, minutos, segundos] = parts;
    } else if (parts.length === 2) {
      [minutos, segundos] = parts;
    } else if (parts.length === 1) {
      [segundos] = parts;
    }
    return (
      <div style={{
        width: '100%',
        maxWidth: 'none',
        background: '#F26522',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '12px 24px',
        borderRadius: '8px 8px 0 0',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 20,
        gap: 18,
        boxSizing: 'border-box',
        marginBottom: 0,
        boxShadow: '0 2px 8px #0003',
        justifyContent: 'space-between',
      }}>
        <AlarmClock size={36} style={{ marginRight: 12, flexShrink: 0 }} />
        <span style={{ fontSize: 20, fontWeight: 700, marginRight: 18, lineHeight: 1.1, whiteSpace: 'pre-line', flex: 1 }}>{form.timer_text || 'Oferta por Tempo Limitado!'}</span>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <div style={{ background: '#F47C2B', borderRadius: 6, padding: '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{String(horas).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HORAS</span>
          </div>
          <div style={{ background: '#F47C2B', borderRadius: 6, padding: '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{String(minutos).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>MIN</span>
          </div>
          <div style={{ background: '#F47C2B', borderRadius: 6, padding: '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{String(segundos).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>SEG</span>
          </div>
        </div>
      </div>
    );
  }

  // Ao fechar o modal, volta para o dashboard
  const handleClose = () => {
    setOpen(false);
    router.push('/dashboard');
  };

  return (
    <>
      {/* Removido o <Head> que forçava o background */}
      <div style={{ filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none', position: 'fixed', inset: 0, zIndex: 1 }}>
        <EditarCheckout />
      </div>
      {/* Overlay escuro e modal de edição por cima */}
      <div style={{
        position: 'fixed',
        inset: 0,
        width: '100%', // Corrigido para cobrir toda a largura
        height: '100%',
        minHeight: '100vh',
        background: 'rgba(10,10,20,0.45)',
        backdropFilter: 'blur(12px)',
        zIndex: 2,
        pointerEvents: 'auto',
        overflowX: 'hidden', // Evita faixa do lado direito
      }}></div>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Corrigido para eliminar barra branca
        zIndex: 3,
      }}>
        <div
          style={{
            width: '100%',
            maxWidth: 'calc(1100px + 2cm)',
            margin: '0 auto',
            padding: '48px 32px 0px 32px', // padding-bottom reduzido em 4cm (aprox. 64px)
            background: 'transparent',
            border: 'none', // Remove qualquer borda
            borderRadius: '32px', // Força bordas bem arredondadas
            boxShadow: '0 8px 40px 0 #000a, 0 1.5px 8px #2228',
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxHeight: 'calc(100% - 3cm)', // reduz exatamente 3cm da altura
            fontWeight: 500,
            fontSize: 15,
            marginTop: '-2cm', // subiu mais 2cm
            zoom: 0.8, // Aplica zoom apenas no modal
            position: 'relative',
            left: '1cm', // Move 1cm para a direita
          }}
        >
          <TesteCssModule />
          <CronometroTopo />
          {/* Botão de voltar e título fora do box/modal */}
          <div style={{
            maxWidth: 1600,
            margin: '40px auto 0 auto',
            padding: '0 0.5vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
          </div>
          {/* Box/modal principal */}
          <div style={{
            width: '100%',
            maxWidth: '100%',
            background: '#020204',
            boxShadow: '0 8px 32px #000a, 0 2px 8px #0006',
            padding: '2rem 0.5vw 2.5cm 0.5vw', // aumentar o padding-bottom para 2.5cm
            minHeight: 0,
            position: 'relative',
            zIndex: 1,
            border: '2.5px solid #14062B', // Nova cor da borda
            borderRadius: '32px', // Bordas bem arredondadas no box interno
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'visible', // Garantir que o Popover não seja cortado
          }}>
            {/* Container dos botões de ação */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24, justifyContent: 'flex-start', width: '100%' }}>
              <button
                onClick={() => router.push('/checkout/editar')}
                style={{
                  background: 'rgba(36,36,48,0.92)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '0.7rem 1.3rem',
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 2px 12px #0006',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  zIndex: 2,
                  transition: 'background 0.18s',
                  alignSelf: 'flex-start',
                }}
                title="Voltar"
              >
                <ArrowLeft size={20} />
              </button>
              <button type="submit" form="editar-checkout-form" disabled={saving} style={{ minWidth: 120, background: '#18122b', color: '#fff', fontWeight: 700, fontSize: 15, border: '1.5px solid #23243a', borderRadius: 8, padding: '0.7rem 1.3rem', cursor: 'pointer', boxShadow: '0 2px 8px #0004', width: 'auto', maxWidth: '100%' }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
            {/* Tabs mais finas */}
            <div style={{ display: 'flex', gap: 0, border: '1.5px solid #1A0938', borderRadius: 16, overflow: 'hidden', marginBottom: 32, background: 'none', height: 52, width: '100%', maxWidth: '100%', boxShadow: '0 4px 16px #0006' }}>
              {['geral', 'provas', 'pagamento', 'visual'].map((tab, idx, arr) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as string)}
                  style={{
                    flex: 1,
                    background: activeTab === tab ? '#fff' : 'transparent',
                    color: activeTab === tab ? '#18122b' : '#e5e7eb',
                    fontWeight: 600,
                    fontSize: 16,
                    border: 'none',
                    padding: '8px 0',
                    borderRadius:
                      idx === 0
                        ? '12px 0 0 12px'
                        : idx === arr.length - 1
                          ? '0 12px 12px 0'
                          : 0,
                    transition: 'background 0.18s, color 0.18s',
                    outline: 'none',
                    boxShadow: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseOver={e => {
                    if (activeTab !== tab) e.currentTarget.style.background = '#18122b';
                  }}
                  onMouseOut={e => {
                    if (activeTab !== tab) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {tab === 'geral' && 'Geral'}
                  {tab === 'provas' && 'Provas Sociais'}
                  {tab === 'pagamento' && 'Central de Integrações'}
                  {tab === 'visual' && 'Visual'}
                </button>
              ))}
            </div>
            {loading ? (
              <div style={{ color: '#b3b3b3', textAlign: 'center', fontSize: 18 }}>Carregando...</div>
            ) : error ? (
              <div style={{ color: '#f87171', textAlign: 'center', fontSize: 18 }}>{error}</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Campos principais sempre visíveis */}
                <div style={{ marginBottom: 32 }}>
                  <div style={sectionTitleStyle}>Configurações</div>
                  <TwoColGrid>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'auto', margin: 0, padding: 0 }}>
                      <label style={labelLightStyle}>Título*</label>
                      <input name="offer_title" value={form.offer_title} onChange={handleChange} required style={{ ...inputLightStyle, width: 'calc(100% - 1cm)', border: '1.5px solid #1A0938', background: 'transparent', boxShadow: '0 4px 16px #000c', color: '#fff' }} placeholder="Título" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'auto', margin: 0, padding: 0 }}>
                      <label style={labelLightStyle}>Descrição</label>
                      <input name="description" value={form.description} onChange={handleChange} style={{ ...inputLightStyle, width: '100%', border: '1.5px solid #1A0938', background: 'transparent', boxShadow: '0 4px 16px #000c', color: '#fff' }} placeholder="Uma breve descrição sobre o seu conteúdo" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'auto', margin: 0, padding: 0 }}>
                      <label style={labelLightStyle}>Tipo de pagamento*</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <select name="payment_type" value="pix" disabled style={{ ...inputLightStyle, width: '100%', minWidth: 0, border: '1.5px solid #1A0938', background: 'transparent', boxShadow: '0 4px 16px #000c', color: '#fff' }}>
                          <option value="pix">Pix</option>
                          <option value="boleto" disabled>Em breve: Boleto</option>
                          <option value="cartao" disabled>Em breve: Cartão de crédito</option>
                        </select>
                        <img src="https://i.imgur.com/rYCqTX3.png" alt="Pix" style={{ height: 32, width: 32, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 2, border: '1.5px solid #e5e7eb' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'auto', margin: 0, padding: 0 }}>
                      <label style={labelLightStyle}>Valor*</label>
                      <input name="price" type="text" inputMode="numeric" value={formatBRL(form.price)} onChange={handlePriceChange} style={{ ...inputLightStyle, width: '100%', border: '1.5px solid #1A0938', background: 'transparent', boxShadow: '0 4px 16px #000c', color: '#fff' }} placeholder="0,00" />
                    </div>
                    {/* Produto principal, obrigatórios, order bumps, etc. podem ser incluídos aqui também, se desejar sempre visíveis */}
                  </TwoColGrid>
                </div>
                {/* Tabs e conteúdo condicional */}
                {activeTab === 'geral' && (
                  <div style={{ marginTop: '-2cm' }}>
                    {/* Tab: Geral */}
                    <div>
                      <div style={sectionTitleStyle}>Configurações</div>
                      <TwoColGrid>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'auto', margin: 0, padding: 0 }}>
                          <label style={labelLightStyle}>Produto principal</label>
                          <Popover open={openProdutoNovo} onOpenChange={setOpenProdutoNovo}>
                            <PopoverTrigger asChild>
                              <input
                                readOnly
                                value={produtoSelecionado}
                                placeholder="Selecione um produto"
                                style={{
                                  ...inputLightStyle,
                                  width: 'calc(100% + 1cm)',
                                  border: '1.5px solid #1A0938',
                                  background: 'transparent',
                                  boxShadow: '0 4px 16px #000c',
                                  color: '#fff',
                                  borderRadius: 12,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                                onClick={() => setOpenProdutoNovo(true)}
                              />
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="max-h-80 p-0 text-white rounded-xl border-[#1A0938] overflow-y-auto custom-scrollbar"
                              style={{
                                minWidth: 696, // 734 - 38
                                width: 696,    // 734 - 38
                                maxHeight: 480,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                fontFamily: 'Inter, sans-serif',
                                zIndex: 999999999,
                                position: 'absolute',
                                left: 0,
                                top: '110%',
                                transform: 'none',
                                background: '#020204',
                                boxShadow: '0 8px 32px #000a, 0 2px 8px #0006',
                                paddingRight: 12,
                              }}
                            >
                              <style jsx global>{`
                                  .custom-scrollbar::-webkit-scrollbar {
                                    width: 8px;
                                    background: #18122b;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: #a78bfa;
                                    border-radius: 8px;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #18122b;
                                  }
                                  .custom-scrollbar {
                                    scrollbar-width: thin;
                                    scrollbar-color: #a78bfa #18122b;
                                  }
                                `}</style>
                              {/* Lista de produtos reais */}
                              {produtos.length === 0 && (
                                <div style={{ padding: 16, textAlign: 'center', color: '#a1a1aa' }}>Nenhum produto encontrado.</div>
                              )}
                              {produtos.map((prod) => (
                                <div
                                  key={prod.id}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, novo_produto: prod.id }));
                                    setOpenProdutoNovo(false);
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    background: form.novo_produto === prod.id ? '#2d1a4d' : '#020204',
                                    borderBottom: '1px solid #23243a',
                                    borderRadius: 24,
                                    borderTopRightRadius: 24,
                                    borderBottomRightRadius: 24,
                                    margin: 4,
                                    padding: 8,
                                    boxShadow: form.novo_produto === prod.id ? '0 2px 8px #a78bfa33' : 'none',
                                    transition: 'background 0.15s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    width: '100%',
                                    color: '#fff',
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#18122b'}
                                  onMouseOut={e => e.currentTarget.style.background = form.novo_produto === prod.id ? '#2d1a4d' : '#020204'}
                                >
                                  <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{prod.name}</div>
                                  <div style={{ fontSize: 13, color: '#60a5fa', wordBreak: 'break-all', fontFamily: 'Inter, sans-serif' }}>(ID: {prod.id})</div>
                                  {prod.description && (
                                    <div style={{ fontSize: 14, color: '#a1a1aa', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{prod.description}</div>
                                  )}
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / span 2' }}>
                          <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 10, letterSpacing: 0.2 }}>
                            Campos Obrigatórios
                          </div>
                          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'nowrap', marginTop: 2, justifyContent: 'flex-start' }}>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, ask_name: !f.ask_name }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: form.ask_name ? '#a78bfa' : 'transparent',
                                color: form.ask_name ? '#fff' : '#fff',
                                border: form.ask_name ? '2px solid #a78bfa' : '2px solid #fff2',
                                borderRadius: 8,
                                padding: '0.6rem 1.2rem',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                boxShadow: form.ask_name ? '0 2px 8px #a78bfa33' : 'none',
                              }}
                            >
                              <User size={18} style={{ opacity: 0.9 }} /> Nome
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, ask_phone: !f.ask_phone }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: form.ask_phone ? '#a78bfa' : 'transparent',
                                color: form.ask_phone ? '#fff' : '#fff',
                                border: form.ask_phone ? '2px solid #a78bfa' : '2px solid #fff2',
                                borderRadius: 8,
                                padding: '0.6rem 1.2rem',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                boxShadow: form.ask_phone ? '0 2px 8px #a78bfa33' : 'none',
                              }}
                            >
                              <Smartphone size={18} style={{ opacity: 0.9 }} /> Telefone
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, ask_cpf: !f.ask_cpf }))}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                background: form.ask_cpf ? '#a78bfa' : 'transparent',
                                color: form.ask_cpf ? '#fff' : '#fff',
                                border: form.ask_cpf ? '2px solid #a78bfa' : '2px solid #fff2',
                                borderRadius: 8,
                                padding: '0.6rem 1.2rem',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                                transition: 'all 0.18s',
                                boxShadow: form.ask_cpf ? '0 2px 8px #a78bfa33' : 'none',
                              }}
                            >
                              <IdCard size={18} style={{ opacity: 0.9 }} /> CPF
                            </button>
                          </div>
                        </div>
                        {/* Substituir o campo OrderBumps por um Popover estilizado com seleção múltipla (checkbox) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: '1 / span 2' }}>
                          <label style={labelLightStyle}>OrderBumps</label>
                          <Popover open={openProduto} onOpenChange={setOpenProduto}>
                            <PopoverTrigger asChild>
                              <input
                                readOnly
                                value={form.order_bumps.map(id => {
                                  const prod = produtos.find(p => p.id === id);
                                  return prod ? prod.name : '';
                                }).join(', ')}
                                placeholder="Selecione produtos"
                                style={{
                                  ...inputLightStyle,
                                  width: 'calc(100% + 1cm)',
                                  border: '1.5px solid #1A0938',
                                  background: 'transparent',
                                  boxShadow: '0 4px 16px #000c',
                                  color: '#fff',
                                  borderRadius: 12,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                                onClick={() => setOpenProduto(true)}
                              />
                            </PopoverTrigger>
                            <PopoverContent
                              align="start"
                              className="max-h-80 p-0 text-white rounded-xl border-[#1A0938] overflow-y-auto custom-scrollbar"
                              style={{
                                minWidth: 696, // 734 - 38
                                width: 696,    // 734 - 38
                                maxHeight: 480,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                fontFamily: 'Inter, sans-serif',
                                zIndex: 999999999,
                                position: 'absolute',
                                left: 0,
                                top: '110%',
                                transform: 'none',
                                background: '#020204',
                                boxShadow: '0 8px 32px #000a, 0 2px 8px #0006',
                                paddingRight: 12,
                              }}
                            >
                              <style jsx global>{`
                                  .custom-scrollbar::-webkit-scrollbar {
                                    width: 8px;
                                    background: #18122b;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: #a78bfa;
                                    border-radius: 8px;
                                  }
                                  .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #18122b;
                                  }
                                  .custom-scrollbar {
                                    scrollbar-width: thin;
                                    scrollbar-color: #a78bfa #18122b;
                                  }
                                `}</style>
                              {/* Lista de produtos reais */}
                              {produtosOrderBumps.length === 0 && (
                                <div style={{ padding: 16, textAlign: 'center', color: '#a1a1aa' }}>Nenhum produto encontrado.</div>
                              )}
                              {produtosOrderBumps.map((prod) => (
                                <div
                                  key={prod.id}
                                  onClick={() => {
                                    setForm((f) => ({
                                      ...f,
                                      order_bumps: f.order_bumps.includes(prod.id)
                                        ? f.order_bumps.filter(id => id !== prod.id)
                                        : [...f.order_bumps, prod.id],
                                    }));
                                    setOpenProduto(false);
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    background: form.order_bumps.includes(prod.id) ? '#2d1a4d' : '#020204',
                                    borderBottom: '1px solid #23243a',
                                    borderRadius: 24,
                                    borderTopRightRadius: 24,
                                    borderBottomRightRadius: 24,
                                    margin: 4,
                                    padding: 8,
                                    boxShadow: form.order_bumps.includes(prod.id) ? '0 2px 8px #a78bfa33' : 'none',
                                    transition: 'background 0.15s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 4,
                                    width: '100%',
                                    color: '#fff',
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#18122b'}
                                  onMouseOut={e => e.currentTarget.style.background = form.order_bumps.includes(prod.id) ? '#2d1a4d' : '#020204'}
                                >
                                  <div style={{ fontWeight: 800, fontSize: 18, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{prod.name}</div>
                                  <div style={{ fontSize: 13, color: '#60a5fa', wordBreak: 'break-all', fontFamily: 'Inter, sans-serif' }}>(ID: {prod.id})</div>
                                  {prod.description && (
                                    <div style={{ fontSize: 14, color: '#a1a1aa', marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{prod.description}</div>
                                  )}
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                        {/* Após o Popover de seleção múltipla de OrderBumps, exibir os produtos selecionados como chips com um X ao lado para remover */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, width: '100%' }}>
                          {form.order_bumps.map((id) => {
                            const prod = produtos.find((p) => p.id === id);
                            if (!prod) return null;
                            return (
                              <div
                                key={id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  background: '#18122b',
                                  color: '#fff',
                                  borderRadius: 999,
                                  padding: '8px 22px 8px 18px',
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: 16,
                                  fontWeight: 700,
                                  border: '2px solid #a78bfa',
                                  gap: 10,
                                  boxShadow: '0 2px 8px #a78bfa22',
                                  transition: 'background 0.18s, box-shadow 0.18s',
                                  cursor: 'pointer',
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#25113b';
                                  e.currentTarget.style.boxShadow = '0 4px 16px #a78bfa44';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = '#18122b';
                                  e.currentTarget.style.boxShadow = '0 2px 8px #a78bfa22';
                                }}
                              >
                                {prod.name}
                                <button
                                  type="button"
                                  onClick={() => setForm(f => ({ ...f, order_bumps: f.order_bumps.filter(bid => bid !== id) }))}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#a78bfa',
                                    fontWeight: 900,
                                    fontSize: 22,
                                    marginLeft: 8,
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                    borderRadius: 999,
                                    padding: '2px 8px',
                                    transition: 'background 0.18s, color 0.18s',
                                  }}
                                  onMouseOver={e => {
                                    e.currentTarget.style.background = '#a78bfa33';
                                    e.currentTarget.style.color = '#fff';
                                  }}
                                  onMouseOut={e => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.color = '#a78bfa';
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </TwoColGrid>
                    </div>
                  </div>
                )}
                {/* Tab: Provas Sociais */}
                {activeTab === 'provas' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', alignItems: 'center', marginTop: 24, overflowX: 'auto' }}>
                    {/* Título com ícone */}
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 900, minWidth: 700, marginBottom: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, background: '#18122b', borderRadius: 6, marginRight: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="4" y="8" width="24" height="16" rx="6" fill="#fff" stroke="#1A0938" strokeWidth="2.2" />
                          <path d="M16 13.5l1.45 2.94 3.25.47-2.35 2.29.56 3.25L16 20.02l-2.91 1.53.56-3.25-2.35-2.29 3.25-.47L16 13.5z" fill="#facc15" stroke="#a78bfa" strokeWidth="1.2" />
                        </svg>
                      </span>
                      <span style={{ fontWeight: 900, fontSize: 26, color: '#18122b', letterSpacing: -1, fontFamily: 'Inter, sans-serif' }}>Provas Sociais</span>
                    </div>
                    {/* Card branco principal */}
                    <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px #0001', border: '1.5px solid #e5e7eb', padding: '24px 12px 18px 12px', position: 'relative', color: '#18122b', display: 'flex', flexDirection: 'column', gap: 18, margin: '0 auto' }}>
                      {/* Ícone de lixeira no topo direito */}
                      <button type="button" style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#f87171', fontSize: 22, cursor: 'pointer', transition: 'color 0.18s' }} title="Remover avaliação" onMouseOver={e => e.currentTarget.style.color = '#b91c1c'} onMouseOut={e => e.currentTarget.style.color = '#f87171'}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                      {/* Inputs */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                          <label style={labelLightStyle}>Foto do Cliente</label>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: 340,
                              minHeight: 90,
                              background: '#fff',
                              border: '2px dashed #a78bfa',
                              borderRadius: 18,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              padding: 12,
                              marginBottom: 8,
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'border 0.18s',
                              margin: '0 auto',
                            }}
                            onClick={() => document.getElementById('foto_cliente_upload').click()}
                            onDragOver={e => { e.preventDefault(); e.currentTarget.style.border = '2px solid #a78bfa'; }}
                            onDragLeave={e => { e.preventDefault(); e.currentTarget.style.border = '2px dashed #a78bfa'; }}
                            onDrop={e => {
                              e.preventDefault();
                              e.currentTarget.style.border = '2px dashed #a78bfa';
                              const file = e.dataTransfer.files && e.dataTransfer.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  setForm(f => ({ ...f, foto_cliente: typeof ev.target.result === 'string' ? ev.target.result : '' }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          >
                            <input
                              id="foto_cliente_upload"
                              type="file"
                              accept="image/*"
                              onChange={e => {
                                const file = e.target.files && e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    setForm(f => ({ ...f, foto_cliente: typeof ev.target.result === 'string' ? ev.target.result : '' }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              style={{ display: 'none' }}
                            />
                            {!form.foto_cliente && (
                              <>
                                <div style={{ background: '#f3e8ff', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 2px 8px #a78bfa22' }}>
                                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="18" cy="18" r="18" fill="#a78bfa" fillOpacity="0.13" />
                                    <path d="M18 25V13M18 13L13.5 17.5M18 13L22.5 17.5" stroke="#a78bfa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <rect x="10" y="25" width="16" height="2.5" rx="1.2" fill="#a78bfa" fillOpacity="0.18" />
                                  </svg>
                                </div>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, textAlign: 'center' }}>Arraste e solte um arquivo aqui</div>
                                <div style={{ color: '#a1a1aa', fontWeight: 500, fontSize: 15, textAlign: 'center', marginBottom: 2 }}>ou clique para selecionar</div>
                                <div style={{ color: '#a1a1aa', fontWeight: 400, fontSize: 13, textAlign: 'center' }}>Máximo 15.00MB</div>
                                <div style={{ color: '#a1a1aa', fontWeight: 400, fontSize: 13, textAlign: 'center' }}>Tamanho recomendado: 1920px × 1080px (16:9)</div>
                              </>
                            )}
                            {form.foto_cliente && (
                              <img src={form.foto_cliente} alt="Preview" style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 18, marginTop: 8, border: '3px solid #a78bfa', boxShadow: '0 2px 12px #a78bfa22' }} />
                            )}
                          </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <label style={{ color: '#18122b', fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'block' }}>Autor do Depoimento</label>
                          <span style={{ position: 'absolute', left: 14, top: 38, color: '#bdbdbd', pointerEvents: 'none' }}>
                            {/* Ícone de usuário */}
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" /></svg>
                          </span>
                          <input
                            type="text"
                            placeholder="Ex: João, Victor"
                            style={{ width: '100%', maxWidth: 320, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fafbfc', color: '#18122b', fontSize: 15, fontWeight: 500, outline: 'none', marginBottom: 8, boxShadow: 'none', transition: 'border 0.18s', margin: '0 auto', display: 'block' }}
                          />
                        </div>
                        <div>
                          <label style={{ color: '#18122b', fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'block' }}>Descrição <span style={{ color: '#a1a1aa', fontWeight: 400, fontSize: 13, float: 'right' }}>0/250</span></label>
                          <textarea
                            maxLength={250}
                            placeholder=""
                            style={{ width: '100%', maxWidth: 320, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fafbfc', color: '#18122b', fontSize: 15, fontWeight: 500, outline: 'none', minHeight: 60, resize: 'none', boxShadow: 'none', transition: 'border 0.18s', margin: '0 auto', display: 'block' }}
                          />
                        </div>
                        {/* Avaliação */}
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fafbfc', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0.7rem 1rem', marginTop: 2, gap: 12 }}>
                          <span style={{ color: '#18122b', fontWeight: 700, fontSize: 15, minWidth: 70 }}>Avaliação</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <span key={i} style={{ fontSize: 22, color: '#e5e7eb', cursor: 'pointer', transition: 'color 0.18s' }} onMouseOver={e => e.currentTarget.style.color = '#facc15'} onMouseOut={e => e.currentTarget.style.color = '#e5e7eb'}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Botão adicionar avaliação fora do card */}
                    <button type="button" style={{ width: '100%', maxWidth: 420, margin: '0 auto', background: '#000', border: '2px dashed #1A0938', color: '#fff', fontWeight: 700, fontSize: 17, borderRadius: 24, padding: '1.1rem 0', boxShadow: 'none', cursor: 'pointer', letterSpacing: 0.2, transition: 'background 0.18s, color 0.18s, border 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, marginRight: 2, display: 'flex', alignItems: 'center' }}>+</span> Adicionar Avaliação
                    </button>
                  </div>
                )}
                {/* Tab: Método de Pagamento */}
                {activeTab === 'pagamento' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className={styles.paymentBox}>
                      <div className={styles.paymentTitle}>
                        Captura de Métrica
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        <label style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>Pixel do Facebook</label>
                        <Popover open={openPixel} onOpenChange={setOpenPixel}>
                          <PopoverTrigger asChild>
                            <input
                              readOnly
                              value={(() => {
                                if (!form.metric_capture) return '';
                                const pixel = pixels.find(p => p.pixel_id === form.metric_capture);
                                return pixel ? `Pixel: ${pixel.pixel_id}` : '';
                              })()}
                              placeholder={pixels.length === 0 ? 'Nenhum Pixel cadastrado' : 'Selecione um Pixel do Facebook'}
                              style={{
                                width: '100%',
                                padding: '1.1rem',
                                borderRadius: 10,
                                border: '1.5px solid #a78bfa',
                                background: '#18122b',
                                color: '#fff',
                                fontSize: 17,
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 1px 8px #00000022',
                                outline: 'none',
                                marginTop: 2,
                                marginBottom: 2,
                                letterSpacing: 0.2,
                                transition: 'border 0.18s, box-shadow 0.18s',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onClick={() => setOpenPixel(true)}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="max-h-80 p-0 text-white rounded-xl border-[#1A0938] overflow-y-auto custom-scrollbar"
                            style={{
                              minWidth: 260,
                              width: 4,
                              maxHeight: 320,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              fontFamily: 'Inter, sans-serif',
                              zIndex: 999999999,
                              position: 'absolute',
                              left: 0,
                              top: '110%',
                              transform: 'none',
                              background: '#020204',
                              boxShadow: '0 8px 32px #000a, 0 2px 8px #0006',
                              paddingRight: 35,
                            }}
                          >
                            <style jsx global>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                  width: 8px;
                                  background: #18122b;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                  background: #a78bfa;
                                  border-radius: 8px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                  background: #18122b;
                                }
                                .custom-scrollbar {
                                  scrollbar-width: thin;
                                  scrollbar-color: #a78bfa #18122b;
                                }
                              `}</style>
                            {pixels.length === 0 && (
                              <div style={{ padding: 16, textAlign: 'center', color: '#a1a1aa' }}>Nenhum Pixel cadastrado.</div>
                            )}
                            {pixels.map((pixel) => (
                              <div
                                key={pixel.pixel_id}
                                onClick={() => {
                                  setForm(f => ({ ...f, metric_capture: pixel.pixel_id }));
                                  setOpenPixel(false);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  background: form.metric_capture === pixel.pixel_id ? '#18122b' : '#18122b',
                                  border: '1.5px solid #a78bfa',
                                  borderRadius: 8,
                                  margin: '2px 0',
                                  padding: '8px 14px',
                                  boxShadow: form.metric_capture === pixel.pixel_id ? '0 2px 8px #a78bfa33' : 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2,
                                  width: '100%',
                                  color: '#fff',
                                  fontFamily: 'Inter, sans-serif',
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#25113b';
                                  e.currentTarget.style.border = '1.5px solid #a78bfa';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = '#18122b';
                                  e.currentTarget.style.border = '1.5px solid #a78bfa';
                                }}
                              >
                                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', fontFamily: 'Inter, sans-serif' }}>{pixel.pixel_id}</div>
                                <div style={{ fontSize: 13, color: '#60a5fa', wordBreak: 'break-all', fontFamily: 'Inter, sans-serif' }}>Pixel do Facebook</div>
                              </div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className={styles.paymentBox}>
                      <div className={styles.paymentTitle}>
                        Taqueamento de Vendas
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                        <label style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Inter, sans-serif', marginBottom: 2 }}>Taqueamento de Vendas</label>
                        <Popover open={openTracking} onOpenChange={setOpenTracking}>
                          <PopoverTrigger asChild>
                            <input
                              readOnly
                              value={(() => {
                                if (!form.tracking_integration) return '';
                                const tracking = trackings.find(t => t.api_token === form.tracking_integration);
                                return tracking ? `UTMify: ${tracking.api_token.slice(0, 6)}...${tracking.api_token.slice(-4)}` : '';
                              })()}
                              placeholder={trackings.length === 0 ? 'Nenhuma integração UTMify cadastrada' : 'Selecione uma integração UTMify'}
                              style={{
                                width: '100%',
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: '1.5px solid #a78bfa',
                                background: '#18122b',
                                color: '#fff',
                                fontSize: 17,
                                fontWeight: 500,
                                fontFamily: 'Inter, sans-serif',
                                boxShadow: '0 1px 8px #00000022',
                                outline: 'none',
                                marginTop: 2,
                                marginBottom: 2,
                                letterSpacing: 0.2,
                                transition: 'border 0.18s, box-shadow 0.18s',
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onClick={() => setOpenTracking(true)}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="max-h-80 p-0 text-white rounded-xl border-[#1A0938] overflow-y-auto custom-scrollbar"
                            style={{
                              minWidth: 260,
                              width: 260,
                              maxHeight: 320,
                              overflowY: 'auto',
                              overflowX: 'hidden',
                              fontFamily: 'Inter, sans-serif',
                              zIndex: 999999999,
                              position: 'absolute',
                              left: 0,
                              top: '110%',
                              transform: 'none',
                              background: '#020204',
                              boxShadow: '0 8px 32px #000a, 0 2px 8px #0006',
                              paddingRight: 35,
                            }}
                          >
                            <style jsx global>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                  width: 8px;
                                  background: #18122b;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                  background: #a78bfa;
                                  border-radius: 8px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                  background: #18122b;
                                }
                                .custom-scrollbar {
                                  scrollbar-width: thin;
                                  scrollbar-color: #a78bfa #18122b;
                                }
                              `}</style>
                            {trackings.length === 0 && (
                              <div style={{ padding: 16, textAlign: 'center', color: '#a1a1aa' }}>Nenhuma integração UTMify cadastrada.</div>
                            )}
                            {trackings.map((tracking) => (
                              <div
                                key={tracking.api_token}
                                onClick={() => {
                                  setForm(f => ({ ...f, tracking_integration: tracking.api_token }));
                                  setOpenTracking(false);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  background: form.tracking_integration === tracking.api_token ? '#18122b' : '#18122b',
                                  border: '1.5px solid #a78bfa',
                                  borderRadius: 8,
                                  margin: '2px 0',
                                  padding: '8px 14px',
                                  boxShadow: form.tracking_integration === tracking.api_token ? '0 2px 8px #a78bfa33' : 'none',
                                  transition: 'background 0.15s, border 0.15s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 2,
                                  width: '100%',
                                  color: '#fff',
                                  fontFamily: 'Inter, sans-serif',
                                }}
                                onMouseOver={e => {
                                  e.currentTarget.style.background = '#25113b';
                                  e.currentTarget.style.border = '1.5px solid #a78bfa';
                                }}
                                onMouseOut={e => {
                                  e.currentTarget.style.background = '#18122b';
                                  e.currentTarget.style.border = '1.5px solid #a78bfa';
                                }}
                              >
                                <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                                  UTMify: {tracking.api_token.slice(0, 6)}...{tracking.api_token.slice(-4)}
                                </div>
                                <div style={{ fontSize: 13, color: '#60a5fa', wordBreak: 'break-all', fontFamily: 'Inter, sans-serif' }}>UTMify</div>
                              </div>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}
                {/* Tab: Visual */}
                {activeTab === 'visual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={labelStyle}>Texto do Cronômetro</label>
                    <input name="timer_text" value={form.timer_text} onChange={handleChange} placeholder="Oferta por tempo limitado!" style={inputStyle} />
                    <label style={labelStyle}>Tempo do Cronômetro</label>
                    <input name="timer_value" value={form.timer_value} onChange={handleChange} placeholder="Ex: 10:00" style={inputStyle} />
                    <label style={labelStyle}>Preço</label>
                    <input name="price" type="text" inputMode="numeric" value={formatBRL(form.price)} onChange={handlePriceChange} style={inputStyle} />
                    <label style={labelStyle}>Descrição</label>
                    <textarea name="description" value={form.description} onChange={handleChange} style={{ ...inputLightStyle, minHeight: 60, width: '100%', border: '1.5px solid #1A0938', background: 'transparent', boxShadow: '0 4px 16px #000c', color: '#fff' }} />
                  </div>
                )}
                {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
                {success && <div style={{ color: '#22c55e', marginBottom: 12 }}>{success}</div>}
              </form>
            )}
          </div> {/* fechamento do modal principal */}
        </div> {/* fechamento do overlay de centralização */}
      </div> {/* fechamento do overlay escuro */}
    </>
  );
}