import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sendEmail } from '../config/email';

// Charger les variables d'environnement
dotenv.config();

// Dossier de backup
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Créer le dossier de backup s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Fonction pour créer un backup
export const createBackup = async (): Promise<string> => {
  try {
    console.log('🔄 Démarrage du backup MongoDB...');

    // Connexion à MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();

    // Créer un nom de fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.json`);

    const backupData: any = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: {},
    };

    // Exporter chaque collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`  📦 Export de ${collectionName}...`);

      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();

      backupData.collections[collectionName] = documents;
      console.log(`  ✅ ${documents.length} documents exportés`);
    }

    // Écrire le fichier de backup
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    const fileSize = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Backup créé avec succès: ${backupFile}`);
    console.log(`📊 Taille: ${fileSize} MB`);

    // Nettoyer les anciens backups (garder seulement les 7 derniers)
    cleanOldBackups();

    return backupFile;
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
    throw error;
  }
};

// Fonction pour nettoyer les anciens backups
const cleanOldBackups = (): void => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Garder seulement les 7 derniers backups
    if (files.length > 7) {
      const filesToDelete = files.slice(7);
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Ancien backup supprimé: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('⚠️  Erreur lors du nettoyage des backups:', error);
  }
};

// Fonction pour restaurer un backup
export const restoreBackup = async (backupFile: string): Promise<void> => {
  try {
    console.log('🔄 Restauration du backup...');

    if (!fs.existsSync(backupFile)) {
      throw new Error('Fichier de backup introuvable');
    }

    // Connexion à MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Lire le fichier de backup
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'));

    console.log(`📅 Backup du: ${backupData.timestamp}`);
    console.log(`🗄️  Base de données: ${backupData.database}`);

    // Restaurer chaque collection
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      console.log(`  📦 Restauration de ${collectionName}...`);

      const collection = db.collection(collectionName);

      // Supprimer les documents existants
      await collection.deleteMany({});

      // Insérer les documents du backup
      if (Array.isArray(documents) && documents.length > 0) {
        await collection.insertMany(documents as any[]);
        console.log(`  ✅ ${documents.length} documents restaurés`);
      }
    }

    console.log('✅ Restauration terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
    throw error;
  }
};

// Fonction pour lister les backups disponibles
export const listBackups = (): Array<{ name: string; date: Date; size: string }> => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          date: stats.mtime,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return files;
  } catch (error) {
    console.error('❌ Erreur lors de la liste des backups:', error);
    return [];
  }
};

// Fonction pour envoyer une notification de backup
const sendBackupNotification = async (success: boolean, message: string): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const subject = success ? '✅ Backup MongoDB réussi' : '❌ Échec du backup MongoDB';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${success ? '#4caf50' : '#f44336'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${success ? '✅' : '❌'} Backup MongoDB</h1>
        </div>
        <div class="content">
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>Statut :</strong> ${success ? 'Réussi' : 'Échec'}</p>
          <p><strong>Message :</strong> ${message}</p>
        </div>
        <div class="footer">
          <p>Barry & Fils - GestiStock</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject,
    html,
    text: `Backup MongoDB: ${success ? 'Réussi' : 'Échec'} - ${message}`,
  });
};

// Exécution du backup si le script est appelé directement
if (require.main === module) {
  createBackup()
    .then(async (backupFile) => {
      await sendBackupNotification(true, `Backup créé: ${path.basename(backupFile)}`);
      console.log('🎉 Backup terminé avec succès');
      process.exit(0);
    })
    .catch(async (error) => {
      await sendBackupNotification(false, error.message);
      console.error('💥 Échec du backup');
      process.exit(1);
    });
}
