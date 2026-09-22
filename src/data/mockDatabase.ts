import { 
  CupomFiscal, 
  EmpresaParceira, 
  DoadorReal, 
  MetricaMensal, 
  EntidadeRanking,
  DatabaseState 
} from '../types';

export const INITIAL_DATABASE_STATE: DatabaseState = {
  status: 'online',
  fontePrimaria: 'SQLite Local Cache (nfp_database.db)',
  ultimaSincronizacao: '18/09/2026 13:45:12',
  totalRegistrosCupons: 489320,
  cuponsDesduplicados: 14210,
  tempoRespostaMs: 14,
  host: 'rds-mysql-prod.sa-east-1.rds.amazonaws.com / local-sqlite'
};

export const METRICAS_MENSAIS: MetricaMensal[] = [
  // 2009 a 2019 (Histórico Expandido SEFAZ NFP)
  ...[2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019].flatMap(ano => {
    const factor = (ano - 2008) / 12; // gradual growth curve
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((mName, idx) => {
      const mNum = String(idx + 1).padStart(2, '0');
      const baseCredito = Math.round((15000 + factor * 22000) * (0.9 + Math.sin(idx) * 0.15));
      const baseCupons = Math.round((12000 + factor * 14000) * (0.9 + Math.cos(idx) * 0.1));
      return {
        mes: `${ano}-${mNum}`,
        mesNome: `${mName}/${String(ano).slice(2)}`,
        ano: ano,
        creditoTotal: baseCredito,
        creditoAutomatica: Math.round(baseCredito * 0.25),
        creditoDireta: Math.round(baseCredito * 0.15),
        creditoUrnas: Math.round(baseCredito * 0.60),
        cuponsProcessados: baseCupons,
        cuponsValidos: Math.round(baseCupons * 0.94),
        ticketMedioGeral: Number((1.1 + factor * 0.35).toFixed(2)),
        ticketMedioAutomatica: Number((1.5 + factor * 0.5).toFixed(2)),
        ticketMedioUrnas: Number((1.0 + factor * 0.3).toFixed(2)),
        doadoresAutomaticosAtivos: Math.round(80 + factor * 200),
        doadoresPlenos: Math.round(50 + factor * 140),
        doadoresRestritos: Math.round(30 + factor * 60),
        novosDoadores: Math.round(10 + factor * 15)
      };
    });
  }),

  // 2020
  { mes: '2020-01', mesNome: 'Jan/20', ano: 2020, creditoTotal: 41200, creditoAutomatica: 11000, creditoDireta: 6200, creditoUrnas: 24000, cuponsProcessados: 25100, cuponsValidos: 23800, ticketMedioGeral: 1.51, ticketMedioAutomatica: 2.10, ticketMedioUrnas: 1.35, doadoresAutomaticosAtivos: 310, doadoresPlenos: 210, doadoresRestritos: 100, novosDoadores: 25 },
  { mes: '2020-02', mesNome: 'Fev/20', ano: 2020, creditoTotal: 42800, creditoAutomatica: 11500, creditoDireta: 6500, creditoUrnas: 24800, cuponsProcessados: 26000, cuponsValidos: 24600, ticketMedioGeral: 1.52, ticketMedioAutomatica: 2.12, ticketMedioUrnas: 1.36, doadoresAutomaticosAtivos: 330, doadoresPlenos: 225, doadoresRestritos: 105, novosDoadores: 28 },
  { mes: '2020-03', mesNome: 'Mar/20', ano: 2020, creditoTotal: 40500, creditoAutomatica: 11200, creditoDireta: 6100, creditoUrnas: 23200, cuponsProcessados: 24800, cuponsValidos: 23500, ticketMedioGeral: 1.50, ticketMedioAutomatica: 2.11, ticketMedioUrnas: 1.34, doadoresAutomaticosAtivos: 345, doadoresPlenos: 240, doadoresRestritos: 105, novosDoadores: 20 },
  { mes: '2020-04', mesNome: 'Abr/20', ano: 2020, creditoTotal: 38900, creditoAutomatica: 10800, creditoDireta: 5900, creditoUrnas: 22200, cuponsProcessados: 23900, cuponsValidos: 22700, ticketMedioGeral: 1.48, ticketMedioAutomatica: 2.08, ticketMedioUrnas: 1.33, doadoresAutomaticosAtivos: 360, doadoresPlenos: 255, doadoresRestritos: 105, novosDoadores: 18 },
  { mes: '2020-05', mesNome: 'Mai/20', ano: 2020, creditoTotal: 43500, creditoAutomatica: 12100, creditoDireta: 6700, creditoUrnas: 24700, cuponsProcessados: 26800, cuponsValidos: 25400, ticketMedioGeral: 1.53, ticketMedioAutomatica: 2.14, ticketMedioUrnas: 1.37, doadoresAutomaticosAtivos: 380, doadoresPlenos: 270, doadoresRestritos: 110, novosDoadores: 32 },
  { mes: '2020-06', mesNome: 'Jun/20', ano: 2020, creditoTotal: 45100, creditoAutomatica: 12800, creditoDireta: 7100, creditoUrnas: 25200, cuponsProcessados: 27900, cuponsValidos: 26500, ticketMedioGeral: 1.55, ticketMedioAutomatica: 2.16, ticketMedioUrnas: 1.38, doadoresAutomaticosAtivos: 400, doadoresPlenos: 290, doadoresRestritos: 110, novosDoadores: 30 },
  { mes: '2020-07', mesNome: 'Jul/20', ano: 2020, creditoTotal: 47200, creditoAutomatica: 13500, creditoDireta: 7500, creditoUrnas: 26200, cuponsProcessados: 29100, cuponsValidos: 27600, ticketMedioGeral: 1.56, ticketMedioAutomatica: 2.18, ticketMedioUrnas: 1.39, doadoresAutomaticosAtivos: 425, doadoresPlenos: 310, doadoresRestritos: 115, novosDoadores: 35 },
  { mes: '2020-08', mesNome: 'Ago/20', ano: 2020, creditoTotal: 48900, creditoAutomatica: 14200, creditoDireta: 7800, creditoUrnas: 26900, cuponsProcessados: 30200, cuponsValidos: 28600, ticketMedioGeral: 1.58, ticketMedioAutomatica: 2.20, ticketMedioUrnas: 1.40, doadoresAutomaticosAtivos: 450, doadoresPlenos: 330, doadoresRestritos: 120, novosDoadores: 38 },
  { mes: '2020-09', mesNome: 'Set/20', ano: 2020, creditoTotal: 50400, creditoAutomatica: 14900, creditoDireta: 8100, creditoUrnas: 27400, cuponsProcessados: 31100, cuponsValidos: 29500, ticketMedioGeral: 1.59, ticketMedioAutomatica: 2.22, ticketMedioUrnas: 1.41, doadoresAutomaticosAtivos: 475, doadoresPlenos: 350, doadoresRestritos: 125, novosDoadores: 40 },
  { mes: '2020-10', mesNome: 'Out/20', ano: 2020, creditoTotal: 52800, creditoAutomatica: 15800, creditoDireta: 8500, creditoUrnas: 28500, cuponsProcessados: 32600, cuponsValidos: 30900, ticketMedioGeral: 1.61, ticketMedioAutomatica: 2.24, ticketMedioUrnas: 1.42, doadoresAutomaticosAtivos: 500, doadoresPlenos: 370, doadoresRestritos: 130, novosDoadores: 42 },
  { mes: '2020-11', mesNome: 'Nov/20', ano: 2020, creditoTotal: 55100, creditoAutomatica: 16700, creditoDireta: 8900, creditoUrnas: 29500, cuponsProcessados: 34100, cuponsValidos: 32300, ticketMedioGeral: 1.63, ticketMedioAutomatica: 2.26, ticketMedioUrnas: 1.43, doadoresAutomaticosAtivos: 530, doadoresPlenos: 395, doadoresRestritos: 135, novosDoadores: 45 },
  { mes: '2020-12', mesNome: 'Dez/20', ano: 2020, creditoTotal: 61400, creditoAutomatica: 19200, creditoDireta: 10100, creditoUrnas: 32100, cuponsProcessados: 38200, cuponsValidos: 36100, ticketMedioGeral: 1.65, ticketMedioAutomatica: 2.28, ticketMedioUrnas: 1.44, doadoresAutomaticosAtivos: 565, doadoresPlenos: 420, doadoresRestritos: 145, novosDoadores: 55 },

  // 2021
  { mes: '2021-01', mesNome: 'Jan/21', ano: 2021, creditoTotal: 54200, creditoAutomatica: 16900, creditoDireta: 8800, creditoUrnas: 28500, cuponsProcessados: 33500, cuponsValidos: 31800, ticketMedioGeral: 1.64, ticketMedioAutomatica: 2.27, ticketMedioUrnas: 1.43, doadoresAutomaticosAtivos: 575, doadoresPlenos: 430, doadoresRestritos: 145, novosDoadores: 32 },
  { mes: '2021-02', mesNome: 'Fev/21', ano: 2021, creditoTotal: 55800, creditoAutomatica: 17500, creditoDireta: 9100, creditoUrnas: 29200, cuponsProcessados: 34400, cuponsValidos: 32600, ticketMedioGeral: 1.65, ticketMedioAutomatica: 2.28, ticketMedioUrnas: 1.44, doadoresAutomaticosAtivos: 590, doadoresPlenos: 440, doadoresRestritos: 150, novosDoadores: 35 },
  { mes: '2021-03', mesNome: 'Mar/21', ano: 2021, creditoTotal: 58900, creditoAutomatica: 18800, creditoDireta: 9700, creditoUrnas: 30400, cuponsProcessados: 36200, cuponsValidos: 34300, ticketMedioGeral: 1.67, ticketMedioAutomatica: 2.30, ticketMedioUrnas: 1.45, doadoresAutomaticosAtivos: 610, doadoresPlenos: 455, doadoresRestritos: 155, novosDoadores: 40 },
  { mes: '2021-04', mesNome: 'Abr/21', ano: 2021, creditoTotal: 57100, creditoAutomatica: 18100, creditoDireta: 9400, creditoUrnas: 29600, cuponsProcessados: 35100, cuponsValidos: 33300, ticketMedioGeral: 1.66, ticketMedioAutomatica: 2.29, ticketMedioUrnas: 1.44, doadoresAutomaticosAtivos: 625, doadoresPlenos: 468, doadoresRestritos: 157, novosDoadores: 30 },
  { mes: '2021-05', mesNome: 'Mai/21', ano: 2021, creditoTotal: 61500, creditoAutomatica: 19900, creditoDireta: 10200, creditoUrnas: 31400, cuponsProcessados: 37800, cuponsValidos: 35800, ticketMedioGeral: 1.68, ticketMedioAutomatica: 2.31, ticketMedioUrnas: 1.46, doadoresAutomaticosAtivos: 645, doadoresPlenos: 485, doadoresRestritos: 160, novosDoadores: 42 },
  { mes: '2021-06', mesNome: 'Jun/21', ano: 2021, creditoTotal: 63200, creditoAutomatica: 20600, creditoDireta: 10500, creditoUrnas: 32100, cuponsProcessados: 38900, cuponsValidos: 36800, ticketMedioGeral: 1.69, ticketMedioAutomatica: 2.32, ticketMedioUrnas: 1.46, doadoresAutomaticosAtivos: 660, doadoresPlenos: 498, doadoresRestritos: 162, novosDoadores: 38 },
  { mes: '2021-07', mesNome: 'Jul/21', ano: 2021, creditoTotal: 65800, creditoAutomatica: 21800, creditoDireta: 11000, creditoUrnas: 33000, cuponsProcessados: 40200, cuponsValidos: 38100, ticketMedioGeral: 1.70, ticketMedioAutomatica: 2.33, ticketMedioUrnas: 1.47, doadoresAutomaticosAtivos: 685, doadoresPlenos: 518, doadoresRestritos: 167, novosDoadores: 45 },
  { mes: '2021-08', mesNome: 'Ago/21', ano: 2021, creditoTotal: 67400, creditoAutomatica: 22500, creditoDireta: 11300, creditoUrnas: 33600, cuponsProcessados: 41100, cuponsValidos: 38900, ticketMedioGeral: 1.71, ticketMedioAutomatica: 2.34, ticketMedioUrnas: 1.47, doadoresAutomaticosAtivos: 705, doadoresPlenos: 535, doadoresRestritos: 170, novosDoadores: 48 },
  { mes: '2021-09', mesNome: 'Set/21', ano: 2021, creditoTotal: 69200, creditoAutomatica: 23300, creditoDireta: 11600, creditoUrnas: 34300, cuponsProcessados: 42100, cuponsValidos: 39800, ticketMedioGeral: 1.72, ticketMedioAutomatica: 2.35, ticketMedioUrnas: 1.48, doadoresAutomaticosAtivos: 730, doadoresPlenos: 555, doadoresRestritos: 175, novosDoadores: 50 },
  { mes: '2021-10', mesNome: 'Out/21', ano: 2021, creditoTotal: 72100, creditoAutomatica: 24600, creditoDireta: 12100, creditoUrnas: 35400, cuponsProcessados: 43800, cuponsValidos: 41400, ticketMedioGeral: 1.73, ticketMedioAutomatica: 2.36, ticketMedioUrnas: 1.48, doadoresAutomaticosAtivos: 760, doadoresPlenos: 578, doadoresRestritos: 182, novosDoadores: 55 },
  { mes: '2021-11', mesNome: 'Nov/21', ano: 2021, creditoTotal: 75800, creditoAutomatica: 26200, creditoDireta: 12800, creditoUrnas: 36800, cuponsProcessados: 45900, cuponsValidos: 43400, ticketMedioGeral: 1.74, ticketMedioAutomatica: 2.37, ticketMedioUrnas: 1.49, doadoresAutomaticosAtivos: 795, doadoresPlenos: 605, doadoresRestritos: 190, novosDoadores: 60 },
  { mes: '2021-12', mesNome: 'Dez/21', ano: 2021, creditoTotal: 84500, creditoAutomatica: 30100, creditoDireta: 14500, creditoUrnas: 39900, cuponsProcessados: 51200, cuponsValidos: 48400, ticketMedioGeral: 1.75, ticketMedioAutomatica: 2.38, ticketMedioUrnas: 1.50, doadoresAutomaticosAtivos: 840, doadoresPlenos: 640, doadoresRestritos: 200, novosDoadores: 75 },

  // 2022
  { mes: '2022-01', mesNome: 'Jan/22', ano: 2022, creditoTotal: 74200, creditoAutomatica: 25400, creditoDireta: 12600, creditoUrnas: 36200, cuponsProcessados: 44900, cuponsValidos: 42400, ticketMedioGeral: 1.75, ticketMedioAutomatica: 2.37, ticketMedioUrnas: 1.49, doadoresAutomaticosAtivos: 860, doadoresPlenos: 655, doadoresRestritos: 205, novosDoadores: 45 },
  { mes: '2022-02', mesNome: 'Fev/22', ano: 2022, creditoTotal: 76800, creditoAutomatica: 26800, creditoDireta: 13100, creditoUrnas: 36900, cuponsProcessados: 46200, cuponsValidos: 43600, ticketMedioGeral: 1.76, ticketMedioAutomatica: 2.38, ticketMedioUrnas: 1.50, doadoresAutomaticosAtivos: 885, doadoresPlenos: 675, doadoresRestritos: 210, novosDoadores: 48 },
  { mes: '2022-03', mesNome: 'Mar/22', ano: 2022, creditoTotal: 81500, creditoAutomatica: 29100, creditoDireta: 14000, creditoUrnas: 38400, cuponsProcessados: 48900, cuponsValidos: 46200, ticketMedioGeral: 1.77, ticketMedioAutomatica: 2.40, ticketMedioUrnas: 1.51, doadoresAutomaticosAtivos: 920, doadoresPlenos: 700, doadoresRestritos: 220, novosDoadores: 55 },
  { mes: '2022-04', mesNome: 'Abr/22', ano: 2022, creditoTotal: 79200, creditoAutomatica: 28000, creditoDireta: 13500, creditoUrnas: 37700, cuponsProcessados: 47600, cuponsValidos: 45000, ticketMedioGeral: 1.76, ticketMedioAutomatica: 2.39, ticketMedioUrnas: 1.50, doadoresAutomaticosAtivos: 945, doadoresPlenos: 720, doadoresRestritos: 225, novosDoadores: 42 },
  { mes: '2022-05', mesNome: 'Mai/22', ano: 2022, creditoTotal: 85400, creditoAutomatica: 31200, creditoDireta: 14800, creditoUrnas: 39400, cuponsProcessados: 51200, cuponsValidos: 48300, ticketMedioGeral: 1.78, ticketMedioAutomatica: 2.42, ticketMedioUrnas: 1.52, doadoresAutomaticosAtivos: 980, doadoresPlenos: 748, doadoresRestritos: 232, novosDoadores: 58 },
  { mes: '2022-06', mesNome: 'Jun/22', ano: 2022, creditoTotal: 87900, creditoAutomatica: 32600, creditoDireta: 15200, creditoUrnas: 40100, cuponsProcessados: 52600, cuponsValidos: 49600, ticketMedioGeral: 1.79, ticketMedioAutomatica: 2.43, ticketMedioUrnas: 1.52, doadoresAutomaticosAtivos: 1010, doadoresPlenos: 770, doadoresRestritos: 240, novosDoadores: 52 },
  { mes: '2022-07', mesNome: 'Jul/22', ano: 2022, creditoTotal: 91400, creditoAutomatica: 34500, creditoDireta: 15900, creditoUrnas: 41000, cuponsProcessados: 54500, cuponsValidos: 51400, ticketMedioGeral: 1.80, ticketMedioAutomatica: 2.45, ticketMedioUrnas: 1.53, doadoresAutomaticosAtivos: 1045, doadoresPlenos: 798, doadoresRestritos: 247, novosDoadores: 62 },
  { mes: '2022-08', mesNome: 'Ago/22', ano: 2022, creditoTotal: 93800, creditoAutomatica: 35800, creditoDireta: 16300, creditoUrnas: 41700, cuponsProcessados: 55800, cuponsValidos: 52600, ticketMedioGeral: 1.81, ticketMedioAutomatica: 2.46, ticketMedioUrnas: 1.53, doadoresAutomaticosAtivos: 1080, doadoresPlenos: 825, doadoresRestritos: 255, novosDoadores: 65 },
  { mes: '2022-09', mesNome: 'Set/22', ano: 2022, creditoTotal: 96500, creditoAutomatica: 37400, creditoDireta: 16800, creditoUrnas: 42300, cuponsProcessados: 57200, cuponsValidos: 53900, ticketMedioGeral: 1.82, ticketMedioAutomatica: 2.48, ticketMedioUrnas: 1.54, doadoresAutomaticosAtivos: 1120, doadoresPlenos: 855, doadoresRestritos: 265, novosDoadores: 70 },
  { mes: '2022-10', mesNome: 'Out/22', ano: 2022, creditoTotal: 101200, creditoAutomatica: 40100, creditoDireta: 17800, creditoUrnas: 43300, cuponsProcessados: 59800, cuponsValidos: 56400, ticketMedioGeral: 1.84, ticketMedioAutomatica: 2.50, ticketMedioUrnas: 1.55, doadoresAutomaticosAtivos: 1165, doadoresPlenos: 890, doadoresRestritos: 275, novosDoadores: 78 },
  { mes: '2022-11', mesNome: 'Nov/22', ano: 2022, creditoTotal: 106800, creditoAutomatica: 43200, creditoDireta: 18900, creditoUrnas: 44700, cuponsProcessados: 63100, cuponsValidos: 59400, ticketMedioGeral: 1.86, ticketMedioAutomatica: 2.53, ticketMedioUrnas: 1.56, doadoresAutomaticosAtivos: 1215, doadoresPlenos: 930, doadoresRestritos: 285, novosDoadores: 85 },
  { mes: '2022-12', mesNome: 'Dez/22', ano: 2022, creditoTotal: 121500, creditoAutomatica: 51400, creditoDireta: 22100, creditoUrnas: 48000, cuponsProcessados: 71500, cuponsValidos: 67300, ticketMedioGeral: 1.89, ticketMedioAutomatica: 2.57, ticketMedioUrnas: 1.58, doadoresAutomaticosAtivos: 1280, doadoresPlenos: 980, doadoresRestritos: 300, novosDoadores: 105 },

  // 2023
  { mes: '2023-01', mesNome: 'Jan/23', ano: 2023, creditoTotal: 98400, creditoAutomatica: 39500, creditoDireta: 16800, creditoUrnas: 42100, cuponsProcessados: 57800, cuponsValidos: 54500, ticketMedioGeral: 1.81, ticketMedioAutomatica: 2.45, ticketMedioUrnas: 1.53, doadoresAutomaticosAtivos: 1310, doadoresPlenos: 1005, doadoresRestritos: 305, novosDoadores: 65 },
  { mes: '2023-02', mesNome: 'Fev/23', ano: 2023, creditoTotal: 101200, creditoAutomatica: 41200, creditoDireta: 17400, creditoUrnas: 42600, cuponsProcessados: 59200, cuponsValidos: 55800, ticketMedioGeral: 1.82, ticketMedioAutomatica: 2.47, ticketMedioUrnas: 1.54, doadoresAutomaticosAtivos: 1345, doadoresPlenos: 1030, doadoresRestritos: 315, novosDoadores: 68 },
  { mes: '2023-03', mesNome: 'Mar/23', ano: 2023, creditoTotal: 108900, creditoAutomatica: 45600, creditoDireta: 18900, creditoUrnas: 44400, cuponsProcessados: 63400, cuponsValidos: 59800, ticketMedioGeral: 1.84, ticketMedioAutomatica: 2.50, ticketMedioUrnas: 1.55, doadoresAutomaticosAtivos: 1390, doadoresPlenos: 1065, doadoresRestritos: 325, novosDoadores: 78 },
  { mes: '2023-04', mesNome: 'Abr/23', ano: 2023, creditoTotal: 105400, creditoAutomatica: 43800, creditoDireta: 18200, creditoUrnas: 43400, cuponsProcessados: 61500, cuponsValidos: 58100, ticketMedioGeral: 1.83, ticketMedioAutomatica: 2.49, ticketMedioUrnas: 1.54, doadoresAutomaticosAtivos: 1420, doadoresPlenos: 1090, doadoresRestritos: 330, novosDoadores: 60 },
  { mes: '2023-05', mesNome: 'Mai/23', ano: 2023, creditoTotal: 114800, creditoAutomatica: 49200, creditoDireta: 20100, creditoUrnas: 45500, cuponsProcessados: 66800, cuponsValidos: 63100, ticketMedioGeral: 1.86, ticketMedioAutomatica: 2.53, ticketMedioUrnas: 1.56, doadoresAutomaticosAtivos: 1475, doadoresPlenos: 1130, doadoresRestritos: 345, novosDoadores: 85 },
  { mes: '2023-06', mesNome: 'Jun/23', ano: 2023, creditoTotal: 118200, creditoAutomatica: 51400, creditoDireta: 20800, creditoUrnas: 46000, cuponsProcessados: 68500, cuponsValidos: 64700, ticketMedioGeral: 1.87, ticketMedioAutomatica: 2.55, ticketMedioUrnas: 1.57, doadoresAutomaticosAtivos: 1520, doadoresPlenos: 1165, doadoresRestritos: 355, novosDoadores: 80 },
  { mes: '2023-07', mesNome: 'Jul/23', ano: 2023, creditoTotal: 123600, creditoAutomatica: 54800, creditoDireta: 21900, creditoUrnas: 46900, cuponsProcessados: 71200, cuponsValidos: 67300, ticketMedioGeral: 1.88, ticketMedioAutomatica: 2.58, ticketMedioUrnas: 1.58, doadoresAutomaticosAtivos: 1575, doadoresPlenos: 1210, doadoresRestritos: 365, novosDoadores: 92 },
  { mes: '2023-08', mesNome: 'Ago/23', ano: 2023, creditoTotal: 127100, creditoAutomatica: 57100, creditoDireta: 22600, creditoUrnas: 47400, cuponsProcessados: 73100, cuponsValidos: 69100, ticketMedioGeral: 1.89, ticketMedioAutomatica: 2.60, ticketMedioUrnas: 1.58, doadoresAutomaticosAtivos: 1630, doadoresPlenos: 1255, doadoresRestritos: 375, novosDoadores: 95 },
  { mes: '2023-09', mesNome: 'Set/23', ano: 2023, creditoTotal: 131500, creditoAutomatica: 59800, creditoDireta: 23400, creditoUrnas: 48300, cuponsProcessados: 75400, cuponsValidos: 71200, ticketMedioGeral: 1.91, ticketMedioAutomatica: 2.63, ticketMedioUrnas: 1.59, doadoresAutomaticosAtivos: 1690, doadoresPlenos: 1300, doadoresRestritos: 390, novosDoadores: 102 },
  { mes: '2023-10', mesNome: 'Out/23', ano: 2023, creditoTotal: 138900, creditoAutomatica: 64500, creditoDireta: 24900, creditoUrnas: 49500, cuponsProcessados: 79200, cuponsValidos: 74800, ticketMedioGeral: 1.93, ticketMedioAutomatica: 2.66, ticketMedioUrnas: 1.60, doadoresAutomaticosAtivos: 1760, doadoresPlenos: 1355, doadoresRestritos: 405, novosDoadores: 115 },
  { mes: '2023-11', mesNome: 'Nov/23', ano: 2023, creditoTotal: 147200, creditoAutomatica: 70100, creditoDireta: 26500, creditoUrnas: 50600, cuponsProcessados: 83600, cuponsValidos: 78900, ticketMedioGeral: 1.95, ticketMedioAutomatica: 2.70, ticketMedioUrnas: 1.61, doadoresAutomaticosAtivos: 1840, doadoresPlenos: 1415, doadoresRestritos: 425, novosDoadores: 128 },
  { mes: '2023-12', mesNome: 'Dez/23', ano: 2023, creditoTotal: 168500, creditoAutomatica: 84200, creditoDireta: 31200, creditoUrnas: 53100, cuponsProcessados: 94800, cuponsValidos: 89500, ticketMedioGeral: 1.99, ticketMedioAutomatica: 2.75, ticketMedioUrnas: 1.63, doadoresAutomaticosAtivos: 1940, doadoresPlenos: 1490, doadoresRestritos: 450, novosDoadores: 155 },

  // 2024

  { mes: '2024-01', mesNome: 'Jan/24', ano: 2024, creditoTotal: 68450, creditoAutomatica: 22100, creditoDireta: 11200, creditoUrnas: 35150, cuponsProcessados: 42100, cuponsValidos: 39800, ticketMedioGeral: 1.72, ticketMedioAutomatica: 2.30, ticketMedioUrnas: 1.48, doadoresAutomaticosAtivos: 640, doadoresPlenos: 480, doadoresRestritos: 160, novosDoadores: 45 },
  { mes: '2024-02', mesNome: 'Fev/24', ano: 2024, creditoTotal: 71200, creditoAutomatica: 23800, creditoDireta: 11900, creditoUrnas: 35500, cuponsProcessados: 43200, cuponsValidos: 40900, ticketMedioGeral: 1.74, ticketMedioAutomatica: 2.35, ticketMedioUrnas: 1.49, doadoresAutomaticosAtivos: 680, doadoresPlenos: 510, doadoresRestritos: 170, novosDoadores: 52 },
  { mes: '2024-03', mesNome: 'Mar/24', ano: 2024, creditoTotal: 78900, creditoAutomatica: 26900, creditoDireta: 13100, creditoUrnas: 38900, cuponsProcessados: 46800, cuponsValidos: 44200, ticketMedioGeral: 1.78, ticketMedioAutomatica: 2.41, ticketMedioUrnas: 1.51, doadoresAutomaticosAtivos: 725, doadoresPlenos: 550, doadoresRestritos: 175, novosDoadores: 60 },
  { mes: '2024-04', mesNome: 'Abr/24', ano: 2024, creditoTotal: 75400, creditoAutomatica: 25800, creditoDireta: 12400, creditoUrnas: 37200, cuponsProcessados: 45100, cuponsValidos: 42600, ticketMedioGeral: 1.77, ticketMedioAutomatica: 2.38, ticketMedioUrnas: 1.50, doadoresAutomaticosAtivos: 760, doadoresPlenos: 580, doadoresRestritos: 180, novosDoadores: 48 },
  { mes: '2024-05', mesNome: 'Mai/24', ano: 2024, creditoTotal: 84100, creditoAutomatica: 29400, creditoDireta: 14200, creditoUrnas: 40500, cuponsProcessados: 48900, cuponsValidos: 46200, ticketMedioGeral: 1.82, ticketMedioAutomatica: 2.45, ticketMedioUrnas: 1.53, doadoresAutomaticosAtivos: 810, doadoresPlenos: 620, doadoresRestritos: 190, novosDoadores: 65 },
  { mes: '2024-06', mesNome: 'Jun/24', ano: 2024, creditoTotal: 86500, creditoAutomatica: 31200, creditoDireta: 14800, creditoUrnas: 40500, cuponsProcessados: 50100, cuponsValidos: 47400, ticketMedioGeral: 1.82, ticketMedioAutomatica: 2.48, ticketMedioUrnas: 1.52, doadoresAutomaticosAtivos: 855, doadoresPlenos: 660, doadoresRestritos: 195, novosDoadores: 58 },
  { mes: '2024-07', mesNome: 'Jul/24', ano: 2024, creditoTotal: 92300, creditoAutomatica: 34100, creditoDireta: 15900, creditoUrnas: 42300, cuponsProcessados: 52400, cuponsValidos: 49700, ticketMedioGeral: 1.86, ticketMedioAutomatica: 2.52, ticketMedioUrnas: 1.54, doadoresAutomaticosAtivos: 910, doadoresPlenos: 710, doadoresRestritos: 200, novosDoadores: 72 },
  { mes: '2024-08', mesNome: 'Ago/24', ano: 2024, creditoTotal: 94800, creditoAutomatica: 36200, creditoDireta: 16100, creditoUrnas: 42500, cuponsProcessados: 53100, cuponsValidos: 50400, ticketMedioGeral: 1.88, ticketMedioAutomatica: 2.55, ticketMedioUrnas: 1.55, doadoresAutomaticosAtivos: 960, doadoresPlenos: 750, doadoresRestritos: 210, novosDoadores: 68 },
  { mes: '2024-09', mesNome: 'Set/24', ano: 2024, creditoTotal: 97600, creditoAutomatica: 38500, creditoDireta: 16700, creditoUrnas: 42400, cuponsProcessados: 54200, cuponsValidos: 51300, ticketMedioGeral: 1.90, ticketMedioAutomatica: 2.59, ticketMedioUrnas: 1.55, doadoresAutomaticosAtivos: 1020, doadoresPlenos: 800, doadoresRestritos: 220, novosDoadores: 78 },
  { mes: '2024-10', mesNome: 'Out/24', ano: 2024, creditoTotal: 104200, creditoAutomatica: 42100, creditoDireta: 17800, creditoUrnas: 44300, cuponsProcessados: 56900, cuponsValidos: 53800, ticketMedioGeral: 1.94, ticketMedioAutomatica: 2.63, ticketMedioUrnas: 1.57, doadoresAutomaticosAtivos: 1095, doadoresPlenos: 860, doadoresRestritos: 235, novosDoadores: 92 },
  { mes: '2024-11', mesNome: 'Nov/24', ano: 2024, creditoTotal: 112500, creditoAutomatica: 46800, creditoDireta: 19200, creditoUrnas: 46500, cuponsProcessados: 60400, cuponsValidos: 57200, ticketMedioGeral: 1.97, ticketMedioAutomatica: 2.68, ticketMedioUrnas: 1.58, doadoresAutomaticosAtivos: 1180, doadoresPlenos: 930, doadoresRestritos: 250, novosDoadores: 105 },
  { mes: '2024-12', mesNome: 'Dez/24', ano: 2024, creditoTotal: 135800, creditoAutomatica: 58200, creditoDireta: 24100, creditoUrnas: 53500, cuponsProcessados: 71200, cuponsValidos: 67400, ticketMedioGeral: 2.01, ticketMedioAutomatica: 2.74, ticketMedioUrnas: 1.62, doadoresAutomaticosAtivos: 1290, doadoresPlenos: 1020, doadoresRestritos: 270, novosDoadores: 130 },

  // 2025
  { mes: '2025-01', mesNome: 'Jan/25', ano: 2025, creditoTotal: 118200, creditoAutomatica: 51200, creditoDireta: 19500, creditoUrnas: 47500, cuponsProcessados: 61500, cuponsValidos: 58300, ticketMedioGeral: 2.03, ticketMedioAutomatica: 2.76, ticketMedioUrnas: 1.63, doadoresAutomaticosAtivos: 1340, doadoresPlenos: 1060, doadoresRestritos: 280, novosDoadores: 88 },
  { mes: '2025-02', mesNome: 'Fev/25', ano: 2025, creditoTotal: 121500, creditoAutomatica: 54100, creditoDireta: 20200, creditoUrnas: 47200, cuponsProcessados: 62800, cuponsValidos: 59500, ticketMedioGeral: 2.04, ticketMedioAutomatica: 2.79, ticketMedioUrnas: 1.63, doadoresAutomaticosAtivos: 1395, doadoresPlenos: 1110, doadoresRestritos: 285, novosDoadores: 94 },
  { mes: '2025-03', mesNome: 'Mar/25', ano: 2025, creditoTotal: 132400, creditoAutomatica: 60200, creditoDireta: 22400, creditoUrnas: 49800, cuponsProcessados: 67400, cuponsValidos: 63900, ticketMedioGeral: 2.07, ticketMedioAutomatica: 2.82, ticketMedioUrnas: 1.64, doadoresAutomaticosAtivos: 1470, doadoresPlenos: 1170, doadoresRestritos: 300, novosDoadores: 110 },
  { mes: '2025-04', mesNome: 'Abr/25', ano: 2025, creditoTotal: 128900, creditoAutomatica: 58900, creditoDireta: 21800, creditoUrnas: 48200, cuponsProcessados: 65800, cuponsValidos: 62400, ticketMedioGeral: 2.07, ticketMedioAutomatica: 2.81, ticketMedioUrnas: 1.64, doadoresAutomaticosAtivos: 1520, doadoresPlenos: 1210, doadoresRestritos: 310, novosDoadores: 85 },
  { mes: '2025-05', mesNome: 'Mai/25', ano: 2025, creditoTotal: 141600, creditoAutomatica: 66400, creditoDireta: 24100, creditoUrnas: 51100, cuponsProcessados: 71100, cuponsValidos: 67300, ticketMedioGeral: 2.10, ticketMedioAutomatica: 2.86, ticketMedioUrnas: 1.66, doadoresAutomaticosAtivos: 1605, doadoresPlenos: 1280, doadoresRestritos: 325, novosDoadores: 120 },
  { mes: '2025-06', mesNome: 'Jun/25', ano: 2025, creditoTotal: 145800, creditoAutomatica: 69800, creditoDireta: 24700, creditoUrnas: 51300, cuponsProcessados: 72900, cuponsValidos: 69100, ticketMedioGeral: 2.11, ticketMedioAutomatica: 2.88, ticketMedioUrnas: 1.66, doadoresAutomaticosAtivos: 1680, doadoresPlenos: 1340, doadoresRestritos: 340, novosDoadores: 112 },
  { mes: '2025-07', mesNome: 'Jul/25', ano: 2025, creditoTotal: 153200, creditoAutomatica: 74900, creditoDireta: 25900, creditoUrnas: 52400, cuponsProcessados: 75800, cuponsValidos: 71800, ticketMedioGeral: 2.13, ticketMedioAutomatica: 2.91, ticketMedioUrnas: 1.67, doadoresAutomaticosAtivos: 1765, doadoresPlenos: 1410, doadoresRestritos: 355, novosDoadores: 130 },
  { mes: '2025-08', mesNome: 'Ago/25', ano: 2025, creditoTotal: 158400, creditoAutomatica: 78500, creditoDireta: 26800, creditoUrnas: 53100, cuponsProcessados: 77900, cuponsValidos: 73800, ticketMedioGeral: 2.15, ticketMedioAutomatica: 2.93, ticketMedioUrnas: 1.68, doadoresAutomaticosAtivos: 1850, doadoresPlenos: 1480, doadoresRestritos: 370, novosDoadores: 124 },
  { mes: '2025-09', mesNome: 'Set/25', ano: 2025, creditoTotal: 163900, creditoAutomatica: 82400, creditoDireta: 27900, creditoUrnas: 53600, cuponsProcessados: 80100, cuponsValidos: 75900, ticketMedioGeral: 2.16, ticketMedioAutomatica: 2.95, ticketMedioUrnas: 1.69, doadoresAutomaticosAtivos: 1940, doadoresPlenos: 1550, doadoresRestritos: 390, novosDoadores: 135 },
  { mes: '2025-10', mesNome: 'Out/25', ano: 2025, creditoTotal: 174500, creditoAutomatica: 89600, creditoDireta: 29500, creditoUrnas: 55400, cuponsProcessados: 84300, cuponsValidos: 79800, ticketMedioGeral: 2.19, ticketMedioAutomatica: 2.98, ticketMedioUrnas: 1.70, doadoresAutomaticosAtivos: 2040, doadoresPlenos: 1630, doadoresRestritos: 410, novosDoadores: 148 },
  { mes: '2025-11', mesNome: 'Nov/25', ano: 2025, creditoTotal: 186200, creditoAutomatica: 97800, creditoDireta: 31200, creditoUrnas: 57200, cuponsProcessados: 89200, cuponsValidos: 84500, ticketMedioGeral: 2.20, ticketMedioAutomatica: 3.01, ticketMedioUrnas: 1.71, doadoresAutomaticosAtivos: 2160, doadoresPlenos: 1730, doadoresRestritos: 430, novosDoadores: 162 },
  { mes: '2025-12', mesNome: 'Dez/25', ano: 2025, creditoTotal: 224000, creditoAutomatica: 121500, creditoDireta: 37800, creditoUrnas: 64700, cuponsProcessados: 103500, cuponsValidos: 98100, ticketMedioGeral: 2.28, ticketMedioAutomatica: 3.08, ticketMedioUrnas: 1.75, doadoresAutomaticosAtivos: 2310, doadoresPlenos: 1850, doadoresRestritos: 460, novosDoadores: 195 },

  // 2026 (Ano atual)
  { mes: '2026-01', mesNome: 'Jan/26', ano: 2026, creditoTotal: 195400, creditoAutomatica: 106200, creditoDireta: 32400, creditoUrnas: 56800, cuponsProcessados: 90200, cuponsValidos: 85400, ticketMedioGeral: 2.29, ticketMedioAutomatica: 3.10, ticketMedioUrnas: 1.72, doadoresAutomaticosAtivos: 2390, doadoresPlenos: 1910, doadoresRestritos: 480, novosDoadores: 135 },
  { mes: '2026-02', mesNome: 'Fev/26', ano: 2026, creditoTotal: 199800, creditoAutomatica: 110400, creditoDireta: 33100, creditoUrnas: 56300, cuponsProcessados: 91800, cuponsValidos: 86900, ticketMedioGeral: 2.30, ticketMedioAutomatica: 3.12, ticketMedioUrnas: 1.73, doadoresAutomaticosAtivos: 2470, doadoresPlenos: 1980, doadoresRestritos: 490, novosDoadores: 142 },
  { mes: '2026-03', mesNome: 'Mar/26', ano: 2026, creditoTotal: 215300, creditoAutomatica: 121800, creditoDireta: 36200, creditoUrnas: 57300, cuponsProcessados: 97400, cuponsValidos: 92300, ticketMedioGeral: 2.33, ticketMedioAutomatica: 3.15, ticketMedioUrnas: 1.74, doadoresAutomaticosAtivos: 2580, doadoresPlenos: 2070, doadoresRestritos: 510, novosDoadores: 165 },
  { mes: '2026-04', mesNome: 'Abr/26', ano: 2026, creditoTotal: 211000, creditoAutomatica: 119500, creditoDireta: 35100, creditoUrnas: 56400, cuponsProcessados: 95600, cuponsValidos: 90500, ticketMedioGeral: 2.33, ticketMedioAutomatica: 3.14, ticketMedioUrnas: 1.74, doadoresAutomaticosAtivos: 2650, doadoresPlenos: 2130, doadoresRestritos: 520, novosDoadores: 130 },
  { mes: '2026-05', mesNome: 'Mai/26', ano: 2026, creditoTotal: 228900, creditoAutomatica: 132400, creditoDireta: 38200, creditoUrnas: 58300, cuponsProcessados: 101800, cuponsValidos: 96400, ticketMedioGeral: 2.37, ticketMedioAutomatica: 3.18, ticketMedioUrnas: 1.76, doadoresAutomaticosAtivos: 2760, doadoresPlenos: 2220, doadoresRestritos: 540, novosDoadores: 172 },
  { mes: '2026-06', mesNome: 'Jun/26', ano: 2026, creditoTotal: 234100, creditoAutomatica: 136900, creditoDireta: 38800, creditoUrnas: 58400, cuponsProcessados: 103900, cuponsValidos: 98300, ticketMedioGeral: 2.38, ticketMedioAutomatica: 3.20, ticketMedioUrnas: 1.76, doadoresAutomaticosAtivos: 2860, doadoresPlenos: 2300, doadoresRestritos: 560, novosDoadores: 160 },
  { mes: '2026-07', mesNome: 'Jul/26', ano: 2026, creditoTotal: 243500, creditoAutomatica: 144200, creditoDireta: 40100, creditoUrnas: 59200, cuponsProcessados: 106800, cuponsValidos: 101100, ticketMedioGeral: 2.41, ticketMedioAutomatica: 3.22, ticketMedioUrnas: 1.77, doadoresAutomaticosAtivos: 2970, doadoresPlenos: 2390, doadoresRestritos: 580, novosDoadores: 180 },
  { mes: '2026-08', mesNome: 'Ago/26', ano: 2026, creditoTotal: 251200, creditoAutomatica: 149800, creditoDireta: 41400, creditoUrnas: 60000, cuponsProcessados: 109400, cuponsValidos: 103600, ticketMedioGeral: 2.42, ticketMedioAutomatica: 3.24, ticketMedioUrnas: 1.78, doadoresAutomaticosAtivos: 3080, doadoresPlenos: 2480, doadoresRestritos: 600, novosDoadores: 185 },
];

