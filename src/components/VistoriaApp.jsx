import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Download, RotateCcw } from 'lucide-react';

import { checklistItems as initialChecklistItems, categorias } from '@/data/checklistConfig';
import { generatePDF } from '@/utils/pdfGenerator';

import DadosVistoria from '@/components/vistoria/DadosVistoria';
import ChecklistCategoria from '@/components/vistoria/ChecklistCategoria';
import Assinaturas from '@/components/vistoria/Assinaturas';

const initialVistoriaData = {
  cliente: '',
  moto: '',
  placa: '',
  cor: '',
  kmTotal: '',
  rgLocatario: '',
  data: new Date().toISOString().split('T')[0],
  checklist: {},
  fotos: {},
  assinaturaVistoriador: null,
  assinaturaLocatario: null,
  numeroChassi: '',
  numeroMotor: '',
  observacoes_finais_texto: '', 
};

const VistoriaApp = ({ initialData: externalInitialData, clearInitialData }) => {
  const { toast } = useToast();
  const [vistoriaData, setVistoriaData] = useState(() => {
    const savedDataString = localStorage.getItem('vistoriaDataLocAuto');
    let loadedData = { ...initialVistoriaData };
    if (savedDataString) {
      try {
        const parsedData = JSON.parse(savedDataString);
        if (typeof parsedData === 'object' && parsedData !== null) {
          loadedData = { ...loadedData, ...parsedData };
          if(!parsedData.fotos) loadedData.fotos = {}; 
          if(!parsedData.checklist) loadedData.checklist = {};
        }
      } catch (error) {
        console.error("Erro ao parsear dados salvos da vistoria:", error);
        localStorage.removeItem('vistoriaDataLocAuto'); 
      }
    }
    return loadedData;
  });

  const [currentChecklistItems, setCurrentChecklistItems] = useState(initialChecklistItems);

  useEffect(() => {
    if (externalInitialData) {
      setVistoriaData(prevData => ({
        ...prevData, 
        cliente: externalInitialData.cliente || prevData.cliente,
        rgLocatario: externalInitialData.rgLocatario || prevData.rgLocatario,
        moto: externalInitialData.moto || prevData.moto,
        placa: externalInitialData.placa || prevData.placa,
        cor: externalInitialData.cor || prevData.cor,
        kmTotal: externalInitialData.kmTotal || prevData.kmTotal,
        numeroChassi: externalInitialData.numeroChassi || prevData.numeroChassi,
        numeroMotor: externalInitialData.numeroMotor || prevData.numeroMotor,
        checklist: {
          ...prevData.checklist,
          ...(externalInitialData.numeroChassi && { numero_chassi: externalInitialData.numeroChassi }),
          ...(externalInitialData.numeroMotor && { numero_motor: externalInitialData.numeroMotor }),
          ...(externalInitialData.kmTotal && { painel_instrumentos_km: externalInitialData.kmTotal }),
        }
      }));
      if (clearInitialData) clearInitialData(); 
    }
  }, [externalInitialData, clearInitialData]);
  

  useEffect(() => {
    localStorage.setItem('vistoriaDataLocAuto', JSON.stringify(vistoriaData));
  }, [vistoriaData]);

  const handleInputChange = useCallback((field, value) => {
    setVistoriaData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleChecklistChange = useCallback((itemId, value) => {
    setVistoriaData(prev => {
      const newChecklist = { ...prev.checklist, [itemId]: value };
      if (itemId === 'observacoes_finais_texto') {
        return { ...prev, observacoes_finais_texto: value, checklist: newChecklist };
      }
      return { ...prev, checklist: newChecklist };
    });
  }, []);

  const handlePhotoAdd = useCallback((itemId, newPhotos) => {
    setVistoriaData(prev => {
      const newFotosState = JSON.parse(JSON.stringify(prev.fotos || {}));
      const currentItemPhotos = newFotosState[itemId] || [];
      const updatedItemPhotos = [...currentItemPhotos, ...newPhotos].slice(0, 5); 
      newFotosState[itemId] = updatedItemPhotos;
      
      return {
        ...prev,
        fotos: newFotosState,
      };
    });
  }, []);

  const handlePhotoRemove = useCallback((itemId, photoIndex) => {
    setVistoriaData(prev => {
      const newFotosState = JSON.parse(JSON.stringify(prev.fotos || {}));
      if (!newFotosState[itemId]) return prev; 

      const currentItemPhotos = newFotosState[itemId];
      const updatedItemPhotos = currentItemPhotos.filter((_, index) => index !== photoIndex);
      newFotosState[itemId] = updatedItemPhotos;
      
      return {
        ...prev,
        fotos: newFotosState,
      };
    });
  }, []);

  const handleSignature = useCallback((type, signature) => {
    setVistoriaData(prev => ({ ...prev, [type]: signature }));
  }, []);

  const clearSignature = useCallback((type) => {
    setVistoriaData(prev => ({ ...prev, [type]: null }));
  }, []);

  const resetForm = useCallback(() => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados da vistoria? Esta ação não pode ser desfeita.")) {
      const newInitialData = {...initialVistoriaData, data: new Date().toISOString().split('T')[0], fotos: {}, checklist: {}, observacoes_finais_texto: ''};
      setVistoriaData(newInitialData);
      localStorage.removeItem('vistoriaDataLocAuto');
      toast({
        title: "Formulário Limpo",
        description: "Todos os dados da vistoria foram removidos.",
      });
      window.scrollTo(0, 0);
    }
  }, [toast]);

  const validateForm = useCallback(() => {
    const requiredFields = ['cliente', 'moto', 'placa', 'cor', 'kmTotal', 'data', 'rgLocatario'];
    for (const field of requiredFields) {
      if (!vistoriaData[field]) {
        toast({
          title: "Campos obrigatórios",
          description: `Por favor, preencha o campo "${field === 'rgLocatario' ? 'RG do Locatário' : field.replace(/([A-Z])/g, ' $1')}".`,
          variant: "destructive",
        });
        const elementId = field === 'rgLocatario' ? 'rgLocatarioVistoria' : field;
        document.getElementById(elementId)?.focus();
        return false;
      }
    }
    
    const fotoFieldsObrigatoriasGerais = ['foto_frente', 'foto_traseira', 'foto_lado_esquerdo', 'foto_lado_direito'];
    for (const field of fotoFieldsObrigatoriasGerais) {
        if (!vistoriaData.fotos || !vistoriaData.fotos[field] || vistoriaData.fotos[field].length === 0) {
            const nomeItemFoto = currentChecklistItems.find(i => i.id === field)?.nome || field.replace('foto_', '').replace('_', ' ');
            toast({
                title: "Fotos obrigatórias",
                description: `Por favor, adicione a foto geral: ${nomeItemFoto}.`,
                variant: "destructive"
            });
            return false;
        }
    }

    const checklistCompleto = currentChecklistItems.every(item => 
      item.isPhotoOnly || item.isTextAndPhotoOptional || vistoriaData.checklist[item.id]
    );

    if (!checklistCompleto) {
      toast({
        title: "Checklist incompleto",
        description: "Por favor, avalie todos os itens obrigatórios do checklist.",
        variant: "destructive",
      });
      return false;
    }

    if (!vistoriaData.assinaturaVistoriador || !vistoriaData.assinaturaLocatario) {
      toast({
        title: "Assinaturas obrigatórias",
        description: "As assinaturas do vistoriador e locatário são obrigatórias.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [vistoriaData, toast, currentChecklistItems]);

  const handleGeneratePDF = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await generatePDF(vistoriaData, currentChecklistItems);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O relatório de vistoria foi baixado automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [validateForm, vistoriaData, toast, currentChecklistItems]);

  return (
    <div className="container mx-auto p-1 sm:p-2 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        
        <DadosVistoria
          vistoriaData={vistoriaData}
          onInputChange={handleInputChange}
        />

        {categorias.map((categoria, index) => (
          <ChecklistCategoria
            key={categoria}
            categoria={categoria}
            items={currentChecklistItems.filter(item => item.categoria === categoria)}
            vistoriaData={vistoriaData}
            onChecklistChange={handleChecklistChange}
            onPhotoAdd={handlePhotoAdd}
            onPhotoRemove={handlePhotoRemove}
            animationDelay={index * 0.1}
          />
        ))}

        <Assinaturas
          vistoriaData={vistoriaData}
          onSignature={handleSignature}
          onClearSignature={clearSignature}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categorias.length * 0.1 + 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <Button
            onClick={handleGeneratePDF}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold pulse-glow w-full sm:w-auto"
          >
            <Download className="h-5 w-5 mr-2" />
            Gerar Relatório PDF
          </Button>
          <Button
            onClick={resetForm}
            variant="outline"
            size="lg"
            className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Limpar Formulário
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VistoriaApp;