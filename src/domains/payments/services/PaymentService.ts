import { prisma } from "../../../config/database";
import midtransClient from "midtrans-client-typescript";
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY } from "../../../config/env";
import { PaymentStatus } from "@prisma/client";

/**
 * Kelas PaymentService digunakan untuk menangani proses pembayaran menggunakan Midtrans.
 */
export class PaymentService {
  private snap: any;

  /**
   * Konstruktor untuk menginisialisasi konfigurasi Midtrans Snap Client.
   */
  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: MIDTRANS_SERVER_KEY as string,
      clientKey: MIDTRANS_CLIENT_KEY as string,
    });
  }

  /**
   * Membuat pembayaran baru berdasarkan ID pesanan dan ID pengguna.
   * 
   * @param {string} orderId - ID pesanan yang akan dibayar.
   * @param {string} userId - ID pengguna yang melakukan pembayaran.
   * @returns {Promise<{ token: string; redirectUrl: string }>} Token transaksi dan URL redirect ke halaman pembayaran Midtrans.
   * @throws {Error} Jika terjadi kesalahan dalam proses pembuatan pembayaran.
   */
  async createPayment(orderId: string, userId: string): Promise<{ token: string; redirectUrl: string }> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          shipment: true,
          user: {
            include: {
              addresses: true,
            },
          },
          orderItems: {
            include: {
              product: {
                include: {
                  category: { select: { name: true } },
                  images: { select: { image: true }, take: 1 },
                },
              },
            },
          },
        },
      });

      if (!order) throw new Error("Pesanan tidak ditemukan");

      const { user, shipment, orderItems } = order;

      if (!user || !user.addresses.length) throw new Error("Pengguna atau alamat tidak ditemukan");

      const shippingCost = shipment.reduce((sum, ship) => sum + ship.cost, 0);

      // Menyiapkan rincian item dan menghitung jumlah keseluruhan (gross amount)
      const itemDetails = orderItems.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.product.name.substring(0, 50),
        category: item.product.category.name,
        images: item.product.images[0]?.image || "",
      }));
      const itemsTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const grossAmount = itemsTotal + shippingCost;

      // Menyiapkan rincian transaksi untuk Midtrans
      const transactionDetails = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount,
        },
        item_details: [
          ...itemDetails,
          {
            id: "shipping-cost",
            price: shippingCost,
            quantity: 1,
            name: "Ongkos Kirim",
          },
        ],
        customer_details: {
          first_name: user.name,
          email: user.email,
          phone: user.addresses[0]?.phone || "",
          billing_address: {
            first_name: user.name,
            phone: user.addresses[0]?.phone || "",
            address: user.addresses[0]?.address1 || "",
            city: user.addresses[0]?.city || "",
            postal_code: user.addresses[0]?.postalCode || "",
            country_code: "IDN",
          },
        },
        shipping_address: {
          first_name: user.name,
          phone: user.addresses[0]?.phone || "",
          address: user.addresses[0]?.address1 || "",
          city: user.addresses[0]?.city || "",
          postal_code: user.addresses[0]?.postalCode || "",
          country_code: "IDN",
        },
        credit_card: { secure: true },
        callbacks: {
          finish: `${process.env.CLIENT_URL}/transaction-result`
        }
      };

      const transaction = await this.snap.createTransaction(transactionDetails);

      // Simpan data pembayaran ke database
      await prisma.payment.create({
        data: {
          orderId,
          amount: grossAmount,
          status: PaymentStatus.PENDING,
          userId,
        },
      });

      return {
        token: transaction.token,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error: any) {
      console.error("Error in createPayment:", error);
      throw new Error(`Gagal membuat pembayaran: ${error.message}`);
    }
  }

  /**
   * Menangani callback notifikasi dari Midtrans.
   * 
   * @param {any} notification - Notifikasi yang diterima dari Midtrans.
   * @returns {Promise<{ success: boolean }>} Status keberhasilan penanganan notifikasi.
   * @throws {Error} Jika terjadi kesalahan dalam proses penanganan callback.
   */
  async handleCallback(notification: any): Promise<{ success: boolean }> {
    try {
      // Meminta detail status dari Midtrans berdasarkan notifikasi
      const statusResponse = await this.snap.transaction.notification(notification);
      const { order_id: orderId, transaction_status: transactionStatus, fraud_status: fraudStatus } = statusResponse;

      let paymentStatus: PaymentStatus;

      // Menentukan status pembayaran berdasarkan transaksi dan fraud status
      switch (transactionStatus) {
        case "capture":
          paymentStatus = fraudStatus === "challenge" ? PaymentStatus.CHALLENGE : PaymentStatus.SUCCESS;
          break;
        case "settlement":
          paymentStatus = PaymentStatus.SUCCESS;
          break;
        case "cancel":
          paymentStatus = PaymentStatus.CANCELED;
          break;
        case "deny":
        case "expire":
          paymentStatus = PaymentStatus.FAILED;
          break;
        case "pending":
          paymentStatus = PaymentStatus.PENDING;
          break;
        default:
          paymentStatus = PaymentStatus.PENDING;
          break;
      }

      // Perbarui status pembayaran di database
      const paymentUpdate = await prisma.payment.update({
        where: { id: orderId },
        data: { status: paymentStatus },
      });

      if (!paymentUpdate) {
        throw new Error(`Payment with ID ${orderId} not found in database.`);
      }

      if (paymentStatus === PaymentStatus.SUCCESS) {
        // Tandai pesanan sebagai "PAID" jika pembayaran berhasil
        const orderUpdate = await prisma.order.update({
          where: { id: orderId },
          data: { status:  PaymentStatus.SUCCESS },
        });

        if (!orderUpdate) {
          throw new Error(`Order with ID ${orderId} not found in database.`);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error in handleCallback:", error);
      throw new Error(`Gagal menangani callback pembayaran: ${error.message}`);
    }
  }
}
