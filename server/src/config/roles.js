const roles = {
  ADMIN: 'Admin',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

const permissions = {
  [roles.ADMIN]: ['all'],
  [roles.BASE_COMMANDER]: [
    'view_assignments',
    'create_assignment',
    'update_assignment',
    'delete_assignment',
    'view_expenditures',
    'create_expenditure',
    'update_expenditure',
    'delete_expenditure',
    'view_purchases',
    'create_purchase',
    'update_purchase',
    'view_transfers',
    'create_transfer',
    'view_inventory',
    'view_audit_logs',
  ],
  [roles.LOGISTICS_OFFICER]: [
    'view_purchases',
    'create_purchase',
    'update_purchase',
    'view_transfers',
    'create_transfer',
    'update_transfer',
    'view_inventory',
    'view_audit_logs',
  ],
};

export { roles, permissions };
