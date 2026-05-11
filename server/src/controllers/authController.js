import User from '../models/User.js';
import Base from '../models/Base.js';
import { sendTokenResponse } from '../utils/auth.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import logger from '../config/logger.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, base } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email',
      });
    }

    // Verify base exists if role is not Admin
    if (role !== 'Admin' && base) {
      const baseExists = await Base.findById(base);
      if (!baseExists) {
        return res.status(400).json({
          success: false,
          message: 'Base does not exist',
        });
      }
    }

    user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Logistics Officer',
      base: role !== 'Admin' ? base : undefined,
    });

    sendTokenResponse(user, 201, res);

    // Create audit log
    await createAuditLog(user._id, user.role, 'LOGIN', 'User', user._id, null, { email }, req);
  } catch (error) {
    logger.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Check if passwords match
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);

    // Create audit log
    await createAuditLog(user._id, user.role, 'LOGIN', 'User', user._id, null, null, req);
  } catch (error) {
    logger.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'LOGOUT', 'User', req.user.id, null, null, req);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('base', 'name code');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
