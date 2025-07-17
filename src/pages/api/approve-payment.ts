import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
// import { sendUtmfyWebhook } from '../../lib/utmfWebhook'; // Removido pois não existe mais

// Esta API usa a CHAVE DE SERVIÇO para ter permissão de administrador
// e atualizar qualquer registro no banco de dados.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { logId } = req.body;

    if (!logId) {
      return res.status(400).json({ error: 'O ID do log de checkout é obrigatório.' });
    }

    // Atualiza o status para aprovado
    const { data: venda, error } = await supabaseAdmin
      .from('checkout_logs')
      .update({ 
        status: 'aprovado',
        updated_at: new Date().toISOString() 
      })
      .eq('log_id', logId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao aprovar pagamento (API):', error);
      return res.status(500).json({ error: error.message });
    }

    // Remover chamada para webhook UTMFY

    console.log('Venda aprovada com sucesso pela API:', venda);
    res.status(200).json({ success: true, data: venda });

  } catch (err: any) {
    console.error('Erro inesperado na API approve-payment:', err);
    res.status(500).json({ error: 'Erro interno do servidor.', details: err.message });
  }
} 