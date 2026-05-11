import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateUserCreation, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.use(protect);

router.post('/', validateUserCreation, handleValidationErrors, authorize('Admin'), createUser);
router.get('/', authorize('Admin'), getUsers);
router.get('/:id', authorize('Admin'), getUserById);
router.put('/:id', authorize('Admin'), updateUser);
router.delete('/:id', authorize('Admin'), deleteUser);

export default router;
