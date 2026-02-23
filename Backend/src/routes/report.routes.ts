import express from 'express';
import {
  getMonthlyReport,
  getStockEvolution,
  getDailyReport,
  getProductReport,
  getCategoryReport,
  getClientReport,
  getInventoryReport,
} from '../controllers/report.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/stock-evolution', getStockEvolution);
router.get('/daily', getDailyReport);
router.get('/products', getProductReport);
router.get('/categories', getCategoryReport);
router.get('/clients', getClientReport);
router.get('/inventory', getInventoryReport);

export default router;
