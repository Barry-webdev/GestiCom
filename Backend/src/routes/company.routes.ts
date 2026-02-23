import express from 'express';
import { getCompany, updateCompany } from '../controllers/company.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getCompany).put(authorize('admin'), updateCompany);

export default router;
