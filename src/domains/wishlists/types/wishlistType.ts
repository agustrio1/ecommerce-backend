
import { Product, User } from "@prisma/client";

export type WishlistType = {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
  };
  product?: {
    name: string;
    images: { image: string }[];
    price: number;
  };
};


export type CreateWishlistDTO = {
  userId: string;
  productId: string;
};


export type UpdateWishlistDTO = {
  userId?: string;
  productId?: string;
};
