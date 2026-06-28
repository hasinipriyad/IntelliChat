import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  // Accept token from Authorization header (Bearer) or cookie fallback
  const authHeader = req.headers.authorization;
  const token =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT Secret is not defined in the environment variables");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Invalid token." });
  }
}
