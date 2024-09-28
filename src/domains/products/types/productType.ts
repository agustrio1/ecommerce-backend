export interface ProductType  {
  id?: string;
  name: string;
  slug: string;
  description: string;
  weight: number;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  tags?: string[]
};
 