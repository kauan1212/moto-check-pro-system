import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ClipboardCopy } from 'lucide-react';
import { motion } from 'framer-motion';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import AgendamentoItem from '@/components/agendamentos/AgendamentoItem';
import { statusColors } from '@/components/agendamentos/agendamentoUtils';

const AgendamentosPage = ({ initialAgendamentoParaAnalisar, clearInitialAgendamentoParaAnalisar }) => {
  const { toast } = useToast();
  const [agendamentos, setAgendamentos] = useState([]);
  const [locatarios, setLocatarios] = useState([]);
  const [motos, setMotos] = useState([]);
  const [agendamentosPublicos, setAgendamentosPublicos] = useState([]);

  const [formState, setFormState] = useState({
    locatarioId: '',
    nomeLocatarioPublico: '',
    telefoneLocatarioPublico: '',
    placaMotoPublico: '',
    motoVinculada: '',
    tipoServico: '',
    dataAgendada: '',
    horarioAgendado: '',
    statusAgendamento: 'pendente',
    observacoes: '',
  });
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterData, setFilterData] = useState('');
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const agendamentoPublicoUrl = `${window.location.origin}${window.location.pathname}#/agendar-publico`;

  useEffect(() => {
    setAgendamentos(JSON.parse(localStorage.getItem('agendamentosLocAuto')) || []);
    setLocatarios(JSON.parse(localStorage.getItem('locatariosLocAuto')) || []);
    setMotos(JSON.parse(localStorage.getItem('motosLocAuto')) || []);
    setAgendamentosPublicos(JSON.parse(localStorage.getItem('agendamentosPublicosLocAuto')) || []);
  }, []);

  useEffect(() => {
    if (initialAgendamentoParaAnalisar) {
      handleAnalisarSolicitacao(initialAgendamentoParaAnalisar);
      if (clearInitialAgendamentoParaAnalisar) clearInitialAgendamentoParaAnalisar();
    }
  }, [initialAgendamentoParaAnalisar, clearInitialAgendamentoParaAnalisar]);

  const updateFormState = (newState) => {
    setFormState(prev => ({ ...prev, ...newState }));
  };
  
  const saveAgendamentosInternos = useCallback((updatedAgendamentos) => {
    setAgendamentos(updatedAgendamentos);
    localStorage.setItem('agendamentosLocAuto', JSON.stringify(updatedAgendamentos));
  }, []);

  const saveAgendamentosPublicos = useCallback((updatedAgendamentosPublicos) => {
    setAgendamentosPublicos(updatedAgendamentosPublicos);
    localStorage.setItem('agendamentosPublicosLocAuto', JSON.stringify(updatedAgendamentosPublicos));
  }, []);
  
  const motosFiltradasPorLocatario = formState.locatarioId 
    ? motos.filter(moto => String(moto.locatarioId) === String(formState.locatarioId))
    : [];

  const resetForm = useCallback(() => {
    setFormState({
      locatarioId: '',
      nomeLocatarioPublico: '',
      telefoneLocatarioPublico: '',
      placaMotoPublico: '',
      motoVinculada: '',
      tipoServico: '',
      dataAgendada: '',
      horarioAgendado: '',
      statusAgendamento: 'pendente',
      observacoes: '',
    });
    setEditingAgendamento(null);
    setIsFormVisible(false);
  }, []);

  const getNomeLocatario = useCallback((id) => locatarios.find(l => String(l.id) === String(id))?.nomeCompleto || id, [locatarios]);
  
  const getDescricaoMoto = useCallback((id, returnPlacaOnly = false) => {
    if(typeof id === 'string' && !motos.find(m => String(m.id) === String(id))) {
        return id;
    }
    const moto = motos.find(m => String(m.id) === String(id));
    if (returnPlacaOnly) return moto ? moto.placa : id;
    return moto ? `${moto.modelo} (${moto.placa})` : id;
  }, [motos]);

  const handleWhatsAppAction = useCallback((agendamentoDetails, action) => {
    const { nomeLocatario, placaMoto, tipoServico, dataAgendada, horarioAgendado, telefoneContato } = agendamentoDetails;
    
    if (!telefoneContato) {
       toast({ title: "Telefone não disponível", description: "Não há telefone para enviar a mensagem via WhatsApp.", variant: "destructive" });
       return;
    }
    
    const telefoneLimpo = `55${telefoneContato.replace(/\D/g, '')}`;
    let mensagem = "";

    const dataFormatada = new Date(dataAgendada + 'T00:00:00').toLocaleDateString('pt-BR');
    const tipoServicoFormatado = tipoServico.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    if (action === 'confirmar') {
      mensagem = `Olá ${nomeLocatario}, confirmamos seu agendamento para ${tipoServicoFormatado} na moto de placa ${placaMoto} no dia ${dataFormatada} às ${horarioAgendado}. Atenciosamente, LocAuto.`;
    } else if (action === 'reagendar') {
      mensagem = `Olá ${nomeLocatario}, sobre seu agendamento para ${tipoServicoFormatado} na moto de placa ${placaMoto} (solicitado para ${dataFormatada} às ${horarioAgendado}): gostaríamos de propor uma nova data/horário. Poderia entrar em contato? Atenciosamente, LocAuto.`;
    } else {
        return; 
    }
    
    const whatsappUrl = `https://wa.me/${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
    toast({ title: "Ação WhatsApp", description: `Mensagem para ${action} pronta para ser enviada para ${nomeLocatario}.` });
  }, [toast]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const { 
        locatarioId, nomeLocatarioPublico, telefoneLocatarioPublico, placaMotoPublico, 
        motoVinculada, tipoServico, dataAgendada, horarioAgendado, 
        statusAgendamento, observacoes 
    } = formState;

    const isPublicOrigin = editingAgendamento?.isPublic;
    const nomeParaMensagem = isPublicOrigin ? nomeLocatarioPublico : getNomeLocatario(locatarioId);
    const placaParaMensagem = isPublicOrigin ? placaMotoPublico : getDescricaoMoto(motoVinculada, true);
    const telefoneParaMensagem = isPublicOrigin ? telefoneLocatarioPublico : locatarios.find(l => String(l.id) === String(locatarioId))?.telefone;

    if(isPublicOrigin) {
        if (!nomeLocatarioPublico || !placaMotoPublico || !tipoServico || !dataAgendada || !horarioAgendado) {
             toast({ title: "Campos Obrigatórios", description: "Para confirmar uma solicitação pública, todos os campos (Nome, Placa, Serviço, Data, Horário) devem ser preenchidos.", variant: "destructive" });
            return;
        }
    } else {
        if (!locatarioId || !motoVinculada || !tipoServico || !dataAgendada || !horarioAgendado) {
          toast({ title: "Campos Obrigatórios", description: "Locatário, Moto, Serviço, Data e Horário são obrigatórios para agendamentos internos.", variant: "destructive" });
          return;
        }
    }

    const agendamentoData = { 
      id: editingAgendamento && !isPublicOrigin ? editingAgendamento.id : Date.now(), 
      locatarioId: isPublicOrigin ? nomeLocatarioPublico : locatarioId,
      motoId: isPublicOrigin ? placaMotoPublico : motoVinculada,
      tipoServico, 
      dataAgendada, 
      horarioAgendado, 
      statusAgendamento: statusAgendamento === 'solicitado_pelo_cliente' && !isPublicOrigin ? 'pendente' : statusAgendamento,
      observacoes,
      isPublicConfirmed: isPublicOrigin,
      telefoneContato: isPublicOrigin ? telefoneLocatarioPublico : (locatarios.find(l => String(l.id) === String(locatarioId))?.telefone),
    };

    if (editingAgendamento && !isPublicOrigin) {
      saveAgendamentosInternos(agendamentos.map(a => a.id === editingAgendamento.id ? agendamentoData : a));
      toast({ title: "Agendamento Atualizado!", description: "O agendamento interno foi atualizado." });
    } else {
      saveAgendamentosInternos([...agendamentos, agendamentoData]);
      toast({ title: "Agendamento Criado/Confirmado!", description: `Agendamento para ${nomeParaMensagem} criado/confirmado.` });
      
      if (statusAgendamento === 'confirmado') {
         handleWhatsAppAction({ ...agendamentoData, nomeLocatario: nomeParaMensagem, placaMoto: placaParaMensagem, telefoneContato: telefoneParaMensagem }, 'confirmar');
      } else if (statusAgendamento === 'reagendado'){
         handleWhatsAppAction({ ...agendamentoData, nomeLocatario: nomeParaMensagem, placaMoto: placaParaMensagem, telefoneContato: telefoneParaMensagem }, 'reagendar');
      }

      if (isPublicOrigin && editingAgendamento) {
        saveAgendamentosPublicos(agendamentosPublicos.filter(ap => ap.id !== editingAgendamento.id));
      }
    }
    resetForm();
  }, [editingAgendamento, formState, saveAgendamentosInternos, saveAgendamentosPublicos, agendamentos, agendamentosPublicos, resetForm, toast, getNomeLocatario, getDescricaoMoto, handleWhatsAppAction, locatarios]);

  const handleEditInterno = useCallback((agendamento) => {
    setEditingAgendamento(agendamento);
    updateFormState({
        locatarioId: String(agendamento.locatarioId),
        motoVinculada: String(agendamento.motoId),
        tipoServico: agendamento.tipoServico,
        dataAgendada: agendamento.dataAgendada,
        horarioAgendado: agendamento.horarioAgendado,
        statusAgendamento: agendamento.statusAgendamento,
        observacoes: agendamento.observacoes || '',
        nomeLocatarioPublico: '',
        telefoneLocatarioPublico: agendamento.telefoneContato || '',
        placaMotoPublico: '',
    });
    setIsFormVisible(true);
    window.scrollTo(0,0);
  }, []);

  const handleAnalisarSolicitacao = useCallback((agendamentoPublico) => {
    setEditingAgendamento({...agendamentoPublico, isPublic: true});
    updateFormState({
        nomeLocatarioPublico: agendamentoPublico.nomeLocatario,
        telefoneLocatarioPublico: agendamentoPublico.telefoneContato || '',
        placaMotoPublico: agendamentoPublico.placaMoto,
        tipoServico: agendamentoPublico.tipoServico,
        dataAgendada: agendamentoPublico.dataAgendada,
        horarioAgendado: agendamentoPublico.horarioAgendado,
        observacoes: agendamentoPublico.observacoes || '',
        statusAgendamento: 'pendente',
        locatarioId: '',
        motoVinculada: '',
    });
    setIsFormVisible(true);
    window.scrollTo(0,0);
  }, []);

  const handleDeleteInterno = useCallback((id) => {
    if (window.confirm("Tem certeza que deseja excluir este agendamento interno?")) {
      saveAgendamentosInternos(agendamentos.filter(a => a.id !== id));
      toast({ title: "Agendamento Excluído!", description: "O agendamento interno foi excluído." });
    }
  }, [agendamentos, saveAgendamentosInternos, toast]);
  
  const handleDeletePublico = useCallback((id) => {
     if (window.confirm("Tem certeza que deseja excluir esta solicitação de agendamento?")) {
      saveAgendamentosPublicos(agendamentosPublicos.filter(ap => ap.id !== id));
      toast({ title: "Solicitação Excluída!", description: "A solicitação pública foi excluída." });
    }
  }, [agendamentosPublicos, saveAgendamentosPublicos, toast]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Link Copiado!", description: "Link para agendamento público copiado para a área de transferência." });
    }).catch(err => {
      toast({ title: "Erro ao copiar", description: "Não foi possível copiar o link.", variant: "destructive" });
      console.error('Erro ao copiar link: ', err);
    });
  };

  const allCombinedAgendamentos = [
    ...agendamentos.map(ag => ({...ag, isPublic: false, isPublicConfirmed: ag.isPublicConfirmed || false })),
    ...agendamentosPublicos.map(ap => ({
        ...ap, 
        locatarioId: ap.nomeLocatario, 
        motoId: ap.placaMoto, 
        statusAgendamento: ap.status || 'solicitado_pelo_cliente',
        isPublic: true, 
        isPublicConfirmed: false,
    }))
  ];

  const filteredAgendamentos = allCombinedAgendamentos.filter(ag => {
    const matchStatus = filterStatus === 'all' || !filterStatus ? true : ag.statusAgendamento === filterStatus;
    const matchData = filterData ? ag.dataAgendada === filterData : true;
    return matchStatus && matchData;
  }).sort((a,b) => new Date(a.dataAgendada + 'T' + a.horarioAgendado) - new Date(b.dataAgendada + 'T' + b.horarioAgendado));


  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <Card className="card-shadow">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-gray-700">Gerenciar Agendamentos</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => { setIsFormVisible(!isFormVisible); setEditingAgendamento(null); if(isFormVisible) resetForm(); }} variant="ghost" className="text-purple-600 hover:text-purple-700 w-full sm:w-auto justify-start sm:justify-center">
              <PlusCircle className="mr-2 h-5 w-5" /> {isFormVisible && !editingAgendamento?.isPublic ? 'Fechar Formulário' : 'Novo Agendamento Interno'}
            </Button>
            <Button onClick={() => copyToClipboard(agendamentoPublicoUrl)} variant="outline" className="text-teal-600 border-teal-500 hover:bg-teal-50 w-full sm:w-auto justify-start sm:justify-center">
              <ClipboardCopy className="mr-2 h-5 w-5" /> Copiar Link Público
            </Button>
          </div>
        </CardHeader>
        <AgendamentoForm
            isFormVisible={isFormVisible}
            editingAgendamento={editingAgendamento}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
            formState={formState}
            updateFormState={updateFormState}
            locatarios={locatarios}
            motosFiltradasPorLocatario={motosFiltradasPorLocatario}
        />
      </Card>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">Lista de Todos os Agendamentos</CardTitle>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filterStatus">Filtrar por Status</Label>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger id="filterStatus"><SelectValue placeholder="Todos os Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="reagendado">Reagendado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="solicitado_pelo_cliente">Solicitado pelo Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterData">Filtrar por Data</Label>
              <Input id="filterData" type="date" value={filterData} onChange={e => setFilterData(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgendamentos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum agendamento encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {filteredAgendamentos.map(ag => (
                <AgendamentoItem
                  key={ag.id}
                  ag={ag}
                  statusColors={statusColors}
                  handleAnalisarSolicitacao={handleAnalisarSolicitacao}
                  handleDeletePublico={handleDeletePublico}
                  handleWhatsAppAction={handleWhatsAppAction}
                  handleEditInterno={handleEditInterno}
                  handleDeleteInterno={handleDeleteInterno}
                  getNomeLocatario={getNomeLocatario}
                  getDescricaoMoto={getDescricaoMoto}
                  locatarios={locatarios}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgendamentosPage;