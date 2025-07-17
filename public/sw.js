const CACHE_NAME = 'ee-v1.0.0';
const STATIC_CACHE = 'ee-static-v1.0.0';
const DYNAMIC_CACHE = 'ee-dynamic-v1.0.0';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/produtos',
  '/relatorio',
  '/integracao',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cache estático aberto');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégia: Cache First para recursos estáticos
  if (request.method === 'GET' && !url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((fetchResponse) => {
              // Cache dinâmico para páginas
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback offline
          if (request.destination === 'document') {
            return caches.match('/');
          }
        })
    );
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  let notificationData = {
    title: 'EE - Sistema de Vendas',
    body: 'Você tem uma nova notificação!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .then(() => {
        // Atualizar badge
        if ('setAppBadge' in navigator) {
          navigator.setAppBadge(1);
        }
      })
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já existe uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não existe, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'database-sync') {
    event.waitUntil(syncDatabase());
  } else if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync:', event.tag);
  
  if (event.tag === 'fetch-new-content') {
    event.waitUntil(fetchNewContent());
  }
});

// Funções de sincronização
async function syncDatabase() {
  try {
    // Sincronizar dados locais com servidor
    console.log('Sincronizando banco de dados...');
    // Implementar lógica de sincronização
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

async function syncNotifications() {
  try {
    // Sincronizar notificações
    console.log('Sincronizando notificações...');
    // Implementar lógica de notificações
  } catch (error) {
    console.error('Erro na sincronização de notificações:', error);
  }
}

async function fetchNewContent() {
  try {
    // Buscar novo conteúdo
    console.log('Buscando novo conteúdo...');
    // Implementar lógica de busca de conteúdo
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
  }
}

// Share Target (receber compartilhamentos)
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share-action/') && event.request.method === 'GET') {
    event.respondWith(
      new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Compartilhamento Recebido</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <script>
            // Processar dados compartilhados
            const url = new URL(window.location);
            const title = url.searchParams.get('title');
            const text = url.searchParams.get('text');
            const sharedUrl = url.searchParams.get('url');
            
            // Redirecionar para página apropriada
            if (sharedUrl) {
              window.location.href = sharedUrl;
            } else {
              window.location.href = '/dashboard?shared=true&title=' + encodeURIComponent(title) + '&text=' + encodeURIComponent(text);
            }
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida no SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
}); 