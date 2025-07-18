import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, DownloadCloud } from 'lucide-react';
import { usePwaInstall } from '@/components/PwaInstallPrompt';

// Valores padrão temporários para evitar erro de variável não definida
const nomeEmpresa = "Nome da Empresa";
const descricaoEmpresa = "Descrição da Empresa";
const logoUrl = "/icons/icon-192x192.png";
const CNPJ = "";
const TELEFONE = "";
const ENDERECO = "";

const VistoriaHeader = ({
  nomeEmpresa = "Nome da Empresa",
  descricaoEmpresa = "Descrição da Empresa",
  logoUrl = "/icons/icon-192x192.png",
  telefone = "",
  endereco = ""
}) => {
  const { deferredPrompt, triggerInstall } = usePwaInstall();

  return (
    <Card className="w-full max-w-2xl card-shadow bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-visible">
      <CardHeader className="p-2 sm:p-3">
        <div className="flex flex-col xxs:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Logo da Empresa" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-lg border border-white" />
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold leading-tight">
                {nomeEmpresa}
              </CardTitle>
            </div>
          </div>
          <div className="text-center xxs:text-right space-y-0.5 mt-1 xxs:mt-0">
            <div className="flex items-center justify-center xxs:justify-end gap-1 text-xxs sm:text-xs leading-tight">
              <Phone size={10} sm:size={12} className="opacity-80" />
              <span>{telefone}</span>
            </div>
            <div className="flex items-center justify-center xxs:justify-end gap-1 text-xxs sm:text-xs leading-tight">
              <MapPin size={10} sm:size={12} className="opacity-80" />
              <span>{endereco}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      {deferredPrompt && (
        <Button
          onClick={triggerInstall}
          variant="outline"
          size="sm"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/20 hover:bg-white/30 text-white border-white/50 hover:border-white backdrop-blur-sm"
          title="Instalar App"
        >
          <DownloadCloud size={16} className="mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Instalar App</span>
        </Button>
      )}
    </Card>
  );
};

export default VistoriaHeader;