# Guide d'utilisation des Rapports - GestiStock

## Vue d'ensemble

Le système de rapports de GestiStock permet de générer et exporter des rapports détaillés en formats PDF et Excel.

## Fonctionnalités

### 1. Sélection du format d'export
- **PDF** : Rapports formatés avec en-tête Barry & Fils, tableaux stylisés
- **Excel** : Données brutes exportables pour analyse approfondie

### 2. Types de rapports disponibles

#### Rapport Journalier
- Ventes du jour avec détails (N° facture, client, montant, paiement)
- Mouvements de stock (entrées et sorties)
- Statistiques résumées

#### Rapport Mensuel
- Évolution mensuelle des ventes et achats
- Calcul automatique du profit par mois
- Total annuel avec pied de page

#### Rapport par Produit
- Liste complète des produits avec stock actuel
- Quantités vendues et chiffre d'affaires par produit
- Entrées et sorties de stock
- Statut (En stock / Stock bas / Rupture)

#### Rapport par Catégorie
- Analyse par famille de produits
- Nombre de produits par catégorie
- Stock total et valeur
- Ventes et chiffre d'affaires

#### Rapport Clients
- Liste des clients avec total des achats
- Statut VIP / Standard
- Coordonnées complètes

#### Inventaire Complet
- État complet du stock à l'instant T
- Valeur totale du stock
- Prix d'achat et de vente
- Fournisseurs associés
- Alertes stock bas et ruptures

### 3. Graphiques dynamiques

#### Évolution Annuelle
- Graphique en barres : Ventes vs Achats par mois
- Données en temps réel depuis MongoDB
- Sélection de l'année

#### Évolution du Stock
- Graphique linéaire : Évolution du stock total
- Vue hebdomadaire ou mensuelle

## Utilisation

1. **Sélectionner l'année** : Choisir l'année pour les rapports mensuels
2. **Choisir le format** : PDF ou Excel
3. **Cliquer sur un rapport** : Le fichier se télécharge automatiquement

## Caractéristiques techniques

### PDF
- En-tête personnalisé avec logo Barry & Fils
- Couleurs de la charte : Navy Blue (#1C2A47) + Gold (#F59E0B)
- Tableaux avec pagination automatique
- Pied de page avec numéro de page
- Format A4 (portrait ou paysage selon le rapport)

### Excel
- Feuilles multiples pour les rapports complexes
- Données formatées en tableaux
- Prêt pour analyse avec formules Excel
- Format .xlsx compatible avec toutes les versions

## Bibliothèques utilisées

- **jsPDF** : Génération de PDF
- **jspdf-autotable** : Tableaux dans les PDF
- **xlsx** : Génération de fichiers Excel

## Fichiers concernés

- `Frontend/src/lib/report-generator.ts` : Logique de génération
- `Frontend/src/pages/Reports.tsx` : Interface utilisateur
- `Frontend/src/services/report.service.ts` : Appels API
- `Backend/src/controllers/report.controller.ts` : Endpoints backend

## Notes importantes

- Les rapports sont générés côté client (navigateur)
- Les données sont récupérées en temps réel depuis MongoDB
- Aucune donnée n'est stockée lors de l'export
- Les fichiers sont téléchargés directement dans le dossier Téléchargements
