import Purchase from '../models/Purchase.js';
import Asset from '../models/Asset.js';
import Base from '../models/Base.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import { applyBaseScope, ensureBaseAccess } from '../utils/accessControl.js';
import { updateInventory } from '../utils/inventory.js';
import logger from '../config/logger.js';

export const createPurchase = async (req, res, next) => {
  try {
    const { asset, base, quantity, unitCost, supplier, purchaseDate, invoiceNo, notes } = req.body;

    // Verify asset and base exist
    const assetExists = await Asset.findById(asset);
    const baseExists = await Base.findById(base);

    if (!assetExists || !baseExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid asset or base ID',
      });
    }

    if (!ensureBaseAccess(req, res, base, 'Base Commanders can only create purchases for their assigned base')) {
      return;
    }

    const purchase = await Purchase.create({
      asset,
      base,
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      supplier,
      purchaseDate,
      invoiceNo,
      notes,
      createdBy: req.user.id,
    });

    // Update inventory
    await updateInventory(base, asset, { purchases: quantity });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_PURCHASE', 'Purchase', purchase._id, null, purchase, req);

    res.status(201).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    logger.error('Create Purchase Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPurchases = async (req, res, next) => {
  try {
    const { base, asset, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};
    if (base) query.base = base;
    if (asset) query.asset = asset;
    applyBaseScope(req, query);

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const purchases = await Purchase.find(query)
      .populate('asset', 'name category code')
      .populate('base', 'name code')
      .populate('createdBy', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Purchase.countDocuments(query);

    res.status(200).json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Purchases Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('asset')
      .populate('base')
      .populate('createdBy', 'fullName email');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    if (!ensureBaseAccess(req, res, purchase.base)) {
      return;
    }

    res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    logger.error('Get Purchase Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePurchase = async (req, res, next) => {
  try {
    const { quantity, unitCost, supplier, purchaseDate, invoiceNo, notes } = req.body;

    let purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    if (!ensureBaseAccess(req, res, purchase.base, 'Base Commanders can only update purchases for their assigned base')) {
      return;
    }

    const oldData = purchase.toObject();

    // Calculate quantity difference for inventory update
    const quantityDifference = quantity - purchase.quantity;

    purchase.quantity = quantity || purchase.quantity;
    purchase.unitCost = unitCost || purchase.unitCost;
    purchase.totalCost = purchase.quantity * purchase.unitCost;
    purchase.supplier = supplier || purchase.supplier;
    purchase.purchaseDate = purchaseDate || purchase.purchaseDate;
    purchase.invoiceNo = invoiceNo || purchase.invoiceNo;
    purchase.notes = notes || purchase.notes;

    await purchase.save();

    // Update inventory if quantity changed
    if (quantityDifference !== 0) {
      await updateInventory(purchase.base, purchase.asset, { purchases: quantityDifference });
    }

    // Create audit log
    await createAuditLog(
      req.user.id,
      req.user.role,
      'UPDATE_PURCHASE',
      'Purchase',
      purchase._id,
      oldData,
      purchase,
      req
    );

    res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    logger.error('Update Purchase Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
      });
    }

    if (!ensureBaseAccess(req, res, purchase.base)) {
      return;
    }

    // Only Admin can delete
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only Admin can delete purchases',
      });
    }

    // Reverse inventory update
    await updateInventory(purchase.base, purchase.asset, { purchases: -purchase.quantity });

    const deletedPurchase = purchase.toObject();
    await Purchase.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'DELETE_PURCHASE', 'Purchase', req.params.id, deletedPurchase, null, req);

    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Purchase Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
