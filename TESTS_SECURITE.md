# 🧪 GUIDE DE TESTS DE SÉCURITÉ

## 1. Test du Rate Limiting

### Test 1.1 : Rate Limiting Général (100 req/15min)
```bash
# Envoyer 101 requêtes rapidement
for i in {1..101}; do
  curl -X GET https://votre-backend.onrender.com/api/health
  echo "Requête $i"
done

# Résultat attendu : Les 100 premières passent, la 101ème retourne :
# {"message": "Trop de requêtes depuis cette IP, veuillez réessayer plus tard."}
```

### Test 1.2 : Rate Limiting Authentification (5 req/15min)
```bash
# Tenter 6 connexions avec mauvais mot de passe
for i in {1..6}; do
  curl -X POST https://votre-backend.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}'
  echo "Tentative $i"
done

# Résultat attendu : Les 5 premières retournent erreur auth, la 6ème :
# {"message": "Trop de tentatives de connexion, veuillez réessayer dans 15 minutes."}
```

## 2. Test des Headers de Sécurité (Helmet)

```bash
# Vérifier les headers HTTP
curl -I https://votre-backend.onrender.com/api/health

# Headers attendus :
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Strict-Transport-Security: max-age=15552000; includeSubDomains
# Content-Security-Policy: default-src 'self'...
```

## 3. Test de Protection XSS

### Test 3.1 : XSS dans le body
```bash
curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>","password":"test"}'

# Résultat attendu : Requête loggée comme suspecte dans les logs serveur
```

### Test 3.2 : XSS dans les query params
```bash
curl "https://votre-backend.onrender.com/api/products?search=<script>alert(1)</script>"

# Résultat attendu : Requête loggée comme suspecte
```

## 4. Test de Protection SQL Injection

```bash
curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"test"}'

# Résultat attendu : Requête loggée comme suspecte
```

## 5. Test de Path Traversal

```bash
curl "https://votre-backend.onrender.com/api/products/../../../etc/passwd"

# Résultat attendu : Requête loggée comme suspecte, 404 ou erreur
```

## 6. Test du Timeout

```bash
# Simuler une requête lente (nécessite un endpoint de test)
curl -X GET https://votre-backend.onrender.com/api/health \
  --max-time 35

# Résultat attendu après 30s :
# {"success": false, "message": "Requête expirée - timeout"}
```

## 7. Test de Payload Trop Grand

```bash
# Créer un fichier de 11MB
dd if=/dev/zero of=large.json bs=1M count=11

# Envoyer le fichier
curl -X POST https://votre-backend.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --data-binary @large.json

# Résultat attendu :
# {"success": false, "message": "Payload trop volumineux"}
```

## 8. Test d'Authentification JWT

### Test 8.1 : Sans token
```bash
curl -X GET https://votre-backend.onrender.com/api/auth/me

# Résultat attendu :
# {"success": false, "message": "Non autorisé - Token manquant"}
```

### Test 8.2 : Token invalide
```bash
curl -X GET https://votre-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"

# Résultat attendu :
# {"success": false, "message": "Non autorisé - Token invalide"}
```

### Test 8.3 : Token expiré
```bash
# Utiliser un token expiré (généré il y a plus de 7 jours)
curl -X GET https://votre-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Résultat attendu :
# {"success": false, "message": "Non autorisé - Token invalide"}
```

## 9. Test d'Autorisation (Rôles)

### Test 9.1 : Lecteur tente de créer un produit
```bash
# 1. Se connecter en tant que lecteur
TOKEN=$(curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lecteur@gestistock.gn","password":"lecteur123"}' \
  | jq -r '.token')

# 2. Tenter de créer un produit
curl -X POST https://votre-backend.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test","price":1000}'

# Résultat attendu :
# {"success": false, "message": "Accès refusé - Permissions insuffisantes"}
```

## 10. Test CORS

### Test 10.1 : Origine autorisée
```bash
curl -X GET https://votre-backend.onrender.com/api/health \
  -H "Origin: https://gesticommerce.vercel.app" \
  -v

# Résultat attendu : Header présent
# Access-Control-Allow-Origin: https://gesticommerce.vercel.app
```

### Test 10.2 : Origine non autorisée
```bash
curl -X GET https://votre-backend.onrender.com/api/health \
  -H "Origin: https://malicious-site.com" \
  -v

# Résultat attendu : Pas de header Access-Control-Allow-Origin
```

## 11. Test de Compression

```bash
curl -X GET https://votre-backend.onrender.com/api/products \
  -H "Accept-Encoding: gzip" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v

# Résultat attendu : Header présent
# Content-Encoding: gzip
```

## 12. Test Health Check

```bash
curl -X GET https://votre-backend.onrender.com/api/health

# Résultat attendu :
# {"status": "OK", "message": "GestiStock API is running"}
```

## 📊 CHECKLIST DE SÉCURITÉ

- [ ] Rate limiting général fonctionne (100 req/15min)
- [ ] Rate limiting auth fonctionne (5 req/15min)
- [ ] Headers Helmet présents (X-Frame-Options, CSP, etc.)
- [ ] XSS détecté et loggé
- [ ] SQL injection détecté et loggé
- [ ] Path traversal détecté et loggé
- [ ] Timeout fonctionne (30s)
- [ ] Payload trop grand rejeté (>10MB)
- [ ] JWT requis pour routes protégées
- [ ] Token invalide rejeté
- [ ] Token expiré rejeté
- [ ] Autorisation par rôle fonctionne
- [ ] CORS configuré correctement
- [ ] Compression activée
- [ ] Health check répond

## 🔍 MONITORING DES LOGS

### Logs à surveiller sur Render
```bash
# Connexion au dashboard Render > Logs

# Rechercher :
- "⚠️ Requête suspecte détectée" : Tentatives d'attaque
- "Non autorisé" : Tentatives d'accès non autorisées
- "Trop de requêtes" : Rate limiting déclenché
- "Accès refusé" : Tentatives d'accès avec permissions insuffisantes
```

## 🎯 RÉSULTATS ATTENDUS

Tous les tests doivent passer pour confirmer que :
1. L'application est protégée contre les attaques DoS
2. Les headers de sécurité sont correctement configurés
3. Les tentatives XSS/SQL injection sont détectées
4. L'authentification JWT fonctionne
5. L'autorisation par rôle fonctionne
6. CORS est correctement configuré
7. Les requêtes sont compressées
8. Les timeouts fonctionnent

---

**Note** : Remplacer `votre-backend.onrender.com` par l'URL réelle de votre backend Render.
