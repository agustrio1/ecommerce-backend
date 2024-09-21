import { Router } from "express";
import { AuthController } from "../controllers/authController";

export const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", authController.register);

authRouter.post("/login", authController.login);

authRouter.post("/forgot-password", authController.forgotPassword);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.post("/logout", authController.logout);
