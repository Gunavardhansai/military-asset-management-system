# Quick Start Guide - Military Asset Management System

## 5-Minute Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git installed

### Step 1: Clone & Install
```bash
cd "c:\G\Military Asset Management System"
npm install
npm install --workspace=server
npm install --workspace=client
```

### Step 2: Configure MongoDB

1. Go to [mongodb.com](https://mongodb.com)
2. Create a free cluster (M0)
3. Create a database user (save username/password)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/military-assets`

### Step 3: Setup Environment Variables

**Backend (.env)**
```bash
cd server
echo "MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/military-assets" > .env
echo "PORT=5000" >> .env
echo "NODE_ENV=development" >> .env
echo "JWT_SECRET=your_secret_key_here" >> .env
echo "JWT_EXPIRE=7d" >> .env
echo "JWT_REFRESH_SECRET=refresh_secret_here" >> .env
echo "JWT_REFRESH_EXPIRE=30d" >> .env
echo "CLIENT_URL=http://localhost:5173" >> .env
```

**Frontend (.env)**
```bash
cd ../client
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
echo "VITE_NODE_ENV=development" >> .env
```

### Step 4: Start Application
```bash
cd ..
npm run dev
```

The application will open at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Step 5: Seed Data
In a new terminal:
```bash
cd server
npm run seed
```

### Demo Credentials
```
Email: admin@military.com
Password: Admin@123

Email: commander1@military.com
Password: Officer@123

Email: logistics1@military.com
Password: Officer@123
```

---

## Troubleshooting Quick Fixes

### MongoDB Connection Error
```
Error: connect ECONNREFUSED

Solution:
1. Verify connection string is correct
2. Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0)
3. Ensure database name is correct
4. Verify username/password
```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000

Solution:
1. Kill process: lsof -ti:5000 | xargs kill -9
2. Or change PORT in .env file
```

### Frontend API Errors
```
Error: CORS blocked or API unreachable

Solution:
1. Verify VITE_API_URL is correct
2. Check backend is running
3. Look at browser console for details
```

### Seed Data Won't Run
```bash
# Make sure you're in server directory
cd server
npm run seed

# Or manually run
node seeds/seedData.js
```

---

## Verification Checklist

- [ ] Both frontend and backend running
- [ ] Can login with admin@military.com
- [ ] Dashboard shows stats
- [ ] Can view purchases page
- [ ] Can see sample data from seed

---

## Next Steps

1. **Explore Features**
   - Dashboard with stats and charts
   - Purchase management
   - Transfer workflow
   - Inventory tracking

2. **Create Your Data**
   - Add new assets
   - Create bases
   - Record purchases
   - Manage transfers

3. **Deploy to Production**
   - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Deploy frontend to Vercel
   - Deploy backend to Render
   - Use MongoDB Atlas

---

## Documentation

- [README.md](../README.md) - Full documentation
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production deployment
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Database design
- [RBAC_DOCUMENTATION.md](RBAC_DOCUMENTATION.md) - Permission system
- [API_DOCUMENTATION.json](API_DOCUMENTATION.json) - API reference

---

**Need Help?** Check the main README.md or review the DEPLOYMENT_GUIDE.md
