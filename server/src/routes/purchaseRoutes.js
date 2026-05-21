import express from 'express';
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from '../controllers/purchaseController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validatePurchase, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validatePurchase, handleValidationErrors, authorize('Admin', 'Logistics Officer', 'Base Commander'), createPurchase);
router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.put('/:id', validatePurchase, handleValidationErrors, authorize('Admin', 'Logistics Officer', 'Base Commander'), updatePurchase);
router.delete('/:id', authorize('Admin'), deletePurchase);

export default router;
