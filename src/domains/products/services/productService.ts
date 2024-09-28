import { prisma } from "../../../config/database";
import { ProductType } from "../types/productType";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import { Prisma } from "@prisma/client";

export class ProductService {
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
    try {
      const slug = slugify(productData.name, { lower: true });
  
      return await prisma.$transaction(async (prisma) => {
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
      console.error("Error creating product: ", error.message);
      throw new Error("Gagal membuat produk: " + error.message);
    }
  }
  
  
  /**
   * Mengambil semua produk beserta gambar-gambarnya
   * @returns Array produk
   */
  async getAllProducts(): Promise<any[]> {
    try {
      const products = await prisma.product.findMany({
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
          }
        },
      });
      return products;
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
            }
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
          }
        },
      });
      return product;
    } catch (error: any) {
      throw new Error(error.message);
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
  
        // Jika ada gambar baru yang diupload
        if (images && images.length > 0) {
          // Hapus gambar lama dari server
          for (const img of existingProduct.images) {
            const imgPath = path.join(__dirname, "../../../../public/images", img.image);
            if (fs.existsSync(imgPath)) {
              fs.unlinkSync(imgPath);
            }
          }
  
          // Hapus gambar lama dari database
          await prisma.productImage.deleteMany({ where: { productId: id } });
  
          // Tambahkan gambar baru
          await prisma.productImage.createMany({
            data: images.map((file, index) => ({
              productId: id,
              image: file.filename,
              isPrimary: index === 0 ? true : false,
            })),
          });
        }
  
        // Perbarui data produk dan tags
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            name: productData.name,
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
      throw new Error(error.message);
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
