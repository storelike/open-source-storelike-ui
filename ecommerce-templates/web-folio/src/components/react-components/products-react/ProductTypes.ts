// ProductTypes.ts
export interface ProductColection {
  id: string;
  slug?: string;      
  body?: string;
  collection: string;
  data: Product;
  render?:any;
}

// ProductTypes.ts
export interface Product {
  id: any;
  serial_number: number;
  title: string;
  description: string;
  pubDate?: string;
  updateDate?: string;
  draft?: boolean;
  snippet?: string;
  image: {
    src: string;
    alt: string;
  };
  category?: string;
  author?: string;
  tags?: string[];
  price: number;
  discount: number;
  is_active: boolean;
  is_delivery: boolean;
  is_payment_button: boolean;
 
}
