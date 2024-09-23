import { Router } from "express";
import { AddressController } from "../controllers/addressController";
import { authMiddleware, adminMiddleware } from "../../../middlewares/authMiddleware";

export const AddressRouter = Router();
const addressController = new AddressController();

AddressRouter.post("/", authMiddleware, addressController.createAddress);
AddressRouter.put("/:id", authMiddleware, addressController.updateAddress);
AddressRouter.get("/:id", authMiddleware, addressController.getAddressById);
AddressRouter.get("/", authMiddleware, adminMiddleware, addressController.getAllAddresses);
AddressRouter.get(
  "/:userId",
  authMiddleware,
  addressController.getAddressByUserId
);
AddressRouter.delete("/:id", authMiddleware, addressController.deleteAddress);
