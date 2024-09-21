
import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

export const productRouter = Router();
const productController = new ProductController();

productRouter.get('/',  productController.getAllProducts);

productRouter.get('/:id', productController.getProductById);

productRouter.post('/', adminMiddleware, productController.createProduct);

productRouter.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);

productRouter.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
