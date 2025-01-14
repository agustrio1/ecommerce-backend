import { Request, Response } from "express";
import { NotificationService } from "../services/notificationService";


export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();

    this.getNotifications = this.getNotifications.bind(this);
    this.getNotification = this.getNotification.bind(this);
    this.createNotificationForAll = this.createNotificationForAll.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
  }

  // Mendapatkan semua notifikasi untuk pengguna
  public async getNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const { notifications, totalCount, totalPages } = await this.notificationService.getNotificationsByUserId(userId, page, pageSize);
      res.status(200).json({ notifications, totalCount, totalPages, currentPage: page });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil notifikasi" });
    }
  }

  // Mendapatkan satu notifikasi berdasarkan ID
  public async getNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationsByUserId(id);
      if (!notification) {
        return res.status(404).json({ error: "Notifikasi tidak ditemukan" });
      }
      res.status(200).json({ notification });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil notifikasi" });
    }
  }


  // Membuat notifikasi untuk semua user
  public async createNotificationForAll(req: Request, res: Response) {
    try {
      const { message, sendEmail } = req.body;
      const notifications = await this.notificationService.createNotificationForAll(message, sendEmail);
      res.status(201).json({ notifications });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal membuat notifikasi untuk semua pengguna" });
    }
  }

  // Menandai notifikasi sebagai dibaca
  public async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const notification = await this.notificationService.markAsRead(notificationId);
      res.status(200).json({ notification });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal menandai notifikasi sebagai dibaca" });
    }
  }

  // Menghapus notifikasi (user = soft delete, admin = hard delete)
  public async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { userRole } = req.body;
      const notification = await this.notificationService.deleteNotification(notificationId, userRole);
      res.status(200).json({ notification });
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal menghapus notifikasi" });
    }
  }
}
