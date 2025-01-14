import { prisma } from "../../../config/database";
import { transporter } from "../../../config/email";
import { Notification } from "@prisma/client";

export class NotificationService {
  /**
   * Sends an email using the transporter
   * @param email The email to send to
   * @param subject The subject of the email
   * @param message The message of the email
   * @returns The result of sending the email
   * @throws Error if there is an error sending the email
   */
  async sendEmail(email: string, subject: string, message: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Main Container -->
          <div style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 28px; font-weight: 600;">
                Agus Store
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333333; line-height: 1.6;">
                <h2 style="margin: 0 0 20px; color: #2d3748; font-size: 22px; font-weight: 600;">
                  Notifikasi Baru
                </h2>
                <div style="background-color: #f8f9fa; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 16px; color: #4a5568;">
                    ${message}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #edf2f7;">
              <p style="margin: 0; color: #718096; font-size: 14px; font-family: 'Segoe UI', Arial, sans-serif;">
                Terima kasih telah berbelanja di Agus Store
              </p>
              <p style="margin: 20px 0 0; color: #a0aec0; font-size: 12px;">
                © ${new Date().getFullYear()} Agus Store. All rights reserved.
              </p>
            </div>
          </div>
          </div>
        </div>
      </body>
      </html>
    `;
  
    try {
      const info = await transporter.sendMail({
        from: `"Agus Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      return info;
    } catch (error: any) {
      throw new Error(`Gagal mengirim email: ${error.message}`);
    }
  }

  /**
   * Membuat notifikasi untuk semua user
   * @param message Pesan notifikasi
   * @param sendEmail Kirim email ke user, default false
   * @returns Daftar notifikasi yang dibuat
   * @throws Error jika gagal membuat notifikasi
   */

  async createNotificationForAll(
    message: string,
    sendEmail: boolean = false
  ): Promise<Notification[]> {
    try {
      // Ambil data pengguna hanya dengan id dan email
      const users = await prisma.user.findMany({
        select: { id: true, email: true },
      });
  
      // Persiapkan data notifikasi
      const notifications = users.map((user) => ({
        userId: user.id,
        message: message,
      }));
  
      // Batch insert notifikasi
      const notificationResult = await prisma.notification.createMany({
        data: notifications,
      });
  
      // Kirim email secara paralel jika perlu
      if (sendEmail) {
        const emailPromises = users
          .filter((user) => user.email)
          .map((user) =>
            this.sendEmail(user.email, "Notifikasi Baru", message)
          );
  
        // Mengirim email secara paralel dengan Promise.allSettled
        const emailResults = await Promise.allSettled(emailPromises);
        
        // Log hasil pengiriman email jika perlu untuk debugging
        emailResults.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Error sending email:", result.reason);
          }
        });
      }
  
      return notificationResult as any;
    } catch (error: any) {
      throw new Error(`Gagal membuat notifikasi: ${error.message}`);
    }
  }
  

  /**
   * Mendapatkan semua notifikasi untuk user tertentu
   * @param userId ID dari user yang ingin diambil notifikasinya
   * @returns Daftar notifikasi untuk user tertentu
   * @throws Error jika terjadi kesalahan selama proses pengambilan
   */
  async getNotificationsByUserId(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ notifications: Notification[]; totalCount: number; totalPages: number }> {
    try {
      const skip = (page - 1) * pageSize;
      const [notifications, totalCount] = await prisma.$transaction([
        prisma.notification.findMany({
          where: {
            userId,
            isDeleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
        prisma.notification.count({
          where: {
            userId,
            isDeleted: false,
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);

      return { notifications, totalCount, totalPages };
    } catch (error: any) {
      throw new Error(`Gagal mengambil notifikasi: ${error.message}`);
    }
  }

  /**
   * Menandai notifikasi sebagai dibaca
   * @param notificationId ID dari notifikasi yang ingin ditandai
   * @returns Notifikasi yang telah ditandai
   * @throws Error jika terjadi kesalahan selama proses penandaan
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return notification;
    } catch (error: any) {
      throw new Error(
        `Gagal menandai notifikasi sebagai dibaca: ${error.message}`
      );
    }
  }

  async deleteNotification(
    notificationId: string,
    userRole: "USER" | "ADMIN"
  ): Promise<Notification> {
    try {
      if (userRole === "ADMIN") {
        await prisma.notification.delete({
          where: { id: notificationId },
        });
      } else {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isDeleted: true },
        });
      }
      return {
        id: notificationId,
        isDeleted: userRole === "USER",
        userId: "",
        message: "",
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: any) {
      throw new Error(`Gagal menghapus notifikasi: ${error.message}`);
    }
  }
}
