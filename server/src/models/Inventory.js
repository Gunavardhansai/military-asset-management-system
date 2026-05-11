import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: true,
      index: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },
    transferIn: {
      type: Number,
      default: 0,
    },
    transferOut: {
      type: Number,
      default: 0,
    },
    assigned: {
      type: Number,
      default: 0,
    },
    expended: {
      type: Number,
      default: 0,
    },
    closingBalance: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index
inventorySchema.index({ asset: 1, base: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
