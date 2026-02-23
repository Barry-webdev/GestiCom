import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getVIPClients,
} from '../controllers/client.controller';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Toutes les routes nécessitent une authentification

router.get('/vip/list', getVIPClients);
router.route('/').get(getClients).post(authorize('admin', 'gestionnaire'), createClient);
router
  .route('/:id')
  .get(getClient)
  .put(authorize('admin', 'gestionnaire'), updateClient)
  .delete(authorize('admin'), deleteClient);

export default router;
