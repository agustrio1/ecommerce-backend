import { Prisma, Discount } from "@prisma/client";
import { prisma } from "../../../config/database";
import { CreateDiscountDTO, UpdateDiscountDTO } from "../types/discountType";

export class DiscountService {
  /**
   * Membuat Discount baru.
   *
   * @param {CreateDiscountDTO} discountData - Data untuk Discount baru.
   * @returns {Promise<Discount>} Discount yang dibuat.
   * @throws {Error} Jika terjadi kesalahan selama proses pembuatan.
   */
  async createDiscount(discountData: CreateDiscountDTO): Promise<Discount> {
    try {
      // Tetapkan discountType berdasarkan nilai diskon
      if (discountData.discountType === "PERCENTAGE") {
        if (discountData.value <= 100 && discountData.value > 0) {
          // Diskon valid untuk tipe PERCENTAGE
          discountData.discountType = "PERCENTAGE";
        } else {
          throw new Error("Nilai diskon tidak valid untuk tipe PERCENTAGE.");
        }
      } else if (discountData.discountType === "FIXED") {
        if (discountData.value > 0) {
          // Diskon valid untuk tipe FIXED
          discountData.discountType = "FIXED";
        } else {
          throw new Error("Nilai diskon tidak valid untuk tipe FIXED.");
        }
      } else {
        throw new Error("Tipe diskon tidak valid.");
      }
  
      const discount = await prisma.discount.create({
        data: discountData,
      });
      return discount;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }
  

  /**
   * Memperbarui Discount yang sudah ada berdasarkan ID.
   *
   * @param {string} id - ID dari Discount yang akan diperbarui.
   * @param {UpdateDiscountDTO} discountData - Data yang akan diperbarui.
   * @returns {Promise<Discount>} Discount yang diperbarui.
   * @throws {Error} Jika terjadi kesalahan selama proses pembaruan.
   */
  async updateDiscount(id: string, discountData: UpdateDiscountDTO): Promise<Discount> {
    try {
      // Tetapkan discountType berdasarkan nilai diskon
      if (discountData.discountType === "PERCENTAGE") {
        if (discountData.value as number <= 100 && discountData.value as number > 0) {
          discountData.discountType = "PERCENTAGE";
        } else {
          throw new Error("Nilai diskon tidak valid untuk tipe PERCENTAGE.");
        }
      } else if (discountData.discountType === "FIXED") {
        if (discountData.value as number > 0) {
          discountData.discountType = "FIXED";
        } else {
          throw new Error("Nilai diskon tidak valid untuk tipe FIXED.");
        }
      } else {
        throw new Error("Tipe diskon tidak valid.");
      }
  
      const discount = await prisma.discount.update({
        where: { id },
        data: discountData,
      });
      return discount;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }
  

  /**
   * Menghapus Discount berdasarkan ID.
   *
   * @param {string} id - ID dari Discount yang akan dihapus.
   * @returns {Promise<Discount>} Discount yang dihapus.
   * @throws {Error} Jika terjadi kesalahan selama proses penghapusan.
   */
  async deleteDiscount(id: string): Promise<Discount> {
    try {
      const discount = await prisma.discount.delete({ where: { id } });
      return discount;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /** 
   * Get All Discount
   **/
  async getAllDiscounts(): Promise<Discount[]> {
    try {
      const discounts = await prisma.discount.findMany();
      return discounts;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get Discount By ID
   **/
  async getDiscountById(id: string): Promise<Discount> {
    try {
      const discount: any = await prisma.discount.findUnique({ where: { id } });
      return discount;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * get by code
   */

  async getDiscountByCode(code: string): Promise<Discount> {
    try {
      const discount: any = await prisma.discount.findUnique({ where: { code } });
      return discount;
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
          throw new Error(
            "Ada pelanggaran unique constraint, kode discount sudah ada."
          );
        case "P2025":
          throw new Error("Discount tidak ditemukan.");
        default:
          throw new Error("Terjadi kesalahan pada database.");
      }
    }
    throw new Error(error.message || "Terjadi kesalahan yang tidak terduga.");
  }
}
