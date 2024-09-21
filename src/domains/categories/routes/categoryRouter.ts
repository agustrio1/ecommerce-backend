import { Router } from "express";
import { CategoryController } from "../controllers/categoryController";
import { adminMiddleware } from "../../../middlewares/authMiddleware";

export const categoryRouter = Router()
const categoryController = new CategoryController()

categoryRouter.get('/', categoryController.getAllCategories)
categoryRouter.get('/:id', categoryController.getCategoryById)
categoryRouter.post('/', adminMiddleware, categoryController.createCategory)
categoryRouter.put('/:id', adminMiddleware, categoryController.updateCategory)
categoryRouter.delete('/:id', adminMiddleware, categoryController.deleteCategory)