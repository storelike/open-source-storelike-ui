// utils/sendToTelegramCallToAction.ts
import cmAppConfig from '../../../../locale/cms-locale.json';

interface UserData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

const sendToTelegramCallToAction = async (userData: UserData): Promise<{ success: boolean; message?: string }> => {
  const { name, phone, email, message } = userData;

  const messageToSend = `
    Новый запрос на связь:
    Имя: ${name}
    Телефон: ${phone}
    Email: ${email}
    Сообщение: ${message}
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

export default sendToTelegramCallToAction;