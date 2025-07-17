import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Configuração do Firebase (você precisará configurar)
const FIREBASE_SERVER_KEY = process.env.FIREBASE_SERVER_KEY;
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;

interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  userId?: string;
  topic?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { title, body, icon, badge, data, userId, topic }: PushNotificationData = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Título e corpo são obrigatórios' });
    }

    // Se você tiver Firebase configurado
    if (FIREBASE_SERVER_KEY && FIREBASE_PROJECT_ID) {
      await sendFirebaseNotification({
        title,
        body,
        icon,
        badge,
        data,
        userId,
        topic
      });
    } else {
      // Fallback: salvar no banco para notificação local
      await saveNotificationToDatabase({
        title,
        body,
        icon,
        badge,
        data,
        userId
      });
    }

    res.status(200).json({ success: true, message: 'Notificação enviada' });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function sendFirebaseNotification(notificationData: PushNotificationData) {
  const { title, body, icon, badge, data, userId, topic } = notificationData;

  const message = {
    notification: {
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-192x192.png'
    },
    data: {
      ...data,
      click_action: data?.url || '/dashboard'
    },
    webpush: {
      headers: {
        'Urgency': 'high'
      },
      notification: {
        title,
        body,
        icon: icon || '/icons/icon-192x192.png',
        badge: badge || '/icons/icon-192x192.png',
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Abrir'
          },
          {
            action: 'close',
            title: 'Fechar'
          }
        ]
      }
    }
  };

  // Se tem userId específico, enviar para ele
  if (userId) {
    message.data = { ...message.data, userId };
  }

  // Se tem topic, enviar para o topic
  if (topic) {
    message.data = { ...message.data, topic };
  }

  const response = await fetch(
    `https://fcm.googleapis.com/fcm/send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    }
  );

  if (!response.ok) {
    throw new Error(`Firebase FCM error: ${response.status}`);
  }

  return response.json();
}

async function saveNotificationToDatabase(notificationData: PushNotificationData) {
  const { title, body, icon, badge, data, userId } = notificationData;

  const { error } = await supabase
    .from('notifications')
    .insert({
      title,
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-192x192.png',
      data: data || {},
      user_id: userId,
      created_at: new Date().toISOString(),
      read: false
    });

  if (error) {
    throw error;
  }
}

// Função para enviar notificação de venda aprovada
export async function sendSaleNotification(userId: string, saleData: any) {
  const notificationData = {
    title: '🎉 Venda Aprovada!',
    body: `Nova venda de R$ ${saleData.amount} aprovada`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/relatorio',
      type: 'sale_approved',
      saleId: saleData.id
    },
    userId
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar notificação de venda:', error);
    return false;
  }
}

// Função para enviar notificação de novo produto
export async function sendProductNotification(userId: string, productData: any) {
  const notificationData = {
    title: '📦 Novo Produto',
    body: `Produto "${productData.name}" criado com sucesso`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/produtos',
      type: 'product_created',
      productId: productData.id
    },
    userId
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar notificação de produto:', error);
    return false;
  }
} 