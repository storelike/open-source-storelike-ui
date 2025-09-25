// Типы данных для параметров
interface UserData {
  name: string;
  email: string;
  phone: string;
  contactMethod: string; // This field is required
}

interface UserAnswer {
  question: string;
  answer: string;
}

interface SendToTelegramProps {
  api_token: string;
  my_channel_name: string;
  userData: UserData;
  userAnswers: UserAnswer[];
  setOpenModalInit: (value: boolean) => void;
  setPhone: (value: string) => void;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  onClose: () => void;
}

// Функция для отправки сообщения в Telegram
export async function sendToTelegram({
  api_token,
  my_channel_name,
  userData,
  userAnswers,
  setOpenModalInit,
  setPhone,
  setName,
  setEmail,
  onClose,
}: SendToTelegramProps): Promise<{ success: boolean; message: string }> {
  try {
    // Формируем тело сообщения
    const emailBody = `
      User Name: ${userData.name}\n
      User Email: ${userData.email}\n
      User Phone: ${userData.phone}\n
      Preferred Contact Method: ${userData.contactMethod}\n
      Answers:\n
      ${userAnswers.map((answer) => `${answer.question}: ${answer.answer}`).join('\n')}
    `;

    // Формируем URL для запроса к Telegram API
    const url = `https://api.telegram.org/bot${api_token}/sendMessage`;

    // Выполняем запрос через fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: my_channel_name,
        text: `Сообщение от Сайта:\n${emailBody}`,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при отправке сообщения в Telegram');
    }

    // Уведомляем об успешной отправке
    console.log('Сообщение успешно отправлено!');

    // Показываем модальное окно с сообщением об успешной отправке
    setOpenModalInit(true);

    // Очищаем поля после успешной отправки
    setPhone('');
    setName('');
    setEmail('');

    // Закрываем модальное окно через 2 секунды
    setTimeout(() => {
      setOpenModalInit(false); // Закрытие модального окна
      onClose(); // Закрытие через функцию, если требуется
    }, 2000);

    return { success: true, message: 'Сообщение успешно отправлено в Telegram.' };
  } catch (error) {
    console.error('Ошибка при отправке сообщения в Telegram:', error);
    return { success: false, message: 'Ошибка при отправке данных в Telegram.' };
  }
}
