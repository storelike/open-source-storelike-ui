import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import sendOrderToTelegram from './utils/sendOrderToTelegram';
import SpinnerLoaderTextButton from '../spinner-loader-text-button';
import localeTextSite from "../../../locale/locale_text_site.json";
import YandexMetricaButton from '../app-react/seo/yandex-metrica-button';
import {cmContactUs, cmSeo} from "../../../locale/cms-locale.json";
import PhoneInput from '../phone-input';

interface UserDataSendTelegram {
  name: string;
  phone: string;
  email: string;
  message: string;
  delivery: string;
  orderDataSendTelegram: OrderData;
}

interface OrderData {
    title: any;
    discountedPrice: number;
    is_delivery: any;
  }

interface OrderDataSendTelegram {
    orderDataSendTelegram: OrderData;
}


const FormSendOrderReact: React.FC<OrderDataSendTelegram> = ({ orderDataSendTelegram }) => {
  const [phoneError, setPhoneError] = useState('');

  const [sendTelegramAllData, setSendTelegramAllData] = useState<UserDataSendTelegram>({
    name: cmContactUs.isFioForm.value ? "":"NotName",
    phone: '',
    email: '',
    message: cmContactUs.isMessageActive.value ? "":"Интересует оформление заказа / подробности (форма продукты/услуги)",
    delivery: '',
    orderDataSendTelegram,
  });

  const [loadingSend, setLoadingSend] = useState(false);
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [agreeToTerms, setAgreeToTerms] = useState(false);


  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
// Validate phone number if the changed field is 'phone'
if (name === "phone") {
  const digitsOnly = value.replace(/\D/g, ''); // Remove non-digit characters
  if (digitsOnly.length !== 11) {
    setPhoneError("Номер телефона должен содержать 11 цифр."); // Example error message
  } else {
    setPhoneError('');
  }
}

  setSendTelegramAllData((prevData) => ({ ...prevData, [name]: value }));
    
  };
  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 11;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isContactValid =
    (contactMethod === 'email' && validateEmail(sendTelegramAllData.email)) ||
    (contactMethod === 'phone' && validatePhone(sendTelegramAllData.phone));

  const isFormValid =
    sendTelegramAllData.name.trim() !== '' &&
    sendTelegramAllData.message.trim() !== '' &&
    (!orderDataSendTelegram.is_delivery || sendTelegramAllData.delivery.trim() !== '') &&
    isContactValid &&  agreeToTerms;
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoadingSend(true);
  
    try {

      

      const result = await sendOrderToTelegram(sendTelegramAllData);
      setLoadingSend(true);
      
      if (result.success) {
        const queryString = new URLSearchParams({
          name: sendTelegramAllData.name,
          phone: sendTelegramAllData.phone,
          email: sendTelegramAllData.email,
          message: sendTelegramAllData.message,
          delivery: sendTelegramAllData.delivery || localeTextSite.components.reactComponents.formSendOrderReact.deliveryEmptyMsg,
        }).toString();
        setLoadingSend(false);
        window.location.href = `/thank-you?${queryString}`;
      } else {
        setErrorMessage(result.message || localeTextSite.components.reactComponents.formSendOrderReact.errorMessage);
        setLoadingSend(false);
     
      }
    } catch (error) {
        setErrorMessage(localeTextSite.components.reactComponents.formSendOrderReact.errorMessage);
        setLoadingSend(false);
     
    }
  };

  const onCloseSendOrder = () => {
    window.location.href = `/`;
  }
    

  return (
    <div className="fixed text-gray-900 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 relative">
        <button
          onClick={() => onCloseSendOrder()}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">{localeTextSite.components.reactComponents.formSendOrderReact.title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={sendTelegramAllData.name}
            placeholder={localeTextSite.components.reactComponents.formSendOrderReact.namePlaceholder}
            onChange={handleInputChange}
            className={`${cmContactUs.isFioForm.value ? "":"hidden"} block w-full p-2 mb-2 border rounded`}
            required
          />
         
         <div className="flex space-x-2 mb-2">
  <button
    type="button"
    onClick={() => setContactMethod('phone')}
    className={`px-2 py-1 rounded border ${contactMethod === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
  >
    Телефон
  </button>
  <button
    type="button"
    onClick={() => setContactMethod('email')}
    className={`px-2 py-1 rounded border ${contactMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
  >
    Email
  </button>
</div>

{contactMethod === 'phone' && (<>
 

<PhoneInput
  name="phone"
  value={sendTelegramAllData.phone}
  placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.phonePlaceholder}
  onChange={handleInputChange}
  className={`block w-full p-2 mb-2 border rounded ${
      phoneError ? 'border-red-400 ring-red-100' : 'border-gray-300 focus:border-gray-600 ring-gray-100'
    }`}
  required
/>



  {phoneError && <p className='text-red-500'>{phoneError}</p>}
</>)}

{contactMethod === 'email' && (
  <input
    type="email"
    name="email"
    value={sendTelegramAllData.email}
    placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.emailPlaceholder}
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 border rounded"
    required
  />
)}
        
          <textarea
            name="message"
            value={sendTelegramAllData.message}
            placeholder={localeTextSite.components.reactComponents.formSendOrderReact.messagePlaceholder}
            onChange={handleInputChange}
            className={`${cmContactUs.isMessageActive.value ? "":"hidden"} block w-full p-2 mb-2 border rounded`}
            
            rows={4}
          />
          {orderDataSendTelegram.is_delivery && <textarea
            name="delivery"
            value={sendTelegramAllData.delivery}
            placeholder={localeTextSite.components.reactComponents.formSendOrderReact.deliveryPlaceholder}
            onChange={handleInputChange}
            className={`block w-full p-2 mb-2 border rounded`}
            required
            rows={4}
          />}

<div className="flex items-start gap-2 mb-2">
  <input
    type="checkbox"
    id="agreeToTerms"
    checked={agreeToTerms}
    onChange={() => setAgreeToTerms(!agreeToTerms)}
    className="mt-1"
  />
  <label htmlFor="agreeToTerms" className="text-sm">
    Я соглашаюсь с{' '}
    <a href="/privacy-policy" target="_blank" className="text-blue-600 underline">политикой конфиденциальности</a>{' '}
    и{' '}
    <a href="/user-agreement" target="_blank" className="text-blue-600 underline">пользовательским соглашением</a>.
  </label>
</div>

          <YandexMetricaButton yaGoalTitle={cmSeo.yaGoalTitleSendOrder.value}>
         <button type="submit" className={`mt-2 w-full px-4 py-2 rounded-md ${isFormValid ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}> 
          
           <SpinnerLoaderTextButton loading={loadingSend} spinTitleText={localeTextSite.components.reactComponents.formSendOrderReact.btnSpinnerLoader} titleText={localeTextSite.components.reactComponents.formSendOrderReact.btnSend}/>
          </button>
          </YandexMetricaButton>
        </form>
       {errorMessage && <p className='text-red-500'>{localeTextSite.components.reactComponents.formSendOrderReact.errorDefaultMessage} {errorMessage}</p>}
      </div>
    </div>
  );
};

export default FormSendOrderReact;
