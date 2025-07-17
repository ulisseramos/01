import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiArrowLeft, FiCheckCircle, FiStar, FiChevronDown, FiShield } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import { FaRegClock } from 'react-icons/fa';
import { FaReceipt, FaCheckCircle } from 'react-icons/fa';
import { FaRegCreditCard } from 'react-icons/fa';
import { Checkbox } from '../../components/ui/checkbox';

declare global {
  interface Window {
    fbq: any;
    _fbq?: any;
  }
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [logId, setLogId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('pendente');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [transId, setTransId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [pixelId, setPixelId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [clientIp, setClientIp] = useState<string | null>(null);
  const [checkingPix, setCheckingPix] = useState(false);
  const [pixError, setPixError] = useState('');
  const [mainProduct, setMainProduct] = useState<any>(null);
  const [mainProductError, setMainProductError] = useState('');
  const [orderBumpProducts, setOrderBumpProducts] = useState<any[]>([]);
  const [selectedOrderBumps, setSelectedOrderBumps] = useState<string[]>([]);

  // Remover o redirecionamento para login para tornar o checkout público
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace('/login');
  //   }
  // }, [user, loading, router]);

  useEffect(() => {
    // Busca usuário logado
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id || null);
    });
    // Tenta buscar apiKey do localStorage
    const localApiKey = localStorage.getItem('pushinpay_api_key');
    if (localApiKey) setApiKey(localApiKey);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchProductAndIntegration = async () => {
      try {
        // Buscar produto e integrações em paralelo para otimizar
        const [productResponse, integrationsResponse] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('public_id', id)
            .single(),
          supabase
            .from('integrations')
            .select('pixel_id, pushinpay_api_key')
            .eq('user_id', (await supabase.from('products').select('user_id').eq('public_id', id).single()).data?.user_id)
            .in('provider', ['facebook_pixel', 'pushinpay'])
        ]);

        if (productResponse.error) throw productResponse.error;
        if (!productResponse.data) throw new Error('Produto não encontrado');

        const productData = productResponse.data;
        setProduct(productData);
        setUserId(productData.user_id);

        // Processar integrações
        if (integrationsResponse.data) {
          const pixelIntegration = integrationsResponse.data.find(i => i.pixel_id);
          const pushinpayIntegration = integrationsResponse.data.find(i => i.pushinpay_api_key);
          
          if (pixelIntegration?.pixel_id) {
            setPixelId(pixelIntegration.pixel_id);
          }
          if (pushinpayIntegration?.pushinpay_api_key) {
            setApiKey(pushinpayIntegration.pushinpay_api_key);
          } else {
            // Fallback: tentar pegar do localStorage
            const localApiKey = localStorage.getItem('pushinpay_api_key');
            if (localApiKey) setApiKey(localApiKey);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar checkout:", error);
        setProduct(null);
      }
    };

    fetchProductAndIntegration();
  }, [id]);

  useEffect(() => {
    if (!product) return;
    // Se o checkout tem main_product, buscar o produto principal
    if (product.main_product) {
      supabase
        .from('products')
        .select('*')
        .eq('id', product.main_product)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setMainProduct(null);
            setMainProductError('Produto principal não encontrado ou foi excluído. Este checkout não está mais disponível.');
          } else {
            setMainProduct(data);
            setMainProductError('');
          }
        });
    } else {
      setMainProduct(null);
      setMainProductError('Produto principal não encontrado ou foi excluído. Este checkout não está mais disponível.');
    }
  }, [product]);

  // Remover useEffect de captura de IP
  // Remover campo ip do insert em checkout_logs
  // Remover chamada para /api/webhook após criar log

  // Injetar Pixel do Facebook se houver pixelId
  useEffect(() => {
    if (!pixelId || !product) return;
    // Evita injetar múltiplas vezes
    if (document.getElementById('fb-pixel-script')) return;
    (function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.id = 'fb-pixel-script';
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)})(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    // Envia currency e value no InitiateCheckout
    let value = Number(product.price);
    if (value > 1000) value = value / 100; // Corrige se estiver em centavos
    window.fbq('track', 'InitiateCheckout', { currency: 'BRL', value });
  }, [pixelId, product]);

  useEffect(() => {
    document.body.classList.add('checkout-page');
    document.body.style.overflowX = 'visible'; // Permite overflow horizontal
    return () => {
      document.body.classList.remove('checkout-page');
      document.body.style.overflowX = '';
    };
  }, []);

  useEffect(() => {
    // Remove o zoom apenas nesta página de checkout
    const html = document.documentElement;
    const originalZoom = html.style.zoom;
    html.style.zoom = '1';
    return () => {
      html.style.zoom = originalZoom || '';
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Função otimizada para inserir checkout com timeout
  const tryInsertCheckout = async (data: any, retries = 1) => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data: inserted, error } = await supabase
          .from('checkout_logs')
          .insert(data)
          .select()
          .single();
        
        if (!error) return { inserted, error: null };
        console.error('Erro Supabase:', error); // <-- Adicionado log detalhado
        if (!error.message.includes("ip")) return { inserted, error };
        
        // Se for erro de IP, tenta de novo imediatamente
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, 10)); // Reduzido para 10ms
        }
      } catch (err) {
        if (i === retries - 1) return { inserted: null, error: err };
      }
    }
    return { inserted: null, error: { message: "Erro ao registrar checkout." } };
  };

  const handleSubmitAndPay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setChecking(true);
    setFormError('');
    setFormSuccess('');
    // Validação dinâmica dos campos obrigatórios
    if ((askName && !form.nome) || (askPhone && !form.telefone) || (askCpf && !form.cpf)) {
      setFormError('Preencha todos os campos obrigatórios!');
      setChecking(false);
      return;
    }

    // Se já existe logId, só paga
    if (logId) {
      await handlePagar();
      setChecking(false);
      return;
    }

    // Envia formulário e depois paga
    const clientGeneratedId = uuidv4();
    setLogId(clientGeneratedId);
    
    // Cria o log no Supabase com timeout
    const logPromise = tryInsertCheckout({
      log_id: clientGeneratedId,
      product_id: product?.id,
      user_id: product?.user_id,
      price: total,
      checkout_url: window.location.href,
      status: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      cpf: form.cpf,
      order_bumps: selectedOrderBumps,
    });

    // Timeout de 2 segundos para criação do log
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao criar log')), 2000)
    );

    try {
      const { inserted, error } = await Promise.race([logPromise, timeoutPromise]) as any;
      
      if (error) {
        setFormError('Erro ao registrar checkout. Tente novamente.');
        setChecking(false);
        return;
      }

      setStatus('pendente');
      setFormSuccess('Dados enviados! Gerando pagamento...');
      
      // Chamar webhook em background (não bloquear)
      fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: clientGeneratedId,
          orderId: clientGeneratedId,
          status: 'pendente',
          user_id: product?.user_id,
          products: [
            {
              id: product.id,
              name: product.name,
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: Math.round(Number(product.price) * 100),
            },
            ...orderBumpProducts.filter(p => selectedOrderBumps.includes(p.id)).map(p => ({
              id: p.id,
              name: p.name,
              planId: null,
              planName: null,
              quantity: 1,
              priceInCents: Math.round(Number(p.price) * 100),
            }))
          ],
          commission: {
            totalPriceInCents: Math.round(Number(total) * 100),
            gatewayFeeInCents: 0,
            userCommissionInCents: Math.round(Number(total) * 100),
            currency: 'BRL',
          },
          customer: {
            name: form.nome,
            email: form.email,
            phone: form.telefone,
            document: form.cpf || null,
            country: 'BR',
            ip: '127.0.0.1',
          },
        })
      }).catch(console.error);

      // Gerar PIX imediatamente
      await handlePagar(clientGeneratedId);
      
    } catch (error) {
      setFormError('Erro ao processar checkout. Tente novamente.');
    }
    
    setChecking(false);
  };

  // Adaptar handlePagar para aceitar logId opcional
  const handlePagar = async (customLogId?: string) => {
    const useLogId = customLogId || logId;
    if (!useLogId) {
      setFormError('Preencha e envie o formulário antes de pagar!');
      return;
    }
    if (!apiKey) {
      setFormError('Chave de API não encontrada.');
      return;
    }
    setFormError('');
    setFormSuccess('');
    setChecking(true);
    
    try {
      const value = Math.round(Number(product.price) * 100);
      if (!value || isNaN(value) || value <= 0) {
        setFormError('Valor do produto inválido.');
        setChecking(false);
        return;
      }

      // Timeout de 3 segundos para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('https://api.pushinpay.com.br/api/pix/cashIn', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value,
          webhook_url: `${window.location.origin}/api/webhook`
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      console.log('PushinPay response:', data);
      
      if (!res.ok) {
        setFormError(data.error || data.message || JSON.stringify(data) || 'Erro ao gerar cobrança.');
        setChecking(false);
        return;
      }
      
      if (data.id && data.qr_code) {
        setPixCode(data.qr_code);
        setFormSuccess('Pagamento gerado! Copie o código Pix abaixo e pague no seu banco.');
        setTransId(data.id);
        
        if (!useLogId || typeof useLogId !== 'string' || useLogId.length < 10) {
          setFormError('Erro interno: logId inválido.');
          setChecking(false);
          return;
        }

        // Atualizar log em background (não bloquear a UI)
        (async () => {
          try {
            await supabase.from('checkout_logs').update({ 
              status: 'pendente', 
              transaction_id: data.id 
            }).eq('log_id', useLogId);
            // Iniciar verificação de status em background
            checkStatus(data.id);
          } catch (error) {
            console.error('Erro ao atualizar log:', error);
          }
        })();
        
      } else {
        setFormError('Erro ao gerar cobrança.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setFormError('Timeout: PIX não foi gerado em 3 segundos. Tente novamente.');
      } else {
        setFormError('Erro ao conectar com PushinPay.');
      }
    }
    setChecking(false);
  };

  const checkStatus = async (transactionId: string) => {
    if (!apiKey) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        // Timeout de 2 segundos para verificação de status
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const res = await fetch(`https://api.pushinpay.com.br/api/transactions/${transactionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await res.json();
        
        if (data.status === 'approved' || data.status === 'paid') {
          setStatus('aprovado');
          setFormSuccess('Pagamento aprovado!');
          
          // Usar logId atual se disponível
          let validLogId = logId;
          
          // Atualiza o log no banco em background
          if (validLogId) {
            (async () => {
              try {
                await supabase.from('checkout_logs')
                  .update({ status: 'aprovado', updated_at: new Date().toISOString() })
                  .eq('log_id', validLogId);
                
                // Chama webhook em background
                if (product && userId && validLogId) {
                  try {
                    await fetch('/api/webhook', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        logId: validLogId,
                        orderId: validLogId,
                        status: 'aprovado',
                        user_id: product.user_id,
                        products: [
                          {
                            id: product.id,
                            name: product.name,
                            planId: null,
                            planName: null,
                            quantity: 1,
                            priceInCents: Math.round(Number(product.price) * 100),
                          },
                          ...orderBumpProducts.filter(p => selectedOrderBumps.includes(p.id)).map(p => ({
                            id: p.id,
                            name: p.name,
                            planId: null,
                            planName: null,
                            quantity: 1,
                            priceInCents: Math.round(Number(p.price) * 100),
                          }))
                        ],
                        commission: {
                          totalPriceInCents: Math.round(Number(total) * 100),
                          gatewayFeeInCents: 0,
                          userCommissionInCents: Math.round(Number(total) * 100),
                          currency: 'BRL',
                        },
                        customer: {
                          name: form.nome,
                          email: form.email,
                          phone: form.telefone,
                          document: form.cpf || null,
                          country: 'BR',
                          ip: '127.0.0.1',
                        },
                      })
                    });
                  } catch (webhookError) {
                    console.error('Erro ao chamar webhook:', webhookError);
                  }
                }
              } catch (error) {
                console.error('Erro ao atualizar log:', error);
              }
            })();
          }
          
          clearInterval(interval);
          // Redireciona para página de obrigado
          router.push('/checkout/obrigado');
        } else if (attempts > 30) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        if (attempts > 10) {
          clearInterval(interval);
        }
      }
    }, 3000);
  };

  // Timer para banner
  function Timer() {
    const [time, setTime] = useState(3 * 60); // 3 minutos
    const [showColon, setShowColon] = useState(true);
    useEffect(() => {
      if (time <= 0) return;
      const interval = setInterval(() => setTime(t => t - 1), 1000);
      const colonInterval = setInterval(() => setShowColon(c => !c), 500);
      return () => { clearInterval(interval); clearInterval(colonInterval); };
    }, [time]);
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const min = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    return (
      <div className="checkout-timer checkout-timer-original">
        <div className="timer-block-glass">
          <span className="timer-digit">{hours}</span>
          <span className="timer-label">Horas</span>
        </div>
        <span className="timer-separator" style={{ opacity: showColon ? 1 : 0.3, transition: 'opacity 0.2s' }}>:</span>
        <div className="timer-block-glass">
          <span className="timer-digit">{min}</span>
          <span className="timer-label">Minutos</span>
        </div>
        <span className="timer-separator" style={{ opacity: showColon ? 1 : 0.3, transition: 'opacity 0.2s' }}>:</span>
        <div className="timer-block-glass">
          <span className="timer-digit">{sec}</span>
          <span className="timer-label">Segundos</span>
        </div>
      </div>
    );
  }

  // Certifique-se de que o logId está salvo no localStorage para persistência entre reloads
  useEffect(() => {
    if (logId) {
      localStorage.setItem('last_checkout_log_id', logId);
    }
  }, [logId]);

  // Função utilitária para garantir o logId correto
  function getValidLogId() {
    if (logId) return logId;
    const stored = localStorage.getItem('last_checkout_log_id');
    if (stored) return stored;
    return null;
  }

  async function handleCheckPixPayment() {
    setCheckingPix(true);
    setPixError('');
    try {
      const res = await fetch('/api/check-pix-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
      });
      const data = await res.json();
      if (data.status === 'aprovado') {
        window.location.href = '/checkout/obrigado';
      } else {
        setPixError('Pagamento ainda não confirmado. Aguarde alguns segundos e tente novamente.');
      }
    } catch (e) {
      setPixError('Erro ao verificar pagamento. Tente novamente.');
    }
    setCheckingPix(false);
  }

  // Adicionar flags para campos obrigatórios
  const askName = product?.ask_name;
  const askPhone = product?.ask_phone;
  const askCpf = product?.ask_cpf;

  // Calcular total com order bumps
  const total = Number(product?.price || 0) + orderBumpProducts.filter(p => selectedOrderBumps.includes(p.id)).reduce((sum, p) => sum + Number(p.price || 0), 0);

  // Função para alternar seleção de order bump
  function handleOrderBumpChange(bumpId: string) {
    setSelectedOrderBumps((prev) =>
      prev.includes(bumpId)
        ? prev.filter((id) => id !== bumpId)
        : [...prev, bumpId]
    );
  }

  // Buscar order bumps ao carregar o produto
  useEffect(() => {
    if (!product || !product.order_bumps) {
      setOrderBumpProducts([]);
      return;
    }
    let orderBumpIds = product.order_bumps;
    // Se vier como string JSON, faz o parse
    if (typeof orderBumpIds === 'string') {
      try {
        orderBumpIds = JSON.parse(orderBumpIds);
      } catch (e) {
        orderBumpIds = [];
      }
    }
    if (!Array.isArray(orderBumpIds) || orderBumpIds.length === 0) {
      setOrderBumpProducts([]);
      return;
    }
    supabase.from('products').select('*').in('id', orderBumpIds).then(({ data }) => {
      setOrderBumpProducts(data || []);
    });
  }, [product]);

  if (loading) {
    return <div className="checkout-loading"><div className="checkout-spinner"></div>Carregando...</div>;
  }

  if (mainProductError) {
    return <div className="checkout-loading" style={{ color: '#ef4444', fontWeight: 700, fontSize: 20, textAlign: 'center', marginTop: 40 }}>{mainProductError}</div>;
  }

  if (!product) {
    return <div className="checkout-loading">Produto não encontrado.</div>;
  }

  // Adicione media queries inline para responsividade do cronômetro
  const timerResponsive = window.innerWidth <= 480;

  // Novo componente de cronômetro laranja grudado ao texto
  function CronometroTopoLaranja({ timerText = 'Oferta por Tempo Limitado!', initialSeconds = 180, fixedTop = false }) {
    const [time, setTime] = useState(initialSeconds);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
      if (time <= 0) return;
      const interval = setInterval(() => setTime(t => t - 1), 1000);
      return () => clearInterval(interval);
    }, [time]);
    useEffect(() => {
      function handleResize() {
        setIsMobile(window.innerWidth < 500);
      }
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    const horas = Math.floor(time / 3600);
    const minutos = Math.floor((time % 3600) / 60);
    const segundos = time % 60;
    return (
      <div style={{
        width: '200vw', // estica MUITO além da tela
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        zIndex: 9999,
        background: '#FF0000',
        color: '#fff',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px 8px' : '12px 24px',
        borderRadius: 0,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 20,
        gap: isMobile ? 8 : 18,
        boxSizing: 'border-box',
        marginTop: 0,
        marginBottom: 0,
        boxShadow: 'none',
        minWidth: 0,
        overflow: 'visible',
      }}>
        {/* Conteúdo original do cronômetro */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: isMobile ? 10 : 0, width: isMobile ? '100%' : 'auto', marginLeft: '1cm' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? 36 : 48,
            height: isMobile ? 36 : 48,
            marginRight: isMobile ? 8 : 12,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <img
              src="https://i.imgur.com/dvMiEzm.png"
              alt="Cronômetro"
              style={{ width: isMobile ? 36 : 48, height: isMobile ? 36 : 48, background: 'transparent' }}
            />
          </span>
          <span style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, marginRight: isMobile ? 0 : 18, lineHeight: 1.1, whiteSpace: 'pre-line', textAlign: isMobile ? 'left' : 'start' }}>{timerText}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: isMobile ? 10 : 0, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}>
          <div style={{ background: '#FF5A7A', borderRadius: 6, padding: isMobile ? '6px 10px' : '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
            <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: 1 }}>{String(horas).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>HORAS</span>
          </div>
          <div style={{ background: '#FF5A7A', borderRadius: 6, padding: isMobile ? '6px 10px' : '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
            <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: 1 }}>{String(minutos).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>MIN</span>
          </div>
          <div style={{ background: '#FF5A7A', borderRadius: 6, padding: isMobile ? '6px 10px' : '6px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
            <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: 1 }}>{String(segundos).padStart(2, '0')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>SEG</span>
          </div>
        </div>
        {/* Força um espaço extra à direita */}
        <div style={{ position: 'absolute', right: '-200vw', top: 0, width: '200vw', height: 1, pointerEvents: 'none' }} />
      </div>
    );
  }

  return (
    <div className="checkout-container">
    
      {/* NOVO: Cronômetro topo laranja grudado ao texto */}
      { !pixCode && (
        <CronometroTopoLaranja timerText="Oferta por Tempo Limitado!" initialSeconds={180} fixedTop />
      )}
      {/* Card de resumo do pedido */}
      { !pixCode && product && (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 16px #0001',
          margin: '1.2rem 0 1.2rem 0',
          width: '100%',
          maxWidth: 370,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          border: '2px solid #e0e7ff',
          padding: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Faixa verde topo */}
          <div style={{ background: '#22C55E', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.3rem', fontWeight: 600, fontSize: 18, borderTopLeftRadius: 16, borderTopRightRadius: 16, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Resumo <FiChevronDown size={20} style={{ marginLeft: 2 }} /></span>
            <span style={{ fontWeight: 600, fontSize: 18 }}>R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {/* Linha produto */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 1.3rem 0.7rem 1.3rem', gap: 14, fontFamily: 'Inter, sans-serif' }}>
            {product.imagem_url && (
              <img src={product.imagem_url} alt={product.name} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 10, boxShadow: '0 1px 6px #0001', background: '#f3f3f3', border: '2px solid #f3f3f3', flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, color: '#23243a', fontWeight: 500, fontSize: 16, marginLeft: product.imagem_url ? 12 : 0 }}>{product.name || 'Produto'}</span>
            <span style={{ color: '#181818', fontWeight: 600, fontSize: 16 }}>R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          {/* Linha divisória */}
          <div style={{ height: 1, width: '100%', borderTop: '1px dashed #FFD600', background: 'none', margin: '0.5rem 0 0.5rem 0' }} />
          {/* Removido: Order Bumps do resumo do pedido */}
          {/* Total atualizado */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.3rem 1.2rem 1.3rem', fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#181818', fontWeight: 700, fontSize: 18 }}>Total</span>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 20 }}>R$ {Number(total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
      {/* Formulário e pagamento */}
      { !pixCode ? (
        <>
          <div className="identificacao-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                background: '#181818',
                color: '#fff',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                marginLeft: 4,
                marginTop: 0,
              }}>
                <FiUser size={20} />
              </div>
              <span style={{
                fontWeight: 600,
                fontSize: 19,
                color: '#23243a',
                letterSpacing: 0.1,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.2,
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                height: 32,
              }}>Identificação</span>
            </div>
            {askName && (
              <>
                <label htmlFor="nome" style={{ fontWeight: 600, color: '#181818', marginBottom: 4, display: 'block' }}>Nome completo</label>
                <input name="nome" id="nome" value={form.nome} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="Nome completo" required style={{ borderRadius: 8, marginBottom: 18 }} />
              </>
            )}
            {askCpf && (
              <>
                <label htmlFor="cpf" style={{ fontWeight: 600, color: '#181818', marginBottom: 4, display: 'block' }}>CPF/CNPJ</label>
                <input name="cpf" id="cpf" value={form.cpf} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="CPF/CNPJ" required style={{ borderRadius: 8, marginBottom: 18 }} />
              </>
            )}
            {askPhone && (
              <>
                <label htmlFor="telefone" style={{ fontWeight: 600, color: '#181818', marginBottom: 4, display: 'block' }}>Telefone</label>
                <input name="telefone" id="telefone" value={form.telefone} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="Telefone" required style={{ borderRadius: 8, marginBottom: 18 }} />
              </>
            )}
            <label htmlFor="email" style={{ fontWeight: 600, color: '#181818', marginBottom: 4, display: 'block' }}>E-mail</label>
            <input name="email" id="email" type="email" value={form.email} onChange={handleChange} className="checkout-input checkout-input-pro" placeholder="E-mail" required style={{ borderRadius: 8, marginBottom: 18 }} />
          </div>
          <div className="checkout-form-card checkout-form-card-pro" style={{ boxShadow: '0 8px 32px rgba(60,60,120,0.13), 0 2px 8px rgba(37,99,235,0.08)' }}>
            {/* Título e lista de order bumps */}
            {orderBumpProducts.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 18, padding: '28px 22px 24px 22px', marginTop: 28, marginBottom: 28, boxShadow: '0 4px 24px #0004', maxWidth: 480, border: '1.5px solid #e5e7eb', transition: 'box-shadow 0.18s', position: 'relative', color: '#18122B', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18 }}>
                Temos uma oferta especial adicional para você!
              </div>
            )}
            {orderBumpProducts.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 18, padding: '28px 22px 24px 22px', marginTop: 28, marginBottom: 28, boxShadow: '0 4px 24px #0004', maxWidth: 480, border: '1.5px solid #e5e7eb', transition: 'box-shadow 0.18s', position: 'relative', color: '#18122B', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 18 }}>
                Temos uma oferta especial adicional para você!
              </div>
            )}
            {orderBumpProducts.length > 0 && (
              <div style={{ marginBottom: 0, marginTop: 2 }}>
                {orderBumpProducts.map((bump) => {
                  const isSelected = selectedOrderBumps.includes(bump.id);
                  return (
                    <div
                      key={bump.id}
                      onClick={() => handleOrderBumpChange(bump.id)}
                      style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: isSelected ? '0 4px 16px #a78bfa33' : '0 2px 8px #0002',
                        border: '1.5px dashed #FFD600',
                        marginBottom: 18,
                        overflow: 'hidden',
                        fontFamily: 'Inter, sans-serif',
                        maxWidth: 440,
                        padding: 0,
                        transition: 'box-shadow 0.18s, border 0.18s',
                        cursor: 'pointer',
                        outline: isSelected ? '2px solid #a78bfa' : 'none',
                      }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px #FFD60033'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = isSelected ? '0 4px 16px #a78bfa33' : '0 2px 8px #0002'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '20px 20px 0 20px', gap: 16 }}>
                        {bump.imagem_url && (
                          <img src={bump.imagem_url} alt={bump.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, background: '#f3f3f3', border: '1.5px solid #f3f3f3', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#18122B', fontWeight: 900, fontSize: 17, marginBottom: 2, letterSpacing: 0.1 }}>{bump.name}</div>
                          <div style={{ color: '#444', fontWeight: 400, fontSize: 15, marginBottom: 8, lineHeight: 1.4 }}>{bump.description}</div>
                          <div style={{ color: '#22c55e', fontWeight: 800, fontSize: 18, marginBottom: 2, letterSpacing: 0.1 }}>+ R$ {Number(bump.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                      <div style={{ borderTop: '1.5px dashed #FFD600', background: '#FFFDEB', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ accentColor: '#a78bfa', width: 24, height: 24, marginRight: 10, pointerEvents: 'none', verticalAlign: 'middle' }}
                        />
                        <span style={{ fontWeight: 800, color: '#18122B', fontSize: 17, letterSpacing: 0.1, verticalAlign: 'middle' }}>Quero comprar também!</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, marginTop: 12 }}>
              <div style={{
                background: '#18181b',
                color: '#fff',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8, // leve arredondamento
                marginLeft: 4,
                marginTop: 0, // Alinhamento vertical
              }}>
                <FaRegCreditCard size={20} />
              </div>
              <span style={{
                fontWeight: 600,
                fontSize: 19,
                color: '#23243a',
                letterSpacing: 0.1,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.2,
                marginTop: 0, // Garantir alinhamento
                display: 'flex',
                alignItems: 'center',
                height: 32, // Igual ao número para alinhar
              }}>Formas de pagamento</span>
            </div>
            <div style={{
              background: '#fff',
              border: '1px solid #22c55e',
              borderRadius: 10,
              padding: '0.6rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 1px 4px #22c55e08',
              maxWidth: 220,
              marginBottom: 12
            }}>
              <img
                src="https://i.imgur.com/rYCqTX3.png"
                alt="Pix"
                style={{ width: 24, height: 24, objectFit: 'contain', marginRight: 8 }}
              />
              <span style={{
                color: '#22c55e',
                fontWeight: 600,
                fontSize: 16,
                fontFamily: 'Inter, sans-serif'
              }}>
                Pix
              </span>
            </div>
            <div style={{
              background: '#fff',
              border: '1.5px solid #e0e7ef',
              borderRadius: 14,
              boxShadow: '0 2px 8px #22c55e11',
              marginBottom: 18,
              padding: '16px 12px 8px 12px',
              maxWidth: 370,
              width: '92%',
              fontFamily: 'Inter, sans-serif',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              <div style={{ fontWeight: 700, fontSize: 19, color: '#181818', marginBottom: 16, letterSpacing: 0.1 }}>Pague com PIX</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ background: '#e7fbe9', color: '#22c55e', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaRegClock size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, color: '#22c55e' }}>Transferência Instantânea</div>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 1 }}>Sua compra é confirmada em segundos, sem esperas.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ background: '#e7fbe9', color: '#22c55e', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="6" height="6" rx="2" stroke="#22c55e" strokeWidth="2"/><rect x="15" y="3" width="6" height="6" rx="2" stroke="#22c55e" strokeWidth="2"/><rect x="15" y="15" width="6" height="6" rx="2" stroke="#22c55e" strokeWidth="2"/><rect x="3" y="15" width="6" height="6" rx="2" stroke="#22c55e" strokeWidth="2"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="#22c55e" strokeWidth="2"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, color: '#22c55e' }}>Praticidade Máxima</div>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 1 }}>Escaneie o QR code ou copie o código PIX. Pronto!</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
                <div style={{ background: '#e7fbe9', color: '#22c55e', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiShield size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, color: '#22c55e' }}>Segurança Garantida</div>
                  <div style={{ color: '#6b7280', fontSize: 14, marginTop: 1 }}>Tecnologia do Banco Central para sua tranquilidade.</div>
                </div>
              </div>
            </div>
            {formError && <div className="checkout-message error checkout-message-pro">{formError}</div>}
            {formSuccess && <div className="checkout-message success checkout-message-pro"><FiCheckCircle style={{marginRight: 6}} /> {formSuccess}</div>}
            <button
              onClick={handleSubmitAndPay}
              className="checkout-btn checkout-btn-pro"
              disabled={checking}
              style={{
                background: '#22c55e',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                borderRadius: 8,
                padding: '1.1rem',
                marginTop: 8,
                boxShadow: '0 2px 8px #22c55e33',
                cursor: checking ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s, box-shadow 0.18s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#16a34a'}
              onMouseOut={e => e.currentTarget.style.background = '#22c55e'}
            >
              {checking ? 'Processando...' : 'Pagar agora'}
            </button>
          </div>
        </>
      ) : (
        <div className="checkout-qrcode checkout-qrcode-pro" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
          <div className="checkout-qrcode-label" style={{ fontSize: 24, fontWeight: 700, color: '#22c55e', marginBottom: 18 }}>Finalize seu pagamento</div>
          <QRCodeCanvas value={pixCode} size={180} bgColor="#fff" fgColor="#2563eb" style={{marginBottom: 12, borderRadius: 12, boxShadow: '0 2px 12px #2563eb22'}} />
          <div style={{ color: '#888', fontWeight: 500, fontSize: 15, marginBottom: 12 }}>Escaneie o código QR com a câmera do seu celular</div>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 18, margin: '12px 0 8px 0', textAlign: 'center' }}>Ou</div>
          <div style={{ fontWeight: 700, color: '#181818', marginBottom: 4 }}>Código PIX</div>
          <textarea
            className="checkout-pix-code checkout-pix-code-pro"
            value={pixCode}
            readOnly
            style={{ width: '100%', minHeight: 48, borderRadius: 8, padding: 8, fontSize: 15, marginBottom: 8, background: '#f8fafc', color: '#222', border: '1.5px solid #22c55e', fontWeight: 600 }}
          />
          <button
            className="checkout-btn checkout-btn-copy"
            style={{ marginTop: 8, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 16 }}
            onClick={() => { navigator.clipboard.writeText(pixCode); setFormSuccess('Código Pix copiado!'); }}
            type="button"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M16.5 2A2.5 2.5 0 0 1 19 4.5V6h-1.5A2.5 2.5 0 0 0 15 8.5V10h-1.5A2.5 2.5 0 0 0 11 12.5V14H9.5A2.5 2.5 0 0 0 7 16.5V19H4.5A2.5 2.5 0 0 1 2 16.5v-12A2.5 2.5 0 0 1 4.5 2h12Z"/><path fill="#fff" d="M8.5 8A2.5 2.5 0 0 1 11 10.5V19a2.5 2.5 0 0 0 2.5 2.5h7A2.5 2.5 0 0 0 23 19v-8.5A2.5 2.5 0 0 0 20.5 8h-12Z"/></svg>
              Copiar código PIX
            </span>
          </button>
          <div style={{ marginTop: 18, width: '100%' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#181818', marginBottom: 10 }}>Instruções</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>1</div>Abra o app do seu banco</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>2</div>Na seção PIX, selecione "Pix Copia e Cola"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>3</div>Cole o código copiado</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ background: '#22c55e', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>4</div>Confirme o pagamento</div>
            </div>
            <div style={{ background: '#e7fbe9', border: '1.5px solid #22c55e', borderRadius: 8, padding: 12, marginTop: 16, color: '#047857', fontWeight: 600, fontSize: 15 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Aguardando pagamento</div>
              Após o pagamento, aguarde alguns segundos para a confirmação.
            </div>
          </div>
          <button className="checkout-btn checkout-btn-pro" style={{ marginTop: 18, fontWeight: 700, fontSize: 17 }} onClick={handleCheckPixPayment} disabled={checkingPix}>
            {checkingPix ? 'Verificando...' : 'Já fiz o pagamento'}
          </button>
          {pixError && <div style={{ color: '#b91c1c', marginTop: 8, fontWeight: 600 }}>{pixError}</div>}
        </div>
      )}
    </div>
  );
} 

function TimerStyled() {
  const [time, setTime] = useState(3 * 60); // 3 minutos
  const [timerResponsive, setTimerResponsive] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 480 : false
  );

  useEffect(() => {
    function handleResize() {
      setTimerResponsive(window.innerWidth <= 480);
    }
    window.addEventListener('resize', handleResize);
    // Chama uma vez para garantir valor inicial
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (time <= 0) return;
    const interval = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [time]);
  const hours = String(Math.floor(time / 3600)).padStart(2, '0');
  const min = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const sec = String(time % 60).padStart(2, '0');
  return (
    <div style={{
      display: 'flex',
      gap: timerResponsive ? 8 : 18,
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: timerResponsive ? 'wrap' : 'nowrap',
    }}>
      <div style={{
        background: '#FF0000',
        borderRadius: 10,
        padding: timerResponsive ? '8px 10px' : '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: timerResponsive ? 54 : 80,
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: timerResponsive ? 18 : 28, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>{hours}</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: timerResponsive ? 11 : 14, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Horas</span>
      </div>
      <div style={{
        background: '#FF0000',
        borderRadius: 10,
        padding: timerResponsive ? '8px 10px' : '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: timerResponsive ? 54 : 80,
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: timerResponsive ? 18 : 28, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>{min}</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: timerResponsive ? 11 : 14, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Minutos</span>
      </div>
      <div style={{
        background: '#FF0000',
        borderRadius: 10,
        padding: timerResponsive ? '8px 10px' : '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: timerResponsive ? 54 : 80,
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: timerResponsive ? 18 : 28, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>{sec}</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: timerResponsive ? 11 : 14, fontFamily: 'Inter, sans-serif', marginTop: 2 }}>Segundos</span>
      </div>
    </div>
  );
} 