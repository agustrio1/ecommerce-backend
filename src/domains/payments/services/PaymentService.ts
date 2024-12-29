import { prisma } from "../../../config/database";
import midtransClient from "midtrans-client-typescript";
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } from "../../../config/env";
import { PaymentStatus } from "@prisma/client";

export class PaymentService {
  private snap: any;

  /**
   * Inisialisasi klien Midtrans Snap dengan konfigurasi yang diberikan.
   */
  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY as string,
      clientKey: MIDTRANS_CLIENT_KEY as string,
    });
  }

  /**
   * Membuat pembayaran baru untuk pesanan tertentu.
   * @param {string} orderId - ID pesanan yang akan dibayar.
   * @param {string} userId - ID pengguna yang melakukan pembayaran.
   * @returns {Promise<{ token: string; redirectUrl: string }>} - Token dan URL redirect dari Midtrans.
   * @throws Akan melemparkan error jika terjadi kegagalan dalam pembuatan pembayaran.
   */
  async createPayment(orderId: string, userId: string): Promise<{ token: string; redirectUrl: string }> {
    try {
      // Ambil data pesanan beserta pengiriman dan detail pengguna
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          shipment: true,
          user: {
            include: {
              addresses: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Pesanan tidak ditemukan");
      }

      const { user, shipment } = order;

      if (!user || !user.addresses.length) {
        throw new Error("Pengguna atau alamat tidak ditemukan");
      }

      // Hitung total biaya pengiriman
      const shippingCost = shipment.reduce((sum, ship) => sum + ship.cost, 0);

      // Hitung jumlah total pembayaran
      const totalAmount = order.total + shippingCost;

      // Siapkan detail transaksi untuk Midtrans
      const transactionDetails = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalAmount,
        },
        customer_details: {
          first_name: user.name,
          email: user.email,
          phone: user.addresses[0].phone,
          billing_address: {
            first_name: user.name,
            phone: user.addresses[0].phone,
            address: user.addresses[0].address1,
            city: user.addresses[0].city,
            postal_code: user.addresses[0].postalCode,
            country_code: "IDN",
          },
        },
        credit_card: {
          secure: true,
        },
      };

      // Buat transaksi dengan Midtrans
      const transaction = await this.snap.createTransaction(transactionDetails);

      // Simpan detail pembayaran ke database
      await prisma.payment.create({
        data: {
          orderId,
          amount: totalAmount,
          status: PaymentStatus.PENDING,
          userId,
        },
      });

      // Kembalikan token dan URL redirect dari Midtrans
      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Gagal membuat pembayaran: ${error.message}`);
    }
  }

  /**
   * Menangani notifikasi callback dari Midtrans.
   * @param {object} notification - Data notifikasi yang diterima dari Midtrans.
   * @returns {Promise<{ success: boolean }>} - Status penanganan notifikasi.
   * @throws Akan melemparkan error jika terjadi kegagalan dalam penanganan notifikasi.
   */
  async handleCallback(notification: any): Promise<{ success: boolean }> {
    try {
      // Dapatkan status transaksi dari notifikasi
      const statusResponse = await this.snap.transaction.notification(notification);
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      // Tentukan status pembayaran berdasarkan status transaksi dan fraud
      let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          paymentStatus = PaymentStatus.CHALLENGE;
        } else if (fraudStatus === "accept") {
          paymentStatus = PaymentStatus.SUCCESS;
        }
      } else if (transactionStatus === "settlement") {
        paymentStatus = PaymentStatus.SUCCESS;
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        paymentStatus = PaymentStatus.FAILED;
      } else if (transactionStatus === "pending") {
        paymentStatus = PaymentStatus.PENDING;
      }

      await prisma.payment.update({
        where: { id: orderId },
        data: { status: paymentStatus },
      });

      if (paymentStatus === PaymentStatus.SUCCESS) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: paymentStatus },
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error(error);
      throw new Error(`Gagal menangani callback pembayaran: ${error.message}`);
    }
  }
}
