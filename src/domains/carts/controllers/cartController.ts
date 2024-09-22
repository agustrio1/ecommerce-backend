import { Request, Response } from "express";
import { CartService } from "../services/cartService";
import { ApiError } from "../../../error/ApiError";

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();

    this.createOrUpdateCart = this.createOrUpdateCart.bind(this);
    this.updateCart = this.updateCart.bind(this);
    this.getCartByUserId = this.getCartByUserId.bind(this);
    this.getAllCarts = this.getAllCarts.bind(this);
    this.deleteCart = this.deleteCart.bind(this);
  }

  private getImageUrl(req: Request, imagePath: string): string {
    return `${req.protocol}://${req.get("host")}/images/${imagePath}`;
  }

  /**
   * Membuat atau memperbarui entri keranjang
   */
  async createOrUpdateCart(req: Request, res: Response) {
    const { userId, productId } = req.body;
    let { quantity } = req.body;

    quantity = Number(quantity);

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        error:
          "Quantity harus berupa angka yang valid dan lebih besar dari nol.",
      });
    }

    const cartData = { userId, productId, quantity };

    try {
      const cart = await this.cartService.createOrUpdateCart(cartData as any);
      return res.status(cart.id ? 200 : 201).json(cart);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Memperbarui jumlah entri keranjang
   */
  async updateCart(req: Request, res: Response) {
    const { userId, productId } = req.body;
    let { quantity } = req.body;

    quantity = Number(quantity);

    // Validasi bahwa quantity adalah number dan tidak negatif
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({
        error: "Quantity harus berupa angka yang valid dan tidak negatif.",
      });
    }

    try {
      const cart = await this.cartService.updateCart(
        userId,
        productId,
        quantity
      );
      return res.status(200).json(cart);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Mengambil semua entri keranjang untuk pengguna tertentu
   */
  async getCartByUserId(req: Request, res: Response) {
    const userId = req.params.userId;
    const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

    try {
      const cartItems = await this.cartService.getCartByUserId(userId);

      const processedCartItems = cartItems.map((item) => {
        const imagePath = item.product.images[0]?.image || "default.jpg"; 
        const imageUrl = this.getImageUrl(req, imagePath);
        return {
          ...item,
          product: {
            ...item.product,
            images: [
              {
                image: imageUrl,
              },
            ],
          },
        };
      });

      return res.status(200).json(processedCartItems);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Mengambil semua entri keranjang (Admin)
   */
  async getAllCarts(req: Request, res: Response) {
    const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

    try {
      const carts = await this.cartService.getAllCart();

      const processedCarts = carts.map((cart) => {
        const imagePath = cart.product.images[0]?.image || "default.jpg";
        const imageUrl = this.getImageUrl(req, imagePath);
        return {
          ...cart,
          product: {
            ...cart.product,
            images: [
              {
                image: imageUrl,
              },
            ],
          },
        };
      });

      return res.status(200).json(processedCarts);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Menghapus entri keranjang
   */
  async deleteCart(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const cart = await this.cartService.deleteCart(id);
      return res.status(200).json(cart);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: error.message });
    }
  }
}
