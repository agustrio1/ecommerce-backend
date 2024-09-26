import { Request, Response } from "express";
import { ShippingService } from "../services/shippingService";
import { CreateShipmentDTO, UpdateShipmentDTO } from "../types/shippingType";

const shippingService = new ShippingService();

export class ShippingController {
  /**
   * Membuat pengiriman baru.
   *
   * @param {Request} req - Request dari client, berisi data pengiriman.
   * @param {Response} res - Response untuk dikirimkan kembali ke client.
   */
  async createShipment(req: Request, res: Response): Promise<Response> {
    try {
      const shipmentData: CreateShipmentDTO = req.body;
      const createdShipment = await shippingService.createShipment(shipmentData);
      return res.status(201).json({
        message: "Pengiriman berhasil dibuat",
        data: createdShipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  /**
   * Memperbarui pengiriman berdasarkan ID.
   *
   * @param {Request} req - Request dari client, berisi ID pengiriman dan data yang diupdate.
   * @param {Response} res - Response untuk dikirimkan kembali ke client.
   */
  async updateShipment(req: Request, res: Response): Promise<Response> {
    try {
      const shipmentData: UpdateShipmentDTO = {
        id: req.params.id,
        ...req.body,
      };
      const updatedShipment = await shippingService.updateShipment(shipmentData);
      return res.status(200).json({
        message: "Pengiriman berhasil diperbarui",
        data: updatedShipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  /**
   * Mendapatkan semua pengiriman.
   *
   * @param {Request} req - Request dari client.
   * @param {Response} res - Response untuk dikirimkan kembali ke client.
   */
  async getAllShipments(req: Request, res: Response): Promise<Response> {
    try {
      const shipments = await shippingService.getAllShipments();
      return res.status(200).json({
        message: "Daftar pengiriman berhasil diambil",
        data: shipments,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  /**
   * Mendapatkan detail pengiriman berdasarkan ID.
   *
   * @param {Request} req - Request dari client, berisi ID pengiriman.
   * @param {Response} res - Response untuk dikirimkan kembali ke client.
   */
  async getShipmentById(req: Request, res: Response): Promise<Response> {
    try {
      const shipment = await shippingService.getShipmentById(req.params.id);
      if (!shipment) {
        return res.status(404).json({
          message: "Pengiriman tidak ditemukan",
        });
      }
      return res.status(200).json({
        message: "Detail pengiriman berhasil diambil",
        data: shipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  /**
   * Menghapus pengiriman berdasarkan ID.
   *
   * @param {Request} req - Request dari client, berisi ID pengiriman.
   * @param {Response} res - Response untuk dikirimkan kembali ke client.
   */
  async deleteShipment(req: Request, res: Response): Promise<Response> {
    try {
      const deletedShipment = await shippingService.deleteShipment(req.params.id);
      return res.status(200).json({
        message: "Pengiriman berhasil dihapus",
        data: deletedShipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}
