// utils/sendToTelegramCallToAction.ts
import appConfig from '../../../../const/app-config/app-config.json';

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

  const url = `https://api.telegram.org/bot${appConfig.TOKEN_TELEGRAM}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: appConfig.CHAT_ID_TELEGRAM,
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