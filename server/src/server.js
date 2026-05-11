import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';
import logger from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import baseRoutes from './routes/baseRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/expenditures', expenditureRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bases', baseRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