export const EMPRESAS_PARCEIRAS: EmpresaParceira[] = [
  {
    id: 'emp-01',
    cnpj: '47.508.411/0001-56',
    razaoSocial: 'Companhia Brasileira de Distribuição',
    nomeFantasia: 'Pão de Açúcar & Minuto',
    categoria: 'Supermercados',
    cuponsValidos: 128450,
    valorTotalNotas: 12450800,
    creditoTotal: 298400,
    creditoUrnas: 184200,
    creditoDoacoes: 114200,
    ticketMedioCupom: 2.32,
    urnasInstaladas: 42,
    status: 'Ativa',
    crescimentoYoY: 18.4,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-02',
    cnpj: '61.585.865/0001-51',
    razaoSocial: 'Raia Drogasil S.A.',
    nomeFantasia: 'Droga Raia / Drogasil',
    categoria: 'Farmácias',
    cuponsValidos: 114200,
    valorTotalNotas: 9840000,
    creditoTotal: 268900,
    creditoUrnas: 142000,
    creditoDoacoes: 126900,
    ticketMedioCupom: 2.35,
    urnasInstaladas: 56,
    status: 'Ativa',
    crescimentoYoY: 22.1,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-03',
    cnpj: '45.543.915/0001-81',
    razaoSocial: 'Carrefour Comércio e Indústria Ltda',
    nomeFantasia: 'Carrefour Express & Hiper',
    categoria: 'Supermercados',
    cuponsValidos: 98700,
    valorTotalNotas: 14210000,
    creditoTotal: 218500,
    creditoUrnas: 165000,
    creditoDoacoes: 53500,
    ticketMedioCupom: 2.21,
    urnasInstaladas: 34,
    status: 'Ativa',
    crescimentoYoY: 12.8,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-04',
    cnpj: '06.057.223/0001-71',
    razaoSocial: 'Sendas Distribuidora S.A.',
    nomeFantasia: 'Assaí Atacadista',
    categoria: 'Supermercados',
    cuponsValidos: 84300,
    valorTotalNotas: 18900000,
    creditoTotal: 185400,
    creditoUrnas: 138000,
    creditoDoacoes: 47400,
    ticketMedioCupom: 2.20,
    urnasInstaladas: 18,
    status: 'Ativa',
    crescimentoYoY: 26.5,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-05',
    cnpj: '43.214.055/0001-07',
    razaoSocial: 'Kalunga Comércio e Indústria Gráfica Ltda',
    nomeFantasia: 'Kalunga Material de Escritório',
    categoria: 'Varejo & Moda',
    cuponsValidos: 54100,
    valorTotalNotas: 5890000,
    creditoTotal: 146200,
    creditoUrnas: 89000,
    creditoDoacoes: 57200,
    ticketMedioCupom: 2.70,
    urnasInstaladas: 24,
    status: 'Ativa',
    crescimentoYoY: 15.2,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-06',
    cnpj: '01.438.784/0001-05',
    razaoSocial: 'Leroy Merlin Companhia Brasileira de Bricolagem',
    nomeFantasia: 'Leroy Merlin',
    categoria: 'Construção & Casa',
    cuponsValidos: 46800,
    valorTotalNotas: 16400000,
    creditoTotal: 138900,
    creditoUrnas: 92000,
    creditoDoacoes: 46900,
    ticketMedioCupom: 2.97,
    urnasInstaladas: 12,
    status: 'Ativa',
    crescimentoYoY: 19.8,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-07',
    cnpj: '02.421.421/0001-11',
    razaoSocial: 'Cobasi Comércio de Produtos Básicos e Artigos para Animais',
    nomeFantasia: 'Cobasi Pet Shop',
    categoria: 'Pet & Serviços',
    cuponsValidos: 48900,
    valorTotalNotas: 6720000,
    creditoTotal: 129400,
    creditoUrnas: 68000,
    creditoDoacoes: 61400,
    ticketMedioCupom: 2.65,
    urnasInstaladas: 28,
    status: 'Ativa',
    crescimentoYoY: 31.4,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-08',
    cnpj: '06.164.253/0001-87',
    razaoSocial: 'Pet Center Comércio e Participações S.A.',
    nomeFantasia: 'Petz',
    categoria: 'Pet & Serviços',
    cuponsValidos: 44200,
    valorTotalNotas: 6100000,
    creditoTotal: 119800,
    creditoUrnas: 61000,
    creditoDoacoes: 58800,
    ticketMedioCupom: 2.71,
    urnasInstaladas: 22,
    status: 'Ativa',
    crescimentoYoY: 28.0,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-09',
    cnpj: '02.867.220/0001-42',
    razaoSocial: 'JBS Aves Ltda - Divisão Varejo',
    nomeFantasia: 'Swift Mercado da Carne',
    categoria: 'Restaurantes & Alimentos',
    cuponsValidos: 41800,
    valorTotalNotas: 5980000,
    creditoTotal: 112400,
    creditoUrnas: 54000,
    creditoDoacoes: 58400,
    ticketMedioCupom: 2.69,
    urnasInstaladas: 19,
    status: 'Ativa',
    crescimentoYoY: 24.3,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-10',
    cnpj: '60.872.504/0001-23',
    razaoSocial: 'C&A Modas S.A.',
    nomeFantasia: 'C&A Moda & Calçados',
    categoria: 'Varejo & Moda',
    cuponsValidos: 37500,
    valorTotalNotas: 4890000,
    creditoTotal: 98500,
    creditoUrnas: 48000,
    creditoDoacoes: 50500,
    ticketMedioCupom: 2.63,
    urnasInstaladas: 15,
    status: 'Ativa',
    crescimentoYoY: 9.7,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-11',
    cnpj: '33.000.118/0001-79',
    razaoSocial: 'Lojas Americanas S.A.',
    nomeFantasia: 'Americanas Express',
    categoria: 'Varejo & Moda',
    cuponsValidos: 35200,
    valorTotalNotas: 3820000,
    creditoTotal: 84300,
    creditoUrnas: 51000,
    creditoDoacoes: 33300,
    ticketMedioCupom: 2.39,
    urnasInstaladas: 20,
    status: 'A renovar',
    crescimentoYoY: -4.2,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-12',
    cnpj: '03.007.331/0001-41',
    razaoSocial: 'Restaurantes Madero S.A.',
    nomeFantasia: 'Madero Container & Steak House',
    categoria: 'Restaurantes & Alimentos',
    cuponsValidos: 28900,
    valorTotalNotas: 4120000,
    creditoTotal: 79400,
    creditoUrnas: 39000,
    creditoDoacoes: 40400,
    ticketMedioCupom: 2.75,
    urnasInstaladas: 14,
    status: 'Ativa',
    crescimentoYoY: 17.6,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-13',
    cnpj: '58.071.437/0001-20',
    razaoSocial: 'Drogarias Pacheco São Paulo Ltda',
    nomeFantasia: 'Drogaria São Paulo',
    categoria: 'Farmácias',
    cuponsValidos: 31200,
    valorTotalNotas: 3100000,
    creditoTotal: 74600,
    creditoUrnas: 38000,
    creditoDoacoes: 36600,
    ticketMedioCupom: 2.39,
    urnasInstaladas: 16,
    status: 'Ativa',
    crescimentoYoY: 14.3,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-14',
    cnpj: '00.776.574/0001-56',
    razaoSocial: 'Lojas Renner S.A.',
    nomeFantasia: 'Lojas Renner',
    categoria: 'Varejo & Moda',
    cuponsValidos: 29400,
    valorTotalNotas: 4200000,
    creditoTotal: 72100,
    creditoUrnas: 34000,
    creditoDoacoes: 38100,
    ticketMedioCupom: 2.45,
    urnasInstaladas: 11,
    status: 'Ativa',
    crescimentoYoY: 11.2,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-15',
    cnpj: '17.261.661/0001-73',
    razaoSocial: 'Hortifruti Natural da Terra S.A.',
    nomeFantasia: 'Natural da Terra',
    categoria: 'Supermercados',
    cuponsValidos: 24600,
    valorTotalNotas: 3450000,
    creditoTotal: 68900,
    creditoUrnas: 29000,
    creditoDoacoes: 39900,
    ticketMedioCupom: 2.80,
    urnasInstaladas: 9,
    status: 'Em expansão',
    crescimentoYoY: 34.0,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-16',
    cnpj: '45.997.418/0001-53',
    razaoSocial: 'Cacau Show Indústria de Alimentos S.A.',
    nomeFantasia: 'Cacau Show',
    categoria: 'Restaurantes & Alimentos',
    cuponsValidos: 26100,
    valorTotalNotas: 2150000,
    creditoTotal: 58700,
    creditoUrnas: 31000,
    creditoDoacoes: 27700,
    ticketMedioCupom: 2.25,
    urnasInstaladas: 18,
    status: 'Ativa',
    crescimentoYoY: 8.5,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-17',
    cnpj: '71.676.316/0001-08',
    razaoSocial: 'Telhanorte Materiais de Construção S.A.',
    nomeFantasia: 'Telhanorte',
    categoria: 'Construção & Casa',
    cuponsValidos: 19800,
    valorTotalNotas: 4620000,
    creditoTotal: 54200,
    creditoUrnas: 36000,
    creditoDoacoes: 18200,
    ticketMedioCupom: 2.74,
    urnasInstaladas: 8,
    status: 'Ativa',
    crescimentoYoY: 10.4,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-18',
    cnpj: '53.113.791/0001-22',
    razaoSocial: 'Fast Shop S.A.',
    nomeFantasia: 'Fast Shop Eletrodomésticos',
    categoria: 'Varejo & Moda',
    cuponsValidos: 14200,
    valorTotalNotas: 6890000,
    creditoTotal: 49800,
    creditoUrnas: 21000,
    creditoDoacoes: 28800,
    ticketMedioCupom: 3.51,
    urnasInstaladas: 6,
    status: 'Ativa',
    crescimentoYoY: 16.1,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-19',
    cnpj: '00.063.960/0001-09',
    razaoSocial: 'Livraria da Vila Ltda',
    nomeFantasia: 'Livraria da Vila',
    categoria: 'Varejo & Moda',
    cuponsValidos: 12400,
    valorTotalNotas: 1540000,
    creditoTotal: 38200,
    creditoUrnas: 14000,
    creditoDoacoes: 24200,
    ticketMedioCupom: 3.08,
    urnasInstaladas: 7,
    status: 'Em expansão',
    crescimentoYoY: 21.0,
    cidade: 'São Paulo'
  },
  {
    id: 'emp-20',
    cnpj: '61.198.164/0001-60',
    razaoSocial: 'Spoleto Franquias e Alimentação S.A.',
    nomeFantasia: 'Spoleto Culinária Italiana',
    categoria: 'Restaurantes & Alimentos',
    cuponsValidos: 11800,
    valorTotalNotas: 890000,
    creditoTotal: 29400,
    creditoUrnas: 16000,
    creditoDoacoes: 13400,
    ticketMedioCupom: 2.49,
    urnasInstaladas: 10,
    status: 'Ativa',
    crescimentoYoY: 7.9,
    cidade: 'São Paulo'
  }
];

