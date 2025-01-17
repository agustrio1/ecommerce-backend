import { prisma } from "../../../config/database";
import { CategoryType } from "../types/categoryType";
import slugify from "slugify";
import path from "path";
import fs from "fs";

export class CategoryService {
  /**
   * Mengambil semua kategori
   * @returns Array kategori
   */
  async getAllCategories(): Promise<any[]> {
    try {
      const categories = await prisma.category.findMany();
      return categories;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil satu kategori berdasarkan ID
   * @param id ID kategori
   * @returns Kategori yang diambil atau null
   * @throws {Error} Jika terjadi kesalahan saat mengambil data
   */
  async getCategoryById(id: string): Promise<any | null> {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil satu kategori berdasarkan slug
   * @param slug Slug kategori
   * @returns Kategori yang diambil atau null
   * @throws {Error} Jika terjadi kesalahan saat mengambil data
   */
  async getCategoryBySlug(slug: string): Promise<any | null> {
    try {
      const category = await prisma.category.findUnique({ where: { slug } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Membuat kategori baru
   * @param name Nama kategori yang ingin dibuat
   * @param image File gambar yang diupload (opsional)
   * @returns Kategori yang dibuat
   * @throws {Error} Jika terjadi kesalahan saat membuat data
   */
  async createCategory(
    name: string,
    image?: Express.Multer.File
  ): Promise<any> {
    const slug = slugify(name, { lower: true });
    try {
      const uploadDir = path.join(process.cwd(), "public", "categories");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug: slug,
          image: image ? image.filename : null,
        },
      });
      return category;
    } catch (error: any) {
      if (image && image.filename) {
        const imgPath = path.join(process.cwd(), "public", "categories", image.filename);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
      console.error("Create category error:", error);
      throw new Error(error.message);
    }
  }

  /**
   * Memperbarui kategori
   * @param id ID kategori yang diupdate
   * @param name Nama kategori yang diupdate
   * @param image File gambar baru (opsional)
   * @returns Kategori yang diupdate
   */
  async updateCategory(
    id: string,
    name: string,
    image?: Express.Multer.File
  ): Promise<any> {
    const slug = slugify(name, { lower: true });
    try {
      return await prisma.$transaction(async (prisma) => {
        const existingCategory = await prisma.category.findUnique({
          where: { id },
        });

        if (!existingCategory) {
          throw new Error("Category not found");
        }

        if (image && existingCategory.image) {
          const oldImgPath = path.join(process.cwd(), "public", "categories", existingCategory.image);
          if (fs.existsSync(oldImgPath)) {
            fs.unlinkSync(oldImgPath);
          }
        }

        const category = await prisma.category.update({
          where: { id },
          data: {
            name,
            slug: slug,
            image: image ? image.filename : existingCategory.image,
          },
        });

        return category;
      });
    } catch (error: any) {
      if (image && image.filename) {
        const imgPath = path.join(process.cwd(), "public", "categories", image.filename);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
      throw new Error(error.message);
    }
  }

  /**
   * Menghapus kategori
   * @param id ID kategori yang ingin dihapus
   * @returns Kategori yang dihapus
   * @throws {Error} Jika terjadi kesalahan saat menghapus data
   */
  async deleteCategory(id: string): Promise<any> {
    try {
      return await prisma.$transaction(async (prisma) => {
        // Cek apakah kategori ada
        const existingCategory = await prisma.category.findUnique({
          where: { id },
        });

        if (!existingCategory) {
          throw new Error("Category not found");
        }

        // Jika kategori memiliki gambar, hapus dari server
        if (existingCategory.image) {
          const imgPath = path.join(
            __dirname,
            "../../../../public/categories",
            existingCategory.image
          );
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }

        const category = await prisma.category.delete({ where: { id } });
        return category;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}