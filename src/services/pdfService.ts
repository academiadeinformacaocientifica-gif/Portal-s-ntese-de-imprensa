import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Summary, News } from '../types';

// Extend jsPDF with autoTable for TypeScript
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateSummaryPDF = (summary: Summary, news: News[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('EMBAIXADA DA REPÚBLICA DE ANGOLA', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sector de Imprensa e Cultura', pageWidth / 2, 28, { align: 'center' });
  
  doc.line(20, 35, pageWidth - 20, 35);

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(summary.tituloCapa, 20, 50, { maxWidth: pageWidth - 40 });

  // Summary Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${summary.dataReferencia}`, 20, 65);
  doc.text(`Total de Notícias: ${summary.totalNoticias}`, pageWidth - 20, 65, { align: 'right' });

  let currentY = 80;

  // News Articles
  news.forEach((n, index) => {
    // Check for page break
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${n.titulo}`, 20, currentY, { maxWidth: pageWidth - 40 });
    currentY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitBody = doc.splitTextToSize(n.corpo, pageWidth - 40);
    doc.text(splitBody, 20, currentY);
    currentY += (splitBody.length * 5) + 5;

    // Metadata Table for this news
    doc.autoTable({
      startY: currentY,
      head: [['Campo', 'Informação']],
      body: [
        ['Fonte', n.metadata.fonte],
        ['Tiragem', n.metadata.tiragem || 'N/A'],
        ['Periodicidade', n.metadata.periodicidade],
        ['Género', n.metadata.genero],
        ['Formato', n.metadata.formato],
      ],
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillStyle: 'secondary', fillColor: [90, 90, 64] },
      margin: { left: 20, right: 20 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 15;
  });

  // Footer (Official Address)
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.line(20, doc.internal.pageSize.getHeight() - 20, pageWidth - 20, doc.internal.pageSize.getHeight() - 20);
    doc.setFontSize(8);
    doc.text('Avenue Montjoie 165, 1180 Uccle, Bélgica', pageWidth / 2, doc.internal.pageSize.getHeight() - 15, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 15, { align: 'right' });
  }

  doc.save(`Sintese_${summary.paisId}_${summary.dataReferencia}.pdf`);
};
