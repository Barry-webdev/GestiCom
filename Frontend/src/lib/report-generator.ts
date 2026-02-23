import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Fonction de formatage pour PDF (sans espaces insécables)
const formatPriceForPDF = (value: number): string => {
  // Formatage manuel pour éviter les espaces insécables
  const parts = value.toString().split('.');
  const integerPart = parts[0];
  
  // Ajouter des espaces tous les 3 chiffres
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return formatted + ' GNF';
};

// Configuration PDF
const PDF_CONFIG = {
  title: 'Barry & Fils - Pita, Guinée',
  primaryColor: [28, 42, 71] as [number, number, number], // Navy Blue
  accentColor: [245, 158, 11] as [number, number, number], // Gold
};

// Générer un PDF pour le rapport journalier
export const generateDailyPDF = (data: any) => {
  const doc = new jsPDF();
  const date = new Date(data.date).toLocaleDateString('fr-FR');

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Rapport Journalier', 105, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(date, 105, 33, { align: 'center' });

  // Statistiques
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Résumé', 14, 50);

  const stats = [
    ['Nombre de ventes', data.data.sales.count.toString()],
    ['Total des ventes', formatPriceForPDF(data.data.sales.total)],
    ['Entrées de stock', data.data.stock.entries.toString()],
    ['Sorties de stock', data.data.stock.exits.toString()],
  ];

  autoTable(doc, {
    startY: 55,
    head: [['Indicateur', 'Valeur']],
    body: stats,
    theme: 'grid',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
  });

  // Ventes du jour
  if (data.data.sales.items.length > 0) {
    doc.setFontSize(14);
    doc.text('Ventes du jour', 14, (doc as any).lastAutoTable.finalY + 15);

    const salesData = data.data.sales.items.map((sale: any) => [
      sale.invoiceNumber,
      sale.client?.name || 'Client anonyme',
      formatPriceForPDF(sale.total),
      sale.paymentMethod,
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['N° Facture', 'Client', 'Montant', 'Paiement']],
      body: salesData,
      theme: 'striped',
      headStyles: { fillColor: PDF_CONFIG.primaryColor },
    });
  }

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`rapport-journalier-${date}.pdf`);
};

// Générer un Excel pour le rapport journalier
export const generateDailyExcel = (data: any) => {
  const date = new Date(data.date).toLocaleDateString('fr-FR');
  const wb = XLSX.utils.book_new();

  // Feuille Résumé
  const summaryData = [
    ['Rapport Journalier', date],
    [],
    ['Indicateur', 'Valeur'],
    ['Nombre de ventes', data.data.sales.count],
    ['Total des ventes', data.data.sales.total],
    ['Entrées de stock', data.data.stock.entries],
    ['Sorties de stock', data.data.stock.exits],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Résumé');

  // Feuille Ventes
  if (data.data.sales.items.length > 0) {
    const salesData = data.data.sales.items.map((sale: any) => ({
      'N° Facture': sale.invoiceNumber,
      'Client': sale.client?.name || 'Client anonyme',
      'Montant': sale.total,
      'Paiement': sale.paymentMethod,
      'Date': new Date(sale.createdAt).toLocaleString('fr-FR'),
    }));
    const ws2 = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Ventes');
  }

  XLSX.writeFile(wb, `rapport-journalier-${date}.xlsx`);
};

// Générer un PDF pour le rapport mensuel
export const generateMonthlyPDF = (data: any) => {
  const doc = new jsPDF();

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Rapport Mensuel', 105, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Année ${data.year}`, 105, 33, { align: 'center' });

  // Tableau mensuel
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Évolution mensuelle', 14, 50);

  const monthlyData = data.data.map((month: any) => [
    month.name,
    formatPriceForPDF(month.ventes),
    formatPriceForPDF(month.achats),
    formatPriceForPDF(month.profit),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Mois', 'Ventes', 'Achats', 'Profit']],
    body: monthlyData,
    theme: 'grid',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
    foot: [[
      'Total',
      formatPriceForPDF(data.data.reduce((sum: number, m: any) => sum + m.ventes, 0)),
      formatPriceForPDF(data.data.reduce((sum: number, m: any) => sum + m.achats, 0)),
      formatPriceForPDF(data.data.reduce((sum: number, m: any) => sum + m.profit, 0)),
    ]],
    footStyles: { fillColor: PDF_CONFIG.accentColor, textColor: [255, 255, 255] },
  });

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save(`rapport-mensuel-${data.year}.pdf`);
};

// Générer un Excel pour le rapport mensuel
export const generateMonthlyExcel = (data: any) => {
  const wb = XLSX.utils.book_new();

  const monthlyData = data.data.map((month: any) => ({
    'Mois': month.name,
    'Ventes (GNF)': month.ventes,
    'Achats (GNF)': month.achats,
    'Profit (GNF)': month.profit,
  }));

  const ws = XLSX.utils.json_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, ws, `Année ${data.year}`);

  XLSX.writeFile(wb, `rapport-mensuel-${data.year}.xlsx`);
};

