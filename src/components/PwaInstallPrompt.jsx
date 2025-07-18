import React, { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/components/ui/use-toast';

const PwaInstallContext = createContext(null);

export const usePwaInstall = () => {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return context;
};

export const PwaInstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: 'App Já Instalado ou Indisponível',
        description: 'O app pode já estar instalado ou a instalação não está disponível no momento. Tente limpar o cache ou reinstalar.',
        variant: 'default_dark',
        duration: 5000,
      });
      return false;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: 'App Instalado!',
        description: 'O LocAuto Vistoria foi adicionado à sua tela inicial.',
        variant: 'default_dark',
      });
    } else {
      toast({
        title: 'Instalação Cancelada',
        description: 'Você pode instalar o app a qualquer momento pelo menu do navegador.',
        variant: 'default_dark',
      });
    }
    
    setDeferredPrompt(null); 
    return outcome === 'accepted';
  };

  return (
    <PwaInstallContext.Provider value={{ deferredPrompt, triggerInstall }}>
      {children}
    </PwaInstallContext.Provider>
  );
};