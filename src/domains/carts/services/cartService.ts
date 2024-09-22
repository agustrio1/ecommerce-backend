import { prisma } from "../../../config/database";
import { CartType } from "../types/cartType";

export class CartService {
  /**
   * Membuat atau memperbarui keranjang dengan memeriksa stok yang tersedia
   * @param cartData Data keranjang
   * @returns Keranjang yang dibuat atau diperbarui
   */
  async createOrUpdateCart(cartData: CartType) {
    const { userId, productId, quantity } = cartData;

    if (quantity <= 0) {
      throw new Error("Quantity harus lebih besar dari nol.");
    }

    try {
      return await prisma.$transaction(async (prisma) => {
        // Ambil produk dan stoknya
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            stock: true,
            price: true,
            images: {
              select: { image: true },
              take: 1,
            },
            category: { select: { name: true } },
          },
        });

        if (!product) {
          throw new Error("Produk tidak ditemukan.");
        }

        if (quantity > product.stock) {
          throw new Error("Stok tidak mencukupi.");
        }

        // Cek apakah keranjang sudah ada untuk user dan produk ini
        const existingCart = await prisma.cart.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        if (existingCart) {
          // Perbarui quantity
          const updatedCart = await prisma.cart.update({
            where: {
              userId_productId: {
                userId,
                productId,
              },
            },
            data: {
              quantity: quantity,
              updatedAt: new Date(),
            },
          });
          return updatedCart;
        } else {
          // Buat entri keranjang baru
          const newCart = await prisma.cart.create({
            data: {
              userId,
              productId,
              quantity, // Pastikan ini adalah number
            },
          });
          return newCart;
        }
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Memperbarui keranjang dengan jumlah yang ditentukan
   * @param userId ID pengguna
   * @param productId ID produk
   * @param quantity Jumlah yang diperbarui
   * @returns Keranjang yang diperbarui
   */
  async updateCart(userId: string, productId: string, quantity: number) {
    if (quantity < 0) {
      throw new Error("Quantity tidak boleh negatif.");
    }

    try {
      return await prisma.$transaction(async (prisma) => {
        // Ambil produk dan stoknya
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { stock: true },
        });

        if (!product) {
          throw new Error("Produk tidak ditemukan.");
        }

        if (quantity > product.stock) {
          throw new Error("Stok tidak mencukupi.");
        }

        // Cek apakah keranjang ada
        const existingCart = await prisma.cart.findUnique({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        });

        if (!existingCart) {
          throw new Error("Item keranjang tidak ditemukan.");
        }

        // Jika quantity adalah 0, hapus entri keranjang
        if (quantity === 0) {
          await prisma.cart.delete({
            where: {
              userId_productId: {
                userId,
                productId,
              },
            },
          });
          return { message: "Item keranjang dihapus." };
        }

        // Perbarui quantity
        const updatedCart = await prisma.cart.update({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
          data: {
            quantity,
            updatedAt: new Date(),
          },
        });

        return updatedCart;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil semua keranjang untuk pengguna tertentu
   * @param userId ID pengguna
   * @returns Array keranjang
   */
  async getCartByUserId(userId: string) {
    try {
      const cartItems = await prisma.cart.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              images: {
                select: {
                  image: true,
                },
                take: 1,
              },
            },
          },
        },
      });
      return cartItems;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil semua keranjang (Admin)
   * @returns Array keranjang
   */
  async getAllCart() {
    try {
      const carts = await prisma.cart.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              images: {
                select: {
                  image: true,
                },
                take: 1,
              },
            },
          },
        },
      });
      return carts;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Menghapus keranjang
   * @param userId ID pengguna
   * @param productId ID produk
   * @returns Keranjang yang dihapus
   */
  async deleteCart(id: string) {
    try {
      return await prisma.cart.delete({
        where: {
          id,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
