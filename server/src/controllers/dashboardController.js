import Purchase from '../models/Purchase.js';
import Transfer from '../models/Transfer.js';
import Assignment from '../models/Assignment.js';
import Expenditure from '../models/Expenditure.js';
import Inventory from '../models/Inventory.js';
import { getAssignedBaseId, isBaseCommander } from '../utils/accessControl.js';
import logger from '../config/logger.js';
import mongoose from 'mongoose';

const toObjectId = (id) =>
  id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

const getScopedBase = (req, requestedBase) =>
  isBaseCommander(req) ? getAssignedBaseId(req) || '000000000000000000000000' : requestedBase;

export const getDashboardStats = async (req, res, next) => {
  try {
    const { base, startDate, endDate } = req.query;
    const scopedBase = getScopedBase(req, base);
    const scopedBaseId = toObjectId(scopedBase);

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.$gte = startDate ? new Date(startDate) : new Date(0);
      dateFilter.$lte = endDate ? new Date(endDate) : new Date();
    }

    const query = {};
    if (scopedBaseId) query.base = scopedBaseId;

    // Get total purchases
    const purchasesQuery = { ...query };
    if (Object.keys(dateFilter).length > 0) {
      purchasesQuery.purchaseDate = dateFilter;
    }
    const totalPurchases = await Purchase.aggregate([
      { $match: purchasesQuery },
      { $group: { _id: null, total: { $sum: '$quantity' }, cost: { $sum: '$totalCost' } } },
    ]);

    // Get transfers in and out
    const transferQuery = {};
    if (Object.keys(dateFilter).length > 0) {
      transferQuery.transferDate = dateFilter;
    }
    transferQuery.status = { $ne: 'Cancelled' };

    const transferIn = await Transfer.aggregate([
      { $match: scopedBaseId ? { ...transferQuery, toBase: scopedBaseId } : transferQuery },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    const transferOut = await Transfer.aggregate([
      { $match: scopedBaseId ? { ...transferQuery, fromBase: scopedBaseId } : transferQuery },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Get assignments
    const assignmentsQuery = { ...query };
    if (Object.keys(dateFilter).length > 0) {
      assignmentsQuery.assignedDate = dateFilter;
    }
    assignmentsQuery.status = 'Active';

    const totalAssignments = await Assignment.aggregate([
      { $match: assignmentsQuery },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Get expenditures
    const expendituresQuery = { ...query };
    if (Object.keys(dateFilter).length > 0) {
      expendituresQuery.expenditureDate = dateFilter;
    }

    const totalExpenditures = await Expenditure.aggregate([
      { $match: expendituresQuery },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    // Get inventory totals
    const inventoryData = await Inventory.find(query);

    const openingBalance = inventoryData.reduce((sum, inv) => sum + inv.openingBalance, 0);
    const closingBalance = inventoryData.reduce((sum, inv) => sum + inv.closingBalance, 0);
    const netMovement = closingBalance - openingBalance;

    res.status(200).json({
      success: true,
      data: {
        openingBalance,
        closingBalance,
        netMovement,
        purchases: {
          quantity: totalPurchases[0]?.total || 0,
          cost: totalPurchases[0]?.cost || 0,
        },
        transferIn: transferIn[0]?.total || 0,
        transferOut: transferOut[0]?.total || 0,
        assignments: totalAssignments[0]?.total || 0,
        expenditures: totalExpenditures[0]?.total || 0,
      },
    });
  } catch (error) {
    logger.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMonthlyMovement = async (req, res, next) => {
  try {
    const { base, months = 6 } = req.query;
    const scopedBase = getScopedBase(req, base);

    const query = {};
    if (scopedBase) query.base = toObjectId(scopedBase);

    const monthlyData = await Purchase.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
          },
          purchases: { $sum: '$quantity' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $limit: parseInt(months),
      },
    ]);

    res.status(200).json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    logger.error('Get Monthly Movement Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssetDistribution = async (req, res, next) => {
  try {
    const { base } = req.query;
    const scopedBase = getScopedBase(req, base);

    const query = { base: toObjectId(scopedBase) };
    if (!scopedBase) {
      delete query.base;
    }

    const distribution = await Inventory.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'assets',
          localField: 'asset',
          foreignField: '_id',
          as: 'assetInfo',
        },
      },
      {
        $unwind: '$assetInfo',
      },
      {
        $group: {
          _id: '$assetInfo.category',
          total: { $sum: '$closingBalance' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    logger.error('Get Asset Distribution Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNetMovement = async (req, res, next) => {
  try {
    const { base, startDate, endDate } = req.query;
    const scopedBase = getScopedBase(req, base);

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Get purchases
    const purchaseQuery = scopedBase ? { base: scopedBase } : {};
    if (Object.keys(dateFilter).length > 0) {
      purchaseQuery.purchaseDate = dateFilter;
    }

    const purchases = await Purchase.find(purchaseQuery).populate('asset', 'name code category');

    // Get transfers in
    const transferInQuery = scopedBase ? { toBase: scopedBase } : {};
    if (Object.keys(dateFilter).length > 0) {
      transferInQuery.transferDate = dateFilter;
    }
    transferInQuery.status = { $ne: 'Cancelled' };

    const transfersIn = await Transfer.find(transferInQuery).populate('asset', 'name code category');

    // Get transfers out
    const transferOutQuery = scopedBase ? { fromBase: scopedBase } : {};
    if (Object.keys(dateFilter).length > 0) {
      transferOutQuery.transferDate = dateFilter;
    }
    transferOutQuery.status = { $ne: 'Cancelled' };

    const transfersOut = await Transfer.find(transferOutQuery).populate('asset', 'name code category');

    res.status(200).json({
      success: true,
      data: {
        purchases,
        transferIn: transfersIn,
        transferOut: transfersOut,
      },
    });
  } catch (error) {
    logger.error('Get Net Movement Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
