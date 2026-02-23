import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Supplier from '../models/Supplier.model';
import Product from '../models/Product.model';
import StockMovement from '../models/StockMovement.model';
import User from '../models/User.model';

dotenv.config();

const testSupplierValue = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connecté à MongoDB');

    // 1. Afficher tous les fournisseurs et leurs valeurs
    console.log('\n📊 FOURNISSEURS ACTUELS:');
    const suppliers = await Supplier.find();
    suppliers.forEach(supplier => {
      console.log(`- ${supplier.name}: ${supplier.totalValue} GNF`);
    });

    // 2. Afficher tous les produits avec leurs fournisseurs
    console.log('\n📦 PRODUITS ACTUELS:');
    const products = await Product.find().populate('supplier', 'name');
    products.forEach(product => {
      console.log(`- ${product.name}: Fournisseur = ${(product.supplier as any)?.name || 'N/A'}, Prix achat = ${product.buyPrice} GNF`);
    });

    // 3. Trouver un admin pour créer le mouvement
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      return;
    }

    // 4. Créer une entrée de stock de test si on a des produits
    if (products.length > 0) {
      const testProduct = products[0];
      console.log(`\n🧪 TEST: Création d'une entrée de stock pour "${testProduct.name}"`);
      console.log(`   Quantité: 10 ${testProduct.unit}s`);
      console.log(`   Prix achat: ${testProduct.buyPrice} GNF`);
      console.log(`   Montant total: ${10 * testProduct.buyPrice} GNF`);

      // Créer le mouvement
      const movement = await StockMovement.create({
        type: 'entry',
        product: testProduct._id,
        productName: testProduct.name,
        quantity: 10,
        unit: testProduct.unit,
        reason: 'Achat',
        user: admin._id,
        userName: admin.name,
        comment: 'Test automatique',
      });

      console.log('✅ Mouvement créé');

      // Mettre à jour le produit
      testProduct.quantity += 10;
      await testProduct.save();
      console.log('✅ Stock du produit mis à jour');

      // Mettre à jour le fournisseur
      if (testProduct.supplier) {
        const supplier = await Supplier.findById(testProduct.supplier);
        if (supplier) {
          const purchaseAmount = 10 * testProduct.buyPrice;
          console.log(`\n💰 MISE À JOUR DU FOURNISSEUR "${supplier.name}":`);
          console.log(`   Total avant: ${supplier.totalValue} GNF`);
          supplier.totalValue += purchaseAmount;
          supplier.lastDelivery = new Date();
          await supplier.save();
          console.log(`   Total après: ${supplier.totalValue} GNF`);
          console.log(`   Différence: +${purchaseAmount} GNF`);
        } else {
          console.log('❌ Fournisseur non trouvé');
        }
      }
    }

    // 5. Afficher les fournisseurs après mise à jour
    console.log('\n📊 FOURNISSEURS APRÈS MISE À JOUR:');
    const updatedSuppliers = await Supplier.find();
    updatedSuppliers.forEach(supplier => {
      console.log(`- ${supplier.name}: ${supplier.totalValue} GNF`);
    });

    console.log('\n✅ Test terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
};

testSupplierValue();
