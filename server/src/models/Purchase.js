import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
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
    unitCost: {
      type: Number,
      required: [true, 'Please provide unit cost'],
      min: [0, 'Unit cost cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: [true, 'Please provide total cost'],
    },
    supplier: {
      type: String,
      required: [true, 'Please provide supplier name'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Please provide purchase date'],
    },
    invoiceNo: String,
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

// Calculate total cost
purchaseSchema.pre('save', function (next) {
  this.totalCost = this.quantity * this.unitCost;
  next();
});

// Index for better performance
purchaseSchema.index({ base: 1, purchaseDate: -1 });
purchaseSchema.index({ asset: 1 });
purchaseSchema.index({ createdBy: 1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
