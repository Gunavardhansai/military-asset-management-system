# Military Asset Management System

A comprehensive, enterprise-grade MERN Stack application for managing military assets across multiple bases with real-time tracking, audit logging, and role-based access control.

## 🎯 Project Overview

This is a complete production-ready Military Asset Management System that enables commanders and logistics personnel to:

- **Manage assets** across multiple military bases
- **Track purchases, transfers, assignments, and expenditures** with complete audit trails
- **Monitor inventory balance** with real-time calculations (opening balance, closing balance, net movements)
- **Maintain accountability** through comprehensive audit logging
- **Enforce security** with JWT authentication and RBAC
- **Generate insights** with advanced dashboards and analytics

## ✨ Key Features

### 1. Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (RBAC)
- Three user roles: Admin, Base Commander, Logistics Officer
- Password hashing with bcrypt
- Automatic session management

### 2. Asset Management
- Create and manage military assets (vehicles, weapons, ammunition, equipment)
- Track asset categories and specifications
- Maintain unit costs and measurements

### 3. Purchase Management
- Record asset purchases with supplier details
- Track purchase dates and invoices
- Calculate total costs automatically
- Filter and search purchases by base, date, and type

### 4. Transfer Management
- Transfer assets between bases
- Multi-step approval workflow (Pending → In Transit → Received)
- Automatic inventory updates
- Transfer history tracking

### 5. Assignment & Expenditures
- Assign assets to personnel with rank information
- Record asset consumption/loss
- Multiple expenditure reasons (Usage, Loss, Damage, Obsolete)
- Automatic inventory adjustments

### 6. Inventory Management
- Real-time inventory balance calculations
- Automatic formula application:
  - **Closing Balance = Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended**
- Inventory tracking by base and asset
- Stock level monitoring

### 7. Dashboard & Analytics
- Real-time aggregated statistics
- Monthly movement charts
- Asset distribution analysis
- Net movement visualization
- Customizable date range filtering

### 8. Audit Logging
- Complete audit trail for all operations
- Track user, role, timestamp, and changes
- Separate audit log page for admins
- User activity reports

## 🛠️ Tech Stack

### Frontend
- **React.js 18** with Vite
- **React Router DOM** for navigation
- **Redux Toolkit** for state management
- **React Context API** for authentication
- **Tailwind CSS** for styling
- **React Hook Form** for forms
- **Recharts** for analytics and charts
- **Axios** for API communication
- **Framer Motion** for animations
- **React Toastify** for notifications
- **Lucide Icons** for UI icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security
- **Morgan** for logging
- **Winston** for application logging
- **Express Validator** for input validation
- **CORS** for cross-origin requests

### Database
- **MongoDB Atlas** cloud database
- Proper indexing for performance
- Schema validation with Mongoose

## 📁 Project Structure

```
Military Asset Management System/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   ├── pages/                  # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PurchasesPage.jsx
│   │   │   ├── TransfersPage.jsx
│   │   │   ├── AssignmentsPage.jsx
│   │   │   ├── ExpendituresPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── AuditLogsPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   ├── contexts/               # Context providers
│   │   │   └── AuthContext.jsx
│   │   ├── services/               # API services
│   │   │   ├── api.js
│   │   │   └── index.js
│   │   ├── store/                  # Redux store
│   │   │   ├── slices/
│   │   │   │   └── authSlice.js
│   │   │   └── index.js
│   │   ├── utils/                  # Utilities
│   │   │   └── toast.js
│   │   ├── hooks/                  # Custom hooks
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/                 # Configuration
│   │   │   ├── database.js
│   │   │   ├── logger.js
│   │   │   └── roles.js
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Base.js
│   │   │   ├── Asset.js
│   │   │   ├── Purchase.js
│   │   │   ├── Transfer.js
│   │   │   ├── Assignment.js
│   │   │   ├── Expenditure.js
│   │   │   ├── Inventory.js
│   │   │   └── AuditLog.js
│   │   ├── controllers/            # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── purchaseController.js
│   │   │   ├── transferController.js
│   │   │   ├── assignmentController.js
│   │   │   ├── expenditureController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── auditLogController.js
│   │   │   ├── userController.js
│   │   │   ├── baseController.js
│   │   │   ├── assetController.js
│   │   │   └── inventoryController.js
│   │   ├── middleware/             # Middleware
│   │   │   ├── auth.js
│   │   │   ├── auditLogger.js
│   │   │   └── errorHandler.js
│   │   ├── routes/                 # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── purchaseRoutes.js
│   │   │   ├── transferRoutes.js
│   │   │   ├── assignmentRoutes.js
│   │   │   ├── expenditureRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── auditLogRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── baseRoutes.js
│   │   │   ├── assetRoutes.js
│   │   │   └── inventoryRoutes.js
│   │   ├── validators/             # Input validators
│   │   │   └── validators.js
│   │   ├── utils/                  # Utilities
│   │   │   ├── auth.js
│   │   │   └── inventory.js
│   │   └── server.js
│   ├── seeds/                      # Database seed scripts
│   │   └── seedData.js
│   ├── logs/                       # Application logs
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── docs/                            # Documentation
├── database-dump/                   # Database backups
├── README.md
├── .gitignore
├── package.json
└── .gitattributes
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
```bash
cd Military\ Asset\ Management\ System
```

2. **Install root dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB connection string
npm install
```

