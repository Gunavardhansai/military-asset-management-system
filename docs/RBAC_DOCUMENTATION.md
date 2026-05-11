# Role-Based Access Control (RBAC) Documentation

## Overview

The Military Asset Management System implements three distinct roles with specific permissions and access levels. All role checks are enforced at both the middleware and controller levels.

## Roles & Permissions

### 1. Admin

**Purpose:** Full system access for system administration

**Permissions:**
- ✅ Full access to all features
- ✅ Create, read, update, delete all resources
- ✅ User management (create, update, delete users)
- ✅ Base management (create, update, delete bases)
- ✅ Asset management (create, update, delete assets)
- ✅ View all audit logs
- ✅ System settings and configuration
- ✅ Delete purchases, transfers, assignments
- ✅ Approve/cancel transfers
- ✅ View comprehensive dashboard

**Access Scope:** Global (all bases, all operations)

**Typical Users:** 
- System administrator
- IT support staff
- Executive leadership

---

### 2. Base Commander

**Purpose:** Base-level operations and personnel management

**Permissions:**
- ✅ View inventory for assigned base
- ✅ Create assignments for assigned base
- ✅ Update assignments
- ✅ Return assignments
- ✅ Create expenditures
- ✅ Update expenditures
- ✅ Approve transfers (for receiving to their base)
- ✅ Receive transfers
- ✅ View audit logs for their base
- ✅ View dashboard (base-specific data)

**Restrictions:**
- ❌ Cannot delete any records (Admin only)
- ❌ Cannot create purchases
- ❌ Cannot create transfers
- ❌ Cannot manage other bases
- ❌ Cannot manage users
- ❌ Cannot access system settings

**Access Scope:** Assigned base only

**Typical Users:**
- Base commander
- Base operations officer
- Deputy commander

---

### 3. Logistics Officer

**Purpose:** Supply chain operations and inventory management

**Permissions:**
- ✅ Create purchases
- ✅ View purchases (all bases)
- ✅ Update purchases
- ✅ Create transfers
- ✅ View transfers
- ✅ View inventory
- ✅ View audit logs
- ✅ View dashboard

**Restrictions:**
- ❌ Cannot delete any records
- ❌ Cannot approve/cancel transfers (commander approves)
- ❌ Cannot create assignments
- ❌ Cannot create expenditures
- ❌ Cannot manage users
- ❌ Cannot manage assets/bases

**Access Scope:** Can work across bases for logistics operations

**Typical Users:**
- Procurement officer
- Supply chain specialist
- Logistics coordinator
- Inventory manager

---

## Access Control Matrix

| Operation | Admin | Base Commander | Logistics Officer |
|-----------|:-----:|:-----------:|:-----------:|
| **User Management** |
| Create User | ✅ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ |
| Update User | ✅ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ |
| **Base Management** |
| Create Base | ✅ | ❌ | ❌ |
| View All Bases | ✅ | ✅ | ✅ |
| Update Base | ✅ | ❌ | ❌ |
| Delete Base | ✅ | ❌ | ❌ |
| **Asset Management** |
| Create Asset | ✅ | ❌ | ❌ |
| View Assets | ✅ | ✅ | ✅ |
| Update Asset | ✅ | ❌ | ❌ |
| Delete Asset | ✅ | ❌ | ❌ |
| **Purchases** |
| Create Purchase | ✅ | ❌ | ✅ |
| View Purchases | ✅ | ✅ | ✅ |
| Update Purchase | ✅ | ❌ | ✅ |
| Delete Purchase | ✅ | ❌ | ❌ |
| **Transfers** |
| Create Transfer | ✅ | ❌ | ✅ |
| View Transfers | ✅ | ✅ | ✅ |
| Approve Transfer | ✅ | ✅ | ❌ |
| Receive Transfer | ✅ | ✅ | ❌ |
| Cancel Transfer | ✅ | ❌ | ❌ |
| **Assignments** |
| Create Assignment | ✅ | ✅ | ❌ |
| View Assignments | ✅ | ✅ | ✅ |
| Update Assignment | ✅ | ✅ | ❌ |
| Return Assignment | ✅ | ✅ | ❌ |
| Delete Assignment | ✅ | ❌ | ❌ |
| **Expenditures** |
| Create Expenditure | ✅ | ✅ | ❌ |
| View Expenditures | ✅ | ✅ | ✅ |
| Update Expenditure | ✅ | ✅ | ❌ |
| Delete Expenditure | ✅ | ❌ | ❌ |
| **Inventory** |
| View Inventory | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ |
| **Audit Logs** |
| View Audit Logs | ✅ | ❌ | ❌ |
| Export Audit Data | ✅ | ❌ | ❌ |
| **Dashboard** |
| Access Dashboard | ✅ | ✅ | ✅ |
| Global View | ✅ | ❌* | ❌* |

