import { body, validationResult } from 'express-validator';

export const validateAuth = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateUserCreation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['Admin', 'Base Commander', 'Logistics Officer'])
    .withMessage('Invalid role'),
];

export const validatePurchase = [
  body('asset').isMongoId().withMessage('Invalid asset ID'),
  body('base').isMongoId().withMessage('Invalid base ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unitCost').isFloat({ min: 0 }).withMessage('Unit cost must be a positive number'),
  body('supplier').trim().notEmpty().withMessage('Supplier name is required'),
  body('purchaseDate').isISO8601().withMessage('Invalid purchase date'),
];

export const validateTransfer = [
  body('asset').isMongoId().withMessage('Invalid asset ID'),
  body('fromBase').isMongoId().withMessage('Invalid from base ID'),
  body('toBase').isMongoId().withMessage('Invalid to base ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('transferDate').isISO8601().withMessage('Invalid transfer date'),
];

export const validateAssignment = [
  body('asset').isMongoId().withMessage('Invalid asset ID'),
  body('base').isMongoId().withMessage('Invalid base ID'),
  body('personnelName').trim().notEmpty().withMessage('Personnel name is required'),
  body('rank').trim().notEmpty().withMessage('Rank is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('assignedDate').isISO8601().withMessage('Invalid assigned date'),
];

export const validateExpenditure = [
  body('asset').isMongoId().withMessage('Invalid asset ID'),
  body('base').isMongoId().withMessage('Invalid base ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason')
    .isIn(['Usage', 'Loss', 'Damage', 'Obsolete', 'Other'])
    .withMessage('Invalid reason'),
  body('expenditureDate').isISO8601().withMessage('Invalid expenditure date'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};
