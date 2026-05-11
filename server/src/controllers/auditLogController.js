import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resource, user, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (user) query.user = user;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
      .populate('user', 'fullName email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ timestamp: -1 });

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get Audit Logs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id).populate('user', 'fullName email role');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    logger.error('Get Audit Log Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserActivityReport = async (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const query = {};
    if (userId) query.user = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const activities = await AuditLog.find(query)
      .populate('user', 'fullName email role')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    logger.error('Get User Activity Report Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActionSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const summary = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Get Action Summary Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
