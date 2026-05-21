import Inventory from '../models/Inventory.js';
import Asset from '../models/Asset.js';
import { applyBaseScope, ensureBaseAccess } from '../utils/accessControl.js';
import logger from '../config/logger.js';

export const getInventory = async (req, res, next) => {
  try {
    const { base, asset, category, minStock, maxStock, page = 1, limit = 10 } = req.query;

    const query = {};
    if (base) query.base = base;
    if (asset) query.asset = asset;
    applyBaseScope(req, query);

    if (category) {
      const categoryAssetIds = await Asset.find({ category }).distinct('_id');
      query.asset = asset && !categoryAssetIds.some((id) => String(id) === String(asset))
        ? { $in: [] }
        : asset || { $in: categoryAssetIds };
    }

    if (minStock || maxStock) {
      query.closingBalance = {};
      if (minStock) query.closingBalance.$gte = parseInt(minStock);
      if (maxStock) query.closingBalance.$lte = parseInt(maxStock);
    }

    const skip = (page - 1) * limit;

    const inventory = await Inventory.find(query)
      .populate('asset', 'name category code unitOfMeasure')
      .populate('base', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ lastUpdated: -1 });

    const total = await Inventory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventoryByBaseAndAsset = async (req, res, next) => {
  try {
    const { base, asset } = req.params;

    if (!ensureBaseAccess(req, res, base)) {
      return;
    }

    const inventory = await Inventory.findOne({ base, asset })
      .populate('asset', 'name category code unitOfMeasure unitCost')
      .populate('base', 'name code');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    logger.error('Get Inventory Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInventoryReport = async (req, res, next) => {
  try {
    const { base, category, minStock, maxStock } = req.query;

    const query = {};
    if (base) query.base = base;
    applyBaseScope(req, query);

    let inventory = await Inventory.find(query).populate('asset', 'name category code');

    // Apply filters after population
    if (category) {
      inventory = inventory.filter((inv) => inv.asset.category === category);
    }

    if (minStock) {
      inventory = inventory.filter((inv) => inv.closingBalance >= parseInt(minStock));
    }

    if (maxStock) {
      inventory = inventory.filter((inv) => inv.closingBalance <= parseInt(maxStock));
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    logger.error('Get Inventory Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
