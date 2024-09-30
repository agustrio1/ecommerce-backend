import { prisma } from "../../../config/database";
import { CategoryType } from "../types/categoryType";
import slugify from "slugify";

export class CategoryService {
  /**
   * Mengambil semua kategori
   * @returns Array kategori
   */
  async getAllCategories(): Promise<CategoryType[]> {
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
  async getCategoryById(id: string): Promise<CategoryType | null> {
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
  async getCategoryBySlug(slug: string): Promise<CategoryType | null> {
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
   * @returns Kategori yang dibuat
   * @throws {Error} Jika terjadi kesalahan saat membuat data
   */
  async createCategory(name: string): Promise<CategoryType> {
    const slug = slugify(name, { lower: true });
    try {
      const category = await prisma.category.create({
        data: { name, slug: slug },
      });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Memperbarui kategori
   * @param id ID kategori yang diupdate
   * @param name Nama kategori yang diupdate
   * @returns Kategori yang diupdate
   */
  async updateCategory(id: string, name: string): Promise<CategoryType> {
    const slug = slugify(name, { lower: true });
    try {
      const category = await prisma.category.update({
        where: { id },
        data: { name, slug: slug },
      });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Menghapus kategori
   * @param id ID kategori yang ingin dihapus
   * @returns Kategori yang dihapus
   * @throws {Error} Jika terjadi kesalahan saat menghapus data
   */
  async deleteCategory(id: string): Promise<CategoryType> {
    try {
      const category = await prisma.category.delete({ where: { id } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
