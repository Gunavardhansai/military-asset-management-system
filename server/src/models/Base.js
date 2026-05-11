import mongoose from 'mongoose';

const baseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide base name'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Please provide base code'],
      unique: true,
      uppercase: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
    },
    commander: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    capacity: {
      type: Number,
      default: 10000,
    },
    description: String,
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
baseSchema.index({ code: 1 });
baseSchema.index({ name: 1 });

const Base = mongoose.model('Base', baseSchema);
export default Base;
