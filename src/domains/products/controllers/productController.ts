import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { ProductType } from "../types/productType";
import { upload } from "../../../config/media";
import slugify from "slugify";
import { parentPort } from "worker_threads";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Mendapatkan semua produk
   */
  public getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getAllProducts();
      const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        weight: product.weight,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images.map((img: any) => ({
          id: img.id,
          productId: img.productId,
          image: baseUrl + img.image,
          isPrimary: img.isPrimary,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
        })),
        category: product.category.name,
        tags: product.tags.map((tag: any) => ({
          productId: tag.productId,
          name: tag.name,
        }))
      }));

      res.status(200).json(transformedProducts);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil produk" });
    }
  };

  /**
   * Mendapatkan satu produk berdasarkan ID
   * @param id
   */
  public getProductById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

      const transformedProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        description: product.description,
        weigth: product.weight,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images.map((img: any) => ({
          id: img.id,
          productId: img.productId,
          image: baseUrl + img.image,
          isPrimary: img.isPrimary,
          createdAt: img.createdAt,
          updatedAt: img.updatedAt,
        })),
        category: product.category.name,
        tags: product.tags.map((tag: any) => ({
          productId: tag.productId,
          name: tag.name,
        })),
      };

      res.status(200).json(transformedProduct);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil produk" });
    }
  };

  /**
   * Membuat produk baru
   */
  public createProduct = [
    upload.array("images", 5),
    async (req: Request, res: Response) => {
      try {
        const { name, description, weight, price, stock, categoryId, tags } = req.body;
        const files = req.files as Express.Multer.File[];
  
        if (!files || files.length === 0) {
          return res.status(400).json({ error: "Minimal satu gambar diperlukan" });
        }
  
        // Pisahkan `tags` jika diterima sebagai string
        const tagsArray = Array.isArray(tags)
          ? tags
          : tags
          ? tags.split(",").map((tag: any) => tag.trim())
          : undefined;
  
        const productData: ProductType = {
          name,
          slug: slugify(name, { lower: true }),
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          stock: parseInt(stock),
          categoryId,
        } as any;
  
        const product = await this.productService.createProduct(
          productData,
          files,
          tagsArray // Mengirim tags sebagai array
        );
        res.status(201).json(product);
      } catch (error: any) {
        console.error("Error in createProduct controller: ", error.message);
        res.status(500).json({ error: error.message || "Gagal membuat produk" });
      }
    },
  ];
  

  /**
   * Memperbarui produk
   */
  public updateProduct = [
    upload.array("images", 5),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { name, description, weight, price, stock, categoryId, tags } = req.body;
        const files = req.files as Express.Multer.File[];
  
        const productData: Partial<ProductType> = {
          name,
          description,
          weight: weight ? parseFloat(weight) : undefined,
          price: price ? parseFloat(price) : undefined,
          stock: stock ? parseInt(stock) : undefined,
          categoryId,
        };
  
        const tagsArray = Array.isArray(tags)
        ? tags
        : tags
        ? tags.split(",").map((tag: any) => tag.trim())
        : undefined;
      
  
        const product = await this.productService.updateProduct(
          id,
          productData,
          files,
          tagsArray
        );
        res.status(200).json(product);
      } catch (error: any) {
        console.error(error);
        if (error.message === "Product not found") {
          return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: "Gagal memperbarui produk" });
      }
    },
  ];
  

  /**
   * Menghapus produk
   */
  public deleteProduct = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await this.productService.deleteProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }
      res.status(200).json(product);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal menghapus produk" });
    }
  };
}
