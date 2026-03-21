import { useEffect } from 'react';
import { useLocation } from 'react-router';
import type { DataPaidProductToSendTelegram } from '../../../types/DataPaidProductToSendTelegram.type';
import { useSendTelegramPay } from '../../../use-send-telegram-pay';

const TinkoffPageSuccess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);



  // Вынесем все значения из searchParams в отдельные переменные
  const merchantName = searchParams.get('MerchantName');
  const orderId = searchParams.get('OrderId');
  const paymentId = searchParams.get('PaymentId');
  const merchantEmail = searchParams.get('MerchantEmail');
  const backUrl = searchParams.get('BackUrl');
  const rawAmount = searchParams.get('Amount');
  const amount = rawAmount ? parseFloat(rawAmount) / 100 : 0;



  const sendTelegramPay = (dataPayToSendTelegram:any)=> {
    useSendTelegramPay(dataPayToSendTelegram);
  }

  useEffect(() => {
    if (amount && orderId) {
      try {
        const dataPayToSendTelegram: DataPaidProductToSendTelegram = {
          pay_method: 't-bank',
          amount: amount,
          order_id: orderId || '',
          title: 'Успешная оплата на сайте',
        };

         sendTelegramPay(dataPayToSendTelegram);
      } catch (error) {
        console.log('Error sending Telegram Pay', error);
      }
    }
  }, [amount, orderId, sendTelegramPay]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Успешный платеж</h2>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Спасибо за вашу покупку!</h2>
              <p className="text-sm text-gray-600 mb-4">Ваш платеж успешно завершен.</p>
              <p className="text-sm text-gray-600">
                Мы свяжемся с вами по указанным при оплате контактам — номеру телефона или электронной почте. Если у вас возникнут вопросы, вы можете связаться с нами, указав ваш номер заказа (Order ID).
              </p>
            </div>

            <div className="border-t border-gray-200">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Магазин</dt>
                  <dd className="mt-1 text-sm text-gray-900">{merchantName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{orderId}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{paymentId}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Стоимость</dt>
                  <dd className="mt-1 text-sm text-gray-900">{amount} ₽</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Email Магазина:</dt>
                  <dd className="mt-1 text-sm text-gray-900">{merchantEmail}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Сайт:</dt>
                  <dd className="mt-1 text-sm text-gray-900">{backUrl}</dd>
                </div>
              </dl>
              <div className="text-center">
                <a
                  href="/"
                  style={{ backgroundColor: '#3B82F6', borderRadius: '0.5rem', padding: '10px' }}
                  className="text-white hover:bg-blue-700 transition duration-200"
                >
                  На главную
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinkoffPageSuccess;
