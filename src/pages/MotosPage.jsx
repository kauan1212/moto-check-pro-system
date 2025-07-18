import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Search, Bike, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotosPage = () => {
  const { toast } = useToast();
  const [motos, setMotos] = useState([]);
  const [locatarios, setLocatarios] = useState([]);
  
  const [locatarioSelecionado, setLocatarioSelecionado] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState('');
  const [kmAtual, setKmAtual] = useState('');
  const [numeroChassi, setNumeroChassi] = useState('');
  const [numeroMotor, setNumeroMotor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMoto, setEditingMoto] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const storedMotos = JSON.parse(localStorage.getItem('motosLocAuto')) || [];
    setMotos(storedMotos);
    const storedLocatarios = JSON.parse(localStorage.getItem('locatariosLocAuto')) || [];
    setLocatarios(storedLocatarios);
  }, []);

  const saveMotos = (updatedMotos) => {
    setMotos(updatedMotos);
    localStorage.setItem('motosLocAuto', JSON.stringify(updatedMotos));
  };

  const resetForm = () => {
    setLocatarioSelecionado('');
    setModelo('');
    setPlaca('');
    setCor('');
    setAnoFabricacao('');
    setKmAtual('');
    setNumeroChassi('');
    setNumeroMotor('');
    setObservacoes('');
    setEditingMoto(null);
    setIsFormVisible(false);
  };

  const validatePlaca = (placa) => /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i.test(placa); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locatarioSelecionado || !modelo || !placa || !cor || !anoFabricacao || !kmAtual || !numeroChassi || !numeroMotor) {
      toast({ title: "Campos Obrigatórios", description: "Todos os campos marcados com * são obrigatórios, incluindo Chassi e Motor.", variant: "destructive" });
      return;
    }
    if (!validatePlaca(placa)) {
      toast({ title: "Placa Inválida", description: "Insira uma placa válida (Ex: ABC-1234 ou ABC1D23).", variant: "destructive" });
      return;
    }
    if (isNaN(parseInt(anoFabricacao)) || parseInt(anoFabricacao) < 1900 || parseInt(anoFabricacao) > new Date().getFullYear() + 1) {
       toast({ title: "Ano Inválido", description: "Insira um ano de fabricação válido.", variant: "destructive" });
       return;
    }
    if (isNaN(parseFloat(kmAtual)) || parseFloat(kmAtual) < 0) {
        toast({ title: "KM Inválida", description: "Insira uma quilometragem válida.", variant: "destructive" });
        return;
    }


    const motoData = { 
      id: editingMoto?.id || Date.now(), 
      locatarioId: locatarioSelecionado,
      modelo, 
      placa: placa.toUpperCase(), 
      cor, 
      anoFabricacao, 
      kmAtual, 
      numeroChassi,
      numeroMotor,
      observacoes 
    };

    if (editingMoto) {
      saveMotos(motos.map(m => m.id === editingMoto.id ? motoData : m));
      toast({ title: "Moto Atualizada!", description: `A moto ${modelo} - ${placa} foi atualizada.` });
    } else {
      saveMotos([...motos, motoData]);
      toast({ title: "Moto Cadastrada!", description: `A moto ${modelo} - ${placa} foi cadastrada.` });
    }
    resetForm();
  };

  const handleEdit = (moto) => {
    setEditingMoto(moto);
    setLocatarioSelecionado(String(moto.locatarioId));
    setModelo(moto.modelo);
    setPlaca(moto.placa);
    setCor(moto.cor);
    setAnoFabricacao(moto.anoFabricacao);
    setKmAtual(moto.kmAtual);
    setNumeroChassi(moto.numeroChassi || '');
    setNumeroMotor(moto.numeroMotor || '');
    setObservacoes(moto.observacoes || '');
    setIsFormVisible(true);
    window.scrollTo(0,0);
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta moto?")) {
      saveMotos(motos.filter(m => m.id !== id));
      toast({ title: "Moto Excluída!", description: "A moto foi excluída." });
    }
  };

  const getLocatarioNome = (locatarioId) => {
    const locatario = locatarios.find(l => String(l.id) === String(locatarioId));
    return locatario ? `${locatario.nomeCompleto} (RG: ${locatario.rg})` : 'Não vinculado';
  };

  const filteredMotos = motos.filter(m =>
    m.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.numeroChassi && m.numeroChassi.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.numeroMotor && m.numeroMotor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-8">
      <Card className="card-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-700">Gerenciar Motos</CardTitle>
           <Button onClick={() => { setIsFormVisible(!isFormVisible); setEditingMoto(null); if(isFormVisible) resetForm(); }} variant="ghost" className="text-purple-600 hover:text-purple-700">
            <PlusCircle className="mr-2 h-5 w-5" /> {isFormVisible ? 'Fechar Formulário' : 'Nova Moto'}
          </Button>
        </CardHeader>
        <AnimatePresence>
        {isFormVisible && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 p-2">
                <div>
                  <Label htmlFor="locatarioSelecionado">Locatário Vinculado <span className="text-red-500">*</span></Label>
                  <Select onValueChange={setLocatarioSelecionado} value={locatarioSelecionado}>
                    <SelectTrigger id="locatarioSelecionado">
                      <SelectValue placeholder="Selecione um locatário" />
                    </SelectTrigger>
                    <SelectContent>
                      {locatarios.map(loc => (
                        <SelectItem key={loc.id} value={String(loc.id)}>{loc.nomeCompleto} (RG: {loc.rg})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {locatarios.length === 0 && <p className="text-xs text-yellow-600 mt-1">Nenhum locatário cadastrado. Cadastre um locatário primeiro.</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="modelo">Modelo da Moto <span className="text-red-500">*</span></Label>
                    <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Honda CG 160 Titan" />
                  </div>
                  <div>
                    <Label htmlFor="placa">Placa <span className="text-red-500">*</span></Label>
                    <Input id="placa" value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC-1234 ou ABC1D23" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="cor">Cor <span className="text-red-500">*</span></Label>
                    <Input id="cor" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Preta" />
                  </div>
                  <div>
                    <Label htmlFor="anoFabricacao">Ano de Fabricação <span className="text-red-500">*</span></Label>
                    <Input id="anoFabricacao" type="number" value={anoFabricacao} onChange={(e) => setAnoFabricacao(e.target.value)} placeholder="2023" />
                  </div>
                  <div>
                    <Label htmlFor="kmAtual">KM Atual <span className="text-red-500">*</span></Label>
                    <Input id="kmAtual" type="number" value={kmAtual} onChange={(e) => setKmAtual(e.target.value)} placeholder="15000" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="numeroChassi" className="flex items-center">
                      <Fingerprint size={16} className="mr-1 text-gray-600"/> Número do Chassi <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input id="numeroChassi" value={numeroChassi} onChange={(e) => setNumeroChassi(e.target.value)} placeholder="Digite o número do chassi" />
                  </div>
                  <div>
                    <Label htmlFor="numeroMotor" className="flex items-center">
                      <Fingerprint size={16} className="mr-1 text-gray-600"/> Número do Motor <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input id="numeroMotor" value={numeroMotor} onChange={(e) => setNumeroMotor(e.target.value)} placeholder="Digite o número do motor" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoesMoto">Observações</Label>
                  <Textarea id="observacoesMoto" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais sobre a moto" />
                </div>
                <CardFooter className="pt-6 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-sky-600 text-white">
                    {editingMoto ? 'Salvar Alterações' : 'Cadastrar Moto'}
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
          <CardTitle className="text-xl font-semibold text-gray-700">Lista de Motos</CardTitle>
          <div className="mt-4 relative">
            <Input
              type="text"
              placeholder="Buscar por modelo, placa, chassi ou motor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          {filteredMotos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma moto encontrada.</p>
          ) : (
            <ul className="space-y-3">
              {filteredMotos.map(moto => (
                 <motion.li 
                  key={moto.id} 
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Bike className="h-6 w-6 mr-3 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-800">{moto.modelo} - {moto.placa}</p>
                      <p className="text-sm text-gray-600">
                        Locatário: {getLocatarioNome(moto.locatarioId)} | KM: {moto.kmAtual}
                      </p>
                      <p className="text-xs text-gray-500">
                        Chassi: {moto.numeroChassi || 'N/A'} | Motor: {moto.numeroMotor || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(moto)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(moto.id)} className="text-red-600 border-red-600 hover:bg-red-50">
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

export default MotosPage;