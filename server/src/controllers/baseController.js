import Base from '../models/Base.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import logger from '../config/logger.js';

export const createBase = async (req, res, next) => {
  try {
    const { name, code, location, commander, capacity, description } = req.body;

    // Check if base code already exists
    const baseExists = await Base.findOne({ code: code.toUpperCase() });
    if (baseExists) {
      return res.status(400).json({
        success: false,
        message: 'Base with this code already exists',
      });
    }

    const base = await Base.create({
      name,
      code: code.toUpperCase(),
      location,
      commander,
      capacity,
      description,
    });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_USER', 'Base', base._id, null, base, req);

    res.status(201).json({
      success: true,
      data: base,
    });
  } catch (error) {
    logger.error('Create Base Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBases = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const bases = await Base.find()
      .populate('commander', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Base.countDocuments();

    res.status(200).json({
      success: true,
      data: bases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Bases Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBaseById = async (req, res, next) => {
  try {
    const base = await Base.findById(req.params.id).populate('commander', 'fullName email');

    if (!base) {
      return res.status(404).json({
        success: false,
        message: 'Base not found',
      });
    }

    res.status(200).json({
      success: true,
      data: base,
    });
  } catch (error) {
    logger.error('Get Base Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateBase = async (req, res, next) => {
  try {
    const { name, location, commander, capacity, description, isActive } = req.body;

    let base = await Base.findById(req.params.id);

    if (!base) {
      return res.status(404).json({
        success: false,
        message: 'Base not found',
      });
    }

    const oldData = base.toObject();

    base.name = name || base.name;
    base.location = location || base.location;
    base.commander = commander || base.commander;
    base.capacity = capacity || base.capacity;
    base.description = description || base.description;
    base.isActive = isActive !== undefined ? isActive : base.isActive;

    await base.save();

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'UPDATE_USER', 'Base', base._id, oldData, base, req);

    res.status(200).json({
      success: true,
      data: base,
    });
  } catch (error) {
    logger.error('Update Base Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteBase = async (req, res, next) => {
  try {
    const base = await Base.findById(req.params.id);

    if (!base) {
      return res.status(404).json({
        success: false,
        message: 'Base not found',
      });
    }

    const deletedBase = base.toObject();
    await Base.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'DELETE_USER', 'Base', req.params.id, deletedBase, null, req);

    res.status(200).json({
      success: true,
      message: 'Base deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Base Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
