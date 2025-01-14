import { Router } from "express";
import { NotificationController } from "../controller/notificationController";
import { authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

export const notificationRoute = Router();
const notificationController = new NotificationController();

notificationRoute.post("/", authMiddleware, notificationController.createNotificationForAll);

notificationRoute.get("/", adminMiddleware, notificationController.getNotifications);

notificationRoute.get("/:userId", authMiddleware, notificationController.getNotification);

notificationRoute.put("/read/:notificationId", authMiddleware, notificationController.markAsRead);

notificationRoute.delete("/:notificationId", authMiddleware, notificationController.deleteNotification);
