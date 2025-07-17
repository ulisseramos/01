import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { logId } = req.body;
  if (!logId) {
    return res.status(400).json({ error: 'logId é obrigatório' });
  }

  const { data, error } = await supabase
    .from('checkout_logs')
    .select('status')
    .eq('log_id', logId)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ status: data?.status || null });
} 