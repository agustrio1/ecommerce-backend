import { Router } from "express";
import { OrderController } from "../controller/orderController";
import { authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

export const OrderRouter = Router();
const orderController = new OrderController();

OrderRouter.post("/", authMiddleware, orderController.createOrder);
OrderRouter.put("/:id", authMiddleware, orderController.updateOrder);
OrderRouter.get("/", adminMiddleware, adminMiddleware,  orderController.getAllOrders);
OrderRouter.get("/:id", orderController.getOrderById);
OrderRouter.get("/user/:userId", authMiddleware, orderController.getOrdersByUserId);
OrderRouter.delete("/:id", authMiddleware, orderController.deleteOrder);