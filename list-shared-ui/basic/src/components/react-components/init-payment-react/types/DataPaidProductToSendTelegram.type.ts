export interface DataPaidProductToSendTelegram {
    id?: number;
    title: string;
    description?: string;
    price?: number;
    amount: number;
    quantity?: number;
    discount?: number;
    address_delivery?: string;
    order_id: string;
    fio_customer?: string;
    phone_customer?: string;
    email_customer?: string;
    pay_method: string;
  }
  