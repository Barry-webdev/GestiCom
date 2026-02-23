import express from 'express';
import {
  getStockMovements,
  getStockMovement,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockStats,
} from '../controllers/stock.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.get('/stats/summary', getStockStats);
router
  .route('/')
  .get(getStockMovements)
  .post(authorize('admin', 'gestionnaire'), createStockMovement);
router
  .route('/:id')
  .get(getStockMovement)
  .put(authorize('admin', 'gestionnaire'), updateStockMovement)
  .delete(authorize('admin'), deleteStockMovement);

export default router;
