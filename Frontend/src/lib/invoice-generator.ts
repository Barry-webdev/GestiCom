import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '@/types';

interface InvoiceData {
  sale: Sale;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  client: {
    name: string;
    phone: string;
    address?: string;
    email?: string;
  };
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Couleurs
  const primaryColor: [number, number, number] = [28, 42, 71]; // Navy Blue
  const accentColor: [number, number, number] = [245, 158, 11]; // Gold
  
  let yPos = 20;

  // ========== EN-TÊTE ==========
  // Logo et nom de l'entreprise
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name, 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.company.address, 20, 32);
  
  // Type de document
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const invoiceType = data.sale.paymentStatus === 'paid' ? 'FACTURE' : 'FACTURE PROFORMA';
  doc.text(invoiceType, pageWidth - 20, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.sale.saleId || data.sale.id}`, pageWidth - 20, 32, { align: 'right' });
  
  yPos = 50;

  // ========== INFORMATIONS CLIENT ET VENTE ==========
  doc.setTextColor(0, 0, 0);
  
  // Cadre client (gauche)
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, 85, 35, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, yPos, 85, 35, 'S');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 25, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(data.client.name, 25, yPos + 14);
  doc.text(data.client.phone, 25, yPos + 20);
  if (data.client.address) {
    const addressLines = doc.splitTextToSize(data.client.address, 75);
    doc.text(addressLines, 25, yPos + 26);
  }
  
  // Cadre informations vente (droite)
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - 105, yPos, 85, 35, 'F');
  doc.rect(pageWidth - 105, yPos, 85, 35, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS', pageWidth - 100, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(data.sale.createdAt || data.sale.date).toLocaleDateString('fr-FR')}`, pageWidth - 100, yPos + 14);
  doc.text(`Vendeur: ${data.sale.userName || data.sale.user || 'N/A'}`, pageWidth - 100, yPos + 20);
  
  // Statut de paiement
  const statusText = data.sale.paymentStatus === 'paid' ? 'Payé' : 
                     data.sale.paymentStatus === 'partial' ? 'Partiellement payé' : 'Impayé';
  doc.text(`Statut: ${statusText}`, pageWidth - 100, yPos + 26);
  
  yPos += 45;

  // ========== TABLEAU DES ARTICLES ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DÉTAIL DES ARTICLES', 20, yPos);
  yPos += 5;

  const tableData = data.sale.items?.map((item: any) => [
    item.productName || item.product,
    `${item.quantity} ${item.unit}`,
    formatPrice(item.price),
    formatPrice(item.total),
  ]) || [];

  autoTable(doc, {
    startY: yPos,
    head: [['Produit', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ========== TOTAUX ==========
  const boxX = pageWidth - 90;
  const boxWidth = 70;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(boxX, yPos, boxWidth, 30, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(boxX, yPos, boxWidth, 30, 'S');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Sous-total:', boxX + 5, yPos + 8);
  doc.text(formatPrice(data.sale.total), boxX + boxWidth - 5, yPos + 8, { align: 'right' });
  
  if (data.sale.tax && data.sale.tax > 0) {
    doc.text('TVA:', boxX + 5, yPos + 15);
    doc.text(formatPrice(data.sale.tax), boxX + boxWidth - 5, yPos + 15, { align: 'right' });
  }
  
  // Total
  doc.setFillColor(...accentColor);
  doc.rect(boxX, yPos + 18, boxWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', boxX + 5, yPos + 26);
  doc.text(formatPrice(data.sale.total), boxX + boxWidth - 5, yPos + 26, { align: 'right' });
  
  yPos += 35;
  doc.setTextColor(0, 0, 0);

  // ========== INFORMATIONS DE PAIEMENT ==========
  if (data.sale.payments && data.sale.payments.length > 0) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('HISTORIQUE DES PAIEMENTS', 20, yPos);
    yPos += 5;

    const paymentsData = data.sale.payments.map((payment: any) => [
      new Date(payment.date).toLocaleDateString('fr-FR'),
      formatPrice(payment.amount),
      payment.paymentMethod,
      payment.notes || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Montant', 'Mode', 'Notes']],
      body: paymentsData,
      theme: 'plain',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 40 },
        3: { cellWidth: 85 },
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== RÉSUMÉ PAIEMENT ==========
  if (data.sale.paymentStatus !== 'paid') {
    yPos += 5;
    
    doc.setFillColor(255, 243, 224); // Fond orange clair
    doc.rect(20, yPos, pageWidth - 40, 25, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.rect(20, yPos, pageWidth - 40, 25, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RÉSUMÉ DU PAIEMENT', 25, yPos + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Montant total: ${formatPrice(data.sale.total)}`, 25, yPos + 14);
    doc.text(`Montant payé: ${formatPrice(data.sale.amountPaid || 0)}`, 25, yPos + 19);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...accentColor);
    doc.text(`Reste à payer: ${formatPrice(data.sale.amountDue || 0)}`, pageWidth - 25, yPos + 19, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    
    if (data.sale.dueDate) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Date d'échéance: ${new Date(data.sale.dueDate).toLocaleDateString('fr-FR')}`, pageWidth - 25, yPos + 7, { align: 'right' });
    }
    
    yPos += 30;
  }

  // ========== NOTES ==========
  if (data.sale.notes) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NOTES:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(data.sale.notes, pageWidth - 40);
    doc.text(notesLines, 20, yPos + 6);
    yPos += 6 + (notesLines.length * 5);
  }

  // ========== PIED DE PAGE ==========
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  doc.text(data.company.name, pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text(`${data.company.phone} | ${data.company.email}`, pageWidth / 2, footerY + 10, { align: 'center' });
  doc.text(data.company.address, pageWidth / 2, footerY + 15, { align: 'center' });
  
  doc.setFontSize(7);
  doc.text('Merci pour votre confiance !', pageWidth / 2, footerY + 22, { align: 'center' });

  return doc;
};

export const downloadInvoice = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  const fileName = `Facture_${data.sale.saleId || data.sale.id}_${data.client.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

export const printInvoice = (data: InvoiceData) => {
  const doc = generateInvoicePDF(data);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

// Fonction utilitaire pour formater les prix
const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('fr-GN').format(value) + ' GNF';
};