export const DOADORES_REAIS: DoadorReal[] = [
  {
    id: 'doa-001',
    cpf: '341.***.898-04',
    nome: 'Mariana Guimarães Albuquerque',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '12/03/2023',
    mesesAtivo: 42,
    totalCupons: 512,
    creditoGerado: 1724.80,
    ticketMedioCredito: 3.37,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Pinheiros)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Gabriel Monteiro', quantidadeCupons: 184, valorGasto: 16420.50, creditoGerado: 642.10 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Faria Lima', quantidadeCupons: 96, valorGasto: 4890.00, creditoGerado: 328.40 },
      { empresaId: 'emp-07', nomeLoja: 'Cobasi - Marginal Pinheiros', quantidadeCupons: 72, valorGasto: 6920.00, creditoGerado: 294.50 },
      { empresaId: 'emp-15', nomeLoja: 'Natural da Terra - Rebouças', quantidadeCupons: 82, valorGasto: 5410.00, creditoGerado: 268.20 },
      { empresaId: 'emp-06', nomeLoja: 'Leroy Merlin - Morumbi', quantidadeCupons: 78, valorGasto: 9140.00, creditoGerado: 191.60 }
    ]
  },
  {
    id: 'doa-002',
    cpf: '189.***.458-12',
    nome: 'Carlos Eduardo Nogueira Lima',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '18/07/2023',
    mesesAtivo: 38,
    totalCupons: 468,
    creditoGerado: 1582.40,
    ticketMedioCredito: 3.38,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Moema)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Moema Pássaros', quantidadeCupons: 162, valorGasto: 14200.00, creditoGerado: 548.00 },
      { empresaId: 'emp-09', nomeLoja: 'Swift - Av. Ibirapuera', quantidadeCupons: 84, valorGasto: 6100.00, creditoGerado: 310.20 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Lavandisca', quantidadeCupons: 76, valorGasto: 3940.00, creditoGerado: 275.40 },
      { empresaId: 'emp-08', nomeLoja: 'Petz - Aeroporto', quantidadeCupons: 68, valorGasto: 5420.00, creditoGerado: 236.80 },
      { empresaId: 'emp-10', nomeLoja: 'C&A - Shopping Ibirapuera', quantidadeCupons: 78, valorGasto: 4890.00, creditoGerado: 212.00 }
    ]
  },
  {
    id: 'doa-003',
    cpf: '276.***.938-55',
    nome: 'Renata Faria Bicalho',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '04/11/2023',
    mesesAtivo: 34,
    totalCupons: 421,
    creditoGerado: 1468.90,
    ticketMedioCredito: 3.49,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Vila Mariana)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Ricardo Jafet', quantidadeCupons: 154, valorGasto: 13900.00, creditoGerado: 532.00 },
      { empresaId: 'emp-05', nomeLoja: 'Kalunga - Domingos de Morais', quantidadeCupons: 92, valorGasto: 5200.00, creditoGerado: 341.50 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Vila Mariana', quantidadeCupons: 88, valorGasto: 4100.00, creditoGerado: 298.00 },
      { empresaId: 'emp-19', nomeLoja: 'Livraria da Vila - Shopping Pátio Paulista', quantidadeCupons: 46, valorGasto: 2890.00, creditoGerado: 168.40 },
      { empresaId: 'emp-12', nomeLoja: 'Madero Container - Av. Jafet', quantidadeCupons: 41, valorGasto: 3150.00, creditoGerado: 129.00 }
    ]
  },
  {
    id: 'doa-004',
    cpf: '402.***.118-87',
    nome: 'Felipe Siqueira Camargo',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '22/01/2024',
    mesesAtivo: 32,
    totalCupons: 395,
    creditoGerado: 1345.10,
    ticketMedioCredito: 3.41,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Perdizes)',
    lojasFrequentes: [
      { empresaId: 'emp-03', nomeLoja: 'Carrefour - Bairro Perdizes', quantidadeCupons: 140, valorGasto: 11800.00, creditoGerado: 480.00 },
      { empresaId: 'emp-07', nomeLoja: 'Cobasi - Pompéia', quantidadeCupons: 95, valorGasto: 6700.00, creditoGerado: 345.00 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Cardoso de Almeida', quantidadeCupons: 75, valorGasto: 3400.00, creditoGerado: 242.10 },
      { empresaId: 'emp-09', nomeLoja: 'Swift - Sumaré', quantidadeCupons: 55, valorGasto: 4100.00, creditoGerado: 188.00 },
      { empresaId: 'emp-16', nomeLoja: 'Cacau Show - Bourbon Shopping', quantidadeCupons: 30, valorGasto: 1650.00, creditoGerado: 90.00 }
    ]
  },
  {
    id: 'doa-005',
    cpf: '095.***.728-63',
    nome: 'Beatriz Vasconcelos Prado',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '15/04/2024',
    mesesAtivo: 29,
    totalCupons: 362,
    creditoGerado: 1218.60,
    ticketMedioCredito: 3.37,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Jardins)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Oscar Freire', quantidadeCupons: 130, valorGasto: 12400.00, creditoGerado: 440.00 },
      { empresaId: 'emp-15', nomeLoja: 'Natural da Terra - Alameda Lorena', quantidadeCupons: 85, valorGasto: 5800.00, creditoGerado: 295.60 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Augusta', quantidadeCupons: 72, valorGasto: 3600.00, creditoGerado: 250.00 },
      { empresaId: 'emp-19', nomeLoja: 'Livraria da Vila - Fradique', quantidadeCupons: 45, valorGasto: 2750.00, creditoGerado: 148.00 },
      { empresaId: 'emp-10', nomeLoja: 'C&A - Augusta', quantidadeCupons: 30, valorGasto: 2100.00, creditoGerado: 85.00 }
    ]
  },
  {
    id: 'doa-006',
    cpf: '512.***.308-41',
    nome: 'Rodrigo Mendonça Pacheco',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '09/06/2024',
    mesesAtivo: 27,
    totalCupons: 341,
    creditoGerado: 1140.20,
    ticketMedioCredito: 3.34,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Santana)',
    lojasFrequentes: [
      { empresaId: 'emp-04', nomeLoja: 'Assaí - Santana', quantidadeCupons: 115, valorGasto: 13500.00, creditoGerado: 380.00 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Voluntários da Pátria', quantidadeCupons: 82, valorGasto: 3900.00, creditoGerado: 284.00 },
      { empresaId: 'emp-06', nomeLoja: 'Leroy Merlin - Marginal Tietê', quantidadeCupons: 54, valorGasto: 6400.00, creditoGerado: 245.20 },
      { empresaId: 'emp-08', nomeLoja: 'Petz - Braz Leme', quantidadeCupons: 50, valorGasto: 3800.00, creditoGerado: 156.00 },
      { empresaId: 'emp-13', nomeLoja: 'Drogaria São Paulo - Cruzeiro do Sul', quantidadeCupons: 40, valorGasto: 1900.00, creditoGerado: 75.00 }
    ]
  },
  {
    id: 'doa-007',
    cpf: '633.***.118-90',
    nome: 'Luciana Meirelles Fontes',
    tipoDoacao: 'DOACAO',
    perfilFidelidade: 'Restrito',
    dataAdesao: '14/09/2024',
    mesesAtivo: 24,
    totalCupons: 182,
    creditoGerado: 418.50,
    ticketMedioCredito: 2.30,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Tatuapé)',
    lojasFrequentes: [
      { empresaId: 'emp-03', nomeLoja: 'Carrefour - Shopping Anália Franco', quantidadeCupons: 72, valorGasto: 5200.00, creditoGerado: 168.00 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Tuiuti', quantidadeCupons: 48, valorGasto: 2100.00, creditoGerado: 114.50 },
      { empresaId: 'emp-14', nomeLoja: 'Lojas Renner - Metrô Tatuapé', quantidadeCupons: 35, valorGasto: 2600.00, creditoGerado: 82.00 },
      { empresaId: 'emp-16', nomeLoja: 'Cacau Show - Praça Sílvio Romero', quantidadeCupons: 27, valorGasto: 980.00, creditoGerado: 54.00 }
    ]
  },
  {
    id: 'doa-008',
    cpf: '782.***.558-29',
    nome: 'Gustavo Paes de Barros',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '03/11/2024',
    mesesAtivo: 22,
    totalCupons: 304,
    creditoGerado: 1024.80,
    ticketMedioCredito: 3.37,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Itaim Bibi)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Clodomiro Amazonas', quantidadeCupons: 110, valorGasto: 10800.00, creditoGerado: 382.00 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Joaquim Floriano', quantidadeCupons: 65, valorGasto: 3400.00, creditoGerado: 236.80 },
      { empresaId: 'emp-09', nomeLoja: 'Swift - Tabapuã', quantidadeCupons: 58, valorGasto: 4200.00, creditoGerado: 198.00 },
      { empresaId: 'emp-12', nomeLoja: 'Madero - JK Iguatemi', quantidadeCupons: 42, valorGasto: 3500.00, creditoGerado: 138.00 },
      { empresaId: 'emp-18', nomeLoja: 'Fast Shop - Shopping Iguatemi', quantidadeCupons: 29, valorGasto: 5200.00, creditoGerado: 70.00 }
    ]
  },
  {
    id: 'doa-009',
    cpf: '891.***.408-11',
    nome: 'Juliana Castro Esteves',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '10/01/2025',
    mesesAtivo: 20,
    totalCupons: 288,
    creditoGerado: 974.40,
    ticketMedioCredito: 3.38,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Campo Belo)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Vieira de Morais', quantidadeCupons: 104, valorGasto: 9600.00, creditoGerado: 358.40 },
      { empresaId: 'emp-07', nomeLoja: 'Cobasi - Washington Luís', quantidadeCupons: 72, valorGasto: 5100.00, creditoGerado: 264.00 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Vereador José Diniz', quantidadeCupons: 58, valorGasto: 2900.00, creditoGerado: 198.00 },
      { empresaId: 'emp-15', nomeLoja: 'Natural da Terra - Ibirapuera', quantidadeCupons: 36, valorGasto: 2800.00, creditoGerado: 112.00 },
      { empresaId: 'emp-05', nomeLoja: 'Kalunga - Berrini', quantidadeCupons: 18, valorGasto: 1200.00, creditoGerado: 42.00 }
    ]
  },
  {
    id: 'doa-010',
    cpf: '921.***.678-74',
    nome: 'Marcelo Brandão Fontoura',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '05/03/2025',
    mesesAtivo: 18,
    totalCupons: 265,
    creditoGerado: 896.20,
    ticketMedioCredito: 3.38,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Brooklin)',
    lojasFrequentes: [
      { empresaId: 'emp-03', nomeLoja: 'Carrefour - Santo Amaro', quantidadeCupons: 96, valorGasto: 8900.00, creditoGerado: 324.00 },
      { empresaId: 'emp-06', nomeLoja: 'Leroy Merlin - Marginal Pinheiros', quantidadeCupons: 52, valorGasto: 6100.00, creditoGerado: 238.20 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Padre Antônio', quantidadeCupons: 48, valorGasto: 2400.00, creditoGerado: 172.00 },
      { empresaId: 'emp-08', nomeLoja: 'Petz - Berrini', quantidadeCupons: 41, valorGasto: 3100.00, creditoGerado: 114.00 },
      { empresaId: 'emp-20', nomeLoja: 'Spoleto - Morumbi Shopping', quantidadeCupons: 28, valorGasto: 1100.00, creditoGerado: 48.00 }
    ]
  },
  {
    id: 'doa-011',
    cpf: '104.***.898-33',
    nome: 'Patrícia Silveira Dornelles',
    tipoDoacao: 'DOACAO',
    perfilFidelidade: 'Restrito',
    dataAdesao: '28/05/2025',
    mesesAtivo: 15,
    totalCupons: 145,
    creditoGerado: 348.00,
    ticketMedioCredito: 2.40,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Lapa)',
    lojasFrequentes: [
      { empresaId: 'emp-04', nomeLoja: 'Assaí - Vila Leopoldina', quantidadeCupons: 64, valorGasto: 4800.00, creditoGerado: 152.00 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Doze de Outubro', quantidadeCupons: 42, valorGasto: 1900.00, creditoGerado: 104.00 },
      { empresaId: 'emp-11', nomeLoja: 'Americanas Express - Lapa', quantidadeCupons: 25, valorGasto: 1100.00, creditoGerado: 56.00 },
      { empresaId: 'emp-16', nomeLoja: 'Cacau Show - Rua Roma', quantidadeCupons: 14, valorGasto: 580.00, creditoGerado: 36.00 }
    ]
  },
  {
    id: 'doa-012',
    cpf: '332.***.218-91',
    nome: 'Thiago Barcellos Rocha',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '12/08/2025',
    mesesAtivo: 13,
    totalCupons: 215,
    creditoGerado: 735.60,
    ticketMedioCredito: 3.42,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Santo André)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Bairro Jardim', quantidadeCupons: 82, valorGasto: 7400.00, creditoGerado: 278.00 },
      { empresaId: 'emp-07', nomeLoja: 'Cobasi - Perimetral', quantidadeCupons: 51, valorGasto: 3800.00, creditoGerado: 194.00 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Dom Pedro II', quantidadeCupons: 44, valorGasto: 2100.00, creditoGerado: 152.60 },
      { empresaId: 'emp-09', nomeLoja: 'Swift - Figueiras', quantidadeCupons: 38, valorGasto: 2600.00, creditoGerado: 111.00 }
    ]
  },
  {
    id: 'doa-013',
    cpf: '455.***.998-02',
    nome: 'Helena Miranda Toledo',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '04/10/2025',
    mesesAtivo: 11,
    totalCupons: 188,
    creditoGerado: 642.80,
    ticketMedioCredito: 3.42,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Saúde)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Praça da Árvore', quantidadeCupons: 72, valorGasto: 6400.00, creditoGerado: 248.00 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Av. Jabaquara', quantidadeCupons: 48, valorGasto: 2300.00, creditoGerado: 165.80 },
      { empresaId: 'emp-05', nomeLoja: 'Kalunga - Shopping Plaza Sul', quantidadeCupons: 39, valorGasto: 2100.00, creditoGerado: 134.00 },
      { empresaId: 'emp-15', nomeLoja: 'Natural da Terra - Cursino', quantidadeCupons: 29, valorGasto: 1950.00, creditoGerado: 95.00 }
    ]
  },
  {
    id: 'doa-014',
    cpf: '587.***.128-44',
    nome: 'André Vinícius de Souza',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '19/12/2025',
    mesesAtivo: 9,
    totalCupons: 164,
    creditoGerado: 561.00,
    ticketMedioCredito: 3.42,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Consolação)',
    lojasFrequentes: [
      { empresaId: 'emp-03', nomeLoja: 'Carrefour Express - Augusta', quantidadeCupons: 68, valorGasto: 5100.00, creditoGerado: 220.00 },
      { empresaId: 'emp-02', nomeLoja: 'Droga Raia - Bela Cintra', quantidadeCupons: 44, valorGasto: 2050.00, creditoGerado: 154.00 },
      { empresaId: 'emp-19', nomeLoja: 'Livraria da Vila - Lorena', quantidadeCupons: 32, valorGasto: 1800.00, creditoGerado: 112.00 },
      { empresaId: 'emp-12', nomeLoja: 'Madero - Shopping Frei Caneca', quantidadeCupons: 20, valorGasto: 1400.00, creditoGerado: 75.00 }
    ]
  },
  {
    id: 'doa-015',
    cpf: '619.***.808-16',
    nome: 'Camila Peixoto Rezende',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    perfilFidelidade: 'Pleno',
    dataAdesao: '15/01/2026',
    mesesAtivo: 8,
    totalCupons: 148,
    creditoGerado: 508.20,
    ticketMedioCredito: 3.43,
    statusSefaz: 'Ativo',
    cidade: 'São Paulo - SP (Aclimação)',
    lojasFrequentes: [
      { empresaId: 'emp-01', nomeLoja: 'Pão de Açúcar - Aclimação', quantidadeCupons: 62, valorGasto: 5400.00, creditoGerado: 215.00 },
      { empresaId: 'emp-02', nomeLoja: 'Drogasil - Vergueiro', quantidadeCupons: 40, valorGasto: 1950.00, creditoGerado: 142.20 },
      { empresaId: 'emp-08', nomeLoja: 'Petz - Ricardo Jafet', quantidadeCupons: 28, valorGasto: 2200.00, creditoGerado: 98.00 },
      { empresaId: 'emp-16', nomeLoja: 'Cacau Show - Aclimação', quantidadeCupons: 18, valorGasto: 720.00, creditoGerado: 53.00 }
    ]
  }
];

