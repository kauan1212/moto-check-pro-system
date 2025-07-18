import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, PlusCircle, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import imageCompression from 'browser-image-compression';

const MAX_PHOTOS = 5;
const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.7,          
  maxWidthOrHeight: 1280, 
  useWebWorker: true,    
  initialQuality: 0.7,   
};

const PhotoUpload = ({ itemId, onPhotoAdd, onPhotoRemove, currentPhotos = [], itemName }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState(null); 

  const resetInputs = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  const processFiles = useCallback(async (filesArray, source) => {
    if (!filesArray || filesArray.length === 0) {
      setIsLoading(false);
      setLoadingSource(null);
      resetInputs();
      return;
    }
    
    setIsLoading(true);
    setLoadingSource(source);

    try {
      const validFiles = Array.from(filesArray).filter(file => {
        if (!file.type || !file.type.startsWith('image/')) {
          toast({ title: "Arquivo inválido", description: `"${file.name}" não é uma imagem válida. Formatos aceitos: JPEG, PNG, GIF, WebP etc.`, variant: "destructive" });
          console.error(`Arquivo inválido: ${file.name}, tipo: ${file.type}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        throw new Error("Nenhum arquivo de imagem válido selecionado.");
      }
      
      const totalPhotosAfterAdd = currentPhotos.length + validFiles.length;
      if (totalPhotosAfterAdd > MAX_PHOTOS) {
        toast({
          title: "Limite de fotos excedido",
          description: `Você pode anexar no máximo ${MAX_PHOTOS} fotos por item (${itemName}). Selecionadas: ${validFiles.length}, Existentes: ${currentPhotos.length}.`,
          variant: "destructive"
        });
        throw new Error("Limite de fotos excedido.");
      }

      const newPhotoPromises = validFiles.map(async (file) => {
        let compressedFile = file;
        try {
          console.log(`Comprimindo ${file.name}, tamanho original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
          console.log(`Comprimido ${file.name}, novo tamanho: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (compressionError) {
          console.error(`Erro ao comprimir ${file.name}:`, compressionError);
          toast({ title: "Erro de Compressão", description: `Não foi possível comprimir o arquivo ${file.name}. Usando original.`, variant: "warning" });
        }
          
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string' && event.target.result.startsWith('data:image/')) {
              resolve(event.target.result);
            } else {
              const errorMsg = `Falha ao ler o arquivo ${compressedFile.name} como DataURL válido.`;
              console.error(errorMsg, event.target?.result?.substring(0,100));
              toast({ title: "Erro de Leitura", description: `Não foi possível processar o arquivo ${compressedFile.name} como imagem.`, variant: "destructive" });
              reject(new Error(errorMsg));
            }
          };
          reader.onerror = (error) => {
            console.error(`Erro no FileReader para ${compressedFile.name}:`, error);
            toast({ title: "Erro ao ler arquivo", description: `Não foi possível ler o arquivo ${compressedFile.name}.`, variant: "destructive" });
            reject(error); 
          };
          reader.onabort = () => {
            console.warn(`Leitura do arquivo ${compressedFile.name} abortada.`);
            toast({ title: "Leitura Abortada", description: `A leitura do arquivo ${compressedFile.name} foi abortada.`, variant: "warning" });
            reject(new Error(`Leitura do arquivo ${compressedFile.name} abortada.`));
          };
          reader.readAsDataURL(compressedFile);
        });
      });

      const results = await Promise.allSettled(newPhotoPromises);
      const newPhotoDataUrls = results
        .filter(result => result.status === 'fulfilled' && typeof result.value === 'string')
        .map(result => result.value);

      results.forEach(result => {
        if (result.status === 'rejected') {
          console.error("Falha no processamento de uma imagem:", result.reason);
        }
      });
      
      if (newPhotoDataUrls.length > 0) {
        onPhotoAdd(itemId, newPhotoDataUrls);
        if (newPhotoDataUrls.length < validFiles.length) {
             toast({ title: "Processamento Parcial", description: `${newPhotoDataUrls.length} de ${validFiles.length} imagens foram adicionadas com sucesso. Algumas falharam.`, variant: "warning" });
        } else {
            toast({ title: "Sucesso!", description: `${newPhotoDataUrls.length} imagem(ns) adicionada(s) com sucesso para ${itemName}.`, variant: "default" });
        }
      } else if (validFiles.length > 0) {
         toast({ title: "Falha no Processamento", description: "Nenhuma das imagens selecionadas pôde ser processada. Verifique o console para detalhes.", variant: "destructive" });
      }

    } catch (error) {
        console.error("Erro ao processar fotos:", error.message);
        if (error.message !== "Limite de fotos excedido." && error.message !== "Nenhum arquivo de imagem válido selecionado.") {
            toast({ title: "Erro Geral ao Adicionar Fotos", description: error.message || "Ocorreu um problema ao tentar adicionar as imagens.", variant: "destructive" });
        }
    } finally {
      setIsLoading(false);
      setLoadingSource(null);
      resetInputs();
    }
  }, [currentPhotos.length, itemId, itemName, onPhotoAdd, toast, resetInputs]);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, 'galeria');
    } else {
      setIsLoading(false); 
      setLoadingSource(null);
      resetInputs();
    }
  }, [processFiles, resetInputs]);
  
  const handleCameraCapture = useCallback((e) => {
     if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, 'camera');
    } else {
      setIsLoading(false);
      setLoadingSource(null);
      resetInputs();
    }
  }, [processFiles, resetInputs]);

  const canAddMorePhotos = currentPhotos.length < MAX_PHOTOS;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple
        disabled={isLoading || !canAddMorePhotos}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment" 
        onChange={handleCameraCapture}
        className="hidden"
        multiple
        disabled={isLoading || !canAddMorePhotos}
      />
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 flex items-center text-xs"
          disabled={isLoading || !canAddMorePhotos}
          title={!canAddMorePhotos ? `Máximo de ${MAX_PHOTOS} fotos atingido` : "Adicionar da Galeria"}
        >
          {isLoading && loadingSource === 'galeria' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-1 text-gray-500" />}
          Galeria ({currentPhotos.length}/{MAX_PHOTOS})
        </Button>
        <Button
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          className="h-10 border-dashed border-2 hover:border-teal-400 hover:bg-teal-50 flex items-center text-xs"
          disabled={isLoading || !canAddMorePhotos}
          title={!canAddMorePhotos ? `Máximo de ${MAX_PHOTOS} fotos atingido` : "Capturar com Câmera"}
        >
          {isLoading && loadingSource === 'camera' ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Camera className="h-4 w-4 mr-1 text-gray-500" />}
          Câmera ({currentPhotos.length}/{MAX_PHOTOS})
        </Button>
      </div>
      
      {currentPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {currentPhotos.map((photo, index) => (
            <div key={photo ? photo.substring(photo.length - 30, photo.length -1) + index : `photo-${itemId}-${index}`} className="relative group">
              <img
                src={photo}
                alt={`Foto ${index + 1} de ${itemName}`}
                className="w-full h-24 object-cover rounded-lg photo-preview border"
                onError={(e) => {
                  e.target.alt = `Erro ao carregar imagem ${index + 1}`;
                  e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
                  console.warn(`Erro ao carregar DataURL da imagem ${index + 1} para o item ${itemName}. A string pode estar corrompida ou ser inválida.`);
                }}
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={() => !isLoading && onPhotoRemove(itemId, index)}
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={isLoading}
                title={`Remover foto ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
       {!canAddMorePhotos && currentPhotos.length >= MAX_PHOTOS && (
        <p className="text-xs text-red-500 mt-1">Você atingiu o limite de {MAX_PHOTOS} fotos para este item.</p>
      )}
    </div>
  );
};

export default PhotoUpload;