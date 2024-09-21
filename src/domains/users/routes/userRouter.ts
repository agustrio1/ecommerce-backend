  import { Router } from "express";
  import { UserController } from "../controllers/userController";
  import { authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

  export const userRoute = Router()
  const userController = new UserController();

  userRoute.get('/', authMiddleware, adminMiddleware, userController.getUsers)
  userRoute.get('/:id', authMiddleware, userController.getUser)
  userRoute.put('/:id', authMiddleware, userController.updateUser)
  userRoute.delete('/:id', authMiddleware, userController.deleteUser)