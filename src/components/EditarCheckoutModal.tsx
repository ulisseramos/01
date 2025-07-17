import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import styles from '../styles/EditarCheckoutModal.module.css';

export default function EditarCheckoutModal({ id, open, onClose }) {
  const { user } = useAuth();
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
  });
  const [activeTab, setActiveTab] = useState('geral');
  const [produtos, setProdutos] = useState([]);
  const [openProduto, setOpenProduto] = useState(false);
  const [openProdutoNovo, setOpenProdutoNovo] = useState(false);
  const [pixels, setPixels] = useState([]);
  const [openPixel, setOpenPixel] = useState(false);
  const [trackings, setTrackings] = useState([]);
  const [openTracking, setOpenTracking] = useState(false);

  useEffect(() => {
    if (!id) return;
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
      });
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    supabase.from('products').select('id, name').eq('user_id', user.id).then(({ data }) => {
      if (data) setProdutos(data);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('integrations').select('pixel_id').eq('user_id', user.id).eq('provider', 'facebook_pixel').then(({ data }) => {
      if (data) setPixels(data.filter(p => p.pixel_id));
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('integrations').select('api_token').eq('user_id', user.id).eq('provider', 'utmify').then(({ data }) => {
      if (data) setTrackings(data.filter(t => t.api_token));
    });
  }, [user]);

  useEffect(() => {
    if (open) {
      document.body.classList.add('body-modal-open');
    } else {
      document.body.classList.remove('body-modal-open');
    }
    return () => {
      document.body.classList.remove('body-modal-open');
    };
  }, [open]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.from('products').update({
      offer_title: form.offer_title,
      checkout_name: form.checkout_name,
      metric_capture: form.metric_capture,
      email_method: form.email_method,
      banner_url: form.banner_url,
      redirect_url: form.redirect_url,
      main_product: form.main_product,
      order_bumps: form.order_bumps,
      author_name: form.author_name,
      ask_name: form.ask_name,
      ask_phone: form.ask_phone,
      ask_cpf: form.ask_cpf,
      info_field_text: form.info_field_text,
      timer_text: form.timer_text,
      timer_value: form.timer_value,
      price: form.price,
      description: form.description,
      payment_type: form.payment_type,
      accept_pix: form.accept_pix,
      accept_boleto: form.accept_boleto,
      accept_card: form.accept_card,
      max_installments: form.max_installments,
      has_offers: form.has_offers,
      novo_produto: form.novo_produto,
      tracking_integration: form.tracking_integration,
    }).eq('id', id);
    if (error) {
      setError('Erro ao salvar: ' + error.message);
    } else {
      setSuccess('Checkout atualizado com sucesso!');
      setTimeout(() => onClose(), 1200);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className={styles.editarCheckoutModal}>
        <form className={styles.editarCheckoutForm} onSubmit={handleSubmit}>
          <div className="modal-options-wrapper">
            <div className={styles.editarCheckoutGrid}>
              {/* ...campos do formulário, mantenha igual ao seu formulário atual... */}
              <div>
                <label>Título*</label>
                <input name="offer_title" value={form.offer_title} onChange={handleChange} required />
              </div>
              <div>
                <label>Descrição</label>
                <input name="description" value={form.description} onChange={handleChange} />
              </div>
              <div>
                <label>Tipo de pagamento*</label>
                <select name="payment_type" value={form.payment_type} onChange={handleChange} required>
                  <option value="pix">Pix</option>
                  <option value="boleto" disabled>Em breve: Boleto</option>
                  <option value="cartao" disabled>Em breve: Cartão de crédito</option>
                </select>
              </div>
              <div>
                <label>Valor*</label>
                <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
              </div>
              <div style={{ gridColumn: '1 / span 2', marginTop: 18 }}>
                <label>Produto principal</label>
                <input name="main_product" value={form.main_product} onChange={handleChange} />
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                <label>OrderBumps</label>
                <input name="order_bumps" value={form.order_bumps} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.editarCheckoutButtonRow}>
              <button type="submit" className={styles.editarCheckoutButton} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button type="button" className={styles.editarCheckoutButton} onClick={onClose}>
                Fechar
              </button>
            </div>
            {error && <div style={{ color: '#f87171', marginTop: 12 }}>{error}</div>}
            {success && <div style={{ color: '#22c55e', marginTop: 12 }}>{success}</div>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 