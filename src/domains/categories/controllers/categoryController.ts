import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
import { categoryValidator } from "../validator/categoryValidator";
import validate from "validate.js";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();

    this.getAllCategories = this.getAllCategories.bind(this);
    this.getCategoryById = this.getCategoryById.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  private validateInput(constraints: any, data: any): any {
    return validate(data, constraints, { format: "flat" });
  }

  /**
   * Mendapatkan semua kategori
   */
  public async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  }

  /**
   * Mendapatkan satu kategori berdasarkan ID
   * @param id
   */
  public async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }
      res.status(200).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  }

  /**
   * Membuat kategori baru
   */
  public async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    const errors = this.validateInput(categoryValidator.create, { name });
    if (errors) {
      return res.status(400).json({ errors });
    }
    try {
      const category = await this.categoryService.createCategory(name);
      res.status(201).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal membuat kategori" });
    }
  }

  /**
   * Memperbarui kategori
   * @param id
   * @param data
   */
  public async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body; // Mengambil data langsung dari body
      const currentUserRole = req.user?.role; // Mengambil role dari req.user

      if (!data || Object.keys(data).length === 0) {
        return res
          .status(400)
          .json({ error: "Tidak ada data yang diberikan untuk diperbarui" });
      }

      const errors = this.validateInput(categoryValidator.update, {
        name: data.name,
      });
      if (errors) {
        return res.status(400).json({ errors });
      }

      const category = await this.categoryService.updateCategory(id, data.name);
      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }
      res.status(200).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal memperbarui kategori" });
    }
  }

  /**
   * Menghapus kategori
   * @param id
   */
  public async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.deleteCategory(id);
      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }
      res.status(200).json(category);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal menghapus kategori" });
    }
  }
}
