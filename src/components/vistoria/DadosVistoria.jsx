import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Palette, Gauge, Bike, UserCircle, Fingerprint } from 'lucide-react';

const DadosVistoria = ({ vistoriaData, onInputChange }) => (
  <Card className="mb-6 card-shadow">
    <CardHeader>
      <CardTitle className="flex items-center text-2xl">
        <Bike className="h-6 w-6 mr-2 text-purple-600" />
        Dados da Moto e Cliente
      </CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="moto">Modelo da Moto</Label>
        <Input
          id="moto"
          value={vistoriaData.moto}
          onChange={(e) => onInputChange('moto', e.target.value)}
          placeholder="Ex: Honda CB 600F"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="placa">Placa</Label>
        <Input
          id="placa"
          value={vistoriaData.placa}
          onChange={(e) => onInputChange('placa', e.target.value)}
          placeholder="Ex: ABC-1234"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="cor">Cor</Label>
        <Input
          id="cor"
          value={vistoriaData.cor}
          onChange={(e) => onInputChange('cor', e.target.value)}
          placeholder="Ex: Vermelha"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="kmTotal">KM Total (Painel)</Label>
        <Input
          id="kmTotal"
          type="number"
          value={vistoriaData.kmTotal}
          onChange={(e) => onInputChange('kmTotal', e.target.value)}
          placeholder="Ex: 15000"
          className="mt-1"
          required
        />
      </div>
       <div>
        <Label htmlFor="numeroChassiVistoria" className="flex items-center">
          <Fingerprint size={16} className="mr-1 text-gray-600"/> Número do Chassi
        </Label>
        <Input
          id="numeroChassiVistoria"
          value={vistoriaData.numeroChassi || ''}
          onChange={(e) => onInputChange('numeroChassi', e.target.value)}
          placeholder="Digite o número do chassi"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="numeroMotorVistoria" className="flex items-center">
          <Fingerprint size={16} className="mr-1 text-gray-600"/> Número do Motor
        </Label>
        <Input
          id="numeroMotorVistoria"
          value={vistoriaData.numeroMotor || ''}
          onChange={(e) => onInputChange('numeroMotor', e.target.value)}
          placeholder="Digite o número do motor"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="cliente">Nome do Cliente</Label>
        <Input
          id="cliente"
          value={vistoriaData.cliente}
          onChange={(e) => onInputChange('cliente', e.target.value)}
          placeholder="Digite o nome completo do cliente"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="rgLocatarioVistoria">RG do Locatário</Label>
        <Input
          id="rgLocatarioVistoria"
          value={vistoriaData.rgLocatario || ''}
          onChange={(e) => onInputChange('rgLocatario', e.target.value)}
          placeholder="00.000.000-0"
          className="mt-1"
          required
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="data">Data da Vistoria</Label>
        <Input
          id="data"
          type="date"
          value={vistoriaData.data}
          onChange={(e) => onInputChange('data', e.target.value)}
          className="mt-1"
          required
        />
      </div>
    </CardContent>
  </Card>
);

export default DadosVistoria;