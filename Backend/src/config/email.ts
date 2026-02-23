import nodemailer from 'nodemailer';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true pour 465, false pour les autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Interface pour les options d'email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Fonction pour envoyer un email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"Barry & Fils - GestiStock" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

// Template pour email de bienvenue
export const sendWelcomeEmail = async (name: string, email: string, password: string): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1C2A47; color: #F59E0B; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .credentials { background: #fff; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Barry & Fils - GestiStock</h1>
        </div>
        <div class="content">
          <h2>Bienvenue ${name} !</h2>
          <p>Votre compte GestiStock a été créé avec succès.</p>
          
          <div class="credentials">
            <h3>Vos identifiants de connexion :</h3>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> ${password}</p>
          </p>
          
          <p><strong>⚠️ Important :</strong> Veuillez changer votre mot de passe lors de votre première connexion.</p>
          
          <p>Vous pouvez vous connecter à l'adresse : <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
        </div>
        <div class="footer">
          <p>Barry & Fils - Pita, Guinée</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Bienvenue sur GestiStock',
    html,
    text: `Bienvenue ${name}! Vos identifiants: Email: ${email}, Mot de passe: ${password}`,
  });
};

// Template pour alerte stock bas
export const sendLowStockAlert = async (adminEmail: string, productName: string, quantity: number): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1C2A47; color: #F59E0B; padding: 20px; text-align: center; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerte Stock Bas</h1>
        </div>
        <div class="alert">
          <h3>Produit en stock bas</h3>
          <p><strong>Produit :</strong> ${productName}</p>
          <p><strong>Quantité restante :</strong> ${quantity}</p>
          <p>Veuillez réapprovisionner ce produit rapidement.</p>
        </div>
        <div class="footer">
          <p>Barry & Fils - GestiStock</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `⚠️ Alerte Stock Bas - ${productName}`,
    html,
    text: `Alerte: Le produit ${productName} est en stock bas (${quantity} restant)`,
  });
};

// Template pour rapport journalier
export const sendDailyReport = async (adminEmail: string, stats: any): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1C2A47; color: #F59E0B; padding: 20px; text-align: center; }
        .stats { background: #f9f9f9; padding: 20px; margin: 20px 0; }
        .stat-item { background: #fff; padding: 10px; margin: 10px 0; border-left: 4px solid #F59E0B; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Rapport Journalier</h1>
          <p>${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div class="stats">
          <div class="stat-item">
            <strong>Ventes du jour :</strong> ${stats.salesCount} ventes
          </div>
          <div class="stat-item">
            <strong>Chiffre d'affaires :</strong> ${stats.revenue.toLocaleString('fr-FR')} GNF
          </div>
          <div class="stat-item">
            <strong>Entrées de stock :</strong> ${stats.entries} mouvements
          </div>
          <div class="stat-item">
            <strong>Sorties de stock :</strong> ${stats.exits} mouvements
          </div>
        </div>
        <div class="footer">
          <p>Barry & Fils - GestiStock</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `📊 Rapport Journalier - ${new Date().toLocaleDateString('fr-FR')}`,
    html,
    text: `Rapport journalier: ${stats.salesCount} ventes, ${stats.revenue} GNF de CA`,
  });
};

// Template pour facture de vente
export const sendInvoiceEmail = async (clientEmail: string, invoiceData: any): Promise<boolean> => {
  const itemsHtml = invoiceData.items.map((item: any) => `
    <tr>
      <td>${item.product.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toLocaleString('fr-FR')} GNF</td>
      <td>${item.total.toLocaleString('fr-FR')} GNF</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1C2A47; color: #F59E0B; padding: 20px; text-align: center; }
        .invoice { background: #f9f9f9; padding: 20px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #1C2A47; color: #F59E0B; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Barry & Fils</h1>
          <p>Pita, Guinée</p>
        </div>
        <div class="invoice">
          <h2>Facture N° ${invoiceData.invoiceNumber}</h2>
          <p><strong>Date :</strong> ${new Date(invoiceData.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Client :</strong> ${invoiceData.clientName}</p>
          
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total : ${invoiceData.total.toLocaleString('fr-FR')} GNF
          </div>
          
          <p><strong>Mode de paiement :</strong> ${invoiceData.paymentMethod}</p>
        </div>
        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>Barry & Fils - Pita, Guinée</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: clientEmail,
    subject: `Facture N° ${invoiceData.invoiceNumber} - Barry & Fils`,
    html,
    text: `Facture ${invoiceData.invoiceNumber}: ${invoiceData.total} GNF`,
  });
};

export default transporter;
