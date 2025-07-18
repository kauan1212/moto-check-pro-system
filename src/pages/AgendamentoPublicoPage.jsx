import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CalendarClock, Wrench as Tool, Send, User, Bike as BikeIcon, CalendarDays, Clock, MessageSquare, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import VistoriaHeader from '@/components/vistoria/VistoriaHeader'; 

const AgendamentoPublicoPage = ({ onSolicitacaoEnviada }) => {
  const { toast } = useToast();
  const [nomeLocatario, setNomeLocatario] = useState('');
  const [placaMoto, setPlacaMoto] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [dataAgendada, setDataAgendada] = useState('');
  const [horarioAgendado, setHorarioAgendado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [telefoneContato, setTelefoneContato] = useState('');


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    const placa = params.get('placa');
    if (nome) setNomeLocatario(decodeURIComponent(nome));
    if (placa) setPlacaMoto(decodeURIComponent(placa));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nomeLocatario || !placaMoto || !tipoServico || !dataAgendada || !horarioAgendado || !telefoneContato) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios, incluindo o telefone para contato.",
        variant: "destructive",
      });
      return;
    }
    
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!telefoneRegex.test(telefoneContato)) {
        toast({
            title: "Telefone Inválido",
            description: "Por favor, insira um número de telefone válido (Ex: (11) 98888-7777).",
            variant: "destructive"
        });
        return;
    }


    const agendamentoPublicoData = {
      nomeLocatario,
      placaMoto,
      tipoServico,
      dataAgendada,
      horarioAgendado,
      observacoes,
      telefoneContato,
      id: `public-${Date.now()}-${placaMoto}`,
      dataSolicitacao: new Date().toISOString(),
      status: 'solicitado_pelo_cliente'
    };
    
    const agendamentosPublicos = JSON.parse(localStorage.getItem('agendamentosPublicosLocAuto')) || [];
    agendamentosPublicos.push(agendamentoPublicoData);
    localStorage.setItem('agendamentosPublicosLocAuto', JSON.stringify(agendamentosPublicos));
    
    toast({
      title: "Solicitação Enviada!",
      description: "Sua solicitação de agendamento foi enviada. Entraremos em contato para confirmar.",
      className: "bg-green-500 text-white",
    });

    if(onSolicitacaoEnviada) {
        onSolicitacaoEnviada(agendamentoPublicoData);
    }

    setNomeLocatario('');
    setPlacaMoto('');
    setTipoServico('');
    setDataAgendada('');
    setHorarioAgendado('');
    setObservacoes('');
    setTelefoneContato('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6 }}
      className="container mx-auto p-4 max-w-2xl flex flex-col items-center pt-8 md:pt-16"
    >
      <VistoriaHeader />
      <Card className="mt-8 w-full card-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-700 flex items-center justify-center">
            <CalendarClock className="h-7 w-7 mr-2 text-purple-600" />
            Agendar Manutenção da Moto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nomeLocatarioPublico" className="flex items-center">
                <User size={16} className="mr-1 text-gray-600"/> Seu Nome Completo <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                id="nomeLocatarioPublico" 
                value={nomeLocatario} 
                onChange={(e) => setNomeLocatario(e.target.value)} 
                placeholder="Digite seu nome completo" 
                required
                className="mt-1"
              />
            </div>
             <div>
              <Label htmlFor="telefoneContatoPublico" className="flex items-center">
                <Phone size={16} className="mr-1 text-gray-600"/> Telefone para Contato (WhatsApp) <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                id="telefoneContatoPublico" 
                value={telefoneContato} 
                onChange={(e) => setTelefoneContato(e.target.value)} 
                placeholder="(XX) XXXXX-XXXX" 
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="placaMotoPublico" className="flex items-center">
                <BikeIcon size={16} className="mr-1 text-gray-600"/> Placa da Moto <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input 
                id="placaMotoPublico" 
                value={placaMoto} 
                onChange={(e) => setPlacaMoto(e.target.value.toUpperCase())} 
                placeholder="ABC-1234 ou ABC1D23" 
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tipoServicoPublico" className="flex items-center">
                <Tool size={16} className="mr-1 text-gray-600"/> Tipo de Manutenção <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select onValueChange={setTipoServico} value={tipoServico} required>
                <SelectTrigger id="tipoServicoPublico" className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corretiva">Manutenção Corretiva</SelectItem>
                  <SelectItem value="preventiva">Manutenção Preventiva</SelectItem>
                  <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dataAgendadaPublico" className="flex items-center">
                    <CalendarDays size={16} className="mr-1 text-gray-600"/> Data Desejada <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="dataAgendadaPublico" 
                  type="date" 
                  value={dataAgendada} 
                  onChange={(e) => setDataAgendada(e.target.value)} 
                  required 
                  className="mt-1"
                  min={new Date().toISOString().split("T")[0]} 
                />
              </div>
              <div>
                <Label htmlFor="horarioAgendadoPublico" className="flex items-center">
                    <Clock size={16} className="mr-1 text-gray-600"/> Horário Desejado <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="horarioAgendadoPublico" 
                  type="time" 
                  value={horarioAgendado} 
                  onChange={(e) => setHorarioAgendado(e.target.value)} 
                  required 
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observacoesPublico" className="flex items-center">
                <MessageSquare size={16} className="mr-1 text-gray-600"/> Observações (opcional)
              </Label>
              <Textarea 
                id="observacoesPublico" 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)} 
                placeholder="Descreva o problema ou detalhes adicionais aqui..." 
                className="mt-1"
              />
            </div>
            <CardFooter className="pt-6 flex justify-center">
              <Button type="submit" size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-3 text-lg">
                <Send className="mr-2 h-5 w-5" />
                Enviar Solicitação
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgendamentoPublicoPage;