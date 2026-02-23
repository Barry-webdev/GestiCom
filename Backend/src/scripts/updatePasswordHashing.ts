import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';
import { connectDB } from '../config/database';

dotenv.config();

const updatePasswordHashing = async () => {
  try {
    await connectDB();
    console.log('📊 Mise à jour du hachage des mots de passe...');

    // Récupérer tous les utilisateurs
    const users = await User.find({});
    console.log(`👥 ${users.length} utilisateurs trouvés`);

    // Mots de passe par défaut pour les comptes de test
    const defaultPasswords: { [key: string]: string } = {
      'admin@gestistock.gn': 'admin123',
      'gestionnaire@gestistock.gn': 'gestionnaire123',
      'vendeur@gestistock.gn': 'vendeur123',
      'lecteur@gestistock.gn': 'lecteur123',
    };

    let updated = 0;
    for (const user of users) {
      const defaultPassword = defaultPasswords[user.email];
      
      if (defaultPassword) {
        // Forcer la mise à jour du mot de passe avec le nouveau hachage (8 rounds)
        user.password = defaultPassword;
        await user.save();
        console.log(`✅ Mot de passe mis à jour pour ${user.email}`);
        updated++;
      }
    }

    console.log(`\n🎉 ${updated} mots de passe mis à jour avec succès !`);
    console.log('⚡ Les connexions seront maintenant ultra rapides (8 rounds bcrypt)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

updatePasswordHashing();
