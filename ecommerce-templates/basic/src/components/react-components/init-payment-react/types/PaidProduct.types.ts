export interface PaidProduct {
    id: number|string;
    title: string;
    description: string;
    img_url?: string;
    price: number;
    amount: number;
    quantity: number;
    discount: number;
    is_delivery: boolean;
    is_active?:  boolean;
    address_delivery?: string;
    order_id: string;
    fio_customer: string;
    phone_customer: string;
    email_customer: string;
    pay_method: string;
  }
  