// Deduplication example records to demonstrate the business logic:
// Rule 3: Prioritize StatusdoPedido = 'Pedido com documento encontrado.'
export const RAW_COUPONS_SAMPLE: CupomFiscal[] = [
  {
    id: 'dup-001-A',
    numeroCupom: 'CF-849102-SP',
    dataEmissao: '14/08/2026 18:24',
    cnpjEstabelecimento: '47.508.411/0001-56',
    nomeEstabelecimento: 'Pão de Açúcar Gabriel Monteiro',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    statusPedido: 'Pedido em processamento', // Duplicated & inferior
    valorCompra: 342.50,
    valorCredito: 11.20,
    cpfDoador: '341.***.898-04',
    nomeDoador: 'Mariana Guimarães Albuquerque',
    origem: 'APP_AUTOMATICO',
    mesReferencia: '2026-08'
  },
  {
    id: 'dup-001-B',
    numeroCupom: 'CF-849102-SP',
    dataEmissao: '14/08/2026 18:24',
    cnpjEstabelecimento: '47.508.411/0001-56',
    nomeEstabelecimento: 'Pão de Açúcar Gabriel Monteiro',
    tipoDoacao: 'DOACAO_AUTOMATICA',
    statusPedido: 'Pedido com documento encontrado.', // Prioritized by Rule 3!
    valorCompra: 342.50,
    valorCredito: 11.20,
    cpfDoador: '341.***.898-04',
    nomeDoador: 'Mariana Guimarães Albuquerque',
    origem: 'APP_AUTOMATICO',
    mesReferencia: '2026-08'
  },
  {
    id: 'cup-cad-001',
    numeroCupom: 'CF-990112-SP',
    dataEmissao: '15/08/2026 11:30',
    cnpjEstabelecimento: '61.585.865/0001-51',
    nomeEstabelecimento: 'Droga Raia Faria Lima',
    tipoDoacao: 'CADASTRO', // Rule 1: Urnas/Empresas Parceiras (NOT doador pessoal)
    statusPedido: 'Pedido com documento encontrado.',
    valorCompra: 84.90,
    valorCredito: 2.80,
    origem: 'URNA_PARCEIRA',
    mesReferencia: '2026-08'
  },
  {
    id: 'cup-cad-002',
    numeroCupom: 'CF-990113-SP',
    dataEmissao: '15/08/2026 14:15',
    cnpjEstabelecimento: '45.543.915/0001-81',
    nomeEstabelecimento: 'Carrefour Morumbi',
    tipoDoacao: 'CADASTRO', // Rule 1: Digitador físico
    statusPedido: 'Pedido com documento encontrado.',
    valorCompra: 210.00,
    valorCredito: 5.40,
    origem: 'DIGITADOR',
    mesReferencia: '2026-08'
  },
  {
    id: 'cup-doa-001',
    numeroCupom: 'CF-771239-SP',
    dataEmissao: '16/08/2026 20:10',
    cnpjEstabelecimento: '02.421.421/0001-11',
    nomeEstabelecimento: 'Cobasi Marginal Pinheiros',
    tipoDoacao: 'DOACAO', // Rule 2: Doador Real PF (manual/direta)
    statusPedido: 'Pedido com documento encontrado.',
    valorCompra: 195.40,
    valorCredito: 7.10,
    cpfDoador: '633.***.118-90',
    nomeDoador: 'Luciana Meirelles Fontes',
    origem: 'APP_MANUAL',
    mesReferencia: '2026-08'
  }
];

