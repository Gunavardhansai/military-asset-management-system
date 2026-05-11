import express from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  returnAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateAssignment, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateAssignment, handleValidationErrors, authorize('Admin', 'Base Commander'), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.put('/:id', validateAssignment, handleValidationErrors, authorize('Admin', 'Base Commander'), updateAssignment);
router.patch('/:id/return', authorize('Admin', 'Base Commander'), returnAssignment);
router.delete('/:id', authorize('Admin'), deleteAssignment);

export default router;