// Générer un PDF pour le rapport produits
export const generateProductsPDF = (data: any) => {
  const doc = new jsPDF('landscape');

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 148.5, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Rapport par Produit', 148.5, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${data.count} produits`, 148.5, 33, { align: 'center' });

  // Tableau produits
  const productsData = data.data.map((product: any) => [
    product.name,
    product.category,
    product.currentStock,
    formatPriceForPDF(product.sellPrice),
    product.totalSold,
    formatPriceForPDF(product.revenue),
    product.status === 'in_stock' ? 'En stock' : product.status === 'low' ? 'Stock bas' : 'Rupture',
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Produit', 'Catégorie', 'Stock', 'Prix', 'Vendus', 'CA', 'Statut']],
    body: productsData,
    theme: 'striped',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
    styles: { fontSize: 9 },
  });

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, 148.5, 200, { align: 'center' });
  }

  doc.save('rapport-produits.pdf');
};

// Générer un Excel pour le rapport produits
export const generateProductsExcel = (data: any) => {
  const wb = XLSX.utils.book_new();

  const productsData = data.data.map((product: any) => ({
    'Produit': product.name,
    'Catégorie': product.category,
    'Stock actuel': product.currentStock,
    'Unité': product.unit,
    'Prix achat (GNF)': product.buyPrice,
    'Prix vente (GNF)': product.sellPrice,
    'Fournisseur': product.supplier || 'N/A',
    'Quantité vendue': product.totalSold,
    'Chiffre d\'affaires (GNF)': product.revenue,
    'Entrées': product.entries,
    'Sorties': product.exits,
    'Statut': product.status === 'in_stock' ? 'En stock' : product.status === 'low' ? 'Stock bas' : 'Rupture',
  }));

  const ws = XLSX.utils.json_to_sheet(productsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Produits');

  XLSX.writeFile(wb, 'rapport-produits.xlsx');
};

// Générer un PDF pour le rapport catégories
export const generateCategoriesPDF = (data: any) => {
  const doc = new jsPDF();

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Rapport par Catégorie', 105, 25, { align: 'center' });

  // Tableau catégories
  const categoriesData = data.data.map((cat: any) => [
    cat.category,
    cat.productCount,
    cat.totalStock,
    formatPriceForPDF(cat.totalValue),
    cat.totalSales,
    formatPriceForPDF(cat.revenue),
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Catégorie', 'Produits', 'Stock', 'Valeur', 'Vendus', 'CA']],
    body: categoriesData,
    theme: 'grid',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
  });

  doc.save('rapport-categories.pdf');
};

// Générer un Excel pour le rapport catégories
export const generateCategoriesExcel = (data: any) => {
  const wb = XLSX.utils.book_new();

  const categoriesData = data.data.map((cat: any) => ({
    'Catégorie': cat.category,
    'Nombre de produits': cat.productCount,
    'Stock total': cat.totalStock,
    'Valeur stock (GNF)': cat.totalValue,
    'Quantité vendue': cat.totalSales,
    'Chiffre d\'affaires (GNF)': cat.revenue,
  }));

  const ws = XLSX.utils.json_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(wb, ws, 'Catégories');

  XLSX.writeFile(wb, 'rapport-categories.xlsx');
};

// Générer un PDF pour le rapport clients
export const generateClientsPDF = (data: any) => {
  const doc = new jsPDF();

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Rapport Clients', 105, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`${data.count} clients`, 105, 33, { align: 'center' });

  // Tableau clients
  const clientsData = data.data.map((client: any) => [
    client.name,
    client.phone,
    formatPriceForPDF(client.totalPurchases),
    client.status === 'vip' ? 'VIP' : 'Standard',
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Nom', 'Téléphone', 'Total achats', 'Statut']],
    body: clientsData,
    theme: 'striped',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
  });

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
  }

  doc.save('rapport-clients.pdf');
};

