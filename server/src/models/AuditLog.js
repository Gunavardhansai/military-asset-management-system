import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: String,
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREATE_PURCHASE',
        'UPDATE_PURCHASE',
        'DELETE_PURCHASE',
        'CREATE_TRANSFER',
        'UPDATE_TRANSFER',
        'DELETE_TRANSFER',
        'CREATE_ASSIGNMENT',
        'UPDATE_ASSIGNMENT',
        'DELETE_ASSIGNMENT',
        'CREATE_EXPENDITURE',
        'UPDATE_EXPENDITURE',
        'DELETE_EXPENDITURE',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        'OTHER',
      ],
    },
    resource: String,
    resourceId: mongoose.Schema.Types.ObjectId,
    oldData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed,
    method: String,
    endpoint: String,
    ipAddress: String,
    userAgent: String,
    statusCode: Number,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Index for better performance
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
