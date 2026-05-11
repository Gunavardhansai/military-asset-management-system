import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
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
    personnelName: {
      type: String,
      required: [true, 'Please provide personnel name'],
    },
    rank: {
      type: String,
      required: [true, 'Please provide rank'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    assignedDate: {
      type: Date,
      required: [true, 'Please provide assigned date'],
    },
    returnedDate: Date,
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Lost', 'Damaged'],
      default: 'Active',
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
assignmentSchema.index({ base: 1, status: 1 });
assignmentSchema.index({ asset: 1 });
assignmentSchema.index({ assignedDate: -1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
