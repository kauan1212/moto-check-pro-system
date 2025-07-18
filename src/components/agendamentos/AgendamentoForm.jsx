import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const AgendamentoForm = ({
  isFormVisible,
  editingAgendamento,
  handleSubmit,
  resetForm,
  formState,
  updateFormState,
  locatarios,
  motosFiltradasPorLocatario
}) => {
  const { 
    locatarioId, nomeLocatarioPublico, telefoneLocatarioPublico, placaMotoPublico, 
    motoVinculada, tipoServico, dataAgendada, horarioAgendado, 
    statusAgendamento, observacoes 
  } = formState;

  return (
    <AnimatePresence>
      {isFormVisible && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
          <CardContent>
             <h3 className="text-lg font-semibold mb-4 text-gray-600">
              {editingAgendamento?.isPublic ? 'Analisar Solicitação Pública' : (editingAgendamento ? 'Editar Agendamento Interno' : 'Novo Agendamento Interno')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6 p-2">
              {editingAgendamento?.isPublic ? (
                  <>
                      <Input type="hidden" value={nomeLocatarioPublico} />
                      <Input type="hidden" value={placaMotoPublico} />
                      <div className="p-3 bg-purple-50 rounded-md border border-purple-200 space-y-2">
                          <p className="text-sm font-medium text-purple-700">Solicitação de: {nomeLocatarioPublico}</p>
                          <p className="text-sm text-purple-600">Telefone: {telefoneLocatarioPublico || 'Não informado'}</p>
                          <p className="text-sm text-purple-600">Placa: {placaMotoPublico}</p>
                      </div>
                  </>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <Label htmlFor="agLocatario">Locatário (Interno) <span className="text-red-500">*</span></Label>
                          <Select onValueChange={val => {updateFormState({ locatarioId: val, motoVinculada: ''});}} value={locatarioId}>
                          <SelectTrigger id="agLocatario"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                              {locatarios.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.nomeCompleto}</SelectItem>)}
                          </SelectContent>
                          </Select>
                      </div>
                      <div>
                          <Label htmlFor="agMoto">Moto Vinculada (Interno) <span className="text-red-500">*</span></Label>
                          <Select onValueChange={val => updateFormState({ motoVinculada: val })} value={motoVinculada} disabled={!locatarioId || motosFiltradasPorLocatario.length === 0}>
                          <SelectTrigger id="agMoto"><SelectValue placeholder={!locatarioId ? "Selecione o locatário primeiro" : (motosFiltradasPorLocatario.length === 0 ? "Nenhuma moto para este locatário" : "Selecione a moto")} /></SelectTrigger>
                          <SelectContent>
                              {motosFiltradasPorLocatario.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.modelo} ({m.placa})</SelectItem>)}
                          </SelectContent>
                          </Select>
                      </div>
                  </div>
              )}
              <div>
                <Label htmlFor="agTipoServico">Tipo de Serviço <span className="text-red-500">*</span></Label>
                <Select onValueChange={val => updateFormState({ tipoServico: val })} value={tipoServico}>
                  <SelectTrigger id="agTipoServico"><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
                    <SelectItem value="revisao">Revisão</SelectItem>
                    <SelectItem value="manutencao_corretiva">Manutenção Corretiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="agData">Data Agendada <span className="text-red-500">*</span></Label>
                  <Input id="agData" type="date" value={dataAgendada} onChange={e => updateFormState({ dataAgendada: e.target.value })} min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <Label htmlFor="agHorario">Horário Agendado <span className="text-red-500">*</span></Label>
                  <Input id="agHorario" type="time" value={horarioAgendado} onChange={e => updateFormState({ horarioAgendado: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="agStatus">Status <span className="text-red-500">*</span></Label>
                <Select onValueChange={val => updateFormState({ statusAgendamento: val })} value={statusAgendamento}>
                  <SelectTrigger id="agStatus"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="reagendado">Reagendado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    {editingAgendamento?.isPublic && <SelectItem value="solicitado_pelo_cliente" disabled>Solicitado pelo Cliente</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agObs">Observações</Label>
                <Textarea id="agObs" value={observacoes} onChange={e => updateFormState({ observacoes: e.target.value })} placeholder="Detalhes sobre o agendamento" />
              </div>
              <CardFooter className="pt-6 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button type="submit" className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                  {editingAgendamento?.isPublic ? 'Confirmar/Processar Solicitação' : (editingAgendamento ? 'Salvar Alterações' : 'Criar Agendamento Interno')}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgendamentoForm;