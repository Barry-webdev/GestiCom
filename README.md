# 🏪 GestiStock - Système de Gestion de Stock

> Système complet de gestion de stock pour **Barry & Fils** - Pita, Guinée

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.7.3-blue.svg)](https://www.typescriptlang.org)

---

## 📋 Description

GestiStock est une application web complète de gestion de stock développée spécifiquement pour les besoins de Barry & Fils à Pita, Guinée. Elle permet de gérer efficacement les produits, les ventes, les clients, les fournisseurs et le stock avec un système de permissions par rôle.

### ✨ Fonctionnalités principales

- 📊 **Dashboard interactif** avec statistiques en temps réel
- 📦 **Gestion des produits** (CRUD complet, catégories, seuils d'alerte)
- 💰 **Gestion des ventes** (création, suivi, historique)
- 👥 **Gestion des clients** (statut VIP, historique d'achats)
- 🚚 **Gestion des fournisseurs** (contacts, produits associés)
- 📈 **Gestion du stock** (mouvements, alertes, inventaire)
- 📄 **Rapports PDF & Excel** (ventes, stock, clients, fournisseurs)
- 🔔 **Système de notifications** en temps réel
- 👤 **Authentification & Autorisation** (JWT, 4 rôles)
- 📱 **Design responsive** (mobile, tablette, desktop)
- 🎨 **Interface moderne** (Navy Blue + Gold)

---

## 🛠️ Stack Technique

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Langage:** TypeScript
- **Base de données:** MongoDB (Mongoose)
- **Authentification:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Upload d'images:** Cloudinary + Multer
- **Emails:** Nodemailer
- **Documentation API:** Swagger

### Frontend
- **Framework:** React 18
- **Build tool:** Vite
- **Langage:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Charts:** Recharts
- **PDF:** jsPDF + jsPDF-AutoTable
- **Excel:** XLSX

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 18+ et npm
- MongoDB Atlas (ou MongoDB local)
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/gestistock.git
cd gestistock
```

### 2. Configuration Backend

```bash
cd Backend
npm install

# Copier et configurer les variables d'environnement
copy .env.example .env
# Éditer .env avec vos valeurs
```

Variables d'environnement requises :
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:8080
```

### 3. Configuration Frontend

```bash
cd ../Frontend
npm install

# Copier et configurer les variables d'environnement
copy .env.example .env
```

Variables d'environnement :
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Démarrer l'application

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:8080
- Backend : http://localhost:5000
- API Docs : http://localhost:5000/api-docs

---

## 👤 Comptes de Test

```
Admin:
Email: admin@gestistock.gn
Mot de passe: admin123

Gestionnaire:
Email: gestionnaire@gestistock.gn
Mot de passe: gestionnaire123

Vendeur:
Email: vendeur@gestistock.gn
Mot de passe: vendeur123

Lecteur:
Email: lecteur@gestistock.gn
Mot de passe: lecteur123
```

---

## 🔐 Système de Permissions

| Fonctionnalité | Admin | Gestionnaire | Vendeur | Lecteur |
|----------------|-------|--------------|---------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Voir produits | ✅ | ✅ | ✅ | ✅ |
| Créer/Modifier produits | ✅ | ✅ | ❌ | ❌ |
| Supprimer produits | ✅ | ❌ | ❌ | ❌ |
| Créer ventes | ✅ | ✅ | ✅ | ❌ |
| Voir ventes | ✅ | ✅ | ✅ | ✅ |
| Gérer clients | ✅ | ✅ | ✅ | ❌ |
| Gérer fournisseurs | ✅ | ✅ | ❌ | ❌ |
| Mouvements stock | ✅ | ✅ | ❌ | ❌ |
| Rapports | ✅ | ✅ | ✅ | ✅ |
| Paramètres | ✅ | ❌ | ❌ | ❌ |

---

## 📦 Déploiement en Production

### Option recommandée : Render + Vercel

**Backend sur Render (gratuit):**
- Déploiement automatique depuis GitHub
- 750h/mois gratuit
- HTTPS automatique

**Frontend sur Vercel (gratuit):**
- Déploiement automatique depuis GitHub
- CDN global
- HTTPS automatique

### Guides de déploiement

1. **Guide rapide (5 min):** Voir `DEPLOIEMENT_RAPIDE.md`
2. **Guide complet:** Voir `GUIDE_DEPLOIEMENT.md`
3. **Commandes Git:** Voir `COMMANDES_GIT.md`

---

## 📁 Structure du Projet

```
gestistock/
├── Backend/
│   ├── src/
│   │   ├── config/         # Configurations (DB, Cloudinary, Email, Swagger)
│   │   ├── controllers/    # Contrôleurs API
│   │   ├── middleware/     # Middlewares (auth, validation, errors)
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes Express
│   │   ├── scripts/        # Scripts utilitaires
│   │   ├── utils/          # Fonctions utilitaires
│   │   └── server.ts       # Point d'entrée
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml         # Config Render
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilitaires
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API
│   │   ├── types/          # Types TypeScript
│   │   └── main.tsx        # Point d'entrée
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json         # Config Vercel
│   └── vite.config.ts
│
├── GUIDE_DEPLOIEMENT.md    # Guide de déploiement complet
├── DEPLOIEMENT_RAPIDE.md   # Guide rapide
├── COMMANDES_GIT.md        # Commandes Git
└── README.md               # Ce fichier
```

---

## 🔧 Scripts Disponibles

### Backend

```bash
npm run dev              # Démarrer en mode développement
npm run build            # Compiler TypeScript
npm start                # Démarrer en production
npm run create-admin     # Créer un compte admin
npm run create-test-users # Créer des comptes de test
npm run backup           # Backup de la base de données
```

### Frontend

```bash
npm run dev              # Démarrer en mode développement
npm run build            # Build pour production
npm run preview          # Preview du build
npm run lint             # Linter le code
```

---

## 📊 API Documentation

La documentation Swagger est disponible sur :
- Local : http://localhost:5000/api-docs
- Production : https://votre-backend.onrender.com/api-docs

### Endpoints principaux

```
POST   /api/auth/login          # Connexion
POST   /api/auth/register       # Inscription
GET    /api/products            # Liste des produits
POST   /api/products            # Créer un produit
GET    /api/sales               # Liste des ventes
POST   /api/sales               # Créer une vente
GET    /api/dashboard/stats     # Statistiques dashboard
GET    /api/reports/sales       # Rapport des ventes
```

---

## 🎨 Charte Graphique

- **Couleur primaire:** Navy Blue (#1C2A47)
- **Couleur secondaire:** Gold (#F59E0B)
- **Police:** Plus Jakarta Sans
- **Devise:** Franc Guinéen (GNF)
- **Format téléphone:** +224XXXXXXXXX

---

## 🐛 Dépannage

### Backend ne démarre pas
- Vérifier que MongoDB est accessible
- Vérifier les variables d'environnement dans `.env`
- Vérifier que le port 5000 n'est pas déjà utilisé

### Frontend ne se connecte pas
- Vérifier que le backend est démarré
- Vérifier `VITE_API_URL` dans `.env`
- Ouvrir la console du navigateur (F12) pour voir les erreurs

### Erreurs de compilation TypeScript
```bash
# Backend
cd Backend
npm run build

# Frontend
cd Frontend
npm run build
```

---

## 📝 TODO / Améliorations futures

- [ ] Tests unitaires et d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Mode sombre
- [ ] Export des rapports en CSV
- [ ] Notifications push
- [ ] Application mobile (React Native)
- [ ] Multi-langue (FR/EN)
- [ ] Gestion des retours produits
- [ ] Système de facturation avancé

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteur

**Barry & Fils**
- Localisation : Pita, Guinée
- Email : contact@barryetfils.gn

---

## 🙏 Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [TailwindCSS](https://tailwindcss.com/) pour le styling
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pour la base de données
- [Render](https://render.com/) pour l'hébergement backend
- [Vercel](https://vercel.com/) pour l'hébergement frontend

---

**🎉 GestiStock - Gérez votre stock efficacement !**
