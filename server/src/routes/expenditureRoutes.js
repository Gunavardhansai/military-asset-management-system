import express from 'express';
import {
  createExpenditure,
  getExpenditures,
  getExpenditureById,
  updateExpenditure,
  deleteExpenditure,
} from '../controllers/expenditureController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateExpenditure, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateExpenditure, handleValidationErrors, authorize('Admin', 'Base Commander'), createExpenditure);
router.get('/', getExpenditures);
router.get('/:id', getExpenditureById);
router.put('/:id', validateExpenditure, handleValidationErrors, authorize('Admin', 'Base Commander'), updateExpenditure);
router.delete('/:id', authorize('Admin'), deleteExpenditure);

export default router;
