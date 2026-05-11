import Transfer from '../models/Transfer.js';
import Inventory from '../models/Inventory.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { updateInventory } from '../utils/inventory.js';
import logger from '../config/logger.js';

export const createTransfer = async (req, res, next) => {
  try {
    const { asset, fromBase, toBase, quantity, transferDate, notes } = req.body;

    // Check inventory availability
    const inventory = await Inventory.findOne({
      asset,
      base: fromBase,
    });

    if (!inventory || inventory.closingBalance < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory for transfer',
      });
    }

    const transfer = await Transfer.create({
      asset,
      fromBase,
      toBase,
      quantity,
      transferDate,
      notes,
      createdBy: req.user.id,
      status: 'Pending',
    });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_TRANSFER', 'Transfer', transfer._id, null, transfer, req);

    res.status(201).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Create Transfer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransfers = async (req, res, next) => {
  try {
    const { fromBase, toBase, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};
    if (fromBase) query.fromBase = fromBase;
    if (toBase) query.toBase = toBase;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.transferDate = {};
      if (startDate) query.transferDate.$gte = new Date(startDate);
      if (endDate) query.transferDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const transfers = await Transfer.find(query)
      .populate('asset', 'name category code')
      .populate('fromBase', 'name code')
      .populate('toBase', 'name code')
      .populate('createdBy', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Transfer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transfers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Transfers Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTransferById = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('asset')
      .populate('fromBase')
      .populate('toBase')
      .populate('createdBy', 'fullName email')
      .populate('approvedBy', 'fullName')
      .populate('receivedBy', 'fullName');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Get Transfer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Transfer cannot be approved in its current status',
      });
    }

    const oldData = transfer.toObject();

    transfer.status = 'In Transit';
    transfer.approvedBy = req.user.id;

    // Update inventory
    await updateInventory(transfer.fromBase, transfer.asset, { transferOut: transfer.quantity });
    await updateInventory(transfer.toBase, transfer.asset, { transferIn: transfer.quantity });

    await transfer.save();

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_TRANSFER',
      'Transfer',
      transfer._id,
      oldData,
      transfer,
      req
    );

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Approve Transfer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const receiveTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    if (transfer.status !== 'In Transit') {
      return res.status(400).json({
        success: false,
        message: 'Transfer cannot be received in its current status',
      });
    }

    const oldData = transfer.toObject();

    transfer.status = 'Received';
    transfer.receivedBy = req.user.id;
    transfer.receivedDate = new Date();

    await transfer.save();

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_TRANSFER',
      'Transfer',
      transfer._id,
      oldData,
      transfer,
      req
    );

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Receive Transfer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found',
      });
    }

    if (transfer.status === 'Received' || transfer.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Transfer cannot be cancelled in its current status',
      });
    }

    const oldData = transfer.toObject();

    // Reverse inventory if it was already approved
    if (transfer.status === 'In Transit') {
      await updateInventory(transfer.fromBase, transfer.asset, { transferOut: -transfer.quantity });
      await updateInventory(transfer.toBase, transfer.asset, { transferIn: -transfer.quantity });
    }

    transfer.status = 'Cancelled';
    await transfer.save();

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_TRANSFER',
      'Transfer',
      transfer._id,
      oldData,
      transfer,
      req
    );

    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    logger.error('Cancel Transfer Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
