import express from 'express';
import {
  getInventory,
  getInventoryByBaseAndAsset,
  getInventoryReport,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getInventory);
router.get('/report/summary', authorize('Admin'), getInventoryReport);
router.get('/:base/:asset', getInventoryByBaseAndAsset);

export default router;
