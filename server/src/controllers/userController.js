import User from '../models/User.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import logger from '../config/logger.js';

export const createUser = async (req, res, next) => {
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

    user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Logistics Officer',
      base: role !== 'Admin' ? base : undefined,
    });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_USER', 'User', user._id, null, user, req);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        base: user.base,
      },
    });
  } catch (error) {
    logger.error('Create User Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, base, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (base) query.base = base;

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .populate('base', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        base: user.base,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('base', 'name code');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        base: user.base,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    logger.error('Get User Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { fullName, role, base, isActive } = req.body;

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const oldData = user.toObject();

    user.fullName = fullName || user.fullName;
    user.role = role || user.role;
    user.base = role !== 'Admin' ? (base || user.base) : undefined;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'UPDATE_USER', 'User', user._id, oldData, user, req);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        base: user.base,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    logger.error('Update User Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const deletedUser = user.toObject();
    await User.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'DELETE_USER', 'User', req.params.id, deletedUser, null, req);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Delete User Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
