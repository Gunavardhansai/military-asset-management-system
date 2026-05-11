import express from 'express';
import { createBase, getBases, getBaseById, updateBase, deleteBase } from '../controllers/baseController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Admin'), createBase);
router.get('/', getBases);
router.get('/:id', getBaseById);
router.put('/:id', authorize('Admin'), updateBase);
router.delete('/:id', authorize('Admin'), deleteBase);

export default router;
