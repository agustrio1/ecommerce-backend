import { Router } from "express";
import { WishlistController } from "../controller/wishlistController";
import {authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

export const wishlistRouter = Router();
const wishlistController = new WishlistController();

wishlistRouter.get("/", adminMiddleware, wishlistController.getAllWishlists);
wishlistRouter.post("/", authMiddleware, wishlistController.createWishlist);
wishlistRouter.get("/:id", wishlistController.getWishlistById);
wishlistRouter.get("/user/:userId", authMiddleware, wishlistController.getWishlistByUserId);
wishlistRouter.delete("/:id", authMiddleware, wishlistController.deleteWishlistById);