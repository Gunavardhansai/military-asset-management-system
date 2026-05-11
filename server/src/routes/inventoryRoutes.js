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
router.get('/:base/:asset', getInventoryByBaseAndAsset);
router.get('/report/summary', authorize('Admin'), getInventoryReport);

export default router;
