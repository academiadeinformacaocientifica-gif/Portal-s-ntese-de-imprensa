import { Summary, News, Country } from './types';

export const countries: Country[] = [
  { id: 'australia', nome: 'Austrália', flagCode: 'AU' },
  { id: 'portugal', nome: 'Portugal', flagCode: 'PT' },
  { id: 'brasil', nome: 'Brasil', flagCode: 'BR' },
  { id: 'africa-sul', nome: 'África do Sul', flagCode: 'ZA' },
  { id: 'belgica', nome: 'Bélgica', flagCode: 'BE' },
];

export const mockSummaries: Summary[] = [
  {
    id: 's1',
    dataReferencia: '2025-04-14',
    paisId: 'australia',
    paisNome: 'Austrália',
    tituloCapa: 'Sintese de Imprensa — Austrália Segunda-feira, 14 de Abril de 2025',
    status: 'Hoje',
    totalNoticias: 10,
    categorias: ['Política', 'Economia', 'Sociedade'],
  },
  {
    id: 's2',
    dataReferencia: '2025-04-11',
    paisId: 'portugal',
    paisNome: 'Portugal',
    tituloCapa: 'Sintese de Imprensa — Portugal Sexta-feira, 11 de Abril de 2025',
    status: 'Ontem',
    totalNoticias: 8,
    categorias: ['Política', 'Sociedade'],
  },
  {
    id: 's3',
    dataReferencia: '2025-04-10',
    paisId: 'brasil',
    paisNome: 'Brasil',
    tituloCapa: 'Brasil - 10 de Abril de 2025',
    status: 'Arquivo',
    totalNoticias: 10,
    categorias: ['Política', 'Economia', 'Cultura'],
  },
];

export const mockNews: News[] = [
  {
    id: 'n1',
    sinteseId: 's1',
    titulo: 'Governo apresenta proposta de revisão orçamental para 2025',
    corpo: 'O Governo australiano submeteu ao Parlamento uma proposta de revisão orçamental que prevê um aumento de 12 mil milhões de dólares em despesas com infraestruturas e saúde...',
    categoria: 'Política',
    ordem: 1,
    metadata: {
      fonte: 'The Australian',
      tiragem: 'Nacional - 85.000 ex.',
      periodicidade: 'Diária',
      genero: 'Notícia',
      formato: 'Impresso / Digital',
      data: '14 de Abril de 2025',
      urlOriginal: 'https://www.theaustralian.com.au'
    }
  },
  {
    id: 'n2',
    sinteseId: 's1',
    titulo: 'Tensões comerciais com a China afectam exportações mineiras',
    corpo: 'As exportações de minério de ferro australiano registaram uma queda de 8% em Março, num contexto de crescente tensão diplomática com Pequim.',
    categoria: 'Economia',
    ordem: 2,
    metadata: {
      fonte: 'Sydney Morning Herald',
      tiragem: 'Nacional - 102.000 ex.',
      periodicidade: 'Diária',
      genero: 'Reportagem',
      formato: 'Digital',
      data: '14 de Abril de 2025',
      urlOriginal: 'https://www.smh.com.au'
    }
  }
];
