import AuditLog from '../models/AuditLog.js';
import logger from '../config/logger.js';

export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    try {
      // Get the original send function
      const originalSend = res.send;

      // Override send function to capture response
      res.send = function (data) {
        res.send = originalSend;

        // Only log successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Extract old and new data from request
          const oldData = req.body.oldData || null;
          const newData = req.body;

          // Create audit log entry
          const auditEntry = new AuditLog({
            user: req.user?._id || req.user?.id,
            userRole: req.user?.role,
            action,
            resource,
            resourceId: req.params.id,
            oldData,
            newData,
            method: req.method,
            endpoint: req.originalUrl,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            statusCode: res.statusCode,
          });

          auditEntry
            .save()
            .catch((err) => logger.error('Error saving audit log:', err.message));
        }

        return res.send(data);
      };

      next();
    } catch (error) {
      logger.error('Audit Middleware Error:', error);
      next();
    }
  };
};

export const createAuditLog = async (userId, userRole, action, resource, resourceId, oldData, newData, req) => {
  try {
    const auditEntry = new AuditLog({
      user: userId,
      userRole,
      action,
      resource,
      resourceId,
      oldData,
      newData,
      method: req.method,
      endpoint: req.originalUrl,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: 200,
    });

    await auditEntry.save();
  } catch (error) {
    logger.error('Error creating audit log:', error.message);
  }
};
