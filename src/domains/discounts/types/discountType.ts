
import { DiscountType as PrismaDiscountType } from "@prisma/client";

export type DiscountType = {
  id: string;
  code: string;
  description?: string;
  discountType: PrismaDiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageCount: number;
  maxUsage?: number;
  createdAt: Date;
  updatedAt: Date;
};
export type CreateDiscountDTO = {
  code: string;
  description?: string;
  discountType: PrismaDiscountType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  maxUsage?: number;
};

export type UpdateDiscountDTO = {
  code?: string;
  description?: string;
  discountType?: PrismaDiscountType;
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt?: Date;
  maxUsage?: number;
};
