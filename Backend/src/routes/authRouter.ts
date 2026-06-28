import express from "express";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  validate,
  registerValidator,
  loginValidator,
} from "../utils/validator.js";

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post(
  "/register",
  validate(registerValidator),
  authController.registerUserController,
);

// POST /api/auth/login
authRouter.post(
  "/login",
  validate(loginValidator),
  authController.loginUserController,
);

// POST /api/auth/refresh-token
authRouter.post("/refresh-token", authController.refreshTokenController);

// GET /api/auth/get-me
authRouter.get("/get-me", authMiddleware, authController.getMeController);

// POST /api/auth/logout
authRouter.post("/logout", authController.logoutUserController);

export default authRouter;
