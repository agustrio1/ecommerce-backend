import {Router} from "express"
import {ShippingController} from "../controller/shippingController"
import { authMiddleware } from "../../../middlewares/authMiddleware"

export const ShippingRouter = Router()
const shippingController = new ShippingController()

ShippingRouter.post("/", authMiddleware, shippingController.createShipment)
ShippingRouter.put("/:id", authMiddleware, shippingController.updateShipment)
ShippingRouter.get("/:id", authMiddleware, shippingController.getShipmentById)
ShippingRouter.get("/", authMiddleware, shippingController.getAllShipments)
ShippingRouter.delete("/:id", authMiddleware, shippingController.deleteShipment)