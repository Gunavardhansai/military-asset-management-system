import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateAuth, handleValidationErrors } from '../validators/validators.js';

const router = express.Router();

router.post('/register', validateAuth, handleValidationErrors, register);
router.post('/login', validateAuth, handleValidationErrors, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
