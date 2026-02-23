import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from '../controllers/product.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.get('/alerts/low-stock', getLowStockProducts);
router.route('/').get(getProducts).post(authorize('admin', 'gestionnaire'), createProduct);
router
  .route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'gestionnaire'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

export default router;
