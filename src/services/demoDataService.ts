import { createSummary, createNews } from './firebaseService';
import { Category } from '../types';

export async function seedDemoData() {
  const summaries = [
    {
      paisId: 'pt',
      paisNome: 'Portugal',
      dataReferencia: '20 Abril 2026',
      tituloCapa: 'Parcerias Estratégicas em Energias Renováveis e Economia Azul',
      status: 'Hoje' as const,
      categorias: ['Economia', 'Meio Ambiente', 'Política'] as Category[],
      totalNoticias: 2
    },
    {
      paisId: 'be',
      paisNome: 'Bélgica (UE)',
      dataReferencia: '19 Abril 2026',
      tituloCapa: 'Avanços na Cooperação de Defesa e Segurança UE-África',
      status: 'Ontem' as const,
      categorias: ['Política', 'Saúde/IA'] as Category[],
      totalNoticias: 2
    },
    {
      paisId: 'za',
      paisNome: 'África do Sul',
      dataReferencia: '18 Abril 2026',
      tituloCapa: 'Dinâmica do Comércio Intrarregional na SADC e Integração Económica',
      status: 'Arquivo' as const,
      categorias: ['Economia', 'Política'] as Category[],
      totalNoticias: 2
    }
  ];

  for (const sData of summaries) {
    const summary = await createSummary(sData);
    const summaryId = summary.id;
    
    // Create 2 news articles for each
    await createNews({
      sinteseId: summaryId,
      titulo: `Desenvolvimentos em ${sData.paisNome}: Perspectiva Estratégica`,
      corpo: `O presente relatório detalha os avanços significativos registados em ${sData.paisNome} no âmbito das relações bilaterais com Angola. Destaca-se a assinatura de novos protocolos que visam o fortalecimento da capacidade técnica e o intercâmbio de boas práticas em sectores vitais como a ${sData.categorias[0]}.`,
      categoria: sData.categorias[0] as Category,
      ordem: 1,
      metadata: {
        fonte: 'Diário de Notícias',
        tiragem: '25.000 ex',
        periodicidade: 'Diária',
        genero: 'Informativo',
        formato: 'Digital/Impresso',
        data: sData.dataReferencia,
        urlOriginal: '#'
      }
    });

    await createNews({
      sinteseId: summaryId,
      titulo: `Impacto Socioeconómico e Novas Diretrizes em ${sData.paisNome}`,
      corpo: `As recentes transformações no panorama global têm motivado uma reavaliação das políticas internas em ${sData.paisNome}. Este artigo analisa como estas mudanças impactam directamente a comunidade angolana residente e as oportunidades de investimento para empresas do sector da ${sData.categorias[1] || 'Sociedade'}.`,
      categoria: (sData.categorias[1] || 'Sociedade') as Category,
      ordem: 2,
      metadata: {
        fonte: 'Público',
        tiragem: '18.000 ex',
        periodicidade: 'Diária',
        genero: 'Análise',
        formato: 'Digital',
        data: sData.dataReferencia,
        urlOriginal: '#'
      }
    });
  }
}
