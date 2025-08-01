export const checklistItems = [
  { id: 'painel_instrumentos', nome: 'Painel de Instrumentos', categoria: 'Informações Iniciais', hasKmInput: true },
  { id: 'numero_chassi', nome: 'Número do Chassi', categoria: 'Identificação do Veículo', isTextEntry: true },
  { id: 'numero_motor', nome: 'Número do Motor', categoria: 'Identificação do Veículo', isTextEntry: true },
  { id: 'foto_frente', nome: 'Foto Frontal', categoria: 'Fotos Gerais da Moto', isPhotoOnly: true },
  { id: 'foto_traseira', nome: 'Foto Traseira', categoria: 'Fotos Gerais da Moto', isPhotoOnly: true },
  { id: 'foto_lado_esquerdo', nome: 'Foto Lateral Esquerda', categoria: 'Fotos Gerais da Moto', isPhotoOnly: true },
  { id: 'foto_lado_direito', nome: 'Foto Lateral Direita', categoria: 'Fotos Gerais da Moto', isPhotoOnly: true },
  { id: 'pneu_dianteiro', nome: 'Pneu Dianteiro', categoria: 'Pneus' },
  { id: 'pneu_traseiro', nome: 'Pneu Traseiro', categoria: 'Pneus' },
  { id: 'sistema_freios', nome: 'Sistema de Freio Dianteiro/Traseiro', categoria: 'Sistema de Freios' },
  { id: 'farol_dianteiro', nome: 'Farol Dianteiro', categoria: 'Sistema Elétrico' },
  { id: 'lanterna_traseira', nome: 'Lanterna Traseira', categoria: 'Sistema Elétrico' },
  { id: 'sistema_setas', nome: 'Sistema de Setas (Dianteiro/Traseiro)', categoria: 'Sistema Elétrico' },
  { id: 'bateria', nome: 'Bateria', categoria: 'Sistema Elétrico' },
  { id: 'motor', nome: 'Motor', categoria: 'Mecânica' },
  { id: 'transmissao', nome: 'Transmissão', categoria: 'Mecânica' },
  { id: 'suspensao_dianteira', nome: 'Suspensão Dianteira', categoria: 'Suspensão' },
  { id: 'suspensao_traseira', nome: 'Suspensão Traseira', categoria: 'Suspensão' },
  { id: 'tanque_banco', nome: 'Tanque e Banco', categoria: 'Carroceria e Acessórios' },
  { id: 'observacoes_finais', nome: 'Observações Finais (Opcional)', categoria: 'Observações', isTextAndPhotoOptional: true },
];

export const categorias = [
  'Informações Iniciais',
  'Identificação do Veículo',
  'Fotos Gerais da Moto',
  'Pneus',
  'Sistema de Freios',
  'Sistema Elétrico',
  'Mecânica',
  'Suspensão',
  'Carroceria e Acessórios',
  'Observações',
];