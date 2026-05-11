# Environment Setup Instructions

## Complete Environment Configuration Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
  ```bash
  node --version  # Should show v18+
  ```

- **npm**: v8.0.0 or higher
  ```bash
  npm --version  # Should show v8+
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```

- **MongoDB Atlas Account**: Free tier available at [mongodb.com](https://mongodb.com)

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Configure .env Variables

Edit `server/.env` with the following values:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/military-assets?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-too
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### Step 4: Verify MongoDB Connection

```bash
npm run dev
```

Check for successful database connection message in console.

### Step 5: Seed Initial Data

```bash
npm run seed
```

This creates:
- 3 bases (FL001, FH002, FB003)
- 5 users (admin, commanders, officers)
- 6 asset types
- Sample purchases and transfers
- Sample inventory data

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd client
npm install
```

### Step 2: Create Environment File

```bash
cp .env.example .env
```

### Step 3: Configure .env Variables

Edit `client/.env` with:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Environment
VITE_NODE_ENV=development
```

### Step 4: Verify Setup

```bash
npm run dev
```

Frontend should open at http://localhost:5173

---

## Full Application Startup

### From Root Directory

```bash
# Install all dependencies
npm install

# Install workspace dependencies
npm install --workspace=server
npm install --workspace=client

# Start development (runs both frontend and backend)
npm run dev
```

This will:
- Start backend on http://localhost:5000
- Start frontend on http://localhost:5173
- Enable hot reloading for both

### Access the Application

1. Open browser to http://localhost:5173
2. Login with demo credentials:
   - Email: `admin@military.com`
   - Password: `Admin@123`

---

## MongoDB Atlas Setup (Detailed)

### 1. Create Account

1. Go to [mongodb.com](https://mongodb.com)
2. Click "Sign Up"
3. Complete registration

### 2. Create a Cluster

1. Go to "Create a cluster"
2. Select "M0 Shared" (free tier)
3. Choose region closest to you
4. Click "Create Cluster"

### 3. Create Database User

1. Click "Database Access" in sidebar
2. Click "Add New Database User"
3. Create username (e.g., `admin`)
4. Generate password (copy it)
5. Select "Built-in Role: Atlas Admin"
6. Click "Add User"

### 4. Add IP Address to Whitelist

1. Click "Network Access" in sidebar
2. Click "Add IP Address"
3. Enter `0.0.0.0/0` (allow all IPs - change in production)
4. Click "Confirm"

### 5. Get Connection String

1. Click "Databases" in sidebar
2. Click "Connect" button for your cluster
3. Choose "Connect your application"
4. Select "Node.js"
5. Copy the connection string
6. Replace `<username>` and `<password>`
7. Replace `<dbname>` with `military-assets`

### 7. Update .env

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/military-assets?retryWrites=true&w=majority
```

---

## Port Conflicts

If ports are already in use, change them:

### Change Backend Port

Edit `server/.env`:
```env
PORT=5001  # or any available port
```

Then update frontend:
Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api/v1
```

### Change Frontend Port

Edit `client/vite.config.js`:
```javascript
server: {
  port: 5174,  // or any available port
}
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Example | Notes |
|----------|---------|-------|
| MONGODB_URI | `mongodb+srv://...` | Your MongoDB connection string |
| PORT | 5000 | Backend server port |
| NODE_ENV | development | Environment: development, production, test |
| JWT_SECRET | `long-random-string` | Secret for JWT tokens (use strong value!) |
| JWT_EXPIRE | 7d | Token expiration time |
| JWT_REFRESH_SECRET | `another-secret` | Secret for refresh tokens |
| JWT_REFRESH_EXPIRE | 30d | Refresh token expiration |
| CLIENT_URL | http://localhost:5173 | Frontend URL for CORS |

### Frontend (.env)

| Variable | Example | Notes |
|----------|---------|-------|
| VITE_API_URL | http://localhost:5000/api/v1 | Backend API URL |
| VITE_NODE_ENV | development | Environment mode |

---

## Troubleshooting

### Cannot Connect to MongoDB

```
Error: MongooseServerSelectionError

Solution:
1. Verify connection string spelling
2. Check username/password are correct
3. Ensure database name is "military-assets"
4. Verify IP address is whitelisted (0.0.0.0/0)
5. Test connection: mongosh "connection-string"
```

### Port Already in Use

```
Error: listen EADDRINUSE :::5000

Solution:
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
echo "PORT=5001" >> server/.env
```

### CORS Errors

```
Error: Access blocked by CORS policy

Solution:
1. Check CLIENT_URL in backend .env
2. Verify frontend URL matches
3. Restart backend server after changing .env
4. Clear browser cache
```

### Module Not Found Errors

```
Error: Cannot find module

Solution:
npm install  # in both server and client directories
npm cache clean --force
npm install  # again
```

---

## Verification Checklist

### Backend
- [ ] Node.js v18+ installed
- [ ] MongoDB connection string valid
- [ ] .env file configured
- [ ] `npm run dev` starts without errors
- [ ] Seed data created successfully

### Frontend
- [ ] Node.js v18+ installed
- [ ] .env file configured with VITE_API_URL
- [ ] `npm run dev` opens browser
- [ ] Can access http://localhost:5173

### Integration
- [ ] Can login with admin@military.com / Admin@123
- [ ] Dashboard loads with data
- [ ] No console errors
- [ ] Network requests succeed

---

## Development Commands

```bash
# Backend
cd server
npm run dev              # Start development server
npm run seed             # Seed database
npm test                 # Run tests
npm run lint             # Lint code

# Frontend
cd client
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests

# Root
npm run dev              # Run both concurrently
npm run install-all      # Install all dependencies
```

---

## Next Steps

1. ✅ Complete environment setup
2. ✅ Verify application starts
3. ✅ Login with demo credentials
4. ✅ Explore features
5. ✅ Review [README.md](../README.md)
6. ✅ Check API endpoints
7. ✅ Plan first deployment

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.mongodb.com/atlas/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Mongoose Documentation](https://mongoosejs.com)

---

**Last Updated:** May 2026  
**Version:** 1.0.0
