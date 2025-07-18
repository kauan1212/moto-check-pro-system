import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PenTool, Trash2 } from 'lucide-react';
import SignatureCanvas from '@/components/SignatureCanvas';

const Assinaturas = ({ vistoriaData, onSignature, onClearSignature }) => (
  <Card className="mb-6 card-shadow">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <PenTool className="h-6 w-6 mr-2 text-purple-600" />
        Assinaturas
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label className="text-lg font-medium mb-3 block">
          Assinatura do Vistoriador
        </Label>
        <SignatureCanvas
          onSignature={(signature) => onSignature('assinaturaVistoriador', signature)}
          signature={vistoriaData.assinaturaVistoriador}
        />
        {vistoriaData.assinaturaVistoriador && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClearSignature('assinaturaVistoriador')}
            className="mt-2"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
        <p className="text-sm text-gray-500 mt-2">CNPJ: 55.050.610/0001-91</p>
      </div>
      
      <div>
        <Label className="text-lg font-medium mb-3 block">
          Assinatura do Locatário
        </Label>
        <SignatureCanvas
          onSignature={(signature) => onSignature('assinaturaLocatario', signature)}
          signature={vistoriaData.assinaturaLocatario}
        />
        {vistoriaData.assinaturaLocatario && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClearSignature('assinaturaLocatario')}
              className="mt-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
            {vistoriaData.rgLocatario && (
              <p className="text-sm text-gray-500 mt-2">
                RG: {vistoriaData.rgLocatario}
              </p>
            )}
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default Assinaturas;