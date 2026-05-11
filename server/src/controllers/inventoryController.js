import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';

export const getInventory = async (req, res, next) => {
  try {
    const { base, asset, page = 1, limit = 10 } = req.query;

    const query = {};
    if (base) query.base = base;
    if (asset) query.asset = asset;

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
