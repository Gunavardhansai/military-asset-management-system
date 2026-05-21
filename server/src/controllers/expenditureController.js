import Expenditure from '../models/Expenditure.js';
import Inventory from '../models/Inventory.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { applyBaseScope, ensureBaseAccess } from '../utils/accessControl.js';
import { updateInventory } from '../utils/inventory.js';
import logger from '../config/logger.js';

export const createExpenditure = async (req, res, next) => {
  try {
    const { asset, base, quantity, reason, expenditureDate, description, notes } = req.body;

    if (!ensureBaseAccess(req, res, base, 'Base Commanders can only expend assets from their assigned base')) {
      return;
    }

    const inventory = await Inventory.findOne({ asset, base });
    if (!inventory || inventory.closingBalance < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory for expenditure',
      });
    }

    const expenditure = await Expenditure.create({
      asset,
      base,
      quantity,
      reason,
      expenditureDate,
      description,
      notes,
      createdBy: req.user.id,
      approvedBy: req.user.id, // Auto-approve for now
    });

    // Update inventory
    await updateInventory(base, asset, { expended: quantity });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_EXPENDITURE', 'Expenditure', expenditure._id, null, expenditure, req);

    res.status(201).json({
      success: true,
      data: expenditure,
    });
  } catch (error) {
    logger.error('Create Expenditure Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenditures = async (req, res, next) => {
  try {
    const { base, asset, reason, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};
    if (base) query.base = base;
    if (asset) query.asset = asset;
    if (reason) query.reason = reason;
    applyBaseScope(req, query);

    if (startDate || endDate) {
      query.expenditureDate = {};
      if (startDate) query.expenditureDate.$gte = new Date(startDate);
      if (endDate) query.expenditureDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const expenditures = await Expenditure.find(query)
      .populate('asset', 'name category code')
      .populate('base', 'name code')
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ expenditureDate: -1 });

    const total = await Expenditure.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenditures,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Expenditures Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getExpenditureById = async (req, res, next) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id)
      .populate('asset')
      .populate('base')
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName');

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found',
      });
    }

    if (!ensureBaseAccess(req, res, expenditure.base)) {
      return;
    }

    res.status(200).json({
      success: true,
      data: expenditure,
    });
  } catch (error) {
    logger.error('Get Expenditure Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateExpenditure = async (req, res, next) => {
  try {
    const { quantity, reason, expenditureDate, description, notes } = req.body;

    let expenditure = await Expenditure.findById(req.params.id);

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found',
      });
    }

    if (!ensureBaseAccess(req, res, expenditure.base, 'Base Commanders can only update expenditures for their assigned base')) {
      return;
    }

    const oldData = expenditure.toObject();
    const quantityDifference = quantity - expenditure.quantity;

    if (quantityDifference > 0) {
      const inventory = await Inventory.findOne({ asset: expenditure.asset, base: expenditure.base });
      if (!inventory || inventory.closingBalance < quantityDifference) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory for expenditure update',
        });
      }
    }

    expenditure.quantity = quantity || expenditure.quantity;
    expenditure.reason = reason || expenditure.reason;
    expenditure.expenditureDate = expenditureDate || expenditure.expenditureDate;
    expenditure.description = description || expenditure.description;
    expenditure.notes = notes || expenditure.notes;

    await expenditure.save();

    // Update inventory if quantity changed
    if (quantityDifference !== 0) {
      await updateInventory(expenditure.base, expenditure.asset, { expended: quantityDifference });
    }

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_EXPENDITURE',
      'Expenditure',
      expenditure._id,
      oldData,
      expenditure,
      req
    );

    res.status(200).json({
      success: true,
      data: expenditure,
    });
  } catch (error) {
    logger.error('Update Expenditure Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteExpenditure = async (req, res, next) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id);

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found',
      });
    }

    if (!ensureBaseAccess(req, res, expenditure.base)) {
      return;
    }

    // Only Admin can delete
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin can delete expenditures',
      });
    }

    // Reverse inventory update
    await updateInventory(expenditure.base, expenditure.asset, { expended: -expenditure.quantity });

    const deletedExpenditure = expenditure.toObject();
    await Expenditure.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'DELETE_EXPENDITURE',
      'Expenditure',
      req.params.id,
      deletedExpenditure,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Expenditure deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Expenditure Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
