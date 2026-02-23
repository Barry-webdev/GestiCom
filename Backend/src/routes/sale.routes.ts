import express from 'express';
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesStats,
} from '../controllers/sale.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.get('/stats/summary', getSalesStats);
router
  .route('/')
  .get(getSales)
  .post(authorize('admin', 'gestionnaire', 'vendeur'), createSale);
router
  .route('/:id')
  .get(getSale)
  .put(authorize('admin', 'gestionnaire'), updateSale)
  .delete(authorize('admin'), deleteSale);

export default router;
