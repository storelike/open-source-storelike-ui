// utils/sendToTelegramCallToAction.ts
import cmAppConfig from '../../../../locale/cms-locale.json';

interface UserDataSendTelegram {
  name: string;
  phone: string;
  email: string;
  message: string;
  delivery: string;
  orderDataSendTelegram: OrderData;
}

interface OrderData {
  title: string;
  discountedPrice: number;
  is_delivery: boolean;
}

const sendOrderToTelegram = async (sendTelegramAllData: UserDataSendTelegram): Promise<{ 
  success: boolean; 
  message?: string  
}> => {
  const { name, phone, email, message, orderDataSendTelegram, delivery } = sendTelegramAllData;

  const messageToSend = `
    Новый ЗАКАЗ:
    Имя: ${name}
    Телефон: ${phone}
    Email: ${email}
    Продукт: ${orderDataSendTelegram.title}
    Цена со скидкой: ${orderDataSendTelegram.discountedPrice}
    Данные по доставке: ${delivery}
    Дополнительная информация: ${message}
  `;

  const url = `https://api.telegram.org/bot${cmAppConfig.cmAppConfig.tokenTelegram.value}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cmAppConfig.cmAppConfig.chatIdTelegram.value,
        text: messageToSend,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при отправке данных в Telegram');
    }

    return { success: true, message: 'Сообщение успешно отправлено в Telegram.' };
  } catch (error) {
    console.error('Ошибка при отправке данных в Telegram:', error);
    return { success: false, message: 'Ошибка при отправке данных в Telegram.' };
  }
};

export default sendOrderToTelegram;
