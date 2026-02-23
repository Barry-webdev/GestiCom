# 🚀 GestiStock Backend API

Backend API pour le système de gestion de stock GestiStock.

## 📋 Technologies

- **Node.js** + **Express** - Serveur API
- **TypeScript** - Typage statique
- **MongoDB** + **Mongoose** - Base de données
- **JWT** - Authentification
- **Bcrypt** - Hash des mots de passe

## 🗂️ Structure

```
Backend/
├── src/
│   ├── config/         # Configuration (DB)
│   ├── controllers/    # Logique métier
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── middleware/     # Auth, errors
│   ├── utils/          # Utilitaires
│   └── server.ts       # Point d'entrée
├── .env                # Variables d'environnement
└── package.json
```

## 🔧 Installation

```bash
cd Backend
npm install
```

## ⚙️ Configuration

Le fichier `.env` est déjà configuré avec votre cluster MongoDB.

## 🚀 Démarrage

```bash
# Mode développement (avec hot reload)
npm run dev

# Build
npm run build

# Production
npm start
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Utilisateur connecté

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détail produit
- `POST /api/products` - Créer produit
- `PUT /api/products/:id` - Modifier produit
- `DELETE /api/products/:id` - Supprimer produit
- `GET /api/products/alerts/low-stock` - Alertes stock

### Clients
- `GET /api/clients` - Liste des clients

### Fournisseurs
- `GET /api/suppliers` - Liste des fournisseurs

### Ventes
- `GET /api/sales` - Liste des ventes

### Stock
- `GET /api/stock/movements` - Mouvements de stock

### Dashboard
- `GET /api/dashboard/stats` - Statistiques

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin)

## 🔐 Authentification

Toutes les routes (sauf `/api/auth/*`) nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## 👥 Rôles

- **admin** - Accès complet
- **gestionnaire** - Gestion stock et ventes
- **vendeur** - Ventes uniquement
- **lecteur** - Consultation uniquement

## 📊 Modèles de données

### User
- name, email, phone, password
- role, status

### Product
- name, category, quantity, unit
- buyPrice, sellPrice, threshold
- supplier, status

### Client
- name, phone, address, email
- totalPurchases, lastPurchase, status

### Supplier
- name, phone, address, email, contact
- products, lastDelivery, totalValue, status

### Sale
- saleId, client, items[]
- subtotal, tax, total
- paymentMethod, status, user

### StockMovement
- type (entry/exit), product, quantity
- reason, user, comment

## 🧪 Test de l'API

```bash
# Health check
curl http://localhost:5000/api/health

# Inscription
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@gestistock.gn","phone":"+224622123456","password":"admin123","role":"admin"}'

# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gestistock.gn","password":"admin123"}'
```

## 📝 TODO

- [ ] Implémenter controllers clients
- [ ] Implémenter controllers fournisseurs
- [ ] Implémenter controllers ventes
- [ ] Implémenter controllers stock
- [ ] Implémenter controllers utilisateurs
- [ ] Implémenter dashboard stats
- [ ] Ajouter validation des données
- [ ] Ajouter tests unitaires
- [ ] Ajouter documentation Swagger

## 🔗 Base de données

**Cluster MongoDB:** cluster1.nhifcv2.mongodb.net
**Database:** GestiCom

Toutes les données sont stockées dans cette base de données MongoDB Atlas.