// Générer un Excel pour le rapport clients
export const generateClientsExcel = (data: any) => {
  const wb = XLSX.utils.book_new();

  const clientsData = data.data.map((client: any) => ({
    'Nom': client.name,
    'Téléphone': client.phone,
    'Email': client.email || 'N/A',
    'Adresse': client.address || 'N/A',
    'Total achats (GNF)': client.totalPurchases,
    'Statut': client.status === 'vip' ? 'VIP' : 'Standard',
  }));

  const ws = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  XLSX.writeFile(wb, 'rapport-clients.xlsx');
};

// Générer un PDF pour l'inventaire
export const generateInventoryPDF = (data: any) => {
  const doc = new jsPDF('landscape');

  // En-tête
  doc.setFillColor(...PDF_CONFIG.primaryColor);
  doc.rect(0, 0, 297, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(PDF_CONFIG.title, 148.5, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Inventaire Complet', 148.5, 25, { align: 'center' });
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString('fr-FR'), 148.5, 33, { align: 'center' });

  // Résumé
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Total produits: ${data.summary.totalProducts}`, 14, 50);
  doc.text(`Total articles: ${data.summary.totalItems}`, 14, 58);
  doc.text(`Valeur totale: ${formatPriceForPDF(data.summary.totalValue)}`, 14, 66);

  // Tableau inventaire
  const inventoryData = data.data.map((product: any) => [
    product.name,
    product.category,
    product.quantity,
    product.unit,
    formatPriceForPDF(product.buyPrice),
    formatPriceForPDF(product.sellPrice),
    formatPriceForPDF(product.quantity * product.buyPrice),
    product.supplier?.name || 'N/A',
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['Produit', 'Catégorie', 'Qté', 'Unité', 'PA', 'PV', 'Valeur', 'Fournisseur']],
    body: inventoryData,
    theme: 'grid',
    headStyles: { fillColor: PDF_CONFIG.primaryColor },
    styles: { fontSize: 8 },
  });

  // Pied de page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} sur ${pageCount}`, 148.5, 200, { align: 'center' });
  }

  doc.save('inventaire-complet.pdf');
};

// Générer un Excel pour l'inventaire
export const generateInventoryExcel = (data: any) => {
  const wb = XLSX.utils.book_new();

  // Feuille Résumé
  const summaryData = [
    ['Inventaire Complet', new Date().toLocaleDateString('fr-FR')],
    [],
    ['Total produits', data.summary.totalProducts],
    ['Total articles', data.summary.totalItems],
    ['Valeur totale (GNF)', data.summary.totalValue],
    ['Produits en stock bas', data.summary.lowStockCount],
    ['Produits en rupture', data.summary.outOfStockCount],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Résumé');

  // Feuille Inventaire
  const inventoryData = data.data.map((product: any) => ({
    'Produit': product.name,
    'Catégorie': product.category,
    'Quantité': product.quantity,
    'Unité': product.unit,
    'Prix achat (GNF)': product.buyPrice,
    'Prix vente (GNF)': product.sellPrice,
    'Valeur stock (GNF)': product.quantity * product.buyPrice,
    'Fournisseur': product.supplier?.name || 'N/A',
    'Seuil alerte': product.alertThreshold,
    'Statut': product.status === 'in_stock' ? 'En stock' : product.status === 'low' ? 'Stock bas' : 'Rupture',
  }));

  const ws2 = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Inventaire');

  XLSX.writeFile(wb, 'inventaire-complet.xlsx');
};



