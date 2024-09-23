import { Request, Response } from "express";
import { WishlistService } from "../services/wishlistService";

const wishlistService = new WishlistService();

export class WishlistController {
    /**
     * Membuat wishlist baru.
     *
     * @param {Request} req - Objek request dari Express.
     * @param {Response} res - Objek response dari Express.
     * @returns {Promise<Response>} Wishlist yang berhasil dibuat.
     */
    async createWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const wishlistData = req.body;
            const newWishlist = await wishlistService.createWishlist(wishlistData);
            return res.status(201).json(newWishlist);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Mengambil semua wishlist.
     *
     * @param {Request} req - Objek request dari Express.
     * @param {Response} res - Objek response dari Express.
     * @returns {Promise<Response>} Daftar semua wishlist.
     */
    async getAllWishlists(req: Request, res: Response): Promise<Response> {
        try {
            const wishlists = await wishlistService.getAllWishlists();
            const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

            // Menyusun URL gambar dengan base URL
            const formattedWishlists = wishlists.map((wishlist: any) => {
                const productImage = wishlist.product.images.length > 0 ? baseUrl + wishlist.product.images[0].image : null;
                
                return {
                    ...wishlist,
                    product: {
                        ...wishlist.product,
                        image: productImage 
                    }
                };
            });

            return res.status(200).json(formattedWishlists);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Mengambil wishlist berdasarkan ID.
     *
     * @param {Request} req - Objek request dari Express.
     * @param {Response} res - Objek response dari Express.
     * @returns {Promise<Response>} Wishlist yang ditemukan berdasarkan ID.
     */
    async getWishlistById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const wishlist = await wishlistService.getWishlistById(id);
            if (!wishlist) {
                return res.status(404).json({ message: "Wishlist not found" });
            }
            const baseUrl = `${req.protocol}://${req.get("host")}/images/`;
            const productImage = wishlist.product && wishlist.product.images.length > 0 
                ? baseUrl + wishlist.product.images[0].image 
                : null;

            const formattedWishlist = {
                ...wishlist,
                product: {
                    ...wishlist.product,
                    image: productImage 
                }
            };

            return res.status(200).json(formattedWishlist);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Mengambil wishlist berdasarkan userId.
     *
     * @param {Request} req - Objek request dari Express.
     * @param {Response} res - Objek response dari Express.
     * @returns {Promise<Response>} Wishlist yang ditemukan berdasarkan userId.
     */
    async getWishlistByUserId(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const wishlists = await wishlistService.getWishlistByUserId(userId);
            if (!wishlists || wishlists.length === 0) {
                return res.status(404).json({ message: "No wishlists found for this user" });
            }

            const baseUrl = `${req.protocol}://${req.get("host")}/images/`;

            const formattedWishlists = wishlists.map((wishlist: any) => {
                const productImage = wishlist.product.images.length > 0 ? baseUrl + wishlist.product.images[0].image : null;
                
                return {
                    ...wishlist,
                    product: {
                        ...wishlist.product,
                        image: productImage  // Menyertakan URL gambar penuh
                    }
                };
            });

            return res.status(200).json(formattedWishlists);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    /**
     * Menghapus wishlist berdasarkan ID.
     *
     * @param {Request} req - Objek request dari Express.
     * @param {Response} res - Objek response dari Express.
     * @returns {Promise<Response>} Wishlist yang dihapus.
     */
    async deleteWishlistById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const deletedWishlist = await wishlistService.deleteWishlistById(id);
            if (!deletedWishlist) {
                return res.status(404).json({ message: "Wishlist not found" });
            }
            return res.status(200).json({ message: "Wishlist deleted successfully" });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }
}
