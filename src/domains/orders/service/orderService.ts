import { prisma } from "../../../config/database";
import { CreateOrderDTO, OrderType, UpdateOrderDTO } from "../types/orderType";
import { Order } from "@prisma/client";

interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class OrderService {
  /**
   * Membuat order baru dan menghapus item dari cart.
   *
   * @param {CreateOrderDTO} orderData - Data untuk order baru.
   * @returns {Promise<Order>} Order yang berhasil dibuat.
   * @throws {Error} Jika terjadi kesalahan selama proses pembuatan.
   */
  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    try {
      const order = await prisma.$transaction(async (prisma) => {
        const cartItems = await prisma.cart.findMany({
          where: { userId: orderData.userId },
          include: { product: true },
        });

        if (cartItems.length === 0) {
          throw new Error("Cart kosong, tidak ada item untuk diproses.");
        }

        // Hitung total sebelum diskon
        const total = cartItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        );

        let discountValue = 0;
        let discount; // Declare the discount variable here

        // Hitung diskon jika ada
        if (orderData.discountCode) {
          discount = await prisma.discount.findUnique({
            where: { code: orderData.discountCode },
          });

          if (discount) {
            const now = new Date();
            if (discount.expiresAt && discount.expiresAt > now) {
              if (
                discount.maxUsage &&
                discount.usageCount >= discount.maxUsage
              ) {
                throw new Error("Diskon telah melebihi jumlah penggunaan.");
              }

              // Validasi dan hitung diskon
              if (discount.discountType === "FIXED") {
                discountValue = Math.min(discount.value, total);
              } else if (discount.discountType === "PERCENTAGE") {
                discountValue = (total * discount.value) / 100;
                if (discount.maxDiscount) {
                  discountValue = Math.min(discountValue, discount.maxDiscount);
                }
              }

              // Update penggunaan diskon
              await prisma.discount.update({
                where: { id: discount.id },
                data: { usageCount: { increment: 1 } },
              });
            } else {
              throw new Error("Diskon telah kadaluwarsa atau tidak valid.");
            }
          } else {
            throw new Error("Diskon tidak ditemukan.");
          }
        }

        // Hitung total akhir
        const finalTotal = total - discountValue;

        // Kurangi stok produk
        for (const cartItem of cartItems) {
          const product = cartItem.product;

          if (product.stock < cartItem.quantity) {
            throw new Error(`Stok produk ${product.name} tidak mencukupi.`);
          }

          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        }

        // Buat order baru
        const createdOrder = await prisma.order.create({
          data: {
            userId: orderData.userId,
            addressId: orderData.addressId,
            total: finalTotal,
            discounts: discount ? { connect: { id: discount.id } } : undefined,
            orderItems: {
              create: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
            status: "PENDING",
          },
          include: {
            orderItems: true,
          },
        });

        // Hapus semua item di cart setelah order dibuat
        await prisma.cart.deleteMany({
          where: { userId: orderData.userId },
        });

        return createdOrder;
      });

      return order;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Memperbarui order.
   *
   * @param {UpdateOrderDTO} orderData - Data untuk memperbarui order.
   * @returns {Promise<Order>} Order yang diperbarui.
   * @throws {Error} Jika terjadi kesalahan selama proses perubahan.
   */
  async updateOrder(orderData: UpdateOrderDTO): Promise<Order> {
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderData.id },
        data: {
          status: orderData.status as any,
          ...(orderData.total !== undefined && { total: orderData.total }),
          ...(orderData.addressId !== undefined && {
            addressId: orderData.addressId,
          }),
        },
      });

      return updatedOrder;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mendapatkan semua order.
   *
   * @returns {Promise<Order[]>} Daftar semua order.
   * @throws {Error} Jika terjadi kesalahan selama proses pengambilan data.
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Order>> {
    try {
      const skip = (page - 1) * limit;
      const [total, orders] = await prisma.$transaction([
        prisma.order.count(),

        prisma.order.findMany({
          skip,
          take: limit,
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    category: {
                      select: {
                        name: true,
                      },
                    },
                    images: {
                      select: {
                        image: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
            address: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            discounts: {
              select: {
                code: true,
                discountType: true,
                value: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mendapatkan order berdasarkan ID.
   *
   * @param {string} id - ID order yang ingin diambil.
   * @returns {Promise<Order>} Order yang ditemukan.
   * @throws {Error} Jika terjadi kesalahan atau order tidak ditemukan.
   */
  async getOrderById(id: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      name: true,
                    },
                  },
                  images: {
                    select: {
                      image: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          address: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order tidak ditemukan.");
      }

      return order;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mendapatkan semua order berdasarkan user ID.
   *
   * @param {string} userId - ID pengguna yang ingin diambil ordernya.
   * @returns {Promise<Order[]>} Daftar order untuk pengguna tertentu.
   * @throws {Error} Jika terjadi kesalahan selama proses pengambilan data.
   */
  async getOrdersByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<Order>> {
    try {
      const skip = (page - 1) * limit;

      // Gunakan transaction untuk mendapatkan total dan data sekaligus
      const [total, orders] = await prisma.$transaction([
        // Hitung total records untuk user tertentu
        prisma.order.count({
          where: { userId },
        }),
        // Ambil data dengan pagination
        prisma.order.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            orderItems: {
              include: {
                product: {
                  include: {
                    category: {
                      select: {
                        name: true,
                      },
                    },
                    images: {
                      select: {
                        image: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
            discounts: true,
            address: true,
          },
          orderBy: {
            createdAt: "desc", // Urutkan dari yang terbaru
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: orders,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
 * Mendapatkan produk yang paling laku
 * @returns Promise dengan array produk dan jumlah penjualan
 */
async getTopSellingProducts(limit: number = 10): Promise<any[]> {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            category: true,
            images: {
              take: 1,
              select: {
                image: true
              }
            }
          }
        });

        return {
          ...product,
          totalSold: item._sum.quantity
        };
      })
    );

    return productsWithDetails;
  } catch (error: any) {
    throw new Error(`Failed to get top selling products: ${error.message}`);
  }
}

/**
 * Mendapatkan total order dan statistik status order
 * @returns Promise dengan statistik order
 */
async getOrderStatistics(): Promise<any> {
  try {
    // Hitung total order
    const totalOrders = await prisma.order.count();

    // Hitung total order berdasarkan status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    // Hitung total pendapatan
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        total: true
      }
    });

    // Format statistik
    const statistics = {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      statusBreakdown: ordersByStatus.map(status => ({
        status: status.status,
        count: status._count
      }))
    };

    return statistics;
  } catch (error: any) {
    throw new Error(`Failed to get order statistics: ${error.message}`);
  }
}

  /**
   * Menghapus order berdasarkan ID.
   *
   * @param {string} id - ID order yang ingin dihapus.
   * @returns {Promise<Order>} Order yang dihapus.
   * @throws {Error} Jika terjadi kesalahan selama proses penghapusan atau order tidak ditemukan.
   */
  async deleteOrder(orderId: string): Promise<Order> {
    try {
      // Pertama, ambil order untuk mendapatkan detail order items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new Error("Order tidak ditemukan.");
      }

      // Jika ingin menambahkan logika untuk mengembalikan stok produk
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      await prisma.orderItem.deleteMany({
        where: {
          orderId: orderId,
        },
      });

      // Hapus order
      const deletedOrder = await prisma.order.delete({
        where: { id: orderId },
      });

      return deletedOrder;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
