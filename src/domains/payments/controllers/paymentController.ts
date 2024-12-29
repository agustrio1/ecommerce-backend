import { Request, Response } from "express";
import { PaymentService } from "../services/PaymentService";

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createMidtransPayment(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(400).json({
          message: "User is not authenticated",
        });
      }
      const userId = req.user.id;

      const { orderId } = req.body;
      if (!orderId) {
        return res.status(400).json({
          message: "Order ID is required",
        });
      }

      const payment = await this.paymentService.createPayment(orderId, userId);
      res.status(200).json({
        message: "Payment initiated successfully",
        redirectUrl: payment.redirectUrl,
        token: payment.token,
      });
    } catch (error: any) {
      console.error("Error in createMidtransPayment:", error);
      res.status(500).json({
        message: "Failed to create payment",
        error: error.message,
      });
    }
  }

  async handleMidtransCallback(req: Request, res: Response) {
    try {
      await this.paymentService.handleCallback(req.body);
      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("Error in handleMidtransCallback:", error);
      res.status(500).json({
        message: "Failed to process payment callback",
        error: error.message,
      });
    }
  }
}
