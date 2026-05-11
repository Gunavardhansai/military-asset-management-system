import Asset from '../models/Asset.js';
import { createAuditLog } from '../middleware/auditLogger.js';
import logger from '../config/logger.js';

export const createAsset = async (req, res, next) => {
  try {
    const { name, category, code, description, unitOfMeasure, unitCost } = req.body;

    // Check if asset code already exists
    const assetExists = await Asset.findOne({ code: code.toUpperCase() });
    if (assetExists) {
      return res.status(400).json({
        success: false,
        message: 'Asset with this code already exists',
      });
    }

    const asset = await Asset.create({
      name,
      category,
      code: code.toUpperCase(),
      description,
      unitOfMeasure: unitOfMeasure || 'Unit',
      unitCost: unitCost || 0,
    });

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'CREATE_USER', 'Asset', asset._id, null, asset, req);

    res.status(201).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    logger.error('Create Asset Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssets = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const assets = await Asset.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Asset.countDocuments(query);

    res.status(200).json({
      success: true,
      data: assets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Assets Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssetById = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    logger.error('Get Asset Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const { name, category, description, unitOfMeasure, unitCost, isActive } = req.body;

    let asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const oldData = asset.toObject();

    asset.name = name || asset.name;
    asset.category = category || asset.category;
    asset.description = description || asset.description;
    asset.unitOfMeasure = unitOfMeasure || asset.unitOfMeasure;
    asset.unitCost = unitCost !== undefined ? unitCost : asset.unitCost;
    asset.isActive = isActive !== undefined ? isActive : asset.isActive;

    await asset.save();

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'UPDATE_USER', 'Asset', asset._id, oldData, asset, req);

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    logger.error('Update Asset Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
      });
    }

    const deletedAsset = asset.toObject();
    await Asset.findByIdAndDelete(req.params.id);

    // Create audit log
    await createAuditLog(req.user.id, req.user.role, 'DELETE_USER', 'Asset', req.params.id, deletedAsset, null, req);

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Asset Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
