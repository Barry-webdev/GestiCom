import express from 'express';
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesStats,
  addPayment,
  getOutstandingSales,
} from '../controllers/sale.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.get('/stats/summary', getSalesStats);
router.get('/outstanding', getOutstandingSales); // Créances
router
  .route('/')
  .get(getSales)
  .post(authorize('admin', 'gestionnaire', 'vendeur'), createSale);
router.post('/:id/payments', authorize('admin', 'gestionnaire', 'vendeur'), addPayment); // Ajouter un paiement
router
  .route('/:id')
  .get(getSale)
  .put(authorize('admin', 'gestionnaire'), updateSale)
  .delete(authorize('admin'), deleteSale);

export default router;
