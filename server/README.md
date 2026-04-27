# ⚙️ Backend - AI Thumbnail Generator

Production-ready Express.js backend for the AI Thumbnail Generator application. Built with **TypeScript**, **MongoDB**, and **Google Gemini AI** for robust, type-safe API services.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Controllers](#controllers)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Security](#security)
- [Environment Variables](#environment-variables)

## 🏗️ Project Structure

```
server/
├── configs/                        # Configuration files
│   ├── ai.ts                       # Google Gemini AI setup & initialization
│   └── mongodb.ts                  # MongoDB connection & setup
│
├── controllers/                    # Route controllers (business logic)
│   ├── authController.ts           # Authentication endpoints
│   │   ├── registerUser()          # User registration
│   │   ├── loginUser()             # User login
│   │   ├── logoutUser()            # User logout
│   │   └── verifyUser()            # Verify session
│   │
│   ├── thumbnailController.ts      # Thumbnail generation
│   │   ├── generateThumbnail()     # AI image generation with Gemini
│   │   └── deleteThumbnail()       # Delete thumbnail
│   │
│   └── userController.ts           # User data endpoints
│       ├── getUsersThumbail()      # Get all user thumbnails
│       └── getThumbnailById()      # Get specific thumbnail
│
├── models/                         # Mongoose data models
│   ├── User.ts                     # User schema & interface
│   └── Thumbnail.ts                # Thumbnail schema & interface
│
├── routes/                         # Route definitions
│   ├── authRoutes.ts               # Auth endpoints routing
│   ├── ThumbnailRoutes.ts          # Thumbnail endpoints routing
│   └── userRoutes.ts               # User data endpoints routing
│
├── middlewares/                    # Express middlewares
│   └── auth.ts                     # Authentication verification middleware
│
├── images/                         # Temporary image storage directory
│
├── server.ts                       # Express app entry point
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
└── README.md                       # This file
```

## 🛠️ Tech Stack

| Technology            | Version | Purpose               |
| --------------------- | ------- | --------------------- |
| **Node.js**           | 16+     | Runtime environment   |
| **Express**           | 5.x     | Web framework         |
| **TypeScript**        | 6.x     | Type-safe development |
| **MongoDB**           | Latest  | NoSQL database        |
| **Mongoose**          | 9.x     | MongoDB ODM           |
| **Google Gemini API** | 1.48.x  | AI image generation   |
| **Cloudinary**        | 2.x     | Cloud image storage   |
| **bcrypt**            | 6.x     | Password hashing      |
| **Express Session**   | 1.x     | Session management    |
| **Connect Mongo**     | 6.x     | MongoDB session store |
| **CORS**              | 2.x     | Cross-origin requests |
| **dotenv**            | 17.x    | Environment variables |
| **Nodemon**           | 3.x     | Dev auto-reload       |
| **tsx**               | 4.x     | TypeScript execution  |

## 🚀 Installation

### Prerequisites

- Node.js v16+ or higher
- npm or yarn
- MongoDB instance (local or cloud)
- Google Gemini API key
- Cloudinary account

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ai-thumbnail-generator

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here_change_in_production

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-image

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## ⚙️ Configuration

### MongoDB Connection (`configs/mongodb.ts`)

Handles MongoDB connection with:

- Connection pooling
- Error handling
- Reconnection logic
- Event listeners

### Google Gemini AI (`configs/ai.ts`)

Initializes Gemini AI client with:

- API key authentication
- Model configuration
- Safety settings

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm run server
```

Uses Nodemon to automatically restart on file changes.

### Production Mode

```bash
npm run start
```

Direct Node execution without auto-reload.

### Build TypeScript

```bash
npm run build
```

Compiles TypeScript to JavaScript.

The server will run on `http://localhost:3000` by default.

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Logout User

```
GET /api/auth/logout

Response:
{
  "message": "Logout successful"
}
```

#### Verify User Session

```
GET /api/auth/verify

Response 200:
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "isLoggedIn": true
}

Response 200 (not logged in):
{
  "user": null,
  "isLoggedIn": false
}
```

### Thumbnail Routes (`/api/thumbnail`)

#### Generate Thumbnail

```
POST /api/thumbnail/generate
Authorization: Required (session)
Content-Type: application/json

{
  "title": "My YouTube Video",
  "style": "Bold & Graphic",
  "aspect_ratio": "16:9",
  "color_scheme": "vibrant",
  "prompt": "Add a rocket launch effect",
  "text_overlay": true
}

Response 200:
{
  "message": "thumbnail generated successfully using Gemini",
  "thumbnail": {
    "_id": "thumbnail_id",
    "userId": "user_id",
    "title": "My YouTube Video",
    "style": "Bold & Graphic",
    "image_url": "https://cloudinary.com/...",
    "isGenerating": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Delete Thumbnail

```
DELETE /api/thumbnail/delete/:id
Authorization: Required (session)

Response:
{
  "message": "Thumbnail deleted successfully"
}
```

### User Routes (`/api/user`)

#### Get All User Thumbnails

```
GET /api/user/thumbnails
Authorization: Required (session)

Response 200:
{
  "thumbnail": [
    {
      "_id": "id1",
      "title": "Thumbnail 1",
      "image_url": "...",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

#### Get Specific Thumbnail

```
GET /api/user/thumbnails/:id
Authorization: Required (session)

Response 200:
{
  "thumbnail": {
    "_id": "thumbnail_id",
    "userId": "user_id",
    "title": "Thumbnail Title",
    "description": "...",
    "style": "Bold & Graphic",
    "aspect_ratio": "16:9",
    "color_scheme": "vibrant",
    "image_url": "https://...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Backward Compatible Endpoints

For backward compatibility, misspelled routes are also supported:

- `GET /api/user/thumnails` → `GET /api/user/thumbnails`
- `GET /api/user/thumnails/:id` → `GET /api/user/thumbnails/:id`

## 📦 Database Schema

### User Collection

```typescript
interface Iuser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  timestamps: true
}
```

**Indexes:**

- `email` (unique)

### Thumbnail Collection

```typescript
interface Ithumbnail extends Document {
  userId: string;
  title: string;
  description?: string;
  style: "Bold & Graphic" | "Tech/Futuristic" | "Minimalist" | "Photorealistic" | "Illustrated";
  aspect_ratio?: "16:9" | "1:1" | "9:16";
  color_scheme?: "vibrant" | "sunset" | "forest" | "neon" | "purple" | "monochrome" | "ocean" | "pastel";
  text_overlay?: boolean;
  image_url?: string;
  prompt_used?: string;
  user_prompt?: string;
  isGenerating?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

{
  userId: {
    type: String,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  style: {
    type: String,
    required: true,
    enum: ["Bold & Graphic", "Tech/Futuristic", "Minimalist", "Photorealistic", "Illustrated"]
  },
  aspect_ratio: {
    type: String,
    enum: ["16:9", "1:1", "9:16"]
  },
  color_scheme: {
    type: String,
    enum: ["vibrant", "sunset", "forest", "neon", "purple", "monochrome", "ocean", "pastel"]
  },
  text_overlay: {
    type: Boolean,
    default: false
  },
  image_url: {
    type: String,
    default: null
  },
  prompt_used: {
    type: String
  },
  user_prompt: {
    type: String
  },
  isGenerating: {
    type: Boolean,
    default: true
  }
}
```

**Indexes:**

- `userId` (for user lookups)
- `createdAt` (for sorting by date)

## 🎮 Controllers

### AuthController (`controllers/authController.ts`)

**Functions:**

- `registerUser()` - Create new user account
- `loginUser()` - Authenticate user
- `logoutUser()` - Destroy user session
- `verifyUser()` - Check if user is authenticated

**Features:**

- Password hashing with bcrypt (10 salt rounds)
- Email validation
- Session creation on successful login/register
- Password comparison for login

### ThumbnailController (`controllers/thumbnailController.ts`)

**Functions:**

- `generateThumbnail()` - Generate AI thumbnail with Gemini
- `deleteThumbnail()` - Remove thumbnail from database

**Features:**

- Constructs detailed prompts based on user inputs
- Calls Google Gemini API with safety settings
- Uploads generated image to Cloudinary
- Saves thumbnail metadata to MongoDB
- Handles temporary file cleanup

**Prompt Structure:**
Combines style, color scheme, and user preferences into a detailed image generation prompt for optimal results.

### UserController (`controllers/userController.ts`)

**Functions:**

- `getUsersThumbail()` - Retrieve all thumbnails for authenticated user
- `getThumbnailById()` - Get specific thumbnail with validation

**Features:**

- Session-based authorization
- ObjectId validation
- Sorted results (newest first)
- Ownership verification

## 🔒 Middleware

### Authentication Middleware (`middlewares/auth.ts`)

Protects routes that require user authentication.

**Features:**

- Checks session validity
- Verifies user ID presence
- Prevents unauthorized access
- Returns 401 for unauthorized requests

**Usage:**

```typescript
import protect from "../middlewares/auth.js";

router.get("/protected-route", protect, controllerFunction);
```

## 🚨 Error Handling

### Error Response Format

```json
{
   "message": "Error description"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found
- `500` - Server Error

## 🔐 Security Features

### Authentication

- ✅ Session-based authentication
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Session secrets for encryption
- ✅ 7-day session timeout

### API Security

- ✅ CORS configuration
- ✅ Protected routes with middleware
- ✅ Input validation
- ✅ Error message sanitization

### Database Security

- ✅ Mongoose schema validation
- ✅ Unique email constraint
- ✅ Password field not returned in queries
- ✅ User ID verification on operations

### Image Generation Safety

- ✅ Hate speech filtering (OFF - tunable)
- ✅ Dangerous content filtering (OFF - tunable)
- ✅ Sexually explicit content filtering (OFF - tunable)
- ✅ Harassment content filtering (OFF - tunable)

## 🌐 Environment Variables

| Variable                | Description               | Required                             |
| ----------------------- | ------------------------- | ------------------------------------ |
| `PORT`                  | Server port               | No (default: 3000)                   |
| `NODE_ENV`              | Environment               | Yes                                  |
| `MONGODB_URI`           | MongoDB connection string | Yes                                  |
| `SESSION_SECRET`        | Session encryption key    | Yes                                  |
| `GEMINI_API_KEY`        | Google Gemini API key     | Yes                                  |
| `GEMINI_MODEL`          | Gemini model name         | No (default: gemini-2.5-flash-image) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | Yes                                  |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | Yes                                  |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | Yes                                  |

## 📊 Session Management

### Session Configuration

- **Store**: Memory (development) / MongoDB (production)
- **Timeout**: 7 days
- **Cookie**: HttpOnly, Secure in production
- **Resave**: false
- **Save Uninitialized**: false

### Session Data

```typescript
interface SessionData {
   isloggedIn: boolean;
   userId: string;
}
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `SESSION_SECRET` to strong random string
- [ ] Enable MongoDB session store
- [ ] Set `cookie.secure=true` (HTTPS only)
- [ ] Configure CORS origins
- [ ] Use MongoDB Atlas or hosted MongoDB
- [ ] Store all secrets in environment variables
- [ ] Enable HTTPS
- [ ] Set up error logging
- [ ] Configure rate limiting

### Deployment Options

- **Heroku**
- **Railway**
- **Vercel**
- **AWS (EC2, Lambda)**
- **Google Cloud**
- **Azure**
- **DigitalOcean**

## 🐛 Troubleshooting

### MongoDB Connection Error

```
MongooseError: Cannot connect to MongoDB
```

**Solution**: Check `MONGODB_URI` in `.env` and ensure MongoDB is running.

### Gemini API Error

```
GEMINI_API_KEY is missing
```

**Solution**: Ensure `GEMINI_API_KEY` is set in `.env`.

### Session Store Error

```
⚠️  MongoDB session store error
```

**Solution**: Normal in development with memory store. Use MongoDB session store in production.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**: Change `PORT` in `.env` or kill the process using the port.

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

For frontend documentation, see [Client README](../client/README.md)
