# AL Closet - Full Stack Web Application

A full-stack web application for managing your wardrobe with image uploads, organization, and search features.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Authentication:** JWT

## Features

### ✨ Core Features
1. **User Authentication**
   - JWT-based login/signup
   - Secure password hashing with bcryptjs
   - Token validation for protected routes

2. **Clothing Management**
   - Upload clothing items with images
   - Store detailed information (type, color, size, category)
   - Edit and delete clothing items
   - Filter by type, color, category, and size

3. **Dashboard**
   - View all wardrobe items
   - Advanced filtering options
   - Quick statistics

4. **Gallery View**
   - Organized by category
   - Beautiful card layout
   - Delete items from gallery

## Project Structure

```
AL_Closet/
├── client/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ClothingCard.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Upload.js
│   │   │   └── Gallery.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                    # Node/Express Backend
    ├── models/
    │   ├── User.js
    │   └── Clothing.js
    ├── controllers/
    │   ├── authController.js
    │   └── clothingController.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── clothingRoutes.js
    ├── middleware/
    │   └── auth.js
    ├── config/
    │   ├── database.js
    │   └── multer.js
    ├── uploads/
    ├── server.js
    ├── package.json
    └── .env.example
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```
MONGODB_URI=mongodb://localhost:27017/al-closet
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

App opens at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Clothing Items
- `POST /api/clothing/upload` - Upload new clothing item (protected, multipart)
- `GET /api/clothing` - Get all user's clothing items (protected)
- `GET /api/clothing/:id` - Get specific clothing item (protected)
- `PUT /api/clothing/:id` - Update clothing item (protected)
- `DELETE /api/clothing/:id` - Delete clothing item (protected)
- `GET /api/clothing/filter` - Filter clothing items (protected)

## Usage

1. **Sign Up** - Create a new account with username, email, and password
2. **Login** - Sign in with your credentials
3. **Upload Items** - Click "Upload" to add clothing items with images
4. **View Dashboard** - See all your items with filtering options
5. **Browse Gallery** - View items organized by category
6. **Edit/Delete** - Modify or remove items as needed

## Features Details

### Clothing Item Properties
- **Name** - Item description
- **Type** - shirt, pants, dress, skirt, jacket, sweater, shoes, accessories
- **Color** - Item color
- **Category** - casual, formal, sports, sleepwear
- **Size** - XS to XXL
- **Brand** - Optional brand name
- **Description** - Optional notes
- **Purchase Date** - Optional
- **Tags** - Custom tags for organization
- **Image** - Uploaded image (JPG, PNG, WebP, max 5MB)

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/al-closet
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Styling

The application uses **Tailwind CSS** for styling with custom color scheme:
- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Dark: Gray (#1f2937)
- Light: Light Gray (#f3f4f6)

## Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected routes requiring authentication
- ✅ File upload validation
- ✅ CORS enabled for frontend-backend communication
- ✅ Authorization checks for user data

## Performance Optimizations

- Image compression on upload
- Indexed database queries
- Lazy loading of images
- Efficient filtering
- Responsive design

## Future Enhancements

- [ ] Outfit combinations/suggestions
- [ ] Weather-based recommendations
- [ ] Social sharing
- [ ] Advanced AI recommendations
- [ ] Mobile app
- [ ] Cloud storage integration
- [ ] User profiles
- [ ] Wishlist features

## Error Handling

The application includes comprehensive error handling:
- Validation errors
- Authentication errors
- File upload errors
- Database errors
- Network errors

## License

This project is open source and available for personal use.

## Support

For issues or questions, please contact support at support.webdm@gmail.com or WhatsApp: +917066615275
