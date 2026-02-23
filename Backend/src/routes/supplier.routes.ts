import express from 'express';
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplier.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.route('/').get(getSuppliers).post(authorize('admin', 'gestionnaire'), createSupplier);
router
  .route('/:id')
  .get(getSupplier)
  .put(authorize('admin', 'gestionnaire'), updateSupplier)
  .delete(authorize('admin'), deleteSupplier);

export default router;
