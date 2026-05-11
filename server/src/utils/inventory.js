import Inventory from '../models/Inventory.js';
import logger from '../config/logger.js';

export const calculateInventory = async (baseId, assetId) => {
  try {
    const inventory = await Inventory.findOne({
      base: baseId,
      asset: assetId,
    });

    if (!inventory) {
      return null;
    }

    inventory.closingBalance =
      inventory.openingBalance +
      inventory.purchases +
      inventory.transferIn -
      inventory.transferOut -
      inventory.assigned -
      inventory.expended;

    return inventory;
  } catch (error) {
    logger.error('Error calculating inventory:', error);
    throw error;
  }
};

export const updateInventory = async (baseId, assetId, updates) => {
  try {
    let inventory = await Inventory.findOne({
      base: baseId,
      asset: assetId,
    });

    if (!inventory) {
      inventory = new Inventory({
        base: baseId,
        asset: assetId,
      });
    }

    // Apply updates
    Object.keys(updates).forEach((key) => {
      if (key !== 'closingBalance') {
        inventory[key] = (inventory[key] || 0) + updates[key];
      }
    });

    // Calculate closing balance
    inventory.closingBalance =
      inventory.openingBalance +
      inventory.purchases +
      inventory.transferIn -
      inventory.transferOut -
      inventory.assigned -
      inventory.expended;

    inventory.lastUpdated = new Date();
    await inventory.save();

    return inventory;
  } catch (error) {
    logger.error('Error updating inventory:', error);
    throw error;
  }
};

export const getInventoryByBase = async (baseId, filters = {}) => {
  try {
    const query = { base: baseId };

    if (filters.asset) {
      query.asset = filters.asset;
    }

    const inventory = await Inventory.find(query).populate('asset', 'name category code');

    return inventory;
  } catch (error) {
    logger.error('Error getting inventory by base:', error);
    throw error;
  }
};
