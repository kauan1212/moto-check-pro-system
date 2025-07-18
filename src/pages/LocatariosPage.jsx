import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Search, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LocatariosPage = ({ onSelectLocatario }) => {
  const { toast } = useToast();
  const [locatarios, setLocatarios] = useState([]);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [rg, setRg] = useState('');
  const [telefone, setTelefone] = useState(''); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLocatario, setEditingLocatario] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const storedLocatarios = JSON.parse(localStorage.getItem('locatariosLocAuto')) || [];
    setLocatarios(storedLocatarios);
  }, []);

  const saveLocatarios = (updatedLocatarios) => {
    setLocatarios(updatedLocatarios);
    localStorage.setItem('locatariosLocAuto', JSON.stringify(updatedLocatarios));
  };

  const resetForm = () => {
    setNomeCompleto('');
    setRg('');
    setTelefone('');
    setEditingLocatario(null);
    setIsFormVisible(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nomeCompleto || !rg || !telefone ) { 
      toast({ title: "Campos Obrigatórios", description: "Nome Completo, RG e Telefone são obrigatórios.", variant: "destructive" });
      return;
    }
    
    const telefoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
        toast({
            title: "Telefone Inválido",
            description: "Por favor, insira um número de telefone válido (Ex: (11) 98888-7777).",
            variant: "destructive"
        });
        return;
    }

    const locatarioData = { id: editingLocatario?.id || Date.now().toString(), nomeCompleto, rg, telefone };

    let updatedLocatarios;
    if (editingLocatario) {
      updatedLocatarios = locatarios.map(l => l.id === editingLocatario.id ? locatarioData : l);
      toast({ title: "Locatário Atualizado!", description: `${nomeCompleto} foi atualizado com sucesso.` });
    } else {
      updatedLocatarios = [...locatarios, locatarioData];
      toast({ title: "Locatário Cadastrado!", description: `${nomeCompleto} foi cadastrado com sucesso.` });
    }
    saveLocatarios(updatedLocatarios);
    resetForm();
  };

  const handleEdit = (locatario) => {
    setEditingLocatario(locatario);
    setNomeCompleto(locatario.nomeCompleto);
    setRg(locatario.rg || '');
    setTelefone(locatario.telefone || '');
    setIsFormVisible(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este locatário? Esta ação também removerá motos e agendamentos vinculados a ele.")) {
      const updatedLocatarios = locatarios.filter(l => l.id !== id);
      saveLocatarios(updatedLocatarios);
      
      const motosAtuais = JSON.parse(localStorage.getItem('motosLocAuto')) || [];
      const motosMantidas = motosAtuais.filter(m => String(m.locatarioId) !== String(id));
      localStorage.setItem('motosLocAuto', JSON.stringify(motosMantidas));

      const agendamentosAtuais = JSON.parse(localStorage.getItem('agendamentosLocAuto')) || [];
      const agendamentosMantidos = agendamentosAtuais.filter(a => {
        const locatarioDoAgendamento = locatarios.find(loc => String(loc.id) === String(a.locatarioId));
        return !locatarioDoAgendamento || String(locatarioDoAgendamento.id) !== String(id);
      });
      localStorage.setItem('agendamentosLocAuto', JSON.stringify(agendamentosMantidos));

      toast({ title: "Locatário Excluído!", description: "O locatário e seus dados vinculados foram excluídos." });
    }
  };

  const handleSelectAndGoToVistoria = (locatario) => {
    const motosCadastradas = JSON.parse(localStorage.getItem('motosLocAuto')) || [];
    const motoDoLocatario = motosCadastradas.find(m => String(m.locatarioId) === String(locatario.id));

    toast({
      title: "Locatário Selecionado!",
      description: `${locatario.nomeCompleto} ${motoDoLocatario ? `e a moto ${motoDoLocatario.modelo} (${motoDoLocatario.placa}) foram selecionados` : 'foi selecionado'}. Redirecionando para vistoria...`,
    });
    if(onSelectLocatario) {
      onSelectLocatario(locatario, motoDoLocatario);
    }
  };

  const filteredLocatarios = locatarios.filter(l =>
    l.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.rg && l.rg.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.telefone && l.telefone.includes(searchTerm))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-700">Gerenciar Locatários</CardTitle>
          <Button onClick={() => { setIsFormVisible(!isFormVisible); setEditingLocatario(null); if(isFormVisible) resetForm(); }} variant="ghost" className="text-purple-600 hover:text-purple-700">
            <PlusCircle className="mr-2 h-5 w-5" /> {isFormVisible ? 'Fechar Formulário' : 'Novo Locatário'}
          </Button>
        </CardHeader>
        <AnimatePresence>
          {isFormVisible && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 p-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="nomeCompleto">Nome Completo <span className="text-red-500">*</span></Label>
                      <Input id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="João da Silva" />
                    </div>
                    <div>
                      <Label htmlFor="rg">RG <span className="text-red-500">*</span></Label>
                      <Input id="rg" value={rg} onChange={(e) => setRg(e.target.value)} placeholder="00.000.000-0" />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone (WhatsApp) <span className="text-red-500">*</span></Label>
                      <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
                    </div>
                  </div>
                  <CardFooter className="pt-6 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                    <Button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                      {editingLocatario ? 'Salvar Alterações' : 'Cadastrar Locatário'}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">Lista de Locatários</CardTitle>
          <div className="mt-4 relative">
            <Input
              type="text"
              placeholder="Buscar por nome, RG ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLocatarios.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum locatário encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {filteredLocatarios.map(loc => (
                <motion.li 
                  key={loc.id} 
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <User className="h-6 w-6 mr-3 text-purple-500" />
                    <div>
                      <p className="font-semibold text-gray-800">{loc.nomeCompleto}</p>
                      <p className="text-sm text-gray-600">RG: {loc.rg} | Tel: {loc.telefone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                     <Button variant="default" size="sm" onClick={() => handleSelectAndGoToVistoria(loc)} className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" /> Sel. p/ Vistoria
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(loc)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(loc.id)} className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LocatariosPage;