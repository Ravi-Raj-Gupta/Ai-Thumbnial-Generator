# 🎬 AI Thumbnail Generator

A full-stack web application that leverages **Google Gemini AI** to generate professional YouTube-style thumbnails. Users can sign up, authenticate, customize thumbnail styles and color schemes, generate high-quality images, and manage their generation history all in one place.

## ✨ Features

### User Management

- 🔐 Secure user authentication with session-based login
- 📝 User registration with password encryption (bcrypt)
- ✔️ Email-based login verification
- 👤 User profile management
- 🚪 Secure logout with session destruction

### Thumbnail Generation

- 🤖 AI-powered thumbnail generation using Google Gemini API
- 🎨 Multiple style options (Bold & Graphic, Tech/Futuristic, Minimalist, Photorealistic, Illustrated)
- 🌈 8 color scheme presets (vibrant, sunset, forest, neon, purple, monochrome, ocean, pastel)
- 📐 Customizable aspect ratios (16:9, 1:1, 9:16)
- ✍️ Custom text overlay option
- 💾 Automatic cloud storage with Cloudinary
- 📊 Generation history tracking

### User Experience

- 📱 Fully responsive design with Tailwind CSS
- ⚡ Smooth animations and transitions (Motion library)
- 🎯 Smooth scroll experience with Lenis
- 🔔 Toast notifications for user feedback
- 🎨 Interactive UI components with Lucide React icons
- 👁️ Real-time preview of generated thumbnails

## 🏗️ Project Structure

```
AI Thumbnail Generator/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── AspectRatioSelector.tsx
│   │   │   ├── ColorSchemeSelector.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LenisScroll.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── SectionTitle.tsx
│   │   │   ├── Softbackdrop.tsx
│   │   │   ├── StyleSelector.tsx
│   │   │   ├── TestimonialCard.tsx
│   │   │   └── TiltImage.tsx
│   │   ├── context/                 # React Context for state management
│   │   │   └── AuthContext.tsx
│   │   ├── pages/                   # Page components
│   │   │   ├── About.tsx
│   │   │   ├── ContactUs.tsx
│   │   │   ├── Generate.tsx         # Main thumbnail generation page
│   │   │   ├── HomePage.tsx
│   │   │   ├── MyGeneration.tsx     # User's generation history
│   │   │   └── YtPreview.tsx
│   │   ├── sections/                # Reusable page sections
│   │   │   ├── ContactSection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   └── TestimonialSection.tsx
│   │   ├── configs/                 # Configuration files
│   │   │   └── api.ts               # API endpoint configuration
│   │   ├── data/                    # Static data
│   │   │   ├── features.tsx
│   │   │   ├── footer.ts
│   │   │   ├── navlinks.ts
│   │   │   ├── pricing.ts
│   │   │   └── testimonial.ts
│   │   ├── assets/                  # Static assets
│   │   ├── App.tsx                  # Main App component with routing
│   │   ├── main.tsx                 # React entry point
│   │   ├── types.ts                 # TypeScript type definitions
│   │   └── globals.css              # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── package.json
│
├── server/                          # Express backend application
│   ├── controllers/                 # Route controllers/business logic
│   │   ├── authController.ts        # Authentication logic
│   │   ├── thumbnailController.ts   # Thumbnail generation logic
│   │   └── userController.ts        # User data retrieval
│   ├── models/                      # Mongoose database schemas
│   │   ├── User.ts                  # User schema & interface
│   │   └── Thumbnail.ts             # Thumbnail schema & interface
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.ts            # Auth endpoints
│   │   ├── ThumbnailRoutes.ts       # Thumbnail endpoints
│   │   └── userRoutes.ts            # User data endpoints
│   ├── middlewares/                 # Express middlewares
│   │   └── auth.ts                  # Authentication middleware
│   ├── configs/                     # Configuration files
│   │   ├── ai.ts                    # Google Gemini AI setup
│   │   └── mongodb.ts               # MongoDB connection
│   ├── images/                      # Temporary image storage
│   ├── server.ts                    # Express app entry point
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                        # Project documentation
```

## 🛠️ Tech Stack

### Frontend

| Technology             | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| **React 19**           | UI library & component framework         |
| **TypeScript**         | Type-safe JavaScript development         |
| **Vite**               | Lightning-fast build tool & dev server   |
| **Tailwind CSS**       | Utility-first CSS framework              |
| **React Router**       | Client-side routing                      |
| **Axios**              | HTTP client for API calls                |
| **Motion**             | Animation library for smooth transitions |
| **Lucide React**       | Icon library                             |
| **React Hot Toast**    | Toast notification system                |
| **Lenis**              | Smooth scroll library                    |
| **React Fast Marquee** | Scrolling text component                 |
| **ESLint**             | Code quality & linting                   |

### Backend

