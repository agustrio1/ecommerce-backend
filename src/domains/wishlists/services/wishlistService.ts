import { prisma } from "../../../config/database";
import {
  WishlistType,
  CreateWishlistDTO,
} from "../types/wishlistType";
import { Prisma } from "@prisma/client";

export class WishlistService {
  /**
   * Membuat wishlist baru.
   *
   * @param {CreateWishlistDTO} wishlistData - Data untuk wishlist baru.
   * @returns {Promise<WishlistType>} Wishlist yang berhasil dibuat.
   * @throws {Error} Jika terjadi kesalahan selama proses pembuatan.
   */
  async createWishlist(wishlistData: CreateWishlistDTO): Promise<WishlistType> {
    try {
      const wishlist = await prisma.wishlistItem.create({
        data: wishlistData,
      });
      return wishlist;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Mengambil semua wishlist.
   *
   * @returns {Promise<WishlistType[]>} Daftar semua wishlist.
   * @throws {Error} Jika terjadi kesalahan selama proses pengambilan.
   */
  async getAllWishlists(): Promise<WishlistType[]> {
    try {
      const wishlists = await prisma.wishlistItem.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
          product: {
            select: {
              name: true,
              images: {
                select: {
                  image: true,
                },
                take: 1,
              },
              price: true,
            },
          },
        },
      });
      return wishlists;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil wishlist berdasarkan ID.
   *
   * @param {string} id - ID dari wishlist yang akan diambil.
   * @returns {Promise<WishlistType | null>} Wishlist yang ditemukan, atau null jika tidak ada.
   * @throws {Error} Jika terjadi kesalahan selama proses pengambilan.
   */
  async getWishlistById(id: string): Promise<WishlistType | null> {
    try {
      const wishlist = await prisma.wishlistItem.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              name: true,
              images: {
                select: {
                  image: true,
                },
                take: 1,
              },
              price: true,
            },
          },
        },
      });
      return wishlist;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil wishlist berdasarkan userId.
   *
   * @param {string} userId - ID dari user yang memiliki wishlist.
   * @returns {Promise<WishlistType[] | null>} Wishlist yang ditemukan untuk user, atau null jika tidak ada.
   * @throws {Error} Jika terjadi kesalahan selama proses pengambilan.
   */
  async getWishlistByUserId(userId: string): Promise<WishlistType[] | null> {
    try {
      const wishlists = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              name: true,
              images: {
                select: {
                  image: true,
                },
                take: 1,
              },
              price: true,
            },
          },
        },
      });
      return wishlists;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Menghapus wishlist berdasarkan ID.
   *
   * @param {string} id - ID dari wishlist yang akan dihapus.
   * @returns {Promise<WishlistType | null>} Wishlist yang dihapus, atau null jika tidak ditemukan.
   * @throws {Error} Jika terjadi kesalahan selama proses penghapusan.
   */
  async deleteWishlistById(id: string): Promise<WishlistType | null> {
    try {
      const wishlist = await prisma.wishlistItem.delete({
        where: { id },
      });
      return wishlist;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Menangani dan melempar pesan error Prisma yang sesuai.
   *
   * @param {any} error - Objek error.
   * @throws {Error} Melempar pesan error yang diformat.
   */
  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          throw new Error("Ada pelanggaran unique constraint, data sudah ada.");
        case "P2025":
          throw new Error("Wishlist tidak ditemukan.");
        default:
          throw new Error("Terjadi kesalahan pada database.");
      }
    }
    throw new Error(error.message || "Terjadi kesalahan yang tidak terduga.");
  }
}
