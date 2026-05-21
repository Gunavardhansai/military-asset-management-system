import express from 'express';
import {
  createTransfer,
  getTransfers,
  getTransferById,
  approveTransfer,
  receiveTransfer,
  cancelTransfer,
} from '../controllers/transferController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateTransfer, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateTransfer, handleValidationErrors, authorize('Admin', 'Logistics Officer', 'Base Commander'), createTransfer);
router.get('/', getTransfers);
router.get('/:id', getTransferById);
router.patch('/:id/approve', authorize('Admin', 'Base Commander'), approveTransfer);
router.patch('/:id/receive', authorize('Admin', 'Base Commander'), receiveTransfer);
router.patch('/:id/cancel', authorize('Admin'), cancelTransfer);

export default router;
