// product.interface.ts
export interface Product {
    id: number|string;
    title: string;
    description: string;
    img_url: string;
    price: number;
    amount: number;
    quantity: number;
    discount: number;
    is_delivery: boolean;
    is_active:  boolean;
    address_delivery?: string;
  }
  