4. **Setup Frontend**
```bash
cd ../client
cp .env.example .env
npm install
```

### Environment Variables

**Server (.env)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/military-assets
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```
VITE_API_URL=http://localhost:5000/api/v1
VITE_NODE_ENV=development
```

### Running the Application

**From root directory (runs both frontend and backend concurrently):**
```bash
npm run dev
```

**Or separately:**

Backend:
```bash
cd server
npm run dev
```

Frontend (in another terminal):
```bash
cd client
npm run dev
```

### Seeding Database

```bash
cd server
npm run seed
```

This creates sample data including bases, users, assets, and operations.

**Demo Credentials:**
- Admin: admin@military.com / Admin@123
- Commander: commander1@military.com / Officer@123
- Logistics: logistics1@military.com / Officer@123

## 📚 API Documentation

### Authentication Endpoints

**Login**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@military.com",
  "password": "Admin@123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "fullName": "Admin User",
    "email": "admin@military.com",
    "role": "Admin"
  }
}
```

**Register**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "New User",
  "email": "user@military.com",
  "password": "Password123",
  "role": "Logistics Officer",
  "base": "base_id"
}
```

**Get Current User**
```
GET /api/v1/auth/me
Authorization: Bearer token
```

### Purchase Endpoints

**Create Purchase**
```
POST /api/v1/purchases
Authorization: Bearer token
Content-Type: application/json

{
  "asset": "asset_id",
  "base": "base_id",
  "quantity": 10,
  "unitCost": 1000,
  "supplier": "Supplier Name",
  "purchaseDate": "2024-01-15"
}
```

**Get Purchases**
```
GET /api/v1/purchases?page=1&limit=10&base=base_id
Authorization: Bearer token
```

### Transfer Endpoints

**Create Transfer**
```
POST /api/v1/transfers
Authorization: Bearer token

{
  "asset": "asset_id",
  "fromBase": "base_id",
  "toBase": "base_id",
  "quantity": 5,
  "transferDate": "2024-01-20"
}
```

**Approve Transfer**
```
PATCH /api/v1/transfers/transfer_id/approve
Authorization: Bearer token
```

**Receive Transfer**
```
PATCH /api/v1/transfers/transfer_id/receive
Authorization: Bearer token
```

### Dashboard Endpoints

**Get Dashboard Stats**
```
GET /api/v1/dashboard/stats?base=base_id
Authorization: Bearer token

Response:
{
  "success": true,
  "data": {
    "openingBalance": 1000,
    "closingBalance": 1050,
    "netMovement": 50,
    "purchases": { "quantity": 100, "cost": 50000 },
    "transferIn": 50,
    "transferOut": 30,
    "assignments": 20,
    "expenditures": 10
  }
}
```

**Get Monthly Movement**
```
GET /api/v1/dashboard/monthly-movement?months=6
Authorization: Bearer token
```

