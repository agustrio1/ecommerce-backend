import { Request, Response } from "express";
import { DiscountService } from "../services/dicountService";
import { CreateDiscountDTO, UpdateDiscountDTO } from "../types/discountType";
import { DiscountValidator } from "../validator/discountValidator";
import { ApiError } from "../../../error/ApiError";
import validate from "validate.js";

export class DiscountController {
  private discountService: DiscountService;

  constructor() {
    this.discountService = new DiscountService();

    this.createDiscount = this.createDiscount.bind(this);
    this.updateDiscount = this.updateDiscount.bind(this);
    this.getDiscountById = this.getDiscountById.bind(this);
    this.getAllDiscounts = this.getAllDiscounts.bind(this);
    this.getDiscountByCode = this.getDiscountByCode.bind(this);
    this.deleteDiscount = this.deleteDiscount.bind(this);
  }

  // Create Discount
  async createDiscount(req: Request, res: Response) {
    const error = validate(req.body, DiscountValidator.create);
    if (error) {
      return res.status(400).json({ error: error });
    }

    const discountData: CreateDiscountDTO = req.body;

    try {
      const discount = await this.discountService.createDiscount(discountData);
      return res.status(201).json(discount);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Update Discount
  async updateDiscount(req: Request, res: Response) {
    const error = validate(req.body, DiscountValidator.update);
    if (error) {
      return res.status(400).json({ error: error });
    }

    const discountData: UpdateDiscountDTO = req.body;
    const { id } = req.params;

    try {
      const discount = await this.discountService.updateDiscount(
        id,
        discountData
      );
      return res.status(200).json(discount);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Get Discount by ID
  async getDiscountById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const discount = await this.discountService.getDiscountById(id);
      return res.status(200).json(discount);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Get All Discounts
  async getAllDiscounts(req: Request, res: Response) {
    try {
      const discounts = await this.discountService.getAllDiscounts();
      return res.status(200).json(discounts);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Get Discount by Code
  async getDiscountByCode(req: Request, res: Response) {
    const { code } = req.params;

    try {
      const discount = await this.discountService.getDiscountByCode(code);
      return res.status(200).json(discount);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  // Delete Discount
  async deleteDiscount(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await this.discountService.deleteDiscount(id);
      return res.status(204).json();
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
