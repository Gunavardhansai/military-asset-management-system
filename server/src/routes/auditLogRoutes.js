import express from 'express';
import { getAuditLogs, getAuditLogById, getUserActivityReport, getActionSummary } from '../controllers/auditLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Admin'), getAuditLogs);
router.get('/report/summary', authorize('Admin'), getActionSummary);
router.get('/user/:userId/activity', authorize('Admin'), getUserActivityReport);
router.get('/:id', authorize('Admin'), getAuditLogById);

export default router;
