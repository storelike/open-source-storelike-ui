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
    New ORDER:
    Name: ${name}
    Phone: ${phone}
    Email: ${email}
    Product: ${orderDataSendTelegram.title}
    Discounted price: ${orderDataSendTelegram.discountedPrice}
    Delivery details: ${delivery}
    Additional information: ${message}
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
      throw new Error('Failed to send data to Telegram');
    }

    return { success: true, message: 'Message sent to Telegram successfully.' };
  } catch (error) {
    console.error('Failed to send data to Telegram:', error);
    return { success: false, message: 'Failed to send data to Telegram.' };
  }
};

export default sendOrderToTelegram;
