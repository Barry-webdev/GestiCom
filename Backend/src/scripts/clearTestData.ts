import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.model';
import Client from '../models/Client.model';
import Supplier from '../models/Supplier.model';
import Sale from '../models/Sale.model';
import StockMovement from '../models/StockMovement.model';
import User from '../models/User.model';

dotenv.config();

const clearTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connecté à MongoDB');

    // Supprimer toutes les données de test
    await Product.deleteMany({});
    console.log('✅ Produits supprimés');

    await Client.deleteMany({});
    console.log('✅ Clients supprimés');

    await Supplier.deleteMany({});
    console.log('✅ Fournisseurs supprimés');

    await Sale.deleteMany({});
    console.log('✅ Ventes supprimées');

    await StockMovement.deleteMany({});
    console.log('✅ Mouvements de stock supprimés');

    // Supprimer les utilisateurs de test (garder seulement admin)
    await User.deleteMany({ email: { $ne: 'admin@gestistock.gn' } });
    console.log('✅ Utilisateurs de test supprimés (admin conservé)');

    console.log('\n🎉 Toutes les données de test ont été supprimées!');
    console.log('📝 Seul le compte admin@gestistock.gn a été conservé');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

clearTestData();
