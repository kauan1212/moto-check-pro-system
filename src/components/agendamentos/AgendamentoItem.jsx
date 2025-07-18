import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, MessageSquare, Send, Edit, Trash2, UserCheck, Redo } from 'lucide-react';
import { motion } from 'framer-motion';

const AgendamentoItem = React.memo(({ ag, statusColors, handleAnalisarSolicitacao, handleDeletePublico, handleWhatsAppAction, handleEditInterno, handleDeleteInterno, getNomeLocatario, getDescricaoMoto, locatarios }) => {
  return (
    <motion.li 
      key={ag.id} 
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`p-4 border rounded-lg ${statusColors[ag.statusAgendamento] || 'bg-gray-100 text-gray-800 border-gray-300'} flex flex-col gap-3`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <p className="font-semibold text-lg">
            {ag.isPublic && !ag.isPublicConfirmed ? ag.nomeLocatario : getNomeLocatario(ag.locatarioId)}
            {ag.isPublic && !ag.isPublicConfirmed && <span className="text-xs font-normal text-purple-700"> (Solicitação Pública)</span>}
            {ag.isPublicConfirmed && <span className="text-xs font-normal text-green-700"> (Confirmado de Pública)</span>}
          </p>
          <p className="text-sm">{ag.isPublic && !ag.isPublicConfirmed ? `Placa: ${ag.placaMoto}` : getDescricaoMoto(ag.motoId)}</p>
          <p className="text-sm font-medium">{ag.tipoServico.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          {ag.isPublic && !ag.isPublicConfirmed && ag.telefoneContato && <p className="text-xs text-purple-600">Tel. Cliente: {ag.telefoneContato}</p>}
            {ag.isPublicConfirmed && ag.telefoneContato && <p className="text-xs text-green-600">Tel. Cliente: {ag.telefoneContato}</p>}
        </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${ (statusColors[ag.statusAgendamento] || 'bg-gray-100 text-gray-800 border-gray-300').replace('bg-', 'border-').replace('text-', 'border-')} border mt-2 sm:mt-0`}>
          {(ag.statusAgendamento || 'N/A').replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>
      <div className="flex items-center text-sm gap-4">
        <div className="flex items-center"><CalendarDays size={16} className="mr-1" /> {new Date(ag.dataAgendada + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
        <div className="flex items-center"><Clock size={16} className="mr-1" /> {ag.horarioAgendado}</div>
      </div>
      {ag.observacoes && <p className="text-xs italic flex items-start"><MessageSquare size={14} className="mr-1 mt-0.5 flex-shrink-0" /> {ag.observacoes}</p>}
      
      <div className="flex flex-wrap gap-2 mt-2 self-end">
        {ag.isPublic && !ag.isPublicConfirmed && (
            <>
                <Button variant="outline" size="sm" onClick={() => handleAnalisarSolicitacao(ag)} className="bg-purple-50 hover:bg-purple-100 border-purple-500 text-purple-700">
                    <UserCheck className="h-4 w-4 mr-1" /> Analisar/Confirmar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeletePublico(ag.id)} className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir Solicitação
                </Button>
            </>
        )}
        {(!ag.isPublic || ag.isPublicConfirmed) && (
            <>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleWhatsAppAction({
                        nomeLocatario: ag.isPublicConfirmed ? ag.locatarioId : getNomeLocatario(ag.locatarioId), 
                        placaMoto: ag.isPublicConfirmed ? ag.motoId : getDescricaoMoto(ag.motoId, true), 
                        tipoServico: ag.tipoServico, 
                        dataAgendada: ag.dataAgendada, 
                        horarioAgendado: ag.horarioAgendado,
                        telefoneContato: ag.telefoneContato || (locatarios.find(l => String(l.id) === String(ag.locatarioId))?.telefone)
                    }, 'confirmar')} 
                    className="bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
                    disabled={ag.statusAgendamento === 'confirmado'}
                >
                    <Send className="h-4 w-4 mr-1" /> {ag.statusAgendamento === 'confirmado' ? 'Reenviar Confirmação' : 'Confirmar'}
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleWhatsAppAction({
                        nomeLocatario: ag.isPublicConfirmed ? ag.locatarioId : getNomeLocatario(ag.locatarioId), 
                        placaMoto: ag.isPublicConfirmed ? ag.motoId : getDescricaoMoto(ag.motoId, true), 
                        tipoServico: ag.tipoServico, 
                        dataAgendada: ag.dataAgendada, 
                        horarioAgendado: ag.horarioAgendado,
                        telefoneContato: ag.telefoneContato || (locatarios.find(l => String(l.id) === String(ag.locatarioId))?.telefone)
                    }, 'reagendar')} 
                    className="bg-blue-50 hover:bg-blue-100 border-blue-500 text-blue-700"
                >
                    <Redo className="h-4 w-4 mr-1" /> Reagendar/Sugerir
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditInterno(ag)} className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                    <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteInterno(ag.id)} className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
            </>
        )}
      </div>
    </motion.li>
  );
});

export default AgendamentoItem;