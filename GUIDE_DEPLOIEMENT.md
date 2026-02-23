# 🚀 Guide de Déploiement - GestiStock

Ce guide explique comment déployer GestiStock en production avec :
- **Backend** sur Render (gratuit)
- **Frontend** sur Vercel (gratuit)
- **Base de données** MongoDB Atlas (déjà configuré)

---

## 📋 Prérequis

- Compte GitHub (pour pousser le code)
- Compte Render (https://render.com)
- Compte Vercel (https://vercel.com)
- MongoDB Atlas déjà configuré ✅

---

## 🔧 ÉTAPE 1 : Préparer le Code

### 1.1 Créer un dépôt GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - GestiStock ready for deployment"

# Créer un repo sur GitHub et le lier
git remote add origin https://github.com/votre-username/gestistock.git
git branch -M main
git push -u origin main
```

---

## 🖥️ ÉTAPE 2 : Déployer le Backend sur Render

### 2.1 Créer le service sur Render

1. Aller sur https://render.com et se connecter
2. Cliquer sur **"New +"** → **"Web Service"**
3. Connecter votre dépôt GitHub
4. Sélectionner le dépôt **gestistock**

### 2.2 Configuration du service

**Build & Deploy Settings:**
- **Name:** `gestistock-backend`
- **Region:** `Frankfurt` (EU) ou `Oregon` (US)
- **Branch:** `main`
- **Root Directory:** `Backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free`

### 2.3 Variables d'environnement

Ajouter ces variables dans **Environment** :

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://Barry_Dev:Mamadou%40Yero@cluster1.nhifcv2.mongodb.net/GestiCom
JWT_SECRET=votre_secret_jwt_super_securise_production_2024
JWT_EXPIRE=7d
FRONTEND_URL=https://votre-app.vercel.app
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_app_password
```

### 2.4 Déployer

1. Cliquer sur **"Create Web Service"**
2. Attendre 5-10 minutes pour le déploiement
3. Noter l'URL du backend : `https://gestistock-backend.onrender.com`

⚠️ **Important:** Le plan gratuit de Render met le service en veille après 15 minutes d'inactivité. Le premier appel peut prendre 30-60 secondes.

---

## 🌐 ÉTAPE 3 : Déployer le Frontend sur Vercel

### 3.1 Préparer le Frontend

Mettre à jour `.env.production` avec l'URL du backend Render :

```bash
VITE_API_URL=https://gestistock-backend.onrender.com/api
```

Commit et push :

```bash
git add .
git commit -m "Update production API URL"
git push
```

### 3.2 Créer le projet sur Vercel

1. Aller sur https://vercel.com et se connecter
2. Cliquer sur **"Add New..."** → **"Project"**
3. Importer le dépôt GitHub **gestistock**

### 3.3 Configuration du projet

**Project Settings:**
- **Framework Preset:** `Vite`
- **Root Directory:** `Frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.4 Variables d'environnement

Ajouter dans **Environment Variables** :

```
VITE_API_URL=https://gestistock-backend.onrender.com/api
```

### 3.5 Déployer

1. Cliquer sur **"Deploy"**
2. Attendre 2-3 minutes
3. Noter l'URL du frontend : `https://gestistock.vercel.app`

---

## 🔄 ÉTAPE 4 : Mettre à jour les URLs

### 4.1 Mettre à jour le Backend

Retourner sur Render et mettre à jour la variable :

```
FRONTEND_URL=https://gestistock.vercel.app
```

Cliquer sur **"Save Changes"** (redéploiement automatique)

### 4.2 Tester l'application

1. Ouvrir `https://gestistock.vercel.app`
2. Se connecter avec : `admin@gestistock.gn` / `admin123`
3. Vérifier que tout fonctionne

---

## 📊 ÉTAPE 5 : Configuration Post-Déploiement

### 5.1 Créer un compte admin en production

```bash
# Se connecter au backend Render via SSH ou utiliser l'API
# Ou créer directement depuis MongoDB Atlas
```

### 5.2 Configurer Cloudinary (optionnel)

1. Créer un compte sur https://cloudinary.com
2. Récupérer les credentials
3. Mettre à jour les variables d'environnement sur Render

### 5.3 Configurer les emails (optionnel)

1. Activer l'authentification 2FA sur Gmail
2. Créer un mot de passe d'application
3. Mettre à jour `EMAIL_USER` et `EMAIL_PASSWORD` sur Render

---

## 🔒 Sécurité en Production

### ✅ Checklist de sécurité

- [ ] JWT_SECRET unique et complexe (32+ caractères)
- [ ] Variables d'environnement configurées (pas de valeurs en dur)
- [ ] CORS configuré avec FRONTEND_URL correct
- [ ] MongoDB avec authentification activée
- [ ] Pas de données sensibles dans le code
- [ ] HTTPS activé (automatique sur Render et Vercel)

---

## 🚨 Dépannage

### Backend ne démarre pas

1. Vérifier les logs sur Render Dashboard
2. Vérifier que `MONGODB_URI` est correct
3. Vérifier que le build s'est terminé sans erreur

### Frontend ne se connecte pas au Backend

1. Vérifier que `VITE_API_URL` est correct
2. Ouvrir la console du navigateur (F12)
3. Vérifier les erreurs CORS
4. Vérifier que le backend est bien démarré

### Erreur CORS

Vérifier que `FRONTEND_URL` sur Render correspond exactement à l'URL Vercel (sans `/` à la fin)

---

## 📈 Monitoring

### Render
- Dashboard : https://dashboard.render.com
- Logs en temps réel disponibles
- Métriques CPU/RAM

### Vercel
- Dashboard : https://vercel.com/dashboard
- Analytics disponibles
- Logs de déploiement

### MongoDB Atlas
- Dashboard : https://cloud.mongodb.com
- Monitoring des connexions
- Métriques de performance

---

## 💰 Coûts

**Plan Gratuit (actuel):**
- Render : 750h/mois gratuit (suffisant pour 1 service)
- Vercel : 100 GB bandwidth/mois
- MongoDB Atlas : 512 MB gratuit

**Limitations:**
- Render : Service en veille après 15 min d'inactivité
- Vercel : Pas de limitation majeure pour ce projet
- MongoDB : 512 MB de stockage (largement suffisant pour démarrer)

---

## 🔄 Déploiements Futurs

### Déploiement automatique

Les deux plateformes sont configurées pour le déploiement automatique :

```bash
# Faire des modifications
git add .
git commit -m "Nouvelle fonctionnalité"
git push

# Vercel et Render déploient automatiquement !
```

### Rollback

- **Vercel:** Cliquer sur un déploiement précédent → "Promote to Production"
- **Render:** Cliquer sur "Manual Deploy" → Sélectionner un commit précédent

---

## 📞 Support

En cas de problème :
1. Vérifier les logs sur Render/Vercel
2. Vérifier la console du navigateur (F12)
3. Vérifier MongoDB Atlas (connexions actives)
4. Consulter la documentation officielle

---

## ✅ Checklist Finale

- [ ] Backend déployé sur Render
- [ ] Frontend déployé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] URLs mises à jour (FRONTEND_URL et VITE_API_URL)
- [ ] Test de connexion réussi
- [ ] Compte admin créé
- [ ] Swagger accessible sur `/api-docs`
- [ ] Application responsive testée

---

**🎉 Félicitations ! GestiStock est maintenant en production !**

URL de production : `https://gestistock.vercel.app`
API Documentation : `https://gestistock-backend.onrender.com/api-docs`
