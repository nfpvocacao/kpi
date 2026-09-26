export type TipoDoacao = 'CADASTRO' | 'DOACAO_AUTOMATICA' | 'DOACAO';

export type StatusPedido = 
  | 'Pedido com documento encontrado.'
  | 'Pedido em processamento'
  | 'Documento não localizado'
  | 'Aguardando validação SEFAZ';

export interface CupomFiscal {
  id: string;
  numeroCupom: string;
  dataEmissao: string;
  cnpjEstabelecimento: string;
  nomeEstabelecimento: string;
  tipoDoacao: TipoDoacao;
  statusPedido: StatusPedido;
  valorCompra: number;
  valorCredito: number;
  cpfDoador?: string;
  nomeDoador?: string;
  origem: 'URNA_PARCEIRA' | 'DIGITADOR' | 'APP_AUTOMATICO' | 'APP_MANUAL';
  mesReferencia: string; // YYYY-MM
}

export interface EmpresaParceira {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  categoria: 'Supermercados' | 'Farmácias' | 'Varejo & Moda' | 'Construção & Casa' | 'Restaurantes & Alimentos' | 'Pet & Serviços' | 'Atacado & Distribuição' | 'Postos & Conveniência' | 'Serviços & Outros';
  cuponsValidos: number;
  valorTotalNotas: number;
  creditoTotal: number;
  creditoUrnas: number;
  creditoDoacoes: number;
  ticketMedioCupom: number;
  urnasInstaladas: number;
  status: 'Ativa' | 'Em expansão' | 'A renovar';
  crescimentoYoY: number;
  cidade: string;
}

export interface DoadorReal {
  id: string;
  cpf: string;
  nome: string;
  tipoDoacao: 'DOACAO_AUTOMATICA' | 'DOACAO';
  perfilFidelidade: 'Pleno' | 'Restrito';
  dataAdesao: string;
  mesesAtivo: number;
  totalCupons: number;
  creditoGerado: number;
  ticketMedioCredito: number;
  statusSefaz: 'Ativo' | 'Pendente' | 'Bloqueado Temporário';
  cidade: string;
  lojasFrequentes: {
    empresaId: string;
    nomeLoja: string;
    quantidadeCupons: number;
    valorGasto: number;
    creditoGerado: number;
  }[];
}

export interface MetricaMensal {
  mes: string; // Ex: "2025-01"
  mesNome: string; // Ex: "Jan/25"
  ano: number;
  creditoTotal: number;
  creditoAutomatica: number;
  creditoDireta: number;
  creditoUrnas: number;
  creditoDoacao?: number;
  creditoConsumo?: number;
  cuponsProcessados: number;
  cuponsValidos: number;
  cuponsDoacao?: number;
  cuponsConsumo?: number;
  ticketMedioGeral: number;
  ticketMedioAutomatica: number;
  ticketMedioUrnas: number;
  doadoresAutomaticosAtivos: number;
  doadoresPlenos: number;
  doadoresRestritos: number;
  novosDoadores: number;
}

export interface EntidadeRanking {
  posicaoGeral: number;
  posicaoSocial: number;
  nomeEntidade: string;
  areaAtuacao: string;
  municipio: string;
  creditoSemestre: number;
  volumeCupons: number;
  crescimentoSemestre: number;
  isVocacao?: boolean;
}

export interface SimuladorProjecao {
  metaDoadoresPlenos: number;
  ticketMedioProjetado: number;
  cuponsMesPorDoador: number;
  novasUrnasEmpresas: number;
  ticketMedioUrna: number;
  cuponsMesPorUrna: number;
}

export interface DatabaseState {
  status: 'online' | 'syncing' | 'offline_fallback';
  fontePrimaria: 'SQLite Local Cache (nfp_database.db)' | 'AWS RDS MySQL (backoffice.nfp_cupons_capturados)' | 'Supabase PostgreSQL (Cloud 24/7)';
  ultimaSincronizacao: string;
  totalRegistrosCupons: number;
  cuponsDesduplicados: number;
  tempoRespostaMs: number;
  host: string;
}

export interface PeriodFilter {
  years: number[];
  months: number[]; // 1 = Jan, 12 = Dez
  preset?: 'ALL' | 'LAST_12' | '2026' | '2025' | '2024' | 'CUSTOM' | 'RANGE';
  startMonthYear?: string; // Ex: "2025-06"
  endMonthYear?: string;   // Ex: "2026-05"
}

