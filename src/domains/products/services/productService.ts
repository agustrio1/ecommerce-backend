import { prisma } from "../../../config/database";
import { ProductType } from "../types/productType";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import { contains } from "validate.js";

export class ProductService {

  private getUploadPath() {
    // Use environment variable for upload path
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    return uploadDir;
  }

  /**
   * Membuat produk baru beserta gambar-gambarnya
   * @param productData Data produk
   * @param images Array file gambar yang diupload
   * @returns Produk yang dibuat
   */
  async createProduct(
    productData: ProductType,
    images: Express.Multer.File[],
    tags?: string[]
  ): Promise<any> {
    const uploadPath = this.getUploadPath();

    try {
      const slug = slugify(productData.name, { lower: true });

      return await prisma.$transaction(async (prisma) => {
        // Validate images
        if (!images || images.length === 0) {
          throw new Error("At least one image is required");
        }

        // Ensure all images exist
        for (const file of images) {
          const filePath = path.join(uploadPath, file.filename);
          if (!fs.existsSync(filePath)) {
            throw new Error(`Image file ${file.filename} not found`);
          }
        }

        const product = await prisma.product.create({
          data: {
            name: productData.name,
            slug: slug,
            description: productData.description,
            price: productData.price,
            weight: productData.weight,
            stock: productData.stock,
            category: {
              connect: { id: productData.categoryId },
            },
            images: {
              create: images.map((file, index) => ({
                image: file.filename,
                isPrimary: index === 0,
              })),
            },
            tags: tags?.length
              ? {
                  connectOrCreate: tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                  })),
                }
              : undefined,
          },
          include: {
            images: true,
            category: true,
            tags: true,
          },
        });

        return product;
      });
    } catch (error: any) {
      // Delete uploaded images in case of error
      for (const file of images) {
        const filePath = path.join(uploadPath, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      console.error("Error creating product: ", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Mengambil semua produk beserta gambar-gambarnya
   * @returns Array produk
   */
  async getAllProducts(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = ''
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};
  
      if (searchTerm.trim()) {
        where.name = {
          contains: searchTerm,
          mode: 'insensitive',
        };
      }
  
      const [total, products] = await prisma.$transaction([
        prisma.product.count({ where }),
  
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            images: {
              select: {
                id: true,
                image: true,
                isPrimary: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
            tags: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);
  
      const totalPages = Math.ceil(total / limit);
  
      return {
        data: products,
        searchTerm,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  
  /**
   * Mengambil produk berdasarkan ID beserta gambar-gambarnya
   * @param id ID produk
   * @returns Produk atau null
   */
  async getProductById(id: string): Promise<any | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            select: {
              id: true,
              image: true,
              isPrimary: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });
      return product;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Mengambil produk berdasarkan slug beserta gambar-gambarnya
   * @param slug Slug produk
   * @returns Produk atau null
   */
  async getProductBySlug(slug: string): Promise<any | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          images: {
            select: {
              id: true,
              image: true,
              isPrimary: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });
      return product;
    } catch (error: any) {
      throw new Error("Error fetching product by slug: " + error.message);
    }
  }

  /**
   * Mengambil produk berdasarkan nama kategori beserta gambar-gambarnya
   * @param categoryName Nama kategori
   * @returns Produk atau null
   * @throws {Error} Jika terjadi kesalahan saat mengambil produk berdasarkan kategori
   */
  async getProductByCategorySlug(slug: string): Promise<any[]> {
    try {
      const products = await prisma.product.findMany({
        where: {
          category: {
            slug: {
              equals: slug,
            },
          },
        },
        include: {
          images: {
            select: {
              id: true,
              image: true,
              isPrimary: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });

      if (products.length === 0) {
        throw new Error(`Produk dengan kategori '${slug}' tidak ditemukan.`);
      }

      return products;
    } catch (error: any) {
      throw new Error(
        `Gagal mengambil produk berdasarkan kategori: ${error.message}`
      );
    }
  }

  /**
   * Mengambil produk berdasarkan produk terbaru beserta gambar-gambarnya
   * @returns Produk terbaru
   */
  async getLatestProducts(): Promise<any[]> {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: "desc", // Mengurutkan berdasarkan createdAt secara menurun
        },
        include: {
          images: {
            select: {
              id: true,
              image: true,
              isPrimary: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });
      return products;
    } catch (error: any) {
      throw new Error("Error fetching latest products: " + error.message);
    }
  }

  /**
   * Memperbarui produk beserta gambar-gambarnya
   * @param id ID produk
   * @param productData Data produk
   * @param images Array file gambar baru (opsional)
   * @returns Produk yang diperbarui atau null
   */
  async updateProduct(
    id: string,
    productData: Partial<ProductType>,
    images?: Express.Multer.File[],
    tags?: string[]
  ): Promise<any | null> {
    const uploadPath = this.getUploadPath();

    try {
      return await prisma.$transaction(async (prisma) => {
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { images: true },
        });

        if (!existingProduct) {
          throw new Error("Product not found");
        }

        if (images?.length) {
          // Delete old images
          for (const img of existingProduct.images) {
            const imgPath = path.join(uploadPath, img.image);
            if (fs.existsSync(imgPath)) {
              try {
                fs.unlinkSync(imgPath);
              } catch (err) {
                console.error(`Failed to delete image ${img.image}:`, err);
              }
            }
          }

          // Delete old image records
          await prisma.productImage.deleteMany({ 
            where: { productId: id } 
          });

          // Create new image records
          await prisma.productImage.createMany({
            data: images.map((file, index) => ({
              productId: id,
              image: file.filename,
              isPrimary: index === 0,
            })),
          });
        }

        // Update product data
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            name: productData.name,
            slug: productData.name ? slugify(productData.name, { lower: true }) : undefined,
            description: productData.description,
            weight: productData.weight,
            price: productData.price,
            stock: productData.stock,
            categoryId: productData.categoryId,
            tags: tags
              ? {
                  set: [],
                  connectOrCreate: tags.map((tag) => ({
                    where: { name: tag },
                    create: { name: tag },
                  })),
                }
              : undefined,
          },
          include: {
            images: true,
            category: true,
            tags: true,
          },
        });

        return updatedProduct;
      });
    } catch (error: any) {
      // If there are new images and an error occurs, delete them
      if (images?.length) {
        for (const file of images) {
          const filePath = path.join(uploadPath, file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
      
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Menghapus produk beserta gambar-gambarnya
   * @param id ID produk
   * @returns Produk yang dihapus atau null
   */
  async deleteProduct(id: string): Promise<any | null> {
    try {
      return await prisma.$transaction(async (prisma) => {
        // Cek apakah produk ada
        const existingProduct = await prisma.product.findUnique({
          where: { id },
          include: { images: true },
        });
        if (!existingProduct) {
          throw new Error("Product not found");
        }

        // Hapus gambar dari server
        for (const img of existingProduct.images) {
          const imgPath = path.join(
            __dirname,
            "../../../../public/images",
            img.image
          );
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }

        const deletedProduct = await prisma.product.delete({
          where: { id },
          include: {
            images: true,
            tags: true,
          },
        });

        return deletedProduct;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
