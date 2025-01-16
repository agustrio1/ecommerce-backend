import { Router } from "express";
import { DiscountController } from "../controllers/discountConroller";
import { adminMiddleware } from "../../../middlewares/authMiddleware";

export const DiscountRouter = Router()
const discountController = new DiscountController()

DiscountRouter.get('/code/:code', discountController.getDiscountByCode)
DiscountRouter.post('/', adminMiddleware, discountController.createDiscount)
DiscountRouter.put('/:id', adminMiddleware, discountController.updateDiscount)
DiscountRouter.get('/:id', discountController.getDiscountById)
DiscountRouter.get('/', discountController.getAllDiscounts)
DiscountRouter.delete('/:id', adminMiddleware, discountController.deleteDiscount)