import Assignment from '../models/Assignment.js';
import Inventory from '../models/Inventory.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { applyBaseScope, ensureBaseAccess } from '../utils/accessControl.js';
import { updateInventory } from '../utils/inventory.js';
import logger from '../config/logger.js';

export const createAssignment = async (req, res, next) => {
  try {
    const { asset, base, personnelName, rank, quantity, assignedDate, notes } = req.body;

    if (!ensureBaseAccess(req, res, base, 'Base Commanders can only assign assets from their assigned base')) {
      return;
    }

    const inventory = await Inventory.findOne({ asset, base });
    if (!inventory || inventory.closingBalance < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory for assignment',
      });
    }

    const assignment = await Assignment.create({
      asset,
      base,
      personnelName,
      rank,
      quantity,
      assignedDate,
      notes,
      createdBy: req.user.id,
      status: 'Active',
    });

    // Update inventory
    await updateInventory(base, asset, { assigned: quantity });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_ASSIGNMENT', 'Assignment', assignment._id, null, assignment, req);

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error('Create Assignment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const { base, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};
    if (base) query.base = base;
    if (status) query.status = status;
    applyBaseScope(req, query);

    if (startDate || endDate) {
      query.assignedDate = {};
      if (startDate) query.assignedDate.$gte = new Date(startDate);
      if (endDate) query.assignedDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const assignments = await Assignment.find(query)
      .populate('asset', 'name category code')
      .populate('base', 'name code')
      .populate('createdBy', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ assignedDate: -1 });

    const total = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Assignments Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('asset')
      .populate('base')
      .populate('createdBy', 'fullName email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (!ensureBaseAccess(req, res, assignment.base)) {
      return;
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error('Get Assignment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAssignment = async (req, res, next) => {
  try {
    const { quantity, personnelName, rank, notes } = req.body;

    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (!ensureBaseAccess(req, res, assignment.base, 'Base Commanders can only update assignments for their assigned base')) {
      return;
    }

    const oldData = assignment.toObject();
    const quantityDifference = quantity - assignment.quantity;

    if (quantityDifference > 0) {
      const inventory = await Inventory.findOne({ asset: assignment.asset, base: assignment.base });
      if (!inventory || inventory.closingBalance < quantityDifference) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient inventory for assignment update',
        });
      }
    }

    assignment.quantity = quantity || assignment.quantity;
    assignment.personnelName = personnelName || assignment.personnelName;
    assignment.rank = rank || assignment.rank;
    assignment.notes = notes || assignment.notes;

    await assignment.save();

    // Update inventory if quantity changed
    if (quantityDifference !== 0) {
      await updateInventory(assignment.base, assignment.asset, { assigned: quantityDifference });
    }

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_ASSIGNMENT',
      'Assignment',
      assignment._id,
      oldData,
      assignment,
      req
    );

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error('Update Assignment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const returnAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (!ensureBaseAccess(req, res, assignment.base, 'Base Commanders can only return assignments for their assigned base')) {
      return;
    }

    if (assignment.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Only active assignments can be returned',
      });
    }

    const oldData = assignment.toObject();

    assignment.status = 'Returned';
    assignment.returnedDate = new Date();

    await assignment.save();

    // Update inventory
    await updateInventory(assignment.base, assignment.asset, { assigned: -assignment.quantity });

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_ASSIGNMENT',
      'Assignment',
      assignment._id,
      oldData,
      assignment,
      req
    );

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    logger.error('Return Assignment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    if (!ensureBaseAccess(req, res, assignment.base)) {
      return;
    }

    // Only Admin can delete
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin can delete assignments',
      });
    }

    // Reverse inventory if active
    if (assignment.status === 'Active') {
      await updateInventory(assignment.base, assignment.asset, { assigned: -assignment.quantity });
    }

    const deletedAssignment = assignment.toObject();
    await Assignment.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'DELETE_ASSIGNMENT',
      'Assignment',
      req.params.id,
      deletedAssignment,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Assignment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
