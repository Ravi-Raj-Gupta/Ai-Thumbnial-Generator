# 🎨 Frontend - AI Thumbnail Generator

Modern React-based frontend for the AI Thumbnail Generator application. Built with **Vite**, **TypeScript**, and **Tailwind CSS** for a fast, type-safe, and responsive user experience.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Components Overview](#components-overview)
- [Pages Overview](#pages-overview)
- [Context & State Management](#context--state-management)
- [Routing](#routing)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── AspectRatioSelector.tsx  # Aspect ratio selection dropdown
│   │   ├── ColorSchemeSelector.tsx  # Color scheme selection component
│   │   ├── Footer.tsx               # Footer component
│   │   ├── LenisScroll.tsx          # Smooth scroll wrapper
│   │   ├── Login.tsx                # Login modal
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── PreviewPanel.tsx         # Image preview component
│   │   ├── SectionTitle.tsx         # Reusable section title
│   │   ├── Softbackdrop.tsx         # Blurred backdrop overlay
│   │   ├── StyleSelector.tsx        # Style selection component
│   │   ├── TestimonialCard.tsx      # Testimonial card component
│   │   └── TiltImage.tsx            # 3D tilt image effect
│   │
│   ├── context/
│   │   └── AuthContext.tsx          # Authentication context (user, login state)
│   │
│   ├── pages/                       # Full page components (Route targets)
│   │   ├── About.tsx                # About page
│   │   ├── ContactUs.tsx            # Contact page
│   │   ├── Generate.tsx             # Thumbnail generation page
│   │   ├── HomePage.tsx             # Landing page
│   │   ├── MyGeneration.tsx         # User's generation history
│   │   └── YtPreview.tsx            # YouTube preview mode
│   │
│   ├── sections/                    # Reusable page sections
│   │   ├── ContactSection.tsx       # Contact form section
│   │   ├── CTASection.tsx           # Call-to-action section
│   │   ├── FeaturesSection.tsx      # Features showcase
│   │   ├── HeroSection.tsx          # Hero section with tagline
│   │   ├── PricingSection.tsx       # Pricing table
│   │   └── TestimonialSection.tsx   # User testimonials carousel
│   │
│   ├── configs/
│   │   └── api.ts                   # Axios instance & API endpoints
│   │
│   ├── data/                        # Static data
│   │   ├── features.tsx             # Features data
│   │   ├── footer.ts                # Footer links & content
│   │   ├── navlinks.ts              # Navigation links
│   │   ├── pricing.ts               # Pricing plans data
│   │   └── testimonial.ts           # Testimonials data
│   │
│   ├── assets/                      # Static files
│   │   └── assets.ts                # Asset exports
│   │
│   ├── types.ts                     # TypeScript type definitions
│   ├── App.tsx                      # Main app component with routing
│   ├── main.tsx                     # React entry point
│   ├── globals.css                  # Global styles
│   │
│   └── index.html                   # HTML template
│
├── public/
│   └── assets/                      # Public static assets
│
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json                # App-specific TypeScript config
├── tsconfig.node.json               # Node TypeScript config
├── vite.config.ts                   # Vite configuration
├── eslint.config.js                 # ESLint rules
├── package.json                     # Dependencies & scripts
└── README.md                        # This file
```

## 🛠️ Tech Stack

| Technology             | Version | Purpose                 |
| ---------------------- | ------- | ----------------------- |
| **React**              | 19.x    | UI library              |
| **React Router**       | 7.x     | Client-side routing     |
| **TypeScript**         | Latest  | Type safety             |
| **Vite**               | 7.x     | Build tool & dev server |
| **Tailwind CSS**       | 4.x     | Utility-first styling   |
| **Axios**              | 1.x     | HTTP client             |
| **Motion**             | 12.x    | Animation library       |
| **Lucide React**       | Latest  | Icon library            |
| **React Hot Toast**    | 2.x     | Toast notifications     |
| **Lenis**              | 1.x     | Smooth scroll           |
| **React Fast Marquee** | 1.x     | Scrolling text          |
| **ESLint**             | 9.x     | Code linting            |

## 🚀 Installation

### Prerequisites

- Node.js v16+ or higher
- npm or yarn

### Step 1: Install Dependencies

```bash
cd client
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🎯 Getting Started

### Development Mode

Start the Vite dev server with hot module replacement:

```bash
npm run dev
```

The app will run on `http://localhost:5173` (usually)

### Run Linter

Check code quality and find issues:

```bash
npm run lint
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production (optimized)
npm run lint         # Run ESLint to check code quality
npm run preview      # Preview production build locally

# Other
npm install          # Install dependencies
npm update           # Update dependencies
npm run format       # Format code (if configured)
```

## 🧩 Components Overview

### Layout Components

#### **Navbar**

Navigation bar with:

- Logo/branding
- Navigation links
- Auth status indicator
- Responsive mobile menu

#### **Footer**

Footer with:

- Social links
- Navigation links
- Copyright info
- Company info

#### **LenisScroll**

Wrapper component that enables smooth scrolling experience using Lenis library.

#### **Softbackdrop**

Blurred backdrop overlay for modal-like effects.

### Form & Input Components

#### **Login**

Modal/overlay for user authentication:

- Email & password inputs
- Sign in / Sign up toggle
- Password visibility toggle
- Form validation

#### **AspectRatioSelector**

Dropdown selector for thumbnail aspect ratios:

- 16:9 (widescreen)
- 1:1 (square)
- 9:16 (portrait)

#### **ColorSchemeSelector**

Color scheme selection component with 8 options:

- Vibrant, Sunset, Forest, Neon
- Purple, Monochrome, Ocean, Pastel

#### **StyleSelector**

Thumbnail style selection with 5 options:

- Bold & Graphic
- Tech/Futuristic
- Minimalist
- Photorealistic
- Illustrated

### Display Components

#### **PreviewPanel**

Displays generated thumbnail with:

- Image preview
- Download/share buttons
- Metadata display

#### **SectionTitle**

Reusable section heading component with styling.

#### **TestimonialCard**

Card component for displaying user testimonials.

#### **TiltImage**

Image component with 3D tilt effect on hover.

## 📄 Pages Overview

### **HomePage** (`/`)

- Landing page
- Features section
- Pricing section
- Testimonials section
- CTA section

### **Generate** (`/generate` & `/generate/:id`)

- Main thumbnail generation interface
- Form inputs:
   - Title input
   - Style selector
   - Color scheme selector
   - Aspect ratio selector
   - Custom prompt (optional)
   - Text overlay toggle
- Real-time generation status
- Generated image preview
- Download/save functionality

### **MyGeneration** (`/my-generation`)

- User's thumbnail history
- Thumbnail cards with:
   - Preview image
   - Title & metadata
   - Edit/regenerate options
   - Delete option
- Pagination/infinite scroll

### **YtPreview** (`/preview`)

- YouTube-style preview mode
- Full-screen thumbnail view
- Video-player-like controls

### **About** (`/about`)

- About the application
- Team information
- Mission statement

### **ContactUs** (`/contact`)

- Contact form
- Support information
- Social links

## 🔄 Context & State Management

### **AuthContext**

Global authentication context managing:

- Current user information
- Login/logout state
- User session
- Auth operations

**Usage:**

```typescript
import { useContext } from "react";
import AuthContext from "./context/AuthContext";

const { user, isLoggedIn, login, logout } = useContext(AuthContext);
```

## 🛣️ Routing

Application uses React Router v7 with the following routes:

| Path             | Component    | Protected |
| ---------------- | ------------ | --------- |
| `/`              | HomePage     | ❌        |
| `/about`         | About        | ❌        |
| `/contact`       | ContactUs    | ❌        |
| `/login`         | Login        | ❌        |
| `/generate`      | Generate     | ✅        |
| `/generate/:id`  | Generate     | ✅        |
| `/my-generation` | MyGeneration | ✅        |
| `/preview`       | YtPreview    | ❌        |

Protected routes require user authentication.

## 🌐 API Integration

### **API Configuration** (`configs/api.ts`)

Axios instance configured with:

- Base URL from environment variable
- Request/response interceptors
- Error handling
- Default timeout

### **API Endpoints Called**

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify session
- `GET /auth/logout` - User logout
- `POST /thumbnail/generate` - Generate thumbnail
- `GET /user/thumbnails` - Get user's thumbnails
- `GET /user/thumbnails/:id` - Get specific thumbnail
- `DELETE /thumbnail/delete/:id` - Delete thumbnail

## 🔐 Environment Variables

Create `.env` file with:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3000/api
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 🏗️ Building for Production

### Build Process

```bash
npm run build
```

This creates an optimized `dist` folder with:

- Minified JavaScript
- Optimized CSS
- Bundled assets
- HTML output

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── ...
```

### Deployment

After building, deploy the `dist` folder to any static hosting:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web server

### Preview Build

```bash
npm run preview
```

This runs the production build locally for testing.

## 🎨 Styling

### **Tailwind CSS**

Utility-first CSS framework configured with:

- Custom colors & themes
- Responsive breakpoints
- Dark mode support (if configured)

### **Global Styles** (`globals.css`)

- CSS variables
- Base styles
- Custom utilities
- Font imports

## 📱 Responsive Design

Breakpoints follow Tailwind standards:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## ⚡ Performance Optimization

- Code splitting with Vite
- Image lazy loading
- CSS purging
- Tree shaking
- Minification

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is in use:

```bash
npm run dev -- --port 3001
```

### CORS Errors

Ensure backend is running on `http://localhost:3000` or update `VITE_API_BASE_URL` in `.env`

### Module Not Found

Clear `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

For backend documentation, see [Server README](../server/README.md)
