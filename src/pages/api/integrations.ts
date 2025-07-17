import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, status, url, tracking_code, products, payment_methods, payment_status, producer_hash } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Título e URL são obrigatórios.' });
    }
    // Salva integração no banco
    const { error } = await supabase
      .from('integrations')
      .upsert({
        title,
        status,
        url,
        tracking_code,
        products,
        payment_methods,
        payment_status,
        producer_hash,
      });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Integração salva com sucesso!' });
  }
  return res.status(405).json({ error: 'Método não permitido' });
} 