export const RANKING_SEFAZ_ENTIDADES: EntidadeRanking[] = [
  { posicaoGeral: 1, posicaoSocial: 1, nomeEntidade: 'AACD - Associação de Assistência à Criança Deficiente', areaAtuacao: 'Saúde / Assistência Social', municipio: 'São Paulo', creditoSemestre: 8420000, volumeCupons: 3120000, crescimentoSemestre: 8.4 },
  { posicaoGeral: 2, posicaoSocial: 2, nomeEntidade: 'GRAACC - Grupo de Apoio ao Adolescente e à Criança com Câncer', areaAtuacao: 'Saúde / Assistência Social', municipio: 'São Paulo', creditoSemestre: 7650000, volumeCupons: 2840000, crescimentoSemestre: 9.1 },
  { posicaoGeral: 3, posicaoSocial: 3, nomeEntidade: 'APAE de São Paulo - Instituto Jô Clemente', areaAtuacao: 'Assistência Social', municipio: 'São Paulo', creditoSemestre: 5240000, volumeCupons: 2100000, crescimentoSemestre: 6.2 },
  { posicaoGeral: 4, posicaoSocial: 4, nomeEntidade: 'Fundação Abrinq pelos Direitos da Criança e do Adolescente', areaAtuacao: 'Assistência Social', municipio: 'São Paulo', creditoSemestre: 3980000, volumeCupons: 1680000, crescimentoSemestre: 11.5 },
  { posicaoGeral: 5, posicaoSocial: 5, nomeEntidade: 'Hospital de Amor de Barretos (Fundação Pio XII)', areaAtuacao: 'Saúde', municipio: 'Barretos', creditoSemestre: 3850000, volumeCupons: 1540000, crescimentoSemestre: 7.9 },
  { posicaoGeral: 6, posicaoSocial: 6, nomeEntidade: 'Vocação - Ação Comunitária do Brasil', areaAtuacao: 'Assistência Social / Juventude', municipio: 'São Paulo', creditoSemestre: 1478000, volumeCupons: 638000, crescimentoSemestre: 21.8, isVocacao: true },
  { posicaoGeral: 7, posicaoSocial: 7, nomeEntidade: 'Casas André Luiz - Instituição Espírita', areaAtuacao: 'Assistência Social', municipio: 'Guarulhos', creditoSemestre: 1390000, volumeCupons: 610000, crescimentoSemestre: 5.4 },
  { posicaoGeral: 8, posicaoSocial: 8, nomeEntidade: 'Lar das Moças Cegas', areaAtuacao: 'Assistência Social', municipio: 'Santos', creditoSemestre: 1180000, volumeCupons: 520000, crescimentoSemestre: 4.8 },
  { posicaoGeral: 9, posicaoSocial: 9, nomeEntidade: 'Aldeias Infantis SOS Brasil', areaAtuacao: 'Assistência Social', municipio: 'São Paulo', creditoSemestre: 1120000, volumeCupons: 490000, crescimentoSemestre: 12.3 },
  { posicaoGeral: 10, posicaoSocial: 10, nomeEntidade: 'Associação Beneficente Santa Fé', areaAtuacao: 'Assistência Social', municipio: 'São Paulo', creditoSemestre: 980000, volumeCupons: 440000, crescimentoSemestre: 8.7 },
  { posicaoGeral: 11, posicaoSocial: 11, nomeEntidade: 'Casa do Zezinho', areaAtuacao: 'Assistência Social / Educação', municipio: 'São Paulo', creditoSemestre: 920000, volumeCupons: 410000, crescimentoSemestre: 14.1 },
  { posicaoGeral: 12, posicaoSocial: 12, nomeEntidade: 'Instituto Ronald McDonald', areaAtuacao: 'Saúde / Assistência Social', municipio: 'São Paulo', creditoSemestre: 880000, volumeCupons: 395000, crescimentoSemestre: 6.8 },
  { posicaoGeral: 13, posicaoSocial: 13, nomeEntidade: 'Associação Cruz Verde', areaAtuacao: 'Saúde / Assistência Social', municipio: 'São Paulo', creditoSemestre: 840000, volumeCupons: 380000, crescimentoSemestre: 5.1 },
  { posicaoGeral: 14, posicaoSocial: 14, nomeEntidade: 'Liga Solidária', areaAtuacao: 'Assistência Social', municipio: 'São Paulo', creditoSemestre: 810000, volumeCupons: 360000, crescimentoSemestre: 9.8 }
];

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR');
}

export function formatarPorcentagem(valor: number): string {
  const prefix = valor > 0 ? '+' : '';
  return `${prefix}${valor.toFixed(1)}%`;
}
