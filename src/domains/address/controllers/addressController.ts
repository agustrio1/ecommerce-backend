import { Request, Response } from "express";
import { AddressService } from "../services/addressService";
import { ApiError } from "../../../error/ApiError";

export class AddressController {
  private addressService: AddressService;

  constructor() {
    this.addressService = new AddressService();

    this.createAddress = this.createAddress.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.getAddressById = this.getAddressById.bind(this);
    this.getAllAddresses = this.getAllAddresses.bind(this);
    this.getAddressByUserId = this.getAddressByUserId.bind(this);
    this.deleteAddress = this.deleteAddress.bind(this);
  }

  /**
   * Create a new address.
   */
  async createAddress(req: Request, res: Response) {
    const addressData = req.body;

    try {
      const address = await this.addressService.createAddress(addressData);
      return res.status(201).json(address);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Update an existing address by its ID.
   */
  async updateAddress(req: Request, res: Response) {
    const { id } = req.params;
    const addressData = req.body;

    try {
      const address = await this.addressService.updateAddress(id, addressData);
      return res.status(200).json(address);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get an address by its ID.
   */
  async getAddressById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const address = await this.addressService.getAddressById(id);
      if (!address) {
        return res.status(404).json({ error: "Address not found." });
      }
      return res.status(200).json(address);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieve all addresses.
   */
  async getAllAddresses(req: Request, res: Response) {
    try {
      const addresses = await this.addressService.getAllAddresses();
      return res.status(200).json(addresses);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieve all addresses by user ID.
   */
  async getAddressByUserId(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const addresses = await this.addressService.getAddressByUserId(userId);
      return res.status(200).json(addresses);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete an address by its ID.
   */
  async deleteAddress(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const address = await this.addressService.deleteAddress(id);
      return res.status(200).json(address);
    } catch (error: any) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}