*Base Commander and Logistics Officer see filtered data for their scope

---

## RBAC Implementation

### Middleware-Level Enforcement

```javascript
// Protect route (requires authentication)
router.get('/purchases', protect, getPurchases);

// Authorize specific roles
router.post('/purchases', 
  protect, 
  authorize('Admin', 'Logistics Officer'), 
  createPurchase
);
```

### Controller-Level Enforcement

```javascript
// Additional checks in controller
if (req.user.role === 'Base Commander' && req.user.base !== purchaseBase) {
  // User cannot access other base data
}
```

### Frontend Protection

```javascript
// Route protection
<Route 
  path="/users" 
  element={
    <ProtectedRoute 
      requiredRole="Admin"
    >
      <UsersPage />
    </ProtectedRoute>
  } 
/>

// Component-level access
{user?.role === 'Admin' && <AdminPanel />}
```

---

## Scope Rules

### Admin Scope
- Global access to all data
- No base restrictions
- Can perform all operations

### Base Commander Scope
```javascript
// Can only access:
- Assigned base inventory
- Personnel in assigned base
- Transfers involving their base
- Expenditures in their base

// Cannot access:
- Other bases' data
- Global system settings
- User management
```

### Logistics Officer Scope
```javascript
// Can access:
- All bases (for supply chain operations)
- Purchase history across bases
- Transfer management
- Inventory across system

// Cannot:
- Modify base-specific records
- Delete any records
- Access user management
```

---

## Permission Checking Flow

```
1. Request arrives at endpoint
   ↓
2. `protect` middleware verifies JWT token
   ↓
3. `authorize` middleware checks role
   ↓
4. Controller function executes
   ↓
5. Controller performs additional scope checks
   ↓
6. Operation completes or returns 403 Forbidden
```

---

## Default Role Assignment

- **New Admin Users:** Must be created with `role: 'Admin'`
- **New Base Commanders:** Created with `role: 'Base Commander'` and assigned `base: ObjectId`
- **New Logistics Officers:** Created with `role: 'Logistics Officer'` and assigned `base: ObjectId`

---

## Role Transitions

| From | To | Requirement |
|------|----|----|
| Logistics Officer | Base Commander | Admin action + base assignment |
| Base Commander | Admin | System admin approval |
| Any Role | Inactive | Admin action |

---

## Audit Trail Integration

All role-based access decisions are logged:
```javascript
{
  action: "CREATE_PURCHASE",
  userRole: "Logistics Officer",
  userId: "...",
  resource: "Purchase",
  status: "SUCCESS"
}
```

---

## Security Considerations

1. **No Role Elevation**: Users cannot increase their own permissions
2. **Scope Validation**: Server always validates user scope before operations
3. **Audit Everything**: All access decisions are logged
4. **Fail Secure**: Default deny access unless explicitly granted
5. **Token Validation**: JWT includes role data for quick decisions

---

## Future RBAC Enhancements

- Granular permissions system (beyond role-based)
- Time-based access restrictions
- IP whitelist integration
- Approval workflows for sensitive operations
- Multi-factor authentication for admins

---

**Last Updated:** May 2026
