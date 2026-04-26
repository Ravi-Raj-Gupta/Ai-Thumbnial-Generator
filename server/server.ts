import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import authRouter from "./routes/authRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import userRouter from "./routes/userRoutes.js";



declare module "express-session" {
   interface SessionData {
      isloggedIn: boolean;
      userId: string
   }
}

// Initialize Express app first
const app = express();

// Basic middleware setup
app.use(cors({
   origin: ['http://localhost:5173', 'http://localhost:3000'],
   credentials: true
}))

app.use(express.json());

// Connect to DB with error handling (non-blocking)
connectDB().catch(err => {
   console.warn('⚠️  MongoDB connection failed during startup');
});

// Session configuration - use memory store for development
let sessionConfig: any = {
   secret: process.env.SESSION_SECRET as string,
   resave: false,
   saveUninitialized: false,
   cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,   // 7 days
      httpOnly: true,
      secure: false // Set to true in production with HTTPS
   },
};

// Only attempt MongoDB session store if MongoDB is available AND in production
if (process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
   try {
      sessionConfig.store = MongoStore.create({
         mongoUrl: process.env.MONGODB_URI,
         collectionName: "sessions",
         touchAfter: 24 * 3600,
      }).on('error', (err) => {
         console.warn('⚠️  MongoDB session store error:', err.message);
      });
   } catch (error) {
      console.warn('⚠️  MongoDB session store not available');
   }
}

app.use(session(sessionConfig))

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
   res.send('Server is Live!');
});

app.use('/api/auth', authRouter)
app.use('/api/thumbnail', ThumbnailRouter)
app.use('/api/user', userRouter)


app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});

// Handle uncaught errors to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
   console.error('⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
   console.error('⚠️  Uncaught Exception:', error);
   // Don't exit the process - keep the server running
});
