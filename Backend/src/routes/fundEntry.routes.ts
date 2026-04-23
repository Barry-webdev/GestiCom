import express from 'express';
import { getFundEntries, getFundEntry, createFundEntry, updateFundEntry, deleteFundEntry, getFundStats } from '../controllers/fundEntry.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.get('/stats/summary', getFundStats);
router.route('/').get(getFundEntries).post(authorize('admin', 'gestionnaire'), createFundEntry);
router.route('/:id')
  .get(getFundEntry)
  .put(authorize('admin', 'gestionnaire'), updateFundEntry)
  .delete(authorize('admin'), deleteFundEntry);

export default router;
