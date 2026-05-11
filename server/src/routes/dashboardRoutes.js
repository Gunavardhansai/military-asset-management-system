import express from 'express';
import {
  getDashboardStats,
  getMonthlyMovement,
  getAssetDistribution,
  getNetMovement,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/monthly-movement', getMonthlyMovement);
router.get('/asset-distribution', getAssetDistribution);
router.get('/net-movement', getNetMovement);

export default router;
