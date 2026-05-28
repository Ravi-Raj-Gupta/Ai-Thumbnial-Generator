# 🔧 Backend - AI Thumbnail Generator

Production-ready Node.js backend server using Express, MongoDB, and Google Generative AI. Handles all API requests, AI processing, and database operations.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.0+-000000?style=flat-square&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.6+-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com)

---

## 📋 Quick Navigation

- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration](#-configuration)
- [📚 API Documentation](#-api-documentation)
- [🗄️ Database](#-database)
- [🛡️ Middleware](#-middleware)
- [🔐 Security](#-security)
- [🐛 Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

```
✅ Node.js v18 or higher
✅ npm or yarn
✅ MongoDB Atlas cluster
✅ Google Generative AI API key
✅ Cloudinary account
```

### Installation

```bash
cd server
npm install
```

### Setup Environment

Create `.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-thumbnail-db

# Google AI API
GOOGLE_API_KEY=your_google_generative_ai_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Session Management
SESSION_SECRET=your_secure_random_session_secret

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:5173
```

### Start Development Server

```bash
npm run server
```

Server runs on http://localhost:5000 with auto-reload 🚀

---

## 📁 Project Structure

```
server/
├── ⚙️ configs/
│   ├── ai.ts                    # Google Generative AI setup
│   ├── cloudinary.ts            # Cloudinary cloud storage config
│   └── db.ts                    # MongoDB connection
│
├── 🎮 controllers/
│   ├── AuthControllers.ts       # Auth logic (register, login, logout, verify)
│   ├── ThumbnailController.ts   # Thumbnail generation logic
│   └── UserController.ts        # User management
│
├── 🗄️ models/
│   ├── User.ts                  # User schema & interface
│   └── Thumbnail.ts             # Thumbnail schema & interface
│
├── 🛣️ routes/
│   ├── AuthRoutes.ts            # Auth endpoints
│   ├── ThumbnailRoutes.ts       # Thumbnail endpoints
│   └── UserRoutes.ts            # User endpoints
│
├── 🛡️ middlewares/
│   └── auth.ts                  # Authentication middleware (protect routes)
│
├── 📁 images/                   # Temporary image storage
│
├── server.ts                    # Main Express app & server setup
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables
└── README.md                    # This file
```

---

## ⚙️ Configuration

### Database Configuration (`configs/db.ts`)

```typescript
// MongoDB Atlas connection with Mongoose
// Features:
// - Automatic reconnection
// - Connection pooling
// - Google DNS for reliable SRV resolution
```

**Environment Variable**:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database-name
```

### AI Configuration (`configs/ai.ts`)

```typescript
// Google Generative AI (Gemini) setup
// Model: gemini-1.5-flash (optimized for speed & cost)
```

**Environment Variable**:

```env
GOOGLE_API_KEY=AIza...
```

### Cloudinary Configuration (`configs/cloudinary.ts`)

```typescript
// Cloud image storage and optimization
// Features:
// - Automatic image optimization
// - CDN delivery
// - Transformation support
```

**Environment Variables**:

```env
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

---

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000
Production: https://your-api-url.com
```

### Response Format

All endpoints return JSON responses:

```json
{
   "success": true,
   "message": "Operation successful",
   "data": {}
}
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body**:

```json
{
   "name": "John Doe",
   "email": "john@example.com",
   "password": "securePassword123"
}
```

**Response** (201 Created):

```json
{
   "message": "Account created successfully",
   "user": {
      "_id": "6507abc...",
      "name": "John Doe",
      "email": "john@example.com"
   }
}
```

**Error Responses**:

- `400 Bad Request` - User already exists
- `500 Internal Server Error` - Server error

---

### Login User

**POST** `/api/auth/login`

Authenticate user and create session.

**Request Body**:

```json
{
   "email": "john@example.com",
   "password": "securePassword123"
}
```

**Response** (200 OK):

```json
{
   "message": "Login successful",
   "user": {
      "_id": "6507abc...",
      "name": "John Doe",
      "email": "john@example.com"
   }
}
```

**Error Responses**:

- `400 Bad Request` - Invalid credentials
- `500 Internal Server Error` - Server error

---

### Verify User

**GET** `/api/auth/verify`

Check if user is authenticated (requires auth middleware).

**Headers**:

```
Cookie: connect.sid=<session_id>
```

**Response** (200 OK):

```json
{
   "message": "User verified",
   "user": {
      "_id": "6507abc...",
      "name": "John Doe",
      "email": "john@example.com"
   }
}
```

**Error Responses**:

- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### Logout User

**POST** `/api/auth/logout`

End user session (requires auth middleware).

**Headers**:

```
Cookie: connect.sid=<session_id>
```

**Response** (200 OK):

```json
{
   "message": "Logout successful"
}
```

---

## 🎨 Thumbnail Endpoints

### Generate Thumbnail

**POST** `/api/thumbnails/generate`

Generate a new AI thumbnail. **Requires authentication**.

**Headers**:

```
Content-Type: application/json
Cookie: connect.sid=<session_id>
```

**Request Body**:

```json
{
   "title": "10 Ways to Learn React Fast",
   "additionalDetails": "React tutorial video focusing on hooks and state management",
   "style": "Bold & Graphic",
   "colorScheme": "vibrant",
   "aspectRatio": "16:9"
}
```

**Response** (201 Created):

```json
{
   "message": "Thumbnail generated successfully",
   "thumbnail": {
      "_id": "6507def...",
      "userId": "6507abc...",
      "title": "10 Ways to Learn React Fast",
      "prompt": "A bold graphic thumbnail showing...",
      "style": "Bold & Graphic",
      "colorScheme": "vibrant",
      "aspectRatio": "16:9",
      "imageUrl": "https://res.cloudinary.com/...",
      "metadata": {
         "width": 1280,
         "height": 720,
         "format": "jpeg"
      },
      "createdAt": "2024-05-28T10:30:00Z",
      "updatedAt": "2024-05-28T10:30:00Z"
   }
}
```

**Request Parameters Explained**:

- `title` - Video title (used for AI analysis)
- `additionalDetails` - Extra context for better AI generation
- `style` - Design style:
   - Bold & Graphic
   - Tech/Futuristic
   - Minimalist
   - Photorealistic
   - Illustrated
- `colorScheme` - Color palette:
   - vibrant, sunset, forest, neon, purple, monochrome, ocean, pastel
- `aspectRatio` - Thumbnail dimensions:
   - 16:9 (1280x720)
   - 4:3 (1024x768)
   - 1:1 (512x512)

**Error Responses**:

- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - AI generation failed

---

### Delete Thumbnail

**DELETE** `/api/thumbnails/delete/:id`

Delete a specific thumbnail. **Requires authentication**.

**URL Parameters**:

- `id` - Thumbnail MongoDB ID

**Headers**:

```
Cookie: connect.sid=<session_id>
```

**Response** (200 OK):

```json
{
   "message": "Thumbnail deleted successfully"
}
```

**Error Responses**:

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Thumbnail not found
- `403 Forbidden` - Not thumbnail owner
- `500 Internal Server Error` - Server error

---

## 👤 User Endpoints

### Get User Profile

**GET** `/api/users/profile`

Retrieve authenticated user profile. **Requires authentication**.

**Headers**:

```
Cookie: connect.sid=<session_id>
```

**Response** (200 OK):

```json
{
   "message": "Profile retrieved",
   "user": {
      "_id": "6507abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-05-28T10:30:00Z",
      "updatedAt": "2024-05-28T10:30:00Z"
   }
}
```

---

## 🗄️ Database

### MongoDB Collections

#### Users Collection

```typescript
interface IUser {
   _id: ObjectId;
   name: string;
   email: string;
   password: string; // Hashed with bcrypt
   createdAt: Date;
   updatedAt: Date;
}
```

**Indexes**:

```
email: unique
```

#### Thumbnails Collection

```typescript
interface IThumbnail {
   _id: ObjectId;
   userId: ObjectId; // Reference to User
   title: string;
   prompt: string; // AI prompt used
   additionalDetails: string;
   style: string; // e.g., "Bold & Graphic"
   colorScheme: string; // e.g., "vibrant"
   aspectRatio: string; // e.g., "16:9"
   imageUrl: string; // Cloudinary URL
   metadata: {
      width: number;
      height: number;
      format: string;
      size: number; // File size in bytes
   };
   createdAt: Date;
   updatedAt: Date;
}
```

**Indexes**:

```
userId, createdAt (compound)
userId: (for fast user queries)
```

---

## 🛡️ Middleware

### Authentication Middleware (`middlewares/auth.ts`)

Protects routes that require authentication.

```typescript
// Usage in routes:
router.post("/generate", protect, generateThumbnail);

// What it does:
// 1. Checks for valid session
// 2. Verifies user ID in session
// 3. Attaches userId to request object
// 4. Returns 401 if unauthorized
```

**Error Response** (401 Unauthorized):

```json
{
   "message": "Not authenticated, please login first"
}
```

---

## 🔐 Security Features

### Password Security

- ✅ Bcrypt hashing with salt rounds (10)
- ✅ Never store plaintext passwords

### Session Management

- ✅ Secure session tokens (7-day expiry)
- ✅ HttpOnly cookies
- ✅ Session store in MongoDB
- ✅ CSRF protection enabled

### API Security

- ✅ CORS enabled (whitelist specific origins)
- ✅ Request validation
- ✅ Rate limiting ready
- ✅ Environment variables for secrets

### Data Protection

- ✅ MongoDB encryption at rest
- ✅ HTTPS in production
- ✅ User data isolation

---

## 🛠️ Development

### Available Scripts

```bash
# Start with auto-reload (nodemon)
npm run server

# Start production server
npm run start

# Compile TypeScript
npm run build

# Install dependencies
npm install
```

### Development Workflow

1. **Setup environment** - Create `.env` file
2. **Start MongoDB** - Ensure Atlas cluster is accessible
3. **Run dev server** - `npm run server`
4. **Test endpoints** - Use Postman or REST Client
5. **Debug** - Check console logs and error responses

### Debugging Tips

```typescript
// Add logging for debugging
console.log("Request body:", req.body);
console.log("Session:", req.session);
console.log("Error:", error);

// Check environment variables
console.log("MongoDB URI:", process.env.MONGODB_URI);
console.log("API Key set:", !!process.env.GOOGLE_API_KEY);
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Creates compiled JavaScript in the project root.

### Deploy to Render

1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Set start command: `npm run start`
4. Deploy 🚀

### Deploy to Railway

1. Connect GitHub repo to Railway
2. Set environment variables
3. Railway auto-detects Node.js
4. Auto-deploys on push

### Production Environment Variables

```env
NODE_ENV=production
RENDER=true (for Render)
MONGODB_URI=mongodb+srv://<prod-credentials>
GOOGLE_API_KEY=<prod-key>
CLOUDINARY_CLOUD_NAME=<prod>
CLOUDINARY_API_KEY=<prod-key>
CLOUDINARY_API_SECRET=<prod-secret>
SESSION_SECRET=<strong-random-32-char-secret>
PORT=5000
CLIENT_URL=https://your-frontend-url.com
```

---

## 📊 Performance Optimization

### Database

- ✅ Mongoose connection pooling
- ✅ Compound indexes on frequently queried fields
- ✅ Lean queries when only reading data

### API

- ✅ Response compression
- ✅ Error handling with appropriate status codes
- ✅ Async/await for non-blocking operations

### Images

- ✅ Sharp for fast image processing
- ✅ Cloudinary CDN for global delivery
- ✅ Automatic format optimization

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Problem**: `MongoNetworkError`

```
Solution:
✅ Check IP whitelist in MongoDB Atlas
✅ Verify connection string
✅ Check DNS settings (using Google DNS as fallback)
```

### Google AI API Errors

**Problem**: `401 Unauthorized`

```
Solution:
✅ Verify GOOGLE_API_KEY is set correctly
✅ Check API is enabled in Google Cloud Console
✅ Verify API quota
```

### Cloudinary Upload Fails

**Problem**: `Invalid credentials`

```
Solution:
✅ Check CLOUDINARY_CLOUD_NAME
✅ Verify API_KEY and API_SECRET
✅ Check image format and size
```

### CORS Errors

**Problem**: `No 'Access-Control-Allow-Origin' header`

```
Solution:
✅ Verify CLIENT_URL in environment
✅ Check allowedOrigins array in server.ts
✅ Ensure credentials: true in client requests
```

### Session Issues

**Problem**: `Session not persisting`

```
Solution:
✅ Check SESSION_SECRET is set
✅ Verify MongoDB connection for session store
✅ Check browser accepts cookies
✅ Clear browser cookies and retry
```

---

## 📦 Dependencies

### Core

- `express@5.2.1` - Web framework
- `mongoose@9.6.2` - MongoDB ODM
- `typescript@6.0.3` - Type checking

### Authentication

- `express-session@1.19.0` - Session management
- `connect-mongo@6.0.0` - MongoDB session store
- `bcrypt@6.0.0` - Password hashing

### AI & Image

- `@google/generative-ai@0.24.1` - Gemini API
- `cloudinary@2.10.0` - Image storage
- `sharp@0.34.5` - Image processing

### Utilities

- `cors@2.8.6` - CORS support
- `dotenv@17.4.2` - Environment variables

---

## 📚 Useful Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Guide](https://mongoosejs.com)
- [Google Generative AI](https://ai.google.dev)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-api-endpoint`
2. Make changes and test thoroughly
3. Commit: `git commit -m 'Add new endpoint'`
4. Push: `git push origin feature/new-api-endpoint`
5. Create Pull Request

---

## 👨‍💻 Created by

**Ravi Raj Gupta** ❤️

---

<div align="center">

**[⬆ back to main README](../README.md)**

</div>
