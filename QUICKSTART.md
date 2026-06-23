# Quick Start Guide - AL Closet

## Prerequisites
- Node.js 14+ installed
- MongoDB running locally or cloud instance (MongoDB Atlas recommended)
- npm or yarn

## Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with your MongoDB connection
# Copy content from .env.example and update MONGODB_URI and JWT_SECRET
cp .env.example .env

# Edit .env and add:
# MONGODB_URI=mongodb://localhost:27017/al-closet  (or your MongoDB URI)
# JWT_SECRET=your_super_secret_key_12345

# Start the backend server
npm run dev
# Server will run on http://localhost:5000
```

## Step 2: Frontend Setup (in another terminal)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
# App will open at http://localhost:3000
```

## Step 3: Test the Application

1. **Open http://localhost:3000 in your browser**
2. **Sign Up** - Create a new account
3. **Upload Items** - Click "Upload" to add clothing items
4. **View Dashboard** - See your items with filters
5. **Browse Gallery** - View items by category

## Available Routes

### Home Page
- `http://localhost:3000/` - Landing page

### Authentication Pages
- `http://localhost:3000/login` - Login page
- `http://localhost:3000/signup` - Sign up page

### Main Features (Requires Login)
- `http://localhost:3000/dashboard` - Main wardrobe dashboard
- `http://localhost:3000/upload` - Upload new clothing
- `http://localhost:3000/gallery` - View gallery by category

## Backend API Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "Server is running"
}
```

## Default Test Account (Optional)

You can create a test account:
- **Username:** testuser
- **Email:** test@example.com
- **Password:** password123

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Try `mongod` command if using local MongoDB

### Port Already in Use
- Backend: Change PORT in .env (default 5000)
- Frontend: Use `PORT=3001 npm start` for different port

### CORS Errors
- Ensure backend is running on http://localhost:5000
- Check proxy setting in client/package.json

### Image Upload Issues
- Ensure `/server/uploads` directory exists
- Check file size (max 5MB)
- Supported formats: JPG, PNG, WebP

## Environment Variables Needed

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/al-closet
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
```

### Frontend (.env - optional)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Installing Dependencies Explained

### Backend Dependencies:
- **express** - Web server framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **multer** - File upload handling
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

### Frontend Dependencies:
- **react** - UI library
- **react-router-dom** - Page routing
- **axios** - HTTP requests
- **tailwindcss** - CSS styling
- **react-icons** - Icon library

## Next Steps

1. Customize the UI colors in `client/tailwind.config.js`
2. Add more clothing types in models
3. Implement outfit recommendations
4. Deploy to production (Heroku for backend, Vercel for frontend)

## Getting Help

- Check README.md in the root directory for detailed documentation
- Review error messages in browser console (F12)
- Check backend logs in terminal

---

**Happy organizing! 👗**
