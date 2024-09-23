import { AddressType as PrismaAddressType } from "@prisma/client";

export type AddressType = {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  type: PrismaAddressType;
  userId: string;
};
