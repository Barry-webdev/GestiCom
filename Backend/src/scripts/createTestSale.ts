import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sale from '../models/Sale.model';
import Product from '../models/Product.model';
import Client from '../models/Client.model';
import User from '../models/User.model';

dotenv.config();

const createTestSale = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connecté à MongoDB');

    // Vérifier qu'il y a des produits et clients
    const products = await Product.find();
    const clients = await Client.find();
    const admin = await User.findOne({ email: 'admin@gestistock.gn' });

    if (products.length === 0) {
      console.log('❌ Aucun produit trouvé. Créez d\'abord des produits.');
      process.exit(1);
    }

    if (clients.length === 0) {
      console.log('❌ Aucun client trouvé. Créez d\'abord des clients.');
      process.exit(1);
    }

    if (!admin) {
      console.log('❌ Admin non trouvé.');
      process.exit(1);
    }

    console.log(`\n📦 ${products.length} produits disponibles`);
    console.log(`👥 ${clients.length} clients disponibles`);

    // Prendre le premier produit et client
    const product = products[0];
    const client = clients[0];

    console.log(`\n🛒 Création d'une vente de test...`);
    console.log(`   Produit: ${product.name}`);
    console.log(`   Client: ${client.name}`);
    console.log(`   Quantité: 2`);
    console.log(`   Prix unitaire: ${product.sellPrice} GNF`);

    // Vérifier le stock
    if (product.quantity < 2) {
      console.log(`❌ Stock insuffisant (${product.quantity} disponible)`);
      process.exit(1);
    }

    // Calculer les totaux
    const quantity = 2;
    const itemTotal = product.sellPrice * quantity;
    const subtotal = itemTotal;
    const tax = 0;
    const total = subtotal + tax;

    // Générer le saleId
    const year = new Date().getFullYear();
    const count = await Sale.countDocuments();
    const saleId = `VNT-${year}-${String(count + 1).padStart(4, '0')}`;

    // Créer la vente
    const sale = await Sale.create({
      saleId,
      client: client._id,
      clientName: client.name,
      items: [{
        product: product._id,
        productName: product.name,
        quantity,
        unit: product.unit,
        price: product.sellPrice,
        total: itemTotal,
      }],
      subtotal,
      tax,
      total,
      paymentMethod: 'Espèces',
      status: 'completed',
      user: admin._id,
      userName: admin.name,
      notes: 'Vente de test créée automatiquement',
    });

    // Déduire du stock
    product.quantity -= quantity;
    await product.save();

    // Mettre à jour le client
    client.totalPurchases += total;
    client.lastPurchase = new Date();
    await client.save();

    console.log(`\n✅ Vente créée avec succès!`);
    console.log(`   ID: ${sale.saleId}`);
    console.log(`   Total: ${sale.total} GNF`);
    console.log(`   Stock restant: ${product.quantity} ${product.unit}s`);

    // Vérifier que la vente est bien enregistrée
    const savedSale = await Sale.findById(sale._id);
    if (savedSale) {
      console.log(`\n✅ Vente vérifiée dans MongoDB`);
      console.log(`   Date: ${savedSale.createdAt}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

createTestSale();
