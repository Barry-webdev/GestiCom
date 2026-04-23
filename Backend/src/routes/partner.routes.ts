import express from 'express';
import { getPartners, getPartner, createPartner, updatePartner, deletePartner } from '../controllers/partner.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();
router.use(protect);

router.route('/').get(getPartners).post(authorize('admin', 'gestionnaire'), createPartner);
router.route('/:id')
  .get(getPartner)
  .put(authorize('admin', 'gestionnaire'), updatePartner)
  .delete(authorize('admin'), deletePartner);

export default router;
