# 🎨 Frontend - AI Thumbnail Generator

Blazing-fast, modern React frontend for AI Thumbnail Generator. Built with **Vite**, **TypeScript**, and **Tailwind CSS** v4 for optimal performance and developer experience.

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

## 📋 Quick Navigation

- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🧩 Components](#-components)
- [📄 Pages](#-pages)
- [🔗 State Management](#-state-management)
- [🎨 Styling](#-styling)
- [🛠️ Development](#-development)
- [📦 Build & Deploy](#-build--deploy)

## 📁 Project Structure

```
client/
├── src/
│   ├── 🎨 components/              # Reusable UI components
│   │   ├── AspectRatioSelector.tsx # Aspect ratio dropdown
│   │   ├── ColorSchemeSelector.tsx # Color palette picker
│   │   ├── StyleSelector.tsx       # Style options selector
│   │   ├── PreviewPanel.tsx        # Live thumbnail preview
│   │   ├── Navbar.tsx              # Navigation header
│   │   ├── Footer.tsx              # Footer section
│   │   ├── SectionTitle.tsx        # Section heading
│   │   ├── TestimonialCard.tsx     # Testimonial display
│   │   ├── Softbackdrop.tsx        # Modal backdrop
│   │   ├── Login.tsx               # Auth modal
│   │   ├── LenisScroll.tsx         # Smooth scroll wrapper
│   │   └── TiltImage.tsx           # 3D tilt effect
│   │
│   ├── 📄 pages/                   # Route pages
│   │   ├── HomePage.tsx            # Landing page
│   │   ├── Generate.tsx            # Thumbnail generation
│   │   ├── MyGeneration.tsx        # User's thumbnails
│   │   ├── YtPreview.tsx           # YouTube preview
│   │   ├── About.tsx               # About page
│   │   └── ContactUs.tsx           # Contact page
│   │
│   ├── 🏗️ sections/                # Page sections
│   │   ├── HeroSection.tsx         # Hero banner
│   │   ├── FeaturesSection.tsx     # Features showcase
│   │   ├── PricingSection.tsx      # Pricing plans
│   │   ├── TestimonialSection.tsx  # Testimonials
│   │   ├── CTASection.tsx          # Call-to-action
│   │   └── ContactSection.tsx      # Contact form
│   │
│   ├── 🔗 context/
│   │   └── AuthContext.tsx         # Authentication state
│   │
│   ├── ⚙️ configs/
│   │   └── api.ts                  # Axios instance
│   │
│   ├── 📊 data/                    # Static data
│   │   ├── features.tsx            # Features data
│   │   ├── navlinks.ts             # Navigation links
│   │   ├── pricing.ts              # Pricing plans
│   │   ├── testimonial.ts          # Testimonials
│   │   └── footer.ts               # Footer data
│   │
│   ├── 🎭 assets/
│   │   ├── assets.ts               # Styles, colors, ratios
│   │   └── prompts-for-backend.txt # AI prompts reference
│   │
│   ├── types.ts                    # TypeScript types
│   ├── App.tsx                     # Main component & router
│   ├── main.tsx                    # React entry point
│   ├── globals.css                 # Global styles
│   └── index.html                  # HTML template
│
├── public/
│   └── assets/                     # Static assets
│
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Technology          | Version  | Purpose        |
| ------------------- | -------- | -------------- |
| **React**           | 19.1.0   | UI library     |
| **React Router**    | 7.8.2    | Client routing |
| **TypeScript**      | 5.0+     | Type safety    |
| **Vite**            | 7        | Build tool     |
| **Tailwind CSS**    | 4        | Styling        |
| **Axios**           | 1.14.0   | HTTP client    |
| **Motion**          | 12.23.12 | Animations     |
| **Lucide React**    | 0.542.0  | Icons          |
| **React Hot Toast** | 2.6.0    | Notifications  |
| **Lenis**           | 1.3.11   | Smooth scroll  |

---

## 🚀 Quick Start

### Prerequisites

```
✅ Node.js v18+
✅ npm or yarn
✅ Backend running on http://localhost:5000
```

### Installation & Setup

```bash
# Install dependencies
cd client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

Open http://localhost:5173 🎉

---

## 🧩 Components

### Layout Components

#### Navbar

Navigation header with:

- Logo/branding
- Navigation menu
- Auth indicator
- Mobile responsive

#### Footer

Footer section with:

- Links & company info
- Social media
- Copyright

#### Softbackdrop

Modal backdrop with blur effect.

#### LenisScroll

Smooth scrolling wrapper using Lenis library.

### Selection Components

#### AspectRatioSelector

Dropdown for aspect ratios:

- 16:9 (1280x720)
- 4:3 (1024x768)
- 1:1 (512x512)

```tsx
<AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
```

#### ColorSchemeSelector

Color palette picker with 8 schemes:

- Vibrant, Sunset, Forest, Neon
- Purple, Monochrome, Ocean, Pastel

```tsx
<ColorSchemeSelector selected={colorSchemeId} onSelect={setColorSchemeId} />
```

#### StyleSelector

Thumbnail style dropdown:

- Bold & Graphic
- Tech/Futuristic
- Minimalist
- Photorealistic
- Illustrated

```tsx
<StyleSelector value={style} onChange={setStyle} />
```

### Display Components

#### PreviewPanel

Live thumbnail preview with:

- Image display
- Metadata
- Download button

#### TestimonialCard

Testimonial card component

#### TiltImage

Image with 3D tilt on hover

---

## 📄 Pages

### 🏠 Home (`/`)

Landing page with:

- Hero section
- Features showcase
- Testimonials
- Pricing plans
- CTA section

### 🎨 Generate (`/generate`)

Main thumbnail generator:

- Title & details input
- Style selector
- Color scheme picker
- Aspect ratio selector
- Live preview
- Generate button

### 📚 My Generations (`/my-generation`)

User's thumbnails gallery:

- Thumbnail cards
- View/Download options
- Delete functionality
- Creation dates

### 📺 YT Preview (`/yt-preview/:id`)

YouTube preview mode:

- Video mockup
- Thumbnail preview
- Download button

### About & Contact

Information and contact pages

---

## 🔗 State Management

### AuthContext

Global authentication state:

```tsx
const { isLoggedIn, user, login, logout, register } = useAuth();
```

Manages:

- User login/logout
- Registration
- Session verification
- User data

---

## 🎨 Styling

### Tailwind CSS v4

- Utility-first framework
- JIT compilation
- Custom responsive design
- Built-in dark mode support

### Responsive Breakpoints

```
sm: 640px   | md: 768px
lg: 1024px  | xl: 1280px
2xl: 1536px
```

---

## 📝 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview build locally
npm run lint     # ESLint check
```

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

Creates optimized `dist/` folder

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy 🚀

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

---

## ⚡ Performance

- Bundle size: ~500KB (gzipped)
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Lighthouse Score: 90+
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

---

## 🐛 Troubleshooting

### Port 5173 Already in Use

```bash
npm run dev -- --port 3001
```

### API Connection Error

- ✅ Verify backend is running on http://localhost:5000
- ✅ Check `VITE_API_URL` in `.env`
- ✅ Ensure backend CORS is configured correctly

### Build Fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Hot Reload Not Working

- ✅ Restart dev server
- ✅ Check Node version (v18+)
- ✅ Clear browser cache

---

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes and test
3. Commit and push
4. Create Pull Request

---

## 👨‍💻 Created by

**Ravi Raj Gupta** ❤️

---

<div align="center">

**[⬆ back to main README](../README.md)**

</div>

### Module Not Found

Clear `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

For backend documentation, see [Server README](../server/README.md)
