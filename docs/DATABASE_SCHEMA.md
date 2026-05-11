# Database Schema & Design Documentation

## Overview

The Military Asset Management System uses MongoDB as its primary data store with Mongoose for ODM (Object Document Mapping). The database is designed for optimal performance with proper indexing, relationships, and data integrity.

## Collections Schema

### 1. Users Collection

**Purpose:** Store user accounts with authentication data

```javascript
{
  _id: ObjectId,
  fullName: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: Admin, Base Commander, Logistics Officer),
  base: ObjectId (ref: Base, required if role != Admin),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- email (unique)
- base (for base lookup)

---

### 2. Bases Collection

**Purpose:** Store military base information

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  code: String (required, unique, uppercase),
  location: String (required),
  commander: ObjectId (ref: User),
  capacity: Number (default: 10000),
  description: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- code (unique)
- name (for search)

---

### 3. Assets Collection

**Purpose:** Store asset/equipment master data

```javascript
{
  _id: ObjectId,
  name: String (required),
  category: String (enum: Vehicle, Weapon, Ammunition, Equipment, Supplies),
  code: String (required, unique, uppercase),
  description: String,
  unitOfMeasure: String (enum: Unit, Piece, Box, Carton, Kg, Liter, Meter),
  unitCost: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- code (unique)
- category

---

### 4. Purchases Collection

**Purpose:** Track asset purchases by bases

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: Asset, required),
  base: ObjectId (ref: Base, required),
  quantity: Number (required, min: 1),
  unitCost: Number (required),
  totalCost: Number (calculated: quantity * unitCost),
  supplier: String (required),
  purchaseDate: Date (required),
  invoiceNo: String,
  notes: String,
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- base + purchaseDate (descending, for dashboard queries)
- asset (for asset lookup)
- createdBy (for user audit)

---

### 5. Transfers Collection

**Purpose:** Track asset transfers between bases

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: Asset, required),
  fromBase: ObjectId (ref: Base, required),
  toBase: ObjectId (ref: Base, required),
  quantity: Number (required, min: 1),
  transferDate: Date (required),
  status: String (enum: Pending, In Transit, Received, Cancelled),
  approvedBy: ObjectId (ref: User),
  receivedBy: ObjectId (ref: User),
  receivedDate: Date,
  notes: String,
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- fromBase + toBase (for transfer queries)
- asset
- status (for workflow)
- transferDate (descending)

---

### 6. Assignments Collection

**Purpose:** Track asset assignments to personnel

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: Asset, required),
  base: ObjectId (ref: Base, required),
  personnelName: String (required),
  rank: String (required),
  quantity: Number (required, min: 1),
  assignedDate: Date (required),
  returnedDate: Date,
  status: String (enum: Active, Returned, Lost, Damaged),
  notes: String,
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- base + status (for inventory calculation)
- asset
- assignedDate (descending)

---

### 7. Expenditures Collection

**Purpose:** Track asset consumption or loss

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: Asset, required),
  base: ObjectId (ref: Base, required),
  quantity: Number (required, min: 1),
  reason: String (enum: Usage, Loss, Damage, Obsolete, Other),
  expenditureDate: Date (required),
  description: String,
  approvedBy: ObjectId (ref: User),
  notes: String,
  createdBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- base + expenditureDate (descending)
- asset
- reason

---

### 8. Inventory Collection

**Purpose:** Store calculated inventory balances

