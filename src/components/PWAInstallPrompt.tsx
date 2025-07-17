import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { FiDownload, FiX, FiBell, FiShare2, FiWifi, FiWifiOff } from 'react-icons/fi';

interface PWAInstallPromptProps {
  onClose?: () => void;
  showOfflineStatus?: boolean;
  showNotificationPrompt?: boolean;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onClose,
  showOfflineStatus = true,
  showNotificationPrompt = true
}) => {
  const [mounted, setMounted] = useState(false);
  
  const {
    isInstalled,
    canInstall,
    isOnline,
    hasNotificationPermission,
    isSupported,
    installPWA,
    requestNotificationPermission,
    sendNotification,
    shareContent
  } = usePWA();

  const [isInstalling, setIsInstalling] = useState(false);
  const [showNotificationPromptState, setShowNotificationPromptState] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await installPWA();
      if (success) {
        // Enviar notificação de sucesso
        await sendNotification({
          title: 'EE App Instalado!',
          body: 'Seu app foi instalado com sucesso. Acesse-o pela tela inicial.',
          data: { url: '/dashboard' }
        });
      }
    } catch (error) {
      console.error('Erro na instalação:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      await sendNotification({
        title: 'Notificações Ativadas!',
        body: 'Você receberá notificações sobre vendas e atualizações.',
        data: { url: '/dashboard' }
      });
    }
  };

  const handleShare = async () => {
    await shareContent({
      title: 'EE - Sistema de Vendas',
      text: 'Conheça nosso sistema completo de vendas com integrações!',
      url: window.location.origin
    });
  };

  // Não renderizar até estar montado
  if (!mounted) {
    return null;
  }

  // Se não é suportado ou já instalado, não mostrar
  if (!isSupported || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      {/* Status Online/Offline */}
      {/* (Removido) */}

      {/* Prompt de Instalação */}
      {canInstall && (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Instalar App</h3>
                <p className="text-gray-400 text-xs">Acesse mais rápido pela tela inicial</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInstalling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Instalando...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  Instalar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Prompt de Notificação */}
      {/* (Removido) */}

      {/* Botão de Compartilhar */}
      {/* (Removido) */}
    </div>
  );
};

export default PWAInstallPrompt; 