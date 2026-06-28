import { Request, Response } from "express";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * @name Register
 * @desc Registers a new user in the system.
 * @access Public
 */
export async function registerUserController(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const isUserAlreadyExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name Login
 * @desc Authenticates a user and returns a JWT token.
 * @access Public
 */
export async function loginUserController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    //Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    //Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret is not defined in the environment variables");
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT Refresh Secret is not defined in the environment variables",
      );
    }

    //Create an access token
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    //Create a refresh token (JWT) for the user
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    user.refreshToken = refreshToken;
    await user.save();

    //Set the access token in a HTTP-only cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set the refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // If login is successful, return user data
    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name RefreshToken
 * @desc Refreshes the JWT token for an authenticated user.
 * @access Public
 */
export async function refreshTokenController(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found." });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT Secret is not defined in the environment variables");
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error(
        "JWT Refresh Secret is not defined in the environment variables",
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    ) as { userId: string };

    // Check the token actually matches what's stored
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token revoked." });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" },
    );

    // Set the new access token in an HTTP-only cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({ message: "Access token refreshed." });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token." });
  }
}

/**
 * @name GetMe
 * @desc Retrieves the authenticated user's information.
 * @access Private
 */
export async function getMeController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -refreshToken"); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * @name Logout
 * @desc Logs out the user and invalidates the JWT token.
 * @access Private
 */
export async function logoutUserController(req: Request, res: Response) {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(400).json({ message: "Refresh token not found." });
    }

    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null },
    );

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({ message: "Logged out." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
