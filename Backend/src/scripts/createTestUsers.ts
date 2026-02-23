import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config();

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Create gestionnaire
    const gestionnaireExists = await User.findOne({ email: 'gestionnaire@gestistock.gn' });
    if (!gestionnaireExists) {
      await User.create({
        name: 'Gestionnaire Test',
        email: 'gestionnaire@gestistock.gn',
        phone: '+224623123456',
        password: 'gestionnaire123',
        role: 'gestionnaire',
        status: 'active',
      });
      console.log('✅ Gestionnaire créé: gestionnaire@gestistock.gn / gestionnaire123');
    } else {
      console.log('⚠️  Gestionnaire existe déjà');
    }

    // Create vendeur
    const vendeurExists = await User.findOne({ email: 'vendeur@gestistock.gn' });
    if (!vendeurExists) {
      await User.create({
        name: 'Vendeur Test',
        email: 'vendeur@gestistock.gn',
        phone: '+224624123456',
        password: 'vendeur123',
        role: 'vendeur',
        status: 'active',
      });
      console.log('✅ Vendeur créé: vendeur@gestistock.gn / vendeur123');
    } else {
      console.log('⚠️  Vendeur existe déjà');
    }

    // Create lecteur
    const lecteurExists = await User.findOne({ email: 'lecteur@gestistock.gn' });
    if (!lecteurExists) {
      await User.create({
        name: 'Lecteur Test',
        email: 'lecteur@gestistock.gn',
        phone: '+224625123456',
        password: 'lecteur123',
        role: 'lecteur',
        status: 'active',
      });
      console.log('✅ Lecteur créé: lecteur@gestistock.gn / lecteur123');
    } else {
      console.log('⚠️  Lecteur existe déjà');
    }

    console.log('\n📋 Résumé des utilisateurs de test:');
    console.log('1. Admin: admin@gestistock.gn / admin123');
    console.log('2. Gestionnaire: gestionnaire@gestistock.gn / gestionnaire123');
    console.log('3. Vendeur: vendeur@gestistock.gn / vendeur123');
    console.log('4. Lecteur: lecteur@gestistock.gn / lecteur123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createTestUsers();