**Get Asset Distribution**
```
GET /api/v1/dashboard/asset-distribution?base=base_id
Authorization: Bearer token
```

## 🔐 Role-Based Access Control (RBAC)

### Admin
- Full access to all features
- User management
- System settings
- Audit logs
- Delete operations

### Base Commander
- View assigned base inventory
- Manage assignments and expenditures
- Approve transfers
- Access audit logs for their base

### Logistics Officer
- Create and manage purchases
- Create and manage transfers
- View inventory
- Access audit logs

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configured CORS headers
- **Helmet Security**: Security headers via Helmet.js
- **Input Validation**: Express Validator for all inputs
- **MongoDB Injection Prevention**: Mongoose schema validation
- **Environment Variables**: Sensitive data in .env files
- **Audit Logging**: Complete operation tracking
- **Rate Limiting**: Request validation middleware
- **HTTPS Ready**: Production-ready security headers

## 📊 Database Design

### Models

**User**
- Email (unique)
- Password (hashed)
- Role (Admin, Base Commander, Logistics Officer)
- Base (reference to Base)
- isActive flag
- Last login timestamp

**Base**
- Name (unique)
- Code (unique)
- Location
- Commander (reference to User)
- Capacity

**Asset**
- Name
- Category (Vehicle, Weapon, Ammunition, Equipment, Supplies)
- Code (unique)
- Unit cost
- Unit of measure

**Purchase**
- Asset (reference)
- Base (reference)
- Quantity
- Unit cost
- Total cost
- Supplier
- Purchase date
- Invoice number

**Transfer**
- Asset (reference)
- From Base (reference)
- To Base (reference)
- Quantity
- Transfer date
- Status (Pending, In Transit, Received, Cancelled)
- Approval and receipt tracking

**Assignment**
- Asset (reference)
- Base (reference)
- Personnel Name
- Rank
- Quantity
- Assigned date
- Status (Active, Returned, Lost, Damaged)

**Expenditure**
- Asset (reference)
- Base (reference)
- Quantity
- Reason (Usage, Loss, Damage, Obsolete)
- Expenditure date
- Approval tracking

**Inventory**
- Asset (reference)
- Base (reference)
- Opening balance
- Purchases quantity
- Transfer in quantity
- Transfer out quantity
- Assigned quantity
- Expended quantity
- Closing balance (calculated)

**AuditLog**
- User (reference)
- User Role
- Action type
- Resource type
- Resource ID
- Old data
- New data
- Endpoint
- IP address
- Timestamp

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Component Testing
```bash
cd client
npm test
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Create account at vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. From client directory: `vercel`
4. Follow prompts

### Backend Deployment (Render.com)

1. Create account at render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Database (MongoDB Atlas)

1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Add to .env files

## 📈 Monitoring & Logs

The application generates logs in `server/logs/`:
- `combined.log` - All application logs
- `error.log` - Error-only logs

Access via Winston logger in production.

## 🎯 Future Improvements

- Real-time WebSocket notifications
- PDF/Excel export functionality
- Advanced search capabilities
- Mobile app (React Native)
- Two-factor authentication
- Advanced analytics and reporting
- Integration with external ERP systems
- Barcode scanning for assets
- Geolocation tracking for transfers
- Email notifications
- Scheduled reports
- Data backup automation

## 📋 Assumptions & Limitations

### Assumptions
- Users are identified by unique email addresses
- Each non-admin user is assigned to exactly one base
- Assets have standard unit costs
- Transfers require approval before completion
- All dates are in ISO 8601 format

### Limitations
- Single instance deployment (horizontal scaling requires Redis)
- Real-time updates require WebSocket implementation
- File uploads not implemented
- Batch operations have size limits
- Report generation is server-side only

## 🤝 Support & Contribution

For issues, feature requests, or contributions:
1. Create an issue in the repository
2. Follow code style guidelines
3. Submit pull requests with detailed descriptions

## 📄 License

ISC License

## 👥 Team

Military Asset Management System Development Team

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Status:** Production Ready
#   m i l i t a r y - a s s e t - m a n a g e m e n t - s y s t e m  
 #   m i l i t a r y - a s s e t - m a n a g e m e n t - s y s t e m  
 