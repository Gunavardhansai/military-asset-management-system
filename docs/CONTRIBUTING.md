# Contributing Guidelines

## Project Structure Overview

```
Military Asset Management System/
├── client/              # React frontend
├── server/              # Express backend  
├── docs/                # Documentation
└── README.md            # Main documentation
```

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone and install
git clone <repository>
cd "Military Asset Management System"
npm install

# Setup backend
cd server
cp .env.example .env
# Edit .env with your MongoDB URI

# Setup frontend
cd ../client
cp .env.example .env
```

### 2. Running Development Servers

```bash
# From root directory (runs both)
npm run dev

# Or separately:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

### 3. Code Style & Conventions

#### Backend (Express.js)
- Use async/await for promises
- Follow RESTful conventions
- Keep controllers focused (single responsibility)
- Use middleware for cross-cutting concerns
- Document complex logic with comments

#### Frontend (React)
- Use functional components with hooks
- Keep components under 300 lines
- Extract custom hooks for reusable logic
- Use proper prop validation
- Apply meaningful component names

### 4. Adding Features

#### Adding a New Endpoint

1. **Create/Update Model** (if needed)
   ```javascript
   // server/src/models/NewModel.js
   const schema = new Schema({
     // fields
   });
   module.exports = model('NewModel', schema);
   ```

2. **Create Controller**
   ```javascript
   // server/src/controllers/newController.js
   exports.createNew = async (req, res, next) => {
     try {
       // validation
       // logic
       // audit log
     } catch (error) {
       next(error);
     }
   };
   ```

3. **Add Validators**
   ```javascript
   // server/src/validators/validators.js
   exports.validateNew = [
     body('field').isString().trim()
   ];
   ```

4. **Create Routes**
   ```javascript
   // server/src/routes/newRoutes.js
   router.post('/', protect, authorize('Admin'), validateNew, createNew);
   ```

5. **Register Routes** in server.js
   ```javascript
   app.use('/api/v1/new', newRoutes);
   ```

#### Adding a New Page

1. **Create Component**
   ```javascript
   // client/src/pages/NewPage.jsx
   const NewPage = () => {
     const [data, setData] = useState([]);
     
     useEffect(() => {
       // fetch data
     }, []);
     
     return <div><!-- content --></div>;
   };
   export default NewPage;
   ```

2. **Add Route** in App.jsx
   ```javascript
   <Route path="/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```

3. **Update Sidebar** navigation

### 5. Testing Changes

#### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Proper error handling
- [ ] Loading states visible
- [ ] Success notifications shown
- [ ] Audit logs recorded
- [ ] RBAC enforced

#### API Testing
```bash
cd server

# Test specific endpoint
curl -X GET http://localhost:5000/api/v1/purchases \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Database Changes

#### Adding a Field

1. Update Mongoose schema
2. Write data migration (if needed)
3. Update validators
4. Update API documentation
5. Update frontend forms

#### Migration Example
```javascript
// server/src/migrations/addNewField.js
db.collection.updateMany({}, { $set: { newField: defaultValue } });
```

### 7. Security Considerations

- [ ] Validate all inputs
- [ ] Check authorization for protected routes
- [ ] Hash passwords with bcrypt
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting for APIs
- [ ] Log security-related events
- [ ] Sanitize user input
- [ ] Use HTTPS in production

### 8. Performance Best Practices

#### Backend
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Use aggregation pipelines for analytics
- Cache frequently accessed data
- Optimize query projections

#### Frontend
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Lazy load images and components
- Minimize API calls
- Use proper CSS techniques

### 9. Commit Guidelines

```
Type: Description

- Feature: New functionality
- Fix: Bug fix
- Docs: Documentation changes
- Style: Code style changes
- Refactor: Code refactoring
- Perf: Performance improvements
- Test: Adding/updating tests

Examples:
- Feature: Add transfer approval workflow
- Fix: Resolve inventory calculation bug
- Docs: Update API documentation
```

### 10. Pull Request Process

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit
3. Push branch: `git push origin feature/feature-name`
4. Create pull request with:
   - Clear description
   - Related issues
   - Testing notes
   - Screenshots (if UI)

5. Code review checklist:
   - [ ] Code follows conventions
   - [ ] No security issues
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No performance degradation

### 11. Debugging Tips

#### Backend Debugging
```bash
# Add logging
console.log('Debug info:', variable);

# Use Node debugger
node --inspect server.js

# Check MongoDB data
db.collection.find()
```

#### Frontend Debugging
- Use React Developer Tools extension
- Check Redux Devtools for state
- Use browser DevTools console
- Add console.logs strategically

### 12. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| JWT token expired | Implement refresh token flow |
| Inventory mismatch | Verify calculation formula |
| CORS errors | Check CORS configuration |
| Database connection | Verify MongoDB URI and IP whitelist |

### 13. Release Process

1. Update version in package.json
2. Update CHANGELOG
3. Create release branch
4. Tag release: `git tag v1.0.0`
5. Deploy to production
6. Verify deployment

---

## Code Review Checklist

- [ ] Code is clean and readable
- [ ] No debug console.logs left
- [ ] Proper error handling
- [ ] Security validated
- [ ] Performance acceptable
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes

---

## Questions?

- Check existing documentation
- Review similar implementations
- Ask in team channels
- File GitHub issues for bugs

---

**Last Updated:** May 2026
