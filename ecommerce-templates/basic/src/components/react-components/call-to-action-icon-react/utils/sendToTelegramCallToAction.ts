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
    New contact request:
    Name: ${name}
    Phone: ${phone}
    Email: ${email}
    Message: ${message}
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

export default sendToTelegramCallToAction;