import { Prisma, Discount } from "@prisma/client";
import { prisma } from "../../../config/database";
import { CreateDiscountDTO, UpdateDiscountDTO } from "../types/discountType";

enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export class DiscountService {

  private validateDiscountData(discountData: CreateDiscountDTO): void {
    const { discountType, value, expiresAt } = discountData;
  
    if (discountType === DiscountType.PERCENTAGE) {
      if (value <= 0 || value > 100) {
        throw new Error("Nilai diskon harus antara 1 dan 100 untuk tipe PERCENTAGE.");
      }
    } else if (discountType === DiscountType.FIXED) {
      if (value <= 0) {
        throw new Error("Nilai diskon harus lebih dari 0 untuk tipe FIXED.");
      }
    } else {
      throw new Error("Tipe diskon tidak valid. Harus berupa PERCENTAGE atau FIXED.");
    }
  
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new Error("Tanggal kedaluwarsa harus di masa depan.");
    }
  }
  
  /**
 * Membuat Discount baru.
 *
 * @param {CreateDiscountDTO} discountData - Data untuk Discount baru.
 * @returns {Promise<Discount>} Discount yang dibuat.
 * @throws {Error} Jika terjadi kesalahan selama proses pembuatan.
 */
  async createDiscount(discountData: CreateDiscountDTO): Promise<Discount> {
    try {
      // Validasi diskon
      this.validateDiscountData(discountData);
  
      const { expiresAt, minPurchase, maxDiscount, maxUsage, ...otherData } = discountData;
  
      // Validasi tambahan
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        throw new Error("Tanggal kedaluwarsa harus di masa depan.");
      }
  
      if (minPurchase !== undefined && minPurchase < 0) {
        throw new Error("Minimum pembelian harus lebih besar atau sama dengan 0.");
      }
  
      if (maxDiscount !== undefined && maxDiscount < 0) {
        throw new Error("Maksimum diskon harus lebih besar atau sama dengan 0.");
      }
  
      if (maxUsage !== undefined && maxUsage <= 0) {
        throw new Error("Maksimal penggunaan harus lebih besar dari 0.");
      }
  
      // Buat entitas diskon baru di database
      const discount = await prisma.discount.create({
        data: {
          ...otherData,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          minPurchase: minPurchase || null,
          maxDiscount: maxDiscount || null,
          maxUsage: maxUsage || null,
        },
      });
  
      return discount;
    } catch (error: any) {
      console.error('Error creating discount:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(error.message || "Gagal membuat diskon.");
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
   * Memvalidasi dan mendapatkan diskon berdasarkan kode dengan total order.
   *
   * @param {string} code - Kode diskon yang dicari
   * @param {number} totalOrder - Total nilai pesanan
   * @returns {Promise<Discount>} Diskon yang valid
   * @throws {Error} Jika diskon tidak valid atau tidak memenuhi syarat
   */
 async getDiscountByCode(code: string, totalOrder: number): Promise<Discount> {
  try {

    const discount = await prisma.discount.findFirst({
      where: { code: { equals: code, mode: "insensitive" } },
    });

    if (!discount) {
      throw new Error(`Diskon dengan kode "${code}" tidak ditemukan.`);
    }


    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      throw new Error("Kode diskon sudah kedaluwarsa.");
    }

    if (discount.maxUsage && discount.usageCount >= discount.maxUsage) {
      throw new Error("Kode diskon sudah mencapai batas penggunaan maksimal.");
    }

    if (discount.minPurchase && totalOrder < discount.minPurchase) {
      throw new Error(
        `Total pembelian minimum untuk menggunakan diskon ini adalah ${discount.minPurchase.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}`
      );
    }

    if (discount.discountType === DiscountType.FIXED && discount.value > totalOrder) {
      throw new Error("Nilai diskon melebihi total pembelian.");
    }

    // Kalkulasi nilai diskon aktual
    let actualDiscountValue: number;
    if (discount.discountType === DiscountType.PERCENTAGE) {
      actualDiscountValue = (totalOrder * discount.value) / 100;
      // Terapkan maxDiscount jika ada
      if (discount.maxDiscount && actualDiscountValue > discount.maxDiscount) {
        actualDiscountValue = discount.maxDiscount;
      }
    } else {
      actualDiscountValue = discount.value;
    }

    // Validasi final nilai diskon
    if (actualDiscountValue > totalOrder) {
      throw new Error("Nilai diskon melebihi total pembelian.");
    }

    return {
      ...discount,
      value: actualDiscountValue // Return nilai diskon yang sudah dikalkulasi
    };
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
