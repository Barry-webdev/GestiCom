# ⚡ Déploiement Rapide - GestiStock

## 🎯 Résumé en 5 minutes

### 1️⃣ Backend sur Render (5 min)

1. Aller sur https://render.com
2. **New +** → **Web Service** → Connecter GitHub
3. **Configuration:**
   - Root Directory: `Backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Variables d'environnement:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://Barry_Dev:Mamadou%40Yero@cluster1.nhifcv2.mongodb.net/GestiCom
   JWT_SECRET=votre_secret_super_securise_2024
   FRONTEND_URL=https://votre-app.vercel.app
   ```
5. **Deploy** → Noter l'URL : `https://gestistock-backend.onrender.com`

---

### 2️⃣ Frontend sur Vercel (3 min)

1. Aller sur https://vercel.com
2. **Add New** → **Project** → Importer GitHub
3. **Configuration:**
   - Root Directory: `Frontend`
   - Framework: `Vite`
4. **Variable d'environnement:**
   ```
   VITE_API_URL=https://gestistock-backend.onrender.com/api
   ```
5. **Deploy** → Noter l'URL : `https://gestistock.vercel.app`

---

### 3️⃣ Mise à jour finale (1 min)

Retourner sur Render et mettre à jour :
```
FRONTEND_URL=https://gestistock.vercel.app
```

---

## ✅ C'est prêt !

🌐 Application : `https://gestistock.vercel.app`
📚 API Docs : `https://gestistock-backend.onrender.com/api-docs`
👤 Login : `admin@gestistock.gn` / `admin123`

---

## 📝 Notes importantes

- ⏱️ Premier chargement du backend peut prendre 30-60 secondes (plan gratuit)
- 🔄 Déploiement automatique à chaque `git push`
- 💰 100% gratuit pour commencer
- 📊 MongoDB Atlas déjà configuré

Pour plus de détails, voir `GUIDE_DEPLOIEMENT.md`
