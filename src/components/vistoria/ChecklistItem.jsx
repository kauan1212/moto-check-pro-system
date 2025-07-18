import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, XCircle, Edit3, MessageSquare } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';

const useConditionStyles = () => {
  const getConditionIcon = (condition) => {
    switch (condition) {
      case 'bom': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'regular': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'necessita_troca': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getConditionColor = (condition, isTextEntryOrKmInput, isTextAndPhotoOptional) => {
    if (isTextEntryOrKmInput) return 'border-blue-200 bg-blue-50';
    if (isTextAndPhotoOptional) return 'border-indigo-200 bg-indigo-50';
    switch (condition) {
      case 'bom': return 'border-green-200 bg-green-50';
      case 'regular': return 'border-yellow-200 bg-yellow-50';
      case 'necessita_troca': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return { getConditionIcon, getConditionColor };
};

const ChecklistItem = ({ item, vistoriaData, onChecklistChange, onPhotoAdd, onPhotoRemove }) => {
  const { getConditionIcon, getConditionColor } = useConditionStyles();
  const condition = vistoriaData.checklist[item.id];
  const photos = vistoriaData.fotos[item.id] || [];
  const isTextEntryOrKmInput = item.isTextEntry || item.hasKmInput;
  const isTextAndPhotoOptional = item.isTextAndPhotoOptional;

  const handleInputChange = (e) => {
    const { value } = e.target;
    onChecklistChange(item.id, value);
    
    if (item.id === 'numero_chassi') {
      onChecklistChange('numeroChassi', value); 
    } else if (item.id === 'numero_motor') {
      onChecklistChange('numeroMotor', value);
    } else if (item.id === 'painel_instrumentos_km') {
      onChecklistChange('kmTotal', value);
    } else if (item.id === 'observacoes_finais_texto') {
      onChecklistChange('observacoes_finais_texto', value);
    }
  };
  
  let inputValue = condition;

  if (item.id === 'numero_chassi') {
    inputValue = vistoriaData.numeroChassi || condition || '';
  } else if (item.id === 'numero_motor') {
    inputValue = vistoriaData.numeroMotor || condition || '';
  } else if (item.id === 'painel_instrumentos_km') {
     inputValue = vistoriaData.kmTotal || condition || '';
  } else if (item.id === 'observacoes_finais') {
    inputValue = vistoriaData.checklist['observacoes_finais_texto'] || '';
  }


  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
        item.isPhotoOnly ? 'border-gray-200 bg-white' : getConditionColor(condition, isTextEntryOrKmInput, isTextAndPhotoOptional)
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {!item.isPhotoOnly && !isTextEntryOrKmInput && !isTextAndPhotoOptional && getConditionIcon(condition)}
          {isTextEntryOrKmInput && <Edit3 className="h-4 w-4 text-blue-500" />}
          {isTextAndPhotoOptional && <MessageSquare className="h-4 w-4 text-indigo-500" />}
          <Label className="ml-2 font-medium text-lg">{item.nome}</Label>
        </div>
      </div>
      
      {item.hasKmInput && (
        <div className="mb-3">
          <Label htmlFor={`${item.id}_km`} className="text-sm font-medium">KM no Painel</Label>
          <Input
            id={`${item.id}_km`}
            type="number"
            placeholder="Digite a quilometragem"
            value={inputValue}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      )}

      {item.isTextEntry && (
        <div className="mb-3">
          <Label htmlFor={`${item.id}_text`} className="text-sm font-medium">{item.nome}</Label>
          <Input
            id={`${item.id}_text`}
            type="text"
            placeholder={`Digite o ${item.nome.toLowerCase()}`}
            value={inputValue}
            onChange={handleInputChange}
            className="mt-1"
          />
        </div>
      )}

      {isTextAndPhotoOptional && (
         <div className="mb-3">
          <Label htmlFor={`${item.id}_texto_obs`} className="text-sm font-medium">Observações (texto)</Label>
          <Textarea
            id={`${item.id}_texto_obs`}
            placeholder="Digite suas observações aqui..."
            value={inputValue}
            onChange={(e) => onChecklistChange('observacoes_finais_texto', e.target.value)}
            className="mt-1"
          />
        </div>
      )}
      
      {!item.isPhotoOnly && !isTextEntryOrKmInput && !isTextAndPhotoOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          {['bom', 'regular', 'necessita_troca'].map(cond => (
            <div key={cond} className="flex items-center space-x-2">
              <Checkbox
                id={`${item.id}_${cond}`}
                checked={condition === cond}
                onCheckedChange={(checked) => {
                  if (checked) onChecklistChange(item.id, cond);
                }}
              />
              <Label htmlFor={`${item.id}_${cond}`} className="text-sm font-medium cursor-pointer">
                {cond === 'bom' && 'Bom'}
                {cond === 'regular' && 'Regular'}
                {cond === 'necessita_troca' && 'Necessita Troca'}
              </Label>
            </div>
          ))}
        </div>
      )}

      <PhotoUpload
        itemId={item.id}
        onPhotoAdd={onPhotoAdd}
        onPhotoRemove={onPhotoRemove}
        currentPhotos={photos}
        itemName={item.nome}
      />
    </div>
  );
};

export default ChecklistItem;