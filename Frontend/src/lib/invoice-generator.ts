import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '@/types';

interface InvoiceData {
  sale: Sale;
  company: {
    name: string;
    address: string;
    phone: string;
    email?: string;
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
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Validation des données
  if (!data.sale || !data.company || !data.client) {
    console.error("Données manquantes:", { sale: !!data.sale, company: !!data.company, client: !!data.client });
    throw new Error("Données manquantes pour générer la facture");
  }

  if (!data.sale.items || data.sale.items.length === 0) {
    console.error("Aucun article dans la vente");
    throw new Error("Aucun article dans la vente");
  }

  console.log("Génération PDF avec:", {
    saleId: data.sale.saleId || data.sale.id,
    companyName: data.company.name,
    clientName: data.client.name,
    itemsCount: data.sale.items.length
  });
  
  // Couleurs
  const primaryColor: [number, number, number] = [28, 42, 71]; // Navy Blue
  const accentColor: [number, number, number] = [245, 158, 11]; // Gold
  
  let yPos = 15;

  // ========== EN-TÊTE ==========
  // Logo et nom de l'entreprise
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company.name, 20, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.company.address, 20, 27);
  
  // Type de document
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const invoiceType = data.sale.paymentStatus === 'paid' ? 'FACTURE' : 'FACTURE PROFORMA';
  doc.text(invoiceType, pageWidth - 20, 20, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const saleId = data.sale.saleId || data.sale.id || 'N/A';
  doc.text(`N° ${saleId}`, pageWidth - 20, 27, { align: 'right' });
  
  yPos = 42;

  // ========== INFORMATIONS CLIENT ET VENTE ==========
  doc.setTextColor(0, 0, 0);
  
  // Cadre client (gauche)
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPos, 75, 28, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, yPos, 75, 28, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 23, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.client.name, 23, yPos + 12);
  doc.text(data.client.phone, 23, yPos + 17);
  if (data.client.address) {
    const addressLines = doc.splitTextToSize(data.client.address, 68);
    doc.text(addressLines.slice(0, 1), 23, yPos + 22);
  }
  
