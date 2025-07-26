import configApp from '../../../../const/app-config/app-config.json'
import type { DataPaidProductToSendTelegram } from '../types/DataPaidProductToSendTelegram.type';


export const useSendTelegramPay = async (dataPayToSendTelegram: DataPaidProductToSendTelegram) => {

  const api_token = configApp.TOKEN_TELEGRAM;
  const my_channel_name = configApp.CHAT_ID_TELEGRAM;


  try {

    await fetch(
      `https://api.telegram.org/bot${api_token}/sendMessage?chat_id=${my_channel_name}&text=Покупатель ${dataPayToSendTelegram?.email_customer || "не указан"}, телефон: ${dataPayToSendTelegram?.phone_customer || "не указан"} оплачивает: ${dataPayToSendTelegram?.title} на сумму: ${dataPayToSendTelegram?.amount} Руб. Заказ №: ${dataPayToSendTelegram?.order_id} Указал доставку: ${dataPayToSendTelegram?.address_delivery || "не указан"} Банк зачисления ${dataPayToSendTelegram.pay_method}`
    )
      .then(() => {
        // handle response

        //   alert("бщение отправлено на телеграм")

      })
      .catch((error) => {
        // handle error
        console.error(error);
      });

  } catch (error) {
    console.log("Error Send TELGRAM API")
  }

}

