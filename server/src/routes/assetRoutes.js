import express from 'express';
import { createAsset, getAssets, getAssetById, updateAsset, deleteAsset } from '../controllers/assetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Admin'), createAsset);
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.put('/:id', authorize('Admin'), updateAsset);
router.delete('/:id', authorize('Admin'), deleteAsset);

export default router;
