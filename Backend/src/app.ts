import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRouter from "./routes/authRouter.js";
import chatRouter from "./routes/chatRouter.js";

const app = express();

// Render sits behind a proxy — required for secure cookies to be set
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL].filter(
  Boolean,
) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// General rate limiter — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Stricter limiter for auth endpoints — 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth requests, please try again later." },
});

app.use(generalLimiter);

// Authentication routes
app.use("/api/auth", authLimiter, authRouter);

// Chat routes
app.use("/api/chats", chatRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler — catches errors thrown in route handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error." });
});

export default app;
