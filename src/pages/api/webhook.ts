import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Busca o token da UTMify no banco pelo user_id
const getUtmifyToken = async (user_id: string) => {
  if (!user_id) return '';
  const { data, error } = await supabase
    .from('integrations')
    .select('api_token')
    .eq('user_id', user_id)
    .eq('provider', 'utmify')
    .single();
  return data?.api_token || '';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log('--- Webhook UTMify recebido ---');
    console.log('Método:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('-------------------------------');

    const { logId, status, user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id não informado no body.' });
    }
    const utmifyToken = await getUtmifyToken(user_id);
    if (!utmifyToken) {
      return res.status(400).json({ error: 'Token da UTMify não cadastrado para este usuário.' });
    }

    // Mapear status do sistema para status aceito pela UTMify
    const statusMap: Record<string, string> = {
      'pendente': 'waiting_payment',
      'aprovado': 'paid',
      'recusado': 'refused',
      'reembolsado': 'refunded',
      'chargeback': 'chargedback',
      // fallback: se já for um status aceito, mantém
      'waiting_payment': 'waiting_payment',
      'paid': 'paid',
      'refused': 'refused',
      'refunded': 'refunded',
      'chargedback': 'chargedback',
    };
    const utmifyStatus = statusMap[status] || 'waiting_payment';

    // Montar payload usando sempre os dados do body
    const payload = {
      orderId: req.body.orderId || logId,
      platform: req.body.platform || 'SeuSistema',
      paymentMethod: req.body.paymentMethod || 'pix',
      status: utmifyStatus,
      createdAt: req.body.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      approvedDate: req.body.approvedDate ?? (utmifyStatus === 'paid' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null),
      refundedAt: req.body.refundedAt ?? null,
      customer: req.body.customer || {
        name: 'Cliente',
        email: 'cliente@exemplo.com',
        phone: null,
        document: null,
        country: 'BR',
        ip: '127.0.0.1',
      },
      products: req.body.products || [
        {
          id: 'PROD-TESTE',
          name: 'Produto Teste',
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: 1000,
        },
      ],
      trackingParameters: req.body.trackingParameters || {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null,
      },
      commission: req.body.commission || {
        totalPriceInCents: 1000,
        gatewayFeeInCents: 0,
        userCommissionInCents: 1000,
        currency: 'BRL',
      },
      isTest: req.body.isTest ?? false,
    };
    console.log('Payload enviado para UTMify:', payload);

    try {
      const utmifyRes = await fetch('https://api.utmify.com.br/api-credentials/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': utmifyToken,
        },
        body: JSON.stringify(payload),
      });
      const utmifyData = await utmifyRes.json();
      console.log('Resposta da UTMify:', utmifyRes.status, utmifyData);
      if (!utmifyRes.ok) {
        return res.status(200).json({ error: 'Erro ao enviar para UTMify', details: utmifyData });
      }
      return res.status(200).json({ message: 'Webhook enviado para UTMify!', utmify: utmifyData });
    } catch (err: any) {
      console.error('Erro ao enviar para UTMify:', err);
      return res.status(500).json({ error: 'Erro ao enviar para UTMify', details: err.message });
    }
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 