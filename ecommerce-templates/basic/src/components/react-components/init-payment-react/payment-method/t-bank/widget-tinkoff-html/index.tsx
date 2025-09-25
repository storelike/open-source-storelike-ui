import { useEffect, useRef, useState } from 'react';
import cmAppConfig from '../../../../../../locale/cms-locale.json';
import styles from './styles.module.css';
import { useSendTelegramPay } from '../../../use-send-telegram-pay';
import type { PaidProduct } from '../../../types/PaidProduct.types';
import type { DataPaidProductToSendTelegram } from '../../../types/DataPaidProductToSendTelegram.type';

declare global {
  interface Window {
    pay: (form: HTMLFormElement) => void;
  }
}

const WidgetTinkoffHtml: React.FC<{ paidProduct: PaidProduct }> = ({ paidProduct }) => {
  const [productData, setProductData] = useState<PaidProduct | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const discountedPrice = (paidProduct.price - (paidProduct.price * paidProduct.discount) / 100).toFixed(2);

  // Обновляем состояние, когда загружаются данные для paidProduct
  useEffect(() => {
    if (paidProduct) {
      setProductData(paidProduct);
      if (paidProduct.discount){
        setCustomAmount(Number(discountedPrice));
      } else {
        setCustomAmount(paidProduct?.amount || 0);

      }
    }
  }, [paidProduct]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://securepay.tinkoff.ru/html/payForm/js/tinkoff_v2.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const TPF = formRef.current;

    if (TPF) {
      const handleSubmit = (e: Event) => {
        e.preventDefault();
        const { description, amount, email, phone, receipt }: any = TPF;

        if (receipt) {
          if (!email.value && !phone.value) {
            alert('Поле E-mail или Phone не должно быть пустым');
            return;
          }

          TPF.receipt.value = JSON.stringify({
            EmailCompany: cmAppConfig.cmAppConfig.tinkoffEmailCompany.value,
            Taxation: cmAppConfig.cmAppConfig.tinkoffTaxionCompany.value,
            FfdVersion: '1.2',
            Items: [
              {
                Name: description.value || 'Оплата',
                Price: Number(amount.value * 100),
                Quantity: 1.0,
                Amount: Number(amount.value * 100),
                PaymentMethod: 'full_prepayment',
                PaymentObject: 'service',
                Tax: 'none',
                MeasurementUnit: 'pc',
              },
            ],
          });
        }

        if (window.pay) {
          try {
            const dataPayToSendTelegram: DataPaidProductToSendTelegram = {
              email_customer: productData?.email_customer || '',
              pay_method: 't-bank',
              amount: Number(discountedPrice) || 0,
              order_id: productData?.order_id || '',
              address_delivery: productData?.address_delivery || '',
              phone_customer: productData?.phone_customer || '',
              fio_customer: productData?.fio_customer || '',
              title: productData?.title || '',
            };

            useSendTelegramPay(dataPayToSendTelegram);
          } catch (error) {
            console.log('Error Send Telegram Pay');
          }

          window.pay(TPF);
        } else {
          console.error('Функция pay не найдена.');
        }
      };

      TPF.addEventListener('submit', handleSubmit);

      return () => {
        TPF.removeEventListener('submit', handleSubmit);
      };
    }
  }, [isScriptLoaded, productData]);

  return (
    <>
      <form className={styles.formContainer} name="payform-tinkoff" id="payform-tinkoff" ref={formRef}>
        <input className={styles.inputRow} type="hidden" name="terminalkey" value={cmAppConfig.cmAppConfig.tinkoffTerminalKey.value} />
        <input className={styles.inputRow} type="hidden" name="frame" value="false" />
        <input className={styles.inputRow} type="hidden" name="language" value="ru" />
        <input className={styles.inputRow} type="hidden" name="receipt" value="" />

        <label htmlFor="amount" className={`hidden ${styles.mb2} ${styles.textGray100}`}>
          Сумма заказа
        </label>
        <input
          className={`hidden ${styles.inputRow}`}
          type="number"
          placeholder="Сумма заказа"
          name="amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(Number(e.target.value))}
          required
        />
        <input className={styles.inputRow} type="hidden" name="order" value={productData?.order_id || ''} />
        <input
          className={styles.inputRow}
          type="hidden"
          name="description"
          value={`Заказ №${productData?.order_id || ''}, Оплатил: ${productData?.email_customer || ''}, ${
            productData?.title?.slice(0, 50) || ''
          }`}
        />
        <input className={styles.inputRow} type="hidden" name="name" readOnly value={`${productData?.fio_customer || ''}`} />
        <input className={styles.inputRow} type="hidden" name="email" value={productData?.email_customer || ''} />
        <input className={styles.inputRow} type="hidden" name="phone" />

        <div className={`${styles.mb6} ${styles.card}`}>
          <label className={styles.cardLabel}>Ваш заказ:</label>
          <p className={`${styles.mb4} ${styles.cardText}`}>
            <span>№ {productData?.order_id}</span>
          </p>
          <p className={`${styles.mb4} ${styles.cardText}`}>
            <label className={styles.cardLabel}>Название товара:</label>
            <span className={styles.cardTextBold}>{productData?.title}</span>
          </p>
        </div>

        <>
          <input className={` ${styles.inputRow} ${styles.submitBtn}`} type="submit" value={` Оплатить ${customAmount} ₽`} />
          <p className='hidden'>Выше можно изменить сумму оплаты!</p>
        </>
      </form>
    </>
  );
};

export default WidgetTinkoffHtml;