  // Cadre informations vente (droite)
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - 95, yPos, 75, 28, 'F');
  doc.rect(pageWidth - 95, yPos, 75, 28, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS', pageWidth - 92, yPos + 6);
  
  doc.setFont('helvetica', 'normal');
  const saleDate = data.sale.createdAt || data.sale.date || new Date().toISOString();
  doc.text(`Date: ${new Date(saleDate).toLocaleDateString('fr-FR')}`, pageWidth - 92, yPos + 12);
  doc.text(`Vendeur: ${data.sale.userName || data.sale.user || 'N/A'}`, pageWidth - 92, yPos + 17);
  
  // Statut de paiement
  const statusText = data.sale.paymentStatus === 'paid' ? 'Payé' : 
                     data.sale.paymentStatus === 'partial' ? 'Partiellement payé' : 'Impayé';
  doc.text(`Statut: ${statusText}`, pageWidth - 92, yPos + 22);
  
  yPos += 35;

  // ========== TABLEAU DES ARTICLES ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('ARTICLES', 20, yPos);
  yPos += 3;

  const tableData = data.sale.items?.map((item: any) => [
    item.productName || item.product || 'Produit',
    `${item.quantity || 0} ${item.unit || ''}`,
    formatPrice(item.price || 0),
    formatPrice(item.total || 0),
  ]) || [];

  autoTable(doc, {
    startY: yPos,
    head: [['Produit', 'Qté', 'Prix unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 5;

  // ========== TOTAUX ET RÉSUMÉ PAIEMENT ==========
  const boxX = pageWidth - 85;
  const boxWidth = 65;
  
  // Si paiement partiel ou impayé, afficher le résumé complet
  if (data.sale.paymentStatus !== 'paid') {
    doc.setFillColor(255, 250, 240);
    doc.rect(boxX, yPos, boxWidth, 32, 'F');
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.rect(boxX, yPos, boxWidth, 32, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('RÉSUMÉ PAIEMENT', boxX + 3, yPos + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Total:', boxX + 3, yPos + 11);
    doc.text(formatPrice(data.sale.total || 0), boxX + boxWidth - 3, yPos + 11, { align: 'right' });
    
    doc.text('Payé:', boxX + 3, yPos + 16);
    doc.setTextColor(0, 150, 0);
    doc.text(formatPrice(data.sale.amountPaid || 0), boxX + boxWidth - 3, yPos + 16, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...accentColor);
    doc.text('Reste:', boxX + 3, yPos + 22);
    doc.text(formatPrice(data.sale.amountDue || 0), boxX + boxWidth - 3, yPos + 22, { align: 'right' });
    
    if (data.sale.dueDate) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Échéance: ${new Date(data.sale.dueDate).toLocaleDateString('fr-FR')}`, boxX + 3, yPos + 28);
    }
    
    yPos += 37;
  } else {
    // Si payé, afficher juste le total
    doc.setFillColor(245, 245, 245);
    doc.rect(boxX, yPos, boxWidth, 18, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(boxX, yPos, boxWidth, 18, 'S');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Sous-total:', boxX + 3, yPos + 6);
    doc.text(formatPrice(data.sale.subtotal || data.sale.total || 0), boxX + boxWidth - 3, yPos + 6, { align: 'right' });
    
    doc.setFillColor(...accentColor);
    doc.rect(boxX, yPos + 9, boxWidth, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL:', boxX + 3, yPos + 15);
    doc.text(formatPrice(data.sale.total || 0), boxX + boxWidth - 3, yPos + 15, { align: 'right' });
    
    yPos += 23;
  }
  
  doc.setTextColor(0, 0, 0);

  // ========== HISTORIQUE DES PAIEMENTS (compact) ==========
  if (data.sale.payments && data.sale.payments.length > 0 && yPos < pageHeight - 60) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PAIEMENTS', 20, yPos);
    yPos += 3;

    const paymentsData = data.sale.payments.slice(0, 3).map((payment: any) => [
      new Date(payment.date).toLocaleDateString('fr-FR'),
      formatPrice(payment.amount),
      payment.paymentMethod,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Montant', 'Mode']],
      body: paymentsData,
      theme: 'plain',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30 },
      },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;
  }

  // ========== NOTES (compact) ==========
  if (data.sale.notes && yPos < pageHeight - 40) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NOTES:', 20, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const notesLines = doc.splitTextToSize(data.sale.notes, pageWidth - 40);
    doc.text(notesLines.slice(0, 2), 20, yPos + 4);
    yPos += 4 + (Math.min(notesLines.length, 2) * 3);
  }

  // ========== PIED DE PAGE ==========
  const footerY = pageHeight - 20;
  
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  
  doc.text(data.company.name, pageWidth / 2, footerY + 4, { align: 'center' });
  const contactInfo = data.company.email 
    ? `${data.company.phone} | ${data.company.email}`
    : data.company.phone;
  doc.text(contactInfo, pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text(data.company.address, pageWidth / 2, footerY + 12, { align: 'center' });

  return doc;
};

export const downloadInvoice = (data: InvoiceData) => {
  try {
    const doc = generateInvoicePDF(data);
    const clientName = data.client.name || 'Client';
    const saleId = data.sale.saleId || data.sale.id || 'Vente';
    const fileName = `Facture_${saleId}_${clientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    throw error;
  }
};

export const printInvoice = (data: InvoiceData) => {
  try {
    const doc = generateInvoicePDF(data);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } catch (error) {
    console.error("Erreur lors de l'impression:", error);
    throw error;
  }
};

// Fonction utilitaire pour formater les prix (compatible jsPDF)
const formatPrice = (value: number): string => {
  // Formater manuellement pour éviter les problèmes d'encodage
  const str = value.toString();
  const parts = [];
  let remaining = str;
  
  while (remaining.length > 3) {
    parts.unshift(remaining.slice(-3));
    remaining = remaining.slice(0, -3);
  }
  
  if (remaining.length > 0) {
    parts.unshift(remaining);
  }
  
  return parts.join(' ') + ' GNF';
};
