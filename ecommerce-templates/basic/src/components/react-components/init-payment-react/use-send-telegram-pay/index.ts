import cmAppConfig from '../../../../locale/cms-locale.json';
import type { DataPaidProductToSendTelegram } from '../types/DataPaidProductToSendTelegram.type';


export const useSendTelegramPay = async (dataPayToSendTelegram: DataPaidProductToSendTelegram) => {

  const api_token = cmAppConfig.cmAppConfig.tokenTelegram.value;
  const my_channel_name = cmAppConfig.cmAppConfig.chatIdTelegram.value;


  try {

    await fetch(
      `https://api.telegram.org/bot${api_token}/sendMessage?chat_id=${my_channel_name}&text=Customer ${dataPayToSendTelegram?.email_customer || "not provided"}, phone: ${dataPayToSendTelegram?.phone_customer || "not provided"} is paying for: ${dataPayToSendTelegram?.title} amount: ${dataPayToSendTelegram?.amount} RUB. Order #: ${dataPayToSendTelegram?.order_id} Delivery: ${dataPayToSendTelegram?.address_delivery || "not provided"} Payment bank ${dataPayToSendTelegram.pay_method}`
    )
      .then(() => {
        // handle response

        //   alert("Message sent to Telegram")

      })
      .catch((error) => {
        // handle error
        console.error(error);
      });

  } catch (error) {
    console.log("Error Send TELGRAM API")
  }

}

