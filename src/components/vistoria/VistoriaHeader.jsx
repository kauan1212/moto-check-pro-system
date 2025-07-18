import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, DownloadCloud } from 'lucide-react';
import { usePwaInstall } from '@/components/PwaInstallPrompt';

const logoUrl = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/ac761713-0f01-4aa3-a0ce-b3d2354486eb/cdda750bcbce7f37693d3220c262eb0e.jpg';
const CNPJ = "55.050.610/0001-91";
const TELEFONE = "(15) 99165-3601";
const ENDERECO = "Rua Francisco Catalano 395 - Jardim Brasilândia";

const VistoriaHeader = () => {
  const { deferredPrompt, triggerInstall } = usePwaInstall();

  return (
    <Card className="w-full max-w-2xl card-shadow bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-visible">
      <CardHeader className="p-2 sm:p-3">
        <div className="flex flex-col xxs:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="LocAuto Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-md shadow-lg border border-white" />
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold leading-tight">
                LocAuto
              </CardTitle>
              <p className="text-xxs sm:text-xs font-medium opacity-90 leading-tight">
                Aluguel de Motos
              </p>
            </div>
          </div>
          <div className="text-center xxs:text-right space-y-0.5 mt-1 xxs:mt-0">
            <p className="text-xxs sm:text-xs font-semibold leading-tight">CNPJ: {CNPJ}</p>
            <div className="flex items-center justify-center xxs:justify-end gap-1 text-xxs sm:text-xs leading-tight">
              <Phone size={10} sm:size={12} className="opacity-80" />
              <span>{TELEFONE}</span>
            </div>
            <div className="flex items-center justify-center xxs:justify-end gap-1 text-xxs sm:text-xs leading-tight">
              <MapPin size={10} sm:size={12} className="opacity-80" />
              <span>{ENDERECO}</span>
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