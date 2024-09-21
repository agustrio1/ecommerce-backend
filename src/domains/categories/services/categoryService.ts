import { prisma } from "../../../config/database";
import { CategoryType } from "../types/categoryType";

export class CategoryService {
  async getAllCategories(): Promise<CategoryType[]> {
    try {
      const categories = await prisma.category.findMany();
      return categories;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCategoryById(id: string): Promise<CategoryType | null> {
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async createCategory(name: string): Promise<CategoryType> {
    try {
      const category = await prisma.category.create({ data: { name } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateCategory(id: string, name: string): Promise<CategoryType> {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: { name },
      });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteCategory(id: string): Promise<CategoryType> {
    try {
      const category = await prisma.category.delete({ where: { id } });
      return category;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
