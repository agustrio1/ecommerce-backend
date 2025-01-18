import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { ProductType } from "../types/productType";
import { upload } from "../../../config/media";
import slugify from "slugify";

export class ProductController {
  private productService: ProductService;
  private getBaseUrl(req: Request): string {
    // Use environment variable for production URL
    if (process.env.NODE_ENV === 'production') {
      return `${process.env.API_URL}/images/`;
    }
    // For development
    return `${req.protocol}://${req.get('host')}/images/`;
  }  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Mendapatkan semua produk
   */
  public getAllProducts = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = (req.query.search as string) || '';
  
      const result = await this.productService.getAllProducts(page, limit, searchTerm);
      const baseUrl = this.getBaseUrl(req);
  
      const transformedProducts = result.data.map((product: any) => ({
        ...product,
        images: product.images.map((img: any) => ({
          ...img,
          image: baseUrl + img.image,
        })),
      }));
  
      res.status(200).json({
        status: 'success',
        message: 'Products retrieved successfully',
        data: transformedProducts,
        meta: result.meta,
        searchTerm: result.searchTerm,
      });
    } catch (error: any) {
      console.error('Error getting products:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve products',
        error: error.message
      });
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

      const baseUrl = this.getBaseUrl(req);

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

  public getProductBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const product = await this.productService.getProductBySlug(slug);
  
      if (!product) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }
  
      const baseUrl = this.getBaseUrl(req);
  
      const transformedProduct = {
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
        })),
      };
  
      res.status(200).json(transformedProduct);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil produk berdasarkan slug" });
    }
  };  

  /**
   * Mendapatkan produk berdasarkan nama kategori
   */
  public getProductByCategorySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const products = await this.productService.getProductByCategorySlug(slug);
  
      if (products.length === 0) {
        return res.status(404).json({ error: "Produk dengan kategori tersebut tidak ditemukan" });
      }
  
      const baseUrl = this.getBaseUrl(req);
  
      const transformedProducts = products.map((product: any) => ({
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
        })),
      }));
  
      res.status(200).json(transformedProducts);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil produk berdasarkan kategori" });
    }
  };

  /**
   * Mendapatkan produk terbaru
   */

  public getLatestProducts = async (req: Request, res: Response) => {
    try {
      const products = await this.productService.getLatestProducts();
      res.status(200).json(products);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Gagal mengambil produk terbaru" });
    }
  };
  

  /**
   * Membuat produk baru
   */
  public createProduct = [
    upload.array("images", 5),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'At least one image is required'
          });
        }

        const { name, description, weight, price, stock, categoryId, tags } = req.body;
        
        if (!name || !description || !price || !categoryId) {
          return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
          });
        }

        const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : undefined;

        const productData: ProductType = {
          name,
          description,
          price: parseFloat(price),
          weight: parseFloat(weight),
          stock: parseInt(stock),
          categoryId,
        } as any;

        const product = await this.productService.createProduct(
          productData,
          files,
          tagsArray
        );

        // Transform response with correct image URLs
        const baseUrl = this.getBaseUrl(req);
        const transformedProduct = {
          ...product,
          images: product.images.map((img: any) => ({
            ...img,
            image: baseUrl + img.image,
          })),
        };

        res.status(201).json({
          status: 'success',
          message: 'Product created successfully',
          data: transformedProduct
        });
      } catch (error: any) {
        console.error('Error creating product:', error);
        res.status(500).json({
          status: 'error',
          message: 'Failed to create product',
          error: error.message
        });
      }
    }
  ];
  

  /**
   * Memperbarui produk
   */
  public updateProduct = [
    upload.array("images", 5),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const files = req.files as Express.Multer.File[];
        const { name, description, weight, price, stock, categoryId, tags } = req.body;

        const productData: Partial<ProductType> = {
          name,
          description,
          weight: weight ? parseFloat(weight) : undefined,
          price: price ? parseFloat(price) : undefined,
          stock: stock ? parseInt(stock) : undefined,
          categoryId,
        };

        const tagsArray = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : undefined;

        const product = await this.productService.updateProduct(
          id,
          productData,
          files.length > 0 ? files : undefined,
          tagsArray
        );

        // Transform response with correct image URLs
        const baseUrl = this.getBaseUrl(req);
        const transformedProduct = {
          ...product,
          images: product.images.map((img: any) => ({
            ...img,
            image: baseUrl + img.image,
          })),
        };

        res.status(200).json({
          status: 'success',
          message: 'Product updated successfully',
          data: transformedProduct
        });
      } catch (error: any) {
        console.error('Error updating product:', error);
        res.status(500).json({
          status: 'error',
          message: 'Failed to update product',
          error: error.message
        });
      }
    }
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
