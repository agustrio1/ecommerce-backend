import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
import { categoryValidator } from "../validator/categoryValidator";
import validate from "validate.js";
import { upload } from "../../../middlewares/upload";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  private validateInput(constraints: any, data: any): any {
    return validate(data, constraints, { format: "flat" });
  }

  /**
   * Mendapatkan semua kategori
   */
  public getAllCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.categoryService.getAllCategories();
      const protocol = req.protocol === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${req.get("host")}/categories/`;

      const transformedCategories = categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image ? baseUrl + category.image : null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));

      res.status(200).json(transformedCategories);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  };

  /**
   * Mendapatkan satu kategori berdasarkan ID
   */
  public getCategoryById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }

      const protocol = req.protocol === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${req.get("host")}/categories/`;

      const transformedCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image ? baseUrl + category.image : null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      res.status(200).json(transformedCategory);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  };

  /**
   * Mendapatkan satu kategori berdasarkan slug
   */
  public getCategoryBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const category = await this.categoryService.getCategoryBySlug(slug);

      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }

      const protocol = req.protocol === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${req.get("host")}/categories/`;

      const transformedCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image ? baseUrl + category.image : null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      res.status(200).json(transformedCategory);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal mengambil kategori" });
    }
  };

  /**
   * Membuat kategori baru
   */
  public createCategory = [
    upload.single("image"),
    async (req: Request, res: Response) => {
      try {
        const { name } = req.body;
        const file = req.file;

        const errors = this.validateInput(categoryValidator.create, { name });
        if (errors) {
          return res.status(400).json({ errors });
        }

        const category = await this.categoryService.createCategory(name, file);

        const protocol = req.protocol === "https" ? "https" : "http";
        const baseUrl = `${protocol}://${req.get("host")}/categories/`;

        const transformedCategory = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image ? baseUrl + category.image : null,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        };

        res.status(201).json(transformedCategory);
      } catch (error: any) {
        console.log(error);
        return res.status(500).json({ error: "Gagal membuat kategori" });
      }
    },
  ];

  /**
   * Memperbarui kategori
   */
  public updateCategory = [
    upload.single("image"),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { name } = req.body;
        const file = req.file;

        if (!name) {
          return res.status(400).json({ error: "Nama kategori harus diisi" });
        }

        const errors = this.validateInput(categoryValidator.update, { name });
        if (errors) {
          return res.status(400).json({ errors });
        }

        const category = await this.categoryService.updateCategory(
          id,
          name,
          file
        );

        if (!category) {
          return res.status(404).json({ error: "Kategori tidak ditemukan" });
        }

        const protocol = req.protocol === "https" ? "https" : "http";
        const baseUrl = `${protocol}://${req.get("host")}/categories/`;

        const transformedCategory = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image ? baseUrl + category.image : null,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        };

        res.status(200).json(transformedCategory);
      } catch (error: any) {
        return res.status(500).json({ error: "Gagal memperbarui kategori" });
      }
    },
  ];

  /**
   * Menghapus kategori
   */
  public deleteCategory = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.deleteCategory(id);

      if (!category) {
        return res.status(404).json({ error: "Kategori tidak ditemukan" });
      }

      const protocol = req.protocol === "https" ? "https" : "http";
      const baseUrl = `${protocol}://${req.get("host")}/categories/`;

      const transformedCategory = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image ? baseUrl + category.image : null,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      res.status(200).json(transformedCategory);
    } catch (error: any) {
      return res.status(500).json({ error: "Gagal menghapus kategori" });
    }
  };
}
