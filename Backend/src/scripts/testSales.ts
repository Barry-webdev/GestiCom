import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sale from '../models/Sale.model';

dotenv.config();

const testSales = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connecté à MongoDB');

    const sales = await Sale.find().sort({ createdAt: -1 });
    console.log(`\n📊 Nombre de ventes: ${sales.length}`);
    
    if (sales.length > 0) {
      console.log('\n🛒 Dernières ventes:');
      sales.forEach((sale, index) => {
        console.log(`\n${index + 1}. ${sale.saleId}`);
        console.log(`   Client: ${sale.clientName}`);
        console.log(`   Total: ${sale.total} GNF`);
        console.log(`   Date: ${sale.createdAt}`);
        console.log(`   Items: ${sale.items.length} produits`);
      });
    } else {
      console.log('\n❌ Aucune vente trouvée');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

testSales();
