// Type definitions for the parameters
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

// Function that sends a message to Telegram
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
    // Build the message body
    const emailBody = `
      User Name: ${userData.name}\n
      User Email: ${userData.email}\n
      User Phone: ${userData.phone}\n
      Preferred Contact Method: ${userData.contactMethod}\n
      Answers:\n
      ${userAnswers.map((answer) => `${answer.question}: ${answer.answer}`).join('\n')}
    `;

    // Build the Telegram API request URL
    const url = `https://api.telegram.org/bot${api_token}/sendMessage`;

    // Perform the request via fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: my_channel_name,
        text: `Message from the site:\n${emailBody}`,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send the message to Telegram');
    }

    // Log successful delivery
    console.log('Message sent successfully!');

    // Show the success modal
    setOpenModalInit(true);

    // Clear the fields after a successful send
    setPhone('');
    setName('');
    setEmail('');

    // Close the modal after 2 seconds
    setTimeout(() => {
      setOpenModalInit(false); // Close the modal
      onClose(); // Close via the callback if needed
    }, 2000);

    return { success: true, message: 'Message sent to Telegram successfully.' };
  } catch (error) {
    console.error('Failed to send the message to Telegram:', error);
    return { success: false, message: 'Failed to send data to Telegram.' };
  }
}
