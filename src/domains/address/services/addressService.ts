import { Prisma, Address } from "@prisma/client";
import { prisma } from "../../../config/database";
import { AddressType } from "../types/addresType";

export class AddressService {
  /**
   * Create a new address.
   *
   * @param {AddressType} addressData - The data for the new address.
   * @returns {Promise<Address>} The created address.
   * @throws {Error} If there is an error during the creation process.
   */
  async createAddress(addressData: AddressType): Promise<Address> {
    try {
      const address = await prisma.address.create({
        data: {
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          postalCode: addressData.postalCode,
          phone: addressData.phone,
          type: addressData.type,
          userId: addressData.userId,
        },
      });
      return address;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Update an existing address by its ID.
   *
   * @param {string} id - The ID of the address to update.
   * @param {AddressType} addressData - The updated address data.
   * @returns {Promise<Address>} The updated address.
   * @throws {Error} If there is an error during the update process.
   */
  async updateAddress(id: string, addressData: AddressType): Promise<Address> {
    try {
      const address = await prisma.address.update({
        where: { id },
        data: {
          address1: addressData.address1,
          address2: addressData.address2,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          postalCode: addressData.postalCode,
          phone: addressData.phone,
          type: addressData.type,
        },
      });
      return address;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Get an address by its ID.
   *
   * @param {string} id - The ID of the address to retrieve.
   * @returns {Promise<Address | null>} The found address or null if not found.
   * @throws {Error} If there is an error during the retrieval process.
   */
  async getAddressById(id: string): Promise<Address | null> {
    try {
      const address = await prisma.address.findUnique({ where: { id } });
      return address;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Retrieve all addresses.
   *
   * @returns {Promise<Address[]>} A list of all addresses.
   * @throws {Error} If there is an error during the retrieval process.
   */
  async getAllAddresses(): Promise<Address[]> {
    try {
      const addresses = await prisma.address.findMany();
      return addresses;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Retrieve all addresses by the user ID.
   *
   * @param {string} userId - The ID of the user whose addresses are to be retrieved.
   * @returns {Promise<Address[]>} A list of addresses belonging to the user.
   * @throws {Error} If there is an error during the retrieval process.
   */
  async getAddressByUserId(userId: string): Promise<Address[]> {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId },
      });
      return addresses;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Delete an address by its ID.
   *
   * @param {string} id - The ID of the address to delete.
   * @returns {Promise<Address>} The deleted address.
   * @throws {Error} If there is an error during the deletion process.
   */
  async deleteAddress(id: string): Promise<Address> {
    try {
      const address = await prisma.address.delete({ where: { id } });
      return address;
    } catch (error: any) {
      this.handlePrismaError(error);
    }
  }

  /**
   * Handles and throws proper Prisma error messages.
   *
   * @param {any} error - The error object.
   * @throws {Error} Throws a formatted error message.
   */
  private handlePrismaError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma error codes
      if (error.code === "P2002") {
        throw new Error(
          "There is a unique constraint violation, the address already exists."
        );
      } else if (error.code === "P2025") {
        throw new Error("Address not found.");
      }
    }
    throw new Error(error.message || "An unexpected error occurred");
  }
}
