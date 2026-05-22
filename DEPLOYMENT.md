# Deployment Guide for Vercel

## Setup Instructions

### 1. Environment Variables

Set these variables in your Vercel project settings (Settings → Environment Variables):

**Server (.env):**

```
PORT=3000
MONGODB_URI=your-mongodb-connection-string
SESSION_SECRET=your-secret-key
CLOUDINARY_URL=your-cloudinary-url
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-image
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Client (.env.production):**

```
VITE_BASE_URL=https://your-backend-url/api
```

### 2. Important Notes

- The `server.ts` file has been fixed to use proper `MongoStore` initialization with `new MongoStore()` instead of `.create()`
- Type annotations are properly set for strict TypeScript compilation in Vercel
- CORS is configured to accept requests from your Vercel frontend
- Secure cookies are automatically enabled in production

### 3. Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database user with a strong password
3. Whitelist your Vercel IP or use "Allow access from anywhere" for development
4. Copy the connection string to `MONGODB_URI`

### 4. API Keys

- Get Gemini API key from: https://aistudio.google.com/apikey
- Get Cloudinary credentials from: https://cloudinary.com/console

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set all environment variables in Project Settings
4. Deploy!

### 6. Testing

After deployment:

- Verify MongoDB connection is working
- Test authentication flow
- Test thumbnail generation with Gemini API
- Verify image uploads to Cloudinary
