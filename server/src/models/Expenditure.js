import mongoose from 'mongoose';

const expenditureSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Please select an asset'],
    },
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Base',
      required: [true, 'Please select a base'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason'],
      enum: ['Usage', 'Loss', 'Damage', 'Obsolete', 'Other'],
    },
    expenditureDate: {
      type: Date,
      required: [true, 'Please provide expenditure date'],
    },
    description: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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
expenditureSchema.index({ base: 1, expenditureDate: -1 });
expenditureSchema.index({ asset: 1 });
expenditureSchema.index({ reason: 1 });

const Expenditure = mongoose.model('Expenditure', expenditureSchema);
export default Expenditure;
