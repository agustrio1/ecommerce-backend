import { prisma } from "../../../config/database";
import axios from "axios";
import { CreateShipmentDTO, UpdateShipmentDTO } from "../types/shippingType";
import { Shipment } from "@prisma/client";
import {
  SHIPPINGS_TOKEN,
  RAJAONGKIR_BASE_URL,
  RAJAONGKIR_BASE_CITY_URL,
} from "../../../config/env";

export class ShippingService {
  private readonly KEDIRI_ID = "178";
  private readonly KEDIRI_NAME = "Kediri";
  private cityCache: Record<string, string> = {}; // Cache untuk menyimpan ID kota

  private async getCityIdByName(
    cityName: string,
    provinceName: string
  ): Promise<string | null> {
    const cacheKey = `${cityName.toLowerCase()}-${provinceName.toLowerCase()}`;

    if (this.cityCache[cacheKey]) {
      return this.cityCache[cacheKey];
    }

    try {
      const response = await axios.get(
        `${RAJAONGKIR_BASE_CITY_URL}?city_name=${encodeURIComponent(cityName)}`,
        {
          headers: { key: SHIPPINGS_TOKEN as string },
        }
      );

      const cities = response.data.rajaongkir.results;

      const matchingCity = cities.find(
        (city: any) =>
          city.city_name.toLowerCase() === cityName.toLowerCase() &&
          city.province.toLowerCase() === provinceName.toLowerCase()
      );

      if (matchingCity) {
        this.cityCache[cacheKey] = matchingCity.city_id;
        this.cityCache[matchingCity.city_id] = matchingCity.city_name;
        return matchingCity.city_id;
      } else {
        console.warn(
          `Kota dengan nama ${cityName} dan provinsi ${provinceName} tidak ditemukan.`
        );
        return null;
      }
    } catch (error: any) {
      console.error("Error fetching city ID:", error.message);
      throw new Error("Gagal mendapatkan ID kota.");
    }
  }

  async createShipment(shipmentData: CreateShipmentDTO): Promise<Shipment> {
    try {
      const { orderId, courier, service } = shipmentData;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { address: true, orderItems: { include: { product: true } } },
      });

      if (!order || !order.address) {
        throw new Error("Order atau alamat tidak ditemukan.");
      }

      // Ambil berat produk dari orderItems
      const totalWeight = order.orderItems.reduce((sum, item) => {
        return sum + item.product.weight * item.quantity;
      }, 0);      

      const totalWeightInGrams = Math.round(totalWeight * 1000);

      const originCity = this.KEDIRI_ID;
      const destinationCityName = order.address.city;
      const destinationProvinceName = order.address.state;

      const destinationCityId = await this.getCityIdByName(
        destinationCityName,
        destinationProvinceName
      );
      if (!destinationCityId) {
        throw new Error(`Kota ${destinationCityName} tidak ditemukan.`);
      }

      // Buat request ke Raja Ongkir
      const response = await axios.post(
        RAJAONGKIR_BASE_URL as string,
        {
          origin: originCity,
          destination: destinationCityId,
          weight: totalWeightInGrams,
          courier: courier,
        },
        {
          headers: { key: SHIPPINGS_TOKEN as string },
        }
      );

      const results = response.data.rajaongkir.results;

      if (!results || results.length === 0) {
        throw new Error("Tidak ada hasil dari Raja Ongkir");
      }

      const costs = results[0].costs;
      let selectedService =
        costs.find((item: any) => item.service === service) || costs[0];

      if (selectedService.cost && selectedService.cost.length > 0) {
        const { value, etd } = selectedService.cost[0];

        const createdShipment = await prisma.shipment.create({
          data: {
            orderId: orderId,
            originCity,
            destinationCity: destinationCityId,
            weight: totalWeightInGrams,
            courier: courier,
            service: selectedService.service,
            cost: value,
            etd: etd,
          } as any,
        });

        return createdShipment;
      } else {
        throw new Error(
          `Tidak ada informasi biaya untuk layanan ${selectedService.service}`
        );
      }
    } catch (error: any) {
      console.error("Error during shipment creation:", error.message);
      throw new Error(`Gagal membuat pengiriman: ${error.message}`);
    }
  }

  async updateShipment(shipmentData: UpdateShipmentDTO): Promise<Shipment> {
    try {
      const updatedShipment = await prisma.shipment.update({
        where: { id: shipmentData.id },
        data: {
          status: shipmentData.status,
          trackingNumber: shipmentData.trackingNumber,
          shippedAt: shipmentData.shippedAt,
          deliveredAt: shipmentData.deliveredAt,
        } as any,
      });

      return updatedShipment;
    } catch (error: any) {
      console.error("Error during shipment update:", error.message);
      throw new Error(`Gagal memperbarui pengiriman: ${error.message}`);
    }
  }

  async getAllShipments(): Promise<Shipment[]> {
    try {
      const shipments = await prisma.shipment.findMany({
        include: {
          order: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              address: true,
            },
          },
          shipmentHistory: true,
        },
      });

      return shipments.map((shipment) => ({
        ...shipment,
        originCity: this.KEDIRI_NAME,
        destinationCity:
          shipment.order?.address?.city || shipment.destinationCity,
      }));
    } catch (error: any) {
      console.error("Error fetching all shipments:", error.message);
      throw new Error("Gagal mendapatkan daftar pengiriman.");
    }
  }

  async getShipmentById(id: string): Promise<Shipment | null> {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              address: true,
            },
          },
          shipmentHistory: true,
        },
      });

      if (!shipment) {
        throw new Error("Pengiriman tidak ditemukan.");
      }

      return {
        ...shipment,
        originCity: this.KEDIRI_NAME,
        destinationCity:
          shipment.order?.address?.city || shipment.destinationCity,
      };
    } catch (error: any) {
      console.error("Error fetching shipment by ID:", error.message);
      throw new Error(`Gagal mendapatkan pengiriman: ${error.message}`);
    }
  }

  async deleteShipment(id: string): Promise<Shipment> {
    try {
      const deletedShipment = await prisma.shipment.delete({
        where: { id },
      });

      return deletedShipment;
    } catch (error: any) {
      console.error("Error deleting shipment:", error.message);
      throw new Error(`Gagal menghapus pengiriman: ${error.message}`);
    }
  }
}
