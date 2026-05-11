import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Please select an asset'],
    },
    fromBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Please select source base'],
    },
    toBase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Please select destination base'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    transferDate: {
      type: Date,
      required: [true, 'Please provide transfer date'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Received', 'Cancelled'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receivedDate: Date,
    notes: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
transferSchema.index({ fromBase: 1, toBase: 1 });
transferSchema.index({ asset: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ transferDate: -1 });

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;
