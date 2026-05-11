import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide asset name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide asset category'],
      enum: ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies', 'Other'],
    },
    code: {
      type: String,
      required: [true, 'Please provide asset code'],
      unique: true,
      uppercase: true,
    },
    description: String,
    unitOfMeasure: {
      type: String,
      enum: ['Unit', 'Piece', 'Box', 'Carton', 'Kg', 'Liter', 'Meter'],
      default: 'Unit',
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
assetSchema.index({ code: 1 });
assetSchema.index({ category: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
