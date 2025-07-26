import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import InputMask from 'react-input-mask';
import sendToTelegramCallToAction from '../utils/sendToTelegramCallToAction';
import ModalCallToAction from '../modal-call-to-action';
import SpinnerLoaderTextButton from '../../../../components/react-components/spinner-loader-text-button';
import YandexMetricaButton from '../../../../components/react-components/app-react/seo/yandex-metrica-button';
import seoData from '../../../../const/seo/seo-data-site.json';
import localeTextSite from "../../../../locale/locale_text_site.json";
import textForm from "../../../../const/contact-us/contact-us.json";

interface UserData {
  name: string;
  phone: string;
  email: string;
  message: string;
  externalData?: {};
}

interface ContactFormProps {
  onClose: (formData: UserData) => void;
  externalData?: {};
}

const CalToActionForm: React.FC<ContactFormProps> = ({ externalData, onClose }) => {
  const [userData, setUserData] = useState<UserData>({
    name: textForm.data.is_fio_form ? "":"NotName",
    phone: '',
    email: '',
    message: textForm.data.is_message_active ? "":"Интересует оформление заказа / подробности (форма связаться)",
    externalData,
  });

  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loadingSend, setLoadingSend] = useState(false);
  const [formErrors, setFormErrors] = useState({
    phone: false,
    terms: false,
    contact: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validatePhone = (phone: string) => {
    // Убираем все символы, кроме цифр
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 11; // Ожидаем 10 цифр
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid =
    userData.name.trim() !== '' &&
    userData.message.trim() !== '' &&
    agreeToTerms &&
    (
      (contactMethod === 'phone' && validatePhone(userData.phone)) ||
      (contactMethod === 'email' && validateEmail(userData.email))
    );



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoadingSend(true);
    setFormErrors({ phone: false, terms: false, contact:false });

    try {
      const result = await sendToTelegramCallToAction(userData);

      if (result.success) {

        const queryString = new URLSearchParams({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          message: userData.message,
        }).toString();
        setLoadingSend(false);

        window.location.href = `/thank-you?${queryString}`;
      } else {
        setModalMessage(result.message || localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.errorMessageDefault);
        setLoadingSend(false);
        setModalOpen(true);
      }
    } catch (error) {
      setModalMessage(localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.errorMessage);
      setLoadingSend(false);
      setModalOpen(true);
    }
  };

  return (
    <div className="fixed text-gray-900 inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80 relative">
        <button
          onClick={() => onClose(userData)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={24} />
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">{localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.title}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={userData.name}
            placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.namePlaceholder}
            onChange={handleInputChange}
            className={`${textForm.data.is_fio_form ? "":"hidden"} block w-full p-2 mb-2 border rounded`}
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

{contactMethod === 'phone' && (
  <InputMask
    mask={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.maskPlaceholder}
    name="phone"
    value={userData.phone}
    placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.phonePlaceholder}
    onChange={handleInputChange}
    className={`block w-full p-2 mb-2 border rounded ${
      formErrors.phone ? 'border-red-400 ring-red-100' : 'border-gray-300 focus:border-gray-600 ring-gray-100'
    }`}
    required
  />
)}

{contactMethod === 'email' && (
  <input
    type="email"
    name="email"
    value={userData.email}
    placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.emailPlaceholder}
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 border rounded"
    required
  />
)}


          
          


          <textarea
            name="message"
            value={userData.message}
            placeholder={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.messagePlaceholder}
            onChange={handleInputChange}
            className={`${textForm.data.is_message_active ? "":"hidden"} block text-gray-900 w-full p-2 mb-2 border rounded`}
            required
            rows={4}
          />

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

          
          <YandexMetricaButton yaGoalTitle={seoData.yaGoalTitleCallToAction}>
  <button
    type="submit"
    disabled={!isFormValid}
    className={`mt-2 w-full px-4 py-2 rounded-md ${
      isFormValid
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    <SpinnerLoaderTextButton
      loading={loadingSend}
      spinTitleText={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.btnSpinnerLoader}
      titleText={localeTextSite.components.reactComponents.callToActionIconReact.formCallToAction.btnSend}
    />
  </button>
</YandexMetricaButton>


        </form>
        <ModalCallToAction
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default CalToActionForm;
