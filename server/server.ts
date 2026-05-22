import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import connectDB from "./configs/mongodb.js";
import session, { SessionOptions } from "express-session";
import ConnectMongo from "connect-mongo";
import authRouter from "./routes/authRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import userRouter from "./routes/userRoutes.js";

// Type-safe MongoStore constructor
const MongoStore = ConnectMongo;

declare module "express-session" {
   interface SessionData {
      isloggedIn: boolean;
      userId: string;
   }
}

const app = express();

const corsOrigins =
   process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL || "https://your-frontend.vercel.app"]
      : ["http://localhost:5173", "http://localhost:3000"];

app.use(
   cors({
      origin: corsOrigins,
      credentials: true,
   }),
);

app.use(express.json());

connectDB().catch((err) => {
   console.warn("⚠️  MongoDB connection failed during startup");
});

let sessionConfig: SessionOptions = {
   secret: process.env.SESSION_SECRET as string,
   resave: false,
   saveUninitialized: false,
   cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
   },
};

// Add MongoStore if in production and MongoDB URI is available
if (process.env.NODE_ENV === "production" && process.env.MONGODB_URI) {
   try {
      sessionConfig.store = new MongoStore({
         mongoUrl: process.env.MONGODB_URI,
         collectionName: "sessions",
         touchAfter: 24 * 3600,
      });
   } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.warn("⚠️  MongoDB session store error:", err.message);
   }
}

app.use(session(sessionConfig));

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
   res.send("Server is Live!");
});

app.use("/api/auth", authRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
   console.error("⚠️  Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
   console.error("⚠️  Uncaught Exception:", error);
});
