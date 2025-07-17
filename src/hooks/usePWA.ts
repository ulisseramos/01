import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  isSupported: boolean;
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export const usePWA = () => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: true, // seguro para SSR
    hasNotificationPermission: false,
    isSupported: false // seguro para SSR
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Atualizar valores do browser após montagem
  useEffect(() => {
    setPwaState(prev => ({
      ...prev,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSupported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    }));
  }, []);

  // Verificar se PWA está instalado
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('appinstalled', checkInstallation);
    return () => window.removeEventListener('appinstalled', checkInstallation);
  }, []);

  // Capturar evento de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPwaState(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setPwaState(prev => ({ 
        ...prev, 
        hasNotificationPermission: Notification.permission === 'granted' 
      }));
    }
  }, []);

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          
          // Verificar atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  console.log('Nova versão disponível!');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }
  }, []);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('PWA já instalado ou não pode ser instalado');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso!');
        setDeferredPrompt(null);
        setPwaState(prev => ({ ...prev, canInstall: false, isInstalled: true }));
        return true;
      } else {
        console.log('Instalação cancelada pelo usuário');
        return false;
      }
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notificações não suportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPwaState(prev => ({ ...prev, hasNotificationPermission: granted }));
      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  }, []);

  // Enviar notificação local
  const sendNotification = useCallback(async (data: NotificationData) => {
    if (!pwaState.hasNotificationPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        data: data.data,
        requireInteraction: true,
        silent: false
      });

      // Atualizar badge
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(1);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return false;
    }
  }, [pwaState.hasNotificationPermission, requestNotificationPermission]);

  // Limpar badge
  const clearBadge = useCallback(() => {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge();
    }
  }, []);

  // Compartilhar conteúdo
  const shareContent = useCallback(async (data: {
    title: string;
    text: string;
    url?: string;
  }) => {
    if (!navigator.share) {
      console.log('Web Share API não suportada');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      return false;
    }
  }, []);

  // Registrar background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('Background Sync não suportado');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
      console.log('Background sync registrado:', tag);
      return true;
    } catch (error) {
      console.error('Erro ao registrar background sync:', error);
      return false;
    }
  }, []);

  // Registrar periodic background sync
  const registerPeriodicSync = useCallback(async (tag: string, minInterval: number) => {
    if (!('serviceWorker' in navigator) || !('periodicSync' in window)) {
      console.log('Periodic Background Sync não suportado');
      return false;
    }

    try {
      const permission = await navigator.permissions.query({
        name: 'periodic-background-sync' as any
      });

      if (permission.state !== 'granted') {
        console.log('Permissão para periodic sync não concedida');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await (registration as any).periodicSync.register(tag, {
        minInterval
      });
      console.log('Periodic sync registrado:', tag);
      return true;
    } catch (error) {
      console.error('Erro ao registrar periodic sync:', error);
      return false;
    }
  }, []);

  // Atualizar PWA
  const updatePWA = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);

  return {
    ...pwaState,
    installPWA,
    requestNotificationPermission,
    sendNotification,
    clearBadge,
    shareContent,
    registerBackgroundSync,
    registerPeriodicSync,
    updatePWA
  };
}; 