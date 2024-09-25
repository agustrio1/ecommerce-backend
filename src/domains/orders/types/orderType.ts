export interface CreateOrderDTO {
  userId: string;
  addressId: string;
  total: number;
  status: string;
  discountCode?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    images: { image: string }[];
  }[];
}

export interface UpdateOrderDTO {
  id: string;
  userId: string;
  addressId: string;
  total: number;
  status: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    images: { image: string }[];
  }[];
}

export interface OrderType {
  id: string;
  userId: string;
  addressId: string;
  total: number;
  status: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    images: { image: string }[];
  }
  createdAt: Date;
  updatedAt: Date;
}