```javascript
{
  _id: ObjectId,
  asset: ObjectId (ref: Asset, required),
  base: ObjectId (ref: Base, required),
  openingBalance: Number (default: 0),
  purchases: Number (default: 0),
  transferIn: Number (default: 0),
  transferOut: Number (default: 0),
  assigned: Number (default: 0),
  expended: Number (default: 0),
  closingBalance: Number (calculated),
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Formula:**
```
closingBalance = openingBalance + purchases + transferIn - transferOut - assigned - expended
```

**Indexes:**
- asset + base (unique compound index)
- lastUpdated

---

### 9. AuditLogs Collection

**Purpose:** Complete audit trail of all operations

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  userRole: String,
  action: String (enum: LOGIN, LOGOUT, CREATE_PURCHASE, UPDATE_PURCHASE, DELETE_PURCHASE, 
                          CREATE_TRANSFER, UPDATE_TRANSFER, DELETE_TRANSFER,
                          CREATE_ASSIGNMENT, UPDATE_ASSIGNMENT, DELETE_ASSIGNMENT,
                          CREATE_EXPENDITURE, UPDATE_EXPENDITURE, DELETE_EXPENDITURE,
                          CREATE_USER, UPDATE_USER, DELETE_USER, OTHER),
  resource: String (User, Purchase, Transfer, Assignment, Expenditure, Base, Asset),
  resourceId: ObjectId,
  oldData: Mixed (previous state),
  newData: Mixed (new state),
  method: String (GET, POST, PUT, PATCH, DELETE),
  endpoint: String,
  ipAddress: String,
  userAgent: String,
  statusCode: Number,
  timestamp: Date (indexed)
}
```

**Indexes:**
- user + timestamp (descending)
- action + timestamp (descending)
- resource + timestamp (descending)
- timestamp (descending)

---

## Relationships & Cardinality

```
User (1) -----> (Many) Purchase
        -----> (Many) Transfer
        -----> (Many) Assignment
        -----> (Many) Expenditure
        -----> (Many) AuditLog

Base (1) -----> (Many) User
       -----> (Many) Purchase
       -----> (Many) Transfer (fromBase)
       -----> (Many) Transfer (toBase)
       -----> (Many) Assignment
       -----> (Many) Expenditure
       -----> (Many) Inventory

Asset (1) -----> (Many) Purchase
        -----> (Many) Transfer
        -----> (Many) Assignment
        -----> (Many) Expenditure
        -----> (Many) Inventory
```

---

## Inventory Balance Calculation

The inventory system uses an event-driven architecture where:

1. When a **Purchase** is created → `Inventory.purchases` increases
2. When a **Transfer** is approved → `Inventory.transferOut` increases at source, `transferIn` increases at destination
3. When an **Assignment** is created → `Inventory.assigned` increases
4. When an **Expenditure** is recorded → `Inventory.expended` increases

The `closingBalance` is calculated dynamically using the formula above.

---

## Indexing Strategy

### Performance-Critical Indexes

```javascript
// For dashboard queries
db.purchases.createIndex({ base: 1, purchaseDate: -1 });
db.transfers.createIndex({ fromBase: 1, toBase: 1 });
db.assignments.createIndex({ base: 1, status: 1 });
db.inventory.createIndex({ asset: 1, base: 1 }, { unique: true });

// For audit queries
db.auditlogs.createIndex({ user: 1, timestamp: -1 });
db.auditlogs.createIndex({ action: 1, timestamp: -1 });

// For search/filter
db.users.createIndex({ email: 1 });
db.bases.createIndex({ code: 1 });
db.assets.createIndex({ code: 1, category: 1 });
```

---

## Data Integrity Rules

1. **Referential Integrity**
   - Foreign keys are enforced via Mongoose validation
   - Delete operations consider dependent records

2. **Business Rules**
   - Transfer quantity cannot exceed available inventory
   - Users must be assigned to a base (except Admin)
   - Duplicate asset codes are prevented

3. **Audit Trail**
   - All CRUD operations are logged
   - User identification is required for all operations
   - Original and modified data are stored

---

## Backup Strategy

- **Automatic Backups**: MongoDB Atlas provides daily backups
- **Retention**: 7-day retention by default, customizable to 30 days
- **Point-in-Time Recovery**: Available within 7-day window
- **Manual Backups**: Can be taken anytime for critical periods

---

## Query Performance Optimization

1. **Always use indexed fields** in WHERE clauses
2. **Aggregate queries** for reporting (uses index-aware operations)
3. **Pagination** for large result sets (limit and skip)
4. **Projection** to select only needed fields
5. **Denormalization** in Inventory for faster balance queries

---

## Schema Evolution

Future versions may include:
- Geolocation coordinates for bases
- Asset image storage (using GridFS)
- Historical inventory snapshots
- Budget tracking and forecasting
- Supply chain integration

---

**Last Updated:** May 2026  
**Compliance:** ISO 8601 dates, UTF-8 encoding, Mongoose v8.0+