| Technology            | Purpose                             |
| --------------------- | ----------------------------------- |
| **Node.js**           | JavaScript runtime                  |
| **Express 5**         | Web framework & API server          |
| **TypeScript**        | Type-safe backend development       |
| **MongoDB**           | NoSQL database for data persistence |
| **Mongoose**          | ODM for MongoDB schema validation   |
| **Google Gemini API** | AI image generation engine          |
| **Cloudinary**        | Cloud image storage & delivery      |
| **bcrypt**            | Password hashing & encryption       |
| **Express Session**   | Session management                  |
| **Connect Mongo**     | MongoDB session store               |
| **CORS**              | Cross-Origin Resource Sharing       |
| **dotenv**            | Environment variable management     |

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** database (local or cloud)
- **Google Gemini API Key**
- **Cloudinary Account** (for image storage)

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd "AI Thumbnail Generator"
```

#### 2. Setup Backend Server

```bash
cd server
npm install
```

Create `.env` file in the `server` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ai-thumbnail-generator
SESSION_SECRET=your_session_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-image
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Start the server:

```bash
npm run server
```

#### 3. Setup Frontend Application

```bash
cd ../client
npm install
```

Create `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /logout` - Logout user
- `GET /verify` - Verify current user session

### Thumbnail Routes (`/api/thumbnail`)

- `POST /generate` - Generate new thumbnail using Gemini AI
- `DELETE /delete/:id` - Delete a specific thumbnail

### User Routes (`/api/user`)

- `GET /thumbnails` - Get all user's thumbnails
- `GET /thumbnails/:id` - Get specific thumbnail details

## 🔐 Security Features

- ✅ Password encryption with bcrypt
- ✅ Session-based authentication
- ✅ Protected API routes with authentication middleware
- ✅ CORS configuration for frontend-backend communication
- ✅ Session timeout (7 days)
- ✅ HttpOnly cookies for session security

## 📦 Database Schema

### User Collection

```typescript
{
   _id: ObjectId;
   name: string;
   email: string(unique);
   password: string(hashed);
   createdAt: Date;
   updatedAt: Date;
}
```

### Thumbnail Collection

```typescript
{
  _id: ObjectId
  userId: string (reference to User)
  title: string
  description?: string
  style: "Bold & Graphic" | "Tech/Futuristic" | "Minimalist" | "Photorealistic" | "Illustrated"
  aspect_ratio?: "16:9" | "1:1" | "9:16"
  color_scheme?: "vibrant" | "sunset" | "forest" | "neon" | "purple" | "monochrome" | "ocean" | "pastel"
  text_overlay?: boolean
  image_url?: string
  prompt_used?: string
  user_prompt?: string
  isGenerating?: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🎯 Available Scripts

### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend

```bash
npm run server   # Start server with auto-reload (nodemon)
npm run start    # Start server (production)
npm run build    # Compile TypeScript to JavaScript
```

## 🌐 Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret key for session encryption
- `GEMINI_API_KEY` - Google Gemini API key
- `GEMINI_MODEL` - Gemini model to use (default: gemini-2.5-flash-image)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API base URL

## 🤝 How It Works

1. **User Registration/Login** → Creates session & stores user data in MongoDB
2. **Generate Thumbnail** → User inputs title, selects style & color scheme
3. **AI Processing** → Gemini API generates image based on provided parameters
4. **Cloud Upload** → Generated image uploaded to Cloudinary
5. **Database Storage** → Thumbnail metadata saved in MongoDB
6. **History Access** → User can view, preview, and delete past generations

## 📄 License

This project is open source and available under the ISC License.

## 👨‍💻 Author

Created with ❤️ by **Ravi**

---

For more details, see [Client README](./client/README.md) and [Server README](./server/README.md)

## API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify
POST /api/auth/logout
```

### Thumbnails

```text
POST   /api/thumbnail/generate
DELETE /api/thumbnail/delete/:id
```

### User

```text
GET /api/user/thumbnails
GET /api/user/thumbnails/:id
```

## How Thumbnail Generation Works

1. User enters a title and selects thumbnail options.
2. Backend builds a detailed prompt from the selected style, aspect ratio, color scheme, and extra prompt text.
3. Gemini generates the image.
4. Backend stores the generated image temporarily.
5. Image is uploaded to Cloudinary.
6. Cloudinary image URL is saved in MongoDB.
7. Frontend displays the generated thumbnail.

## Important Notes

- Do not commit your real `.env` file.
- Keep `GEMINI_API_KEY`, `MONGODB_URI`, `SESSION_SECRET`, and `CLOUDINARY_URL` private.
- The backend uses in-memory sessions in development.
- In production, MongoDB session storage is enabled when `NODE_ENV=production`.
- Gemini image generation requires a valid Gemini API key and supported region/account access.

## Troubleshooting

**Backend is not running**

Make sure you are inside the `server` folder and run:

```bash
npm start
```

**Frontend cannot connect to backend**

Check that backend is running on port `3000`, then verify:

```env
VITE_BASE_URL=http://localhost:3000
```

**Gemini API key missing**

Add this to `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

**MongoDB connection issue**

Check your MongoDB connection string:

```env
MONGODB_URI=your_mongodb_connection_string
```

**Cloudinary upload issue**

Check your Cloudinary URL:

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

## License

This project is for learning and portfolio use. Add a license file if you plan to publish or distribute it.
