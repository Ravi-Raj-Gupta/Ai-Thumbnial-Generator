import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import session from "express-session";

declare module "express-session" {
   interface SessionData {
      isLoggedIn: boolean;
      userId: string;
   }
}

(async () => {
   await connectDB();
})();

const app = express();

// Trust proxy is required for secure cookies to work on Render/Vercel
app.set("trust proxy", 1);

const allowedOrigins = [
   "http://localhost:5173",
   "http://localhost:3000",
   process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
   cors({
      origin: allowedOrigins,
      credentials: true,
   }),
);
import MongoStore from "connect-mongo";

const isProduction = process.env.NODE_ENV === "production";

app.use(
   session({
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
         secure: isProduction,
         sameSite: isProduction ? "none" : "lax",
      },
      store: MongoStore.create({
         mongoUrl: process.env.MONGODB_URI as string,
         collectionName: "sessions",
      }),
   }),
);

import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
   res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});
