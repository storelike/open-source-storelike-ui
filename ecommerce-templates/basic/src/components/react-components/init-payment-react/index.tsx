// IninPaymentPage.tsx
import React, { useState } from 'react';
import styles from './styles.module.css';
import PhoneInput from '../phone-input';
import localeTextSite from '../../../locale/locale_text_site.json';

import PaymentProcessModal from './payment-process-modal';

interface OderDataPay {
  slug: string;
  title: string;
  price: number;
  discount: number;
  is_delivery: boolean;
  image: {
    src: string;
    alt: string;
  };
}

interface IninPaymentPageProps {
  product: OderDataPay;
}

const IninPaymentPage: React.FC<IninPaymentPageProps> = ({ product }) => {
  const { title, price, discount, image, is_delivery } = product || {};

  // Рассчитываем цену со скидкой
  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;

  const [payerData, setPayerData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [isModalOpen, setModalOpen] = useState(false); // Состояние для модального окна

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setPayerData({ ...payerData, [name]: value });
  };

  const generateOrderId = () => {
    const now = new Date();
    const formattedDate = now.toISOString().replace(/[-:T]/g, '').split('.')[0];
    
    return `${formattedDate}`;
  };

  const payDataProduct = {
    product,
    payerData,
    orderId: generateOrderId(),
  };

  // Функция для открытия модального окна
  const handleConfirmPayment = () => {
    setModalOpen(true); // Открываем модальное окно
  };

  // Функция для закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.textBase}>Страница оплаты</h2>
        <a href="/" className={styles.textRed500}>На главную</a>

        {product && (
          <>
            <div className={styles.productInfo}>
              {image.src && (
                <img src={image.src} alt={title} className={styles.productImage} />
              ) }

              <div className={styles.productDetails}>
                <h3>{title}</h3>
                {discount > 0 ? (
                  <p>
                    <span className={styles.originalPrice}>{price.toFixed(2)} ₽</span>
                    <span className={styles.discountedPrice}>{discountedPrice.toFixed(2)} ₽</span>
                  </p>
                ) : (
                  <p className={styles.price}>{price.toFixed(2)} ₽</p>
                )}
                {is_delivery && <p>Требуется доставка</p>}
              </div>
            </div>
          </>
        )}

        <form>
          <h4>Данные плательщика</h4>
          <input
            type="text"
            name="name"
            placeholder="ФИО"
            value={payerData.name}
            onChange={handleInputChange}
            required
            className={styles.inputField}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={payerData.email}
            onChange={handleInputChange}
            required
            className={styles.inputField}
          />
        
        
            <PhoneInput
  name="phone"
  value={payerData.phone}
  placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.phonePlaceholder}
  onChange={handleInputChange}
  className={styles.inputField}
  required
/>

          {is_delivery && (
            <input
              type="text"
              name="address"
              placeholder="Адрес доставки"
              value={payerData.address}
              onChange={handleInputChange}
              required
              className={styles.inputField}
            />
          )}

          <button type="button" onClick={handleConfirmPayment} className={styles.payButton}>
            Подтвердить
          </button>
        </form>
      </div>

      {/* Модальное окно для подтверждения оплаты */}
      <PaymentProcessModal isOpen={isModalOpen} onClose={closeModal} payData={payDataProduct} />
    </div>
  );
};

export default IninPaymentPage;

