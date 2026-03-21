// PaymentProcessModal.tsx
import React from 'react';
import styles from './styles.module.css';
import TinkoffPaymentComponent from '../payment-method/t-bank';
import type { PaidProduct } from '../types/PaidProduct.types';

interface PaymentProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payData: {
    product: {
      title: string;
      price: number;
      discount: number;
      is_delivery:boolean;
      image: {
        src: string;
        alt: string;
      };
    };
    payerData: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    orderId: string;
  };
}

const PaymentProcessModal: React.FC<PaymentProcessModalProps> = ({ isOpen, onClose, payData }) => {
  if (!isOpen) return null; // Если модальное окно не открыто, ничего не рендерим

  const { product, payerData, orderId } = payData;
  const discountedPrice = product.discount > 0 ? product.price - (product.price * product.discount) / 100 : product.price;

  const paidProduct: PaidProduct = {
    id:orderId,
    pay_method:"t-bank",
    title:product.title,
    description: payData.orderId,
    price: product.price,
    discount:product.discount,
    is_delivery: product.is_delivery,
    amount: product.price,
    quantity: 1.00,
    fio_customer: payerData?.name,
    email_customer: payerData?.email,
    phone_customer: payerData?.phone,
    address_delivery: payerData?.address,
    order_id: orderId

  }


  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Оплата</h2>
        <div className={styles.productInfo}>
          <img src={product.image.src} alt={product.image.alt} className={styles.productImage} />
          
          {product.discount > 0 ? (
            <p className='text-lg font-bold'>
              Цена:<span className={styles.originalPrice}>{product.price.toFixed(2)} ₽</span>
              <br/>
             Со скидкой:  <span className={styles.discountedPrice}>{discountedPrice.toFixed(2)} ₽</span>
            </p>
          ) : (
            <p className={styles.price}>{product.price.toFixed(2)} ₽</p>
          )}
        </div>
      
       


<TinkoffPaymentComponent paidProduct={paidProduct} />


        <div className={styles.modalActions}>
         
          <button onClick={onClose} className={styles.cancelButton}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessModal;
