import { Router } from "express";
import { PaymentController } from "../controllers/paymentController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

export const PaymentRouter = Router();
const paymentController = new PaymentController();

PaymentRouter.post(
  "/midtrans",
  authMiddleware,
  paymentController.createMidtransPayment.bind(paymentController)
);
PaymentRouter.post(
  "/midtrans/callback",
  paymentController.handleMidtransCallback.bind(paymentController)
);
