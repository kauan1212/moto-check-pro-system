import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import VistoriaApp from '@/components/VistoriaApp';
import LocatariosPage from '@/pages/LocatariosPage';
import MotosPage from '@/pages/MotosPage';
import AgendamentosPage from '@/pages/AgendamentosPage';
import AgendamentoPublicoPage from '@/pages/AgendamentoPublicoPage'; 
import { Button } from '@/components/ui/button';
import { FileText, UserPlus, Bike, CalendarClock } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useToast } from '@/components/ui/use-toast';
import VistoriaHeader from '@/components/vistoria/VistoriaHeader';
import { PwaInstallProvider } from '@/components/PwaInstallPrompt';

const App = () => {
  const [currentPage, setCurrentPage] = useState('vistoria'); 
  const [vistoriaInitialData, setVistoriaInitialData] = useState(null);
  const [agendamentoParaAnalisar, setAgendamentoParaAnalisar] = useState(null);
  const { toast } = useToast();
  const SEU_NUMERO_WHATSAPP = "5515991653601"; 

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const validPages = ['vistoria', 'locatarios', 'motos', 'agendamentos', 'agendar-publico'];
      
      if (hash === 'agendar-publico') {
        setCurrentPage('agendar-publico');
      } else if (validPages.includes(hash) && hash !== 'agendar-publico') {
        setCurrentPage(hash);
      } else if (!hash || !validPages.includes(hash)) {
        setCurrentPage('vistoria');
        window.location.hash = '/vistoria';
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); 

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigateTo = (page) => {
    window.location.hash = `/${page}`;
  };
  
  const handleSelectLocatarioForVistoria = (locatario, moto) => {
    setVistoriaInitialData({
      cliente: locatario.nomeCompleto,
      rgLocatario: locatario.rg, 
      moto: moto ? moto.modelo : '',
      placa: moto ? moto.placa : '',
      cor: moto ? moto.cor : '',
      kmTotal: moto ? String(moto.kmAtual) : '',
      numeroChassi: moto ? moto.numeroChassi : '',
      numeroMotor: moto ? moto.numeroMotor : '',
    });
    navigateTo('vistoria');
  };

  const handleNovaSolicitacaoPublica = (agendamento) => {
    setAgendamentoParaAnalisar(agendamento);
    
    const mensagemWhatsAppAdmin = `🔔 *Nova Solicitação de Agendamento (LocAuto)* 🔔\n\n*Cliente:* ${agendamento.nomeLocatario}\n*Telefone Cliente:* ${agendamento.telefoneContato}\n*Placa:* ${agendamento.placaMoto}\n*Serviço:* ${agendamento.tipoServico.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n*Data:* ${new Date(agendamento.dataAgendada + 'T00:00:00').toLocaleDateString('pt-BR')}\n*Horário:* ${agendamento.horarioAgendado}\n*Obs:* ${agendamento.observacoes || 'Nenhuma'}\n\nPor favor, verifique no painel.`;
    const whatsappUrlAdmin = `https://wa.me/${SEU_NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsAppAdmin)}`;
    
    toast({
      title: "🔔 Nova Solicitação de Agendamento!",
      description: (
        <div>
          {`${agendamento.nomeLocatario} (${agendamento.placaMoto}) solicitou ${agendamento.tipoServico.replace(/_/g, ' ')}. `}
          <a 
            href={whatsappUrlAdmin} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-blue-600 hover:text-blue-800"
            onClick={(e) => e.stopPropagation()} 
          >
            Notificar Admin via WhatsApp
          </a>
          {' ou clique neste card para analisar.'}
        </div>
      ),
      duration: Infinity, 
      variant: "default_dark",
      className: "cursor-pointer hover:bg-gray-700",
      onClick: () => {
        navigateTo('agendamentos');
      }
    });

    const nomeServicoFormatado = agendamento.tipoServico.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const dataFormatada = new Date(agendamento.dataAgendada + 'T00:00:00').toLocaleDateString('pt-BR');

    const mensagemWhatsAppCliente = `Olá! Estou abrindo esta solicitação de agendamento:\n\n*Serviço:* ${nomeServicoFormatado}\n*Moto (Placa):* ${agendamento.placaMoto}\n*Data:* ${dataFormatada}\n*Horário:* ${agendamento.horarioAgendado}\n${agendamento.observacoes ? `*Observações:* ${agendamento.observacoes}\n` : ''}\nFico no aguardo do seu retorno para confirmar a disponibilidade. Obrigado!`;
    const whatsappUrlCliente = `https://wa.me/${SEU_NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagemWhatsAppCliente)}`;
    window.open(whatsappUrlCliente, '_blank');
  };

  const clearAgendamentoParaAnalisar = () => {
    setAgendamentoParaAnalisar(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'vistoria':
        return <VistoriaApp initialData={vistoriaInitialData} clearInitialData={() => setVistoriaInitialData(null)} />;
      case 'locatarios':
        return <LocatariosPage onSelectLocatario={handleSelectLocatarioForVistoria} />;
      case 'motos':
        return <MotosPage />;
      case 'agendamentos':
        return <AgendamentosPage initialAgendamentoParaAnalisar={agendamentoParaAnalisar} clearInitialAgendamentoParaAnalisar={clearAgendamentoParaAnalisar} onNavigateToAgendamentoPublico={() => navigateTo('agendar-publico')} />;
      case 'agendar-publico':
        return <AgendamentoPublicoPage onSolicitacaoEnviada={handleNovaSolicitacaoPublica}/>;
      default:
        return <VistoriaApp initialData={vistoriaInitialData} clearInitialData={() => setVistoriaInitialData(null)} />;
    }
  };
  
  const showHeaderAndMenu = currentPage !== 'agendar-publico';

  return (
    <PwaInstallProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {showHeaderAndMenu && (
          <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-1 py-1 sm:px-2 sm:py-2">
              <VistoriaHeader />
              <NavigationMenu className="mt-1 sm:mt-2">
                <NavigationMenuList className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                  <NavigationMenuItem>
                    <Button variant={currentPage === 'vistoria' ? "default" : "ghost"} onClick={() => navigateTo('vistoria')} className="flex items-center gap-1 text-xxs px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5">
                      <FileText size={14} /> <span className="hidden sm:inline">Vistoria</span>
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                     <Button variant={currentPage === 'locatarios' ? "default" : "ghost"} onClick={() => navigateTo('locatarios')} className="flex items-center gap-1 text-xxs px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5">
                      <UserPlus size={14} /> <span className="hidden sm:inline">Locatários</span>
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant={currentPage === 'motos' ? "default" : "ghost"} onClick={() => navigateTo('motos')} className="flex items-center gap-1 text-xxs px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5">
                      <Bike size={14} /> <span className="hidden sm:inline">Motos</span>
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                     <Button variant={currentPage === 'agendamentos' ? "default" : "ghost"} onClick={() => navigateTo('agendamentos')} className="flex items-center gap-1 text-xxs px-1.5 py-1 sm:text-xs sm:px-2 sm:py-1.5">
                      <CalendarClock size={14} /> <span className="hidden sm:inline">Agendamentos</span>
                    </Button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </header>
        )}
        
        <main className={`container mx-auto p-1 sm:p-2 ${currentPage === 'agendar-publico' ? 'pt-2 sm:pt-4' : ''}`}>
          {currentPage === 'agendar-publico' && (
              <div className="flex justify-center mb-2 sm:mb-4">
              </div>
          )}
          {renderPage()}
        </main>
        <Toaster />
      </div>
    </PwaInstallProvider>
  );
}

export default App;