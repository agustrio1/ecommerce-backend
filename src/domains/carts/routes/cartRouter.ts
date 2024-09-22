import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

export const CartRouter = Router();
const cartController = new CartController();

CartRouter.post("/", authMiddleware, cartController.createOrUpdateCart);
CartRouter.put("/:id", authMiddleware, cartController.updateCart);
CartRouter.get("/:userId", authMiddleware, cartController.getCartByUserId);
CartRouter.get("/", authMiddleware, cartController.getAllCarts);
CartRouter.delete("/:id", authMiddleware, cartController.deleteCart);