import { Request, Response } from "express";
import { OrderService } from "../service/orderService";
import { CreateOrderDTO, UpdateOrderDTO } from "../types/orderType";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();

    // Bind methods to the correct context
    this.createOrder = this.createOrder.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.getAllOrders = this.getAllOrders.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.getOrdersByUserId = this.getOrdersByUserId.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
  }

  /**
   * Membuat order baru.
   * @param req - Request yang berisi data untuk membuat order.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: CreateOrderDTO = req.body;
      const createdOrder = await this.orderService.createOrder(orderData);
      res.status(201).json({
        code: 201,
        status: "success",
        message: "Order berhasil dibuat",
        data: createdOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Gagal membuat order",
        error: error.message,
      });
    }
  }

  /**
   * Memperbarui order.
   * @param req - Request yang berisi data untuk memperbarui order.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async updateOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderData: UpdateOrderDTO = req.body;
      const updatedOrder = await this.orderService.updateOrder(orderData);
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Order berhasil diperbarui",
        data: updatedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Gagal memperbarui order",
        error: error.message,
      });
    }
  }

  /**
   * Mendapatkan semua order.
   * @param req - Request untuk mengambil semua order.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Order berhasil diambil",
        data: orders,
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Gagal mengambil order",
        error: error.message,
      });
    }
  }

  /**
   * Mendapatkan order berdasarkan ID.
   * @param req - Request yang berisi ID order.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const order = await this.orderService.getOrderById(orderId);
      if (!order) {
        res.status(404).json({
          code: 404,
          status: "error",
          message: "Order tidak ditemukan",
        });
        return;
      }
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Order berhasil diambil",
        data: order,
      });
    } catch (error: any) {
      res.status(400).json({
        status: "error",
        message: "Gagal mengambil order",
        error: error.message,
      });
    }
  }

  /**
   * Mendapatkan order berdasarkan user ID.
   * @param req - Request yang berisi ID user.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async getOrdersByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const orders = await this.orderService.getOrdersByUserId(userId);
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Order berhasil diambil",
        data: orders,
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Gagal mengambil order",
        error: error.message,
      });
    }
  }

  /**
   * Menghapus order berdasarkan ID.
   * @param req - Request yang berisi ID order yang ingin dihapus.
   * @param res - Response untuk mengirimkan hasil atau error.
   */
  async deleteOrder(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.id;
      const deletedOrder = await this.orderService.deleteOrder(orderId);
      res.status(200).json({
        message: "Order berhasil dihapus",
        data: deletedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        message: "Gagal menghapus order",
        error: error.message,
      });
    }
  }
}
