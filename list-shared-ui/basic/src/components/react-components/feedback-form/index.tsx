import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import InputMask from "react-input-mask";
import cmContactUs from "../../../locale/cms-locale.json";
import seoData from '../../../const/seo/seo-data-site.json';
import sendTelegramFeedBack from "./utils/sendTelegramFeedBack";
import YandexMetricaButton from "../app-react/seo/yandex-metrica-button";
import localeTextSite from "../../../locale/locale_text_site.json";

import textBurgerMenu from '../../../const/navbar/burger-menu-react.json';
import { LiaTelegram } from 'react-icons/lia';
import { IoLogoWhatsapp } from 'react-icons/io';
import { TfiEmail } from 'react-icons/tfi';

interface UserData {
  name: string;
  contact: string;
  message: string;
}

export default function FeedbackForm() {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [contactMethod, setContactMethod] = useState<"email" | "phone">("phone");
  const [showName, setShowName] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formValues, setFormValues] = useState({
    name: cmContactUs.cmContactUs.isFioForm.value ? "":"NotName",
    contact: "",
    message: cmContactUs.cmContactUs.isMessageActive.value ? "":"Интересует оформление заказа / подробности",
  });
  const [formErrors, setFormErrors] = useState({
    name: cmContactUs.cmContactUs.isFioForm.value ? true : false,
    contact: false,
    message: false,
    terms: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Проверка валидности формы при изменении значений полей
  useEffect(() => {
    const isNameValid = cmContactUs.cmContactUs.isFioForm.value
      ? formValues.name.trim() !== ''
      : true;
    const isMessageValid = formValues.message.trim() !== '';
  
    let isContactValid = false;
    if (contactMethod === 'email') {
      isContactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.contact);
    } else if (contactMethod === 'phone') {
      const digitsOnly = formValues.contact.replace(/\D/g, '');
      isContactValid = digitsOnly.length === 11;
    }
  
    const isFormOkay = isNameValid && isContactValid && isMessageValid && agreeToTerms;
    setIsFormValid(isFormOkay);
  }, [formValues, contactMethod, agreeToTerms]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
   
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormValues((prev) => ({ ...prev, contact: value }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingSend(true);
    setResponseMessage(null);
    setError(null);

    const isEmailValid =
      contactMethod === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.contact) : true;

    const digitsOnly = formValues.contact.replace(/\D/g, "");
    const isPhoneValid =
      contactMethod === "phone" ? digitsOnly.length === 11 : true;

      const newFormErrors = {
        name: !formValues.name.trim(),
        contact: !formValues.contact || (contactMethod === "phone" && !isPhoneValid) || (contactMethod === "email" && !isEmailValid),
        message: !formValues.message.trim(),
        terms: !agreeToTerms, // ← вот это важно
      };
      setFormErrors(newFormErrors);
      
      if (newFormErrors.name || newFormErrors.contact || newFormErrors.message || newFormErrors.terms) {
        setError(localeTextSite.components.reactComponents.feedbackForm.errorRequiredFields);
        setLoadingSend(false);
        return;
      }

    const userData: UserData = { ...formValues };

    try {
      const response = await sendTelegramFeedBack(userData);

      if (!response.success) {
        setError(response.message || localeTextSite.components.reactComponents.feedbackForm.errorDefaultSendForm);
        setLoadingSend(false);
        return;
      }

      setResponseMessage(response.message || localeTextSite.components.reactComponents.feedbackForm.successDefaultSendMessage);

      if (contactMethod === "phone") {
        window.location.href = `/thank-you?phone=${formValues.contact}`;
      }
      if (contactMethod === "email") {
        window.location.href = `/thank-you?email=${formValues.contact}`;
      }
    } catch {
      setError(localeTextSite.components.reactComponents.feedbackForm.errorSendForm);
    } finally {
      setLoadingSend(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white text-gray-900 p-6 rounded-md shadow-md space-y-4">
      <div>
        <input
          type="text"
          name="name"
          placeholder={cmContactUs.cmContactUs.formPlaceholderName.value}
          value={formValues.name}
          onChange={handleInputChange}
          
          className={`${cmContactUs.cmContactUs.isFioForm.value ? "":"hidden"} w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
            formErrors.name ? "border-red-400 ring-red-100" : "border-gray-300 focus:border-gray-600 ring-gray-100"
          }`}
        />
        {formErrors.name && <p className="text-red-500 text-sm">{localeTextSite.components.reactComponents.feedbackForm.errorFormName}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <label>
            <input
              type="radio"
              name="contactMethod"
              value="phone"
              checked={contactMethod === "phone"}
              onChange={() => setContactMethod("phone")}
            />
            {localeTextSite.components.reactComponents.feedbackForm.labelPhone}
          </label>
          <label>
            <input
              type="radio"
              name="contactMethod"
              value="email"
              checked={contactMethod === "email"}
              onChange={() => setContactMethod("email")}
            />
            {localeTextSite.components.reactComponents.feedbackForm.labelEmail}
          </label>
        </div>

        {contactMethod === "phone" && (
          <InputMask
            mask={localeTextSite.components.reactComponents.feedbackForm.maskPlaceholder}
            placeholder={localeTextSite.components.reactComponents.feedbackForm.contactMethodPlaceholder}
            name="contact"
            value={formValues.contact}
            onChange={handleContactChange}
            required
            className={`w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
              formErrors.contact ? "border-red-400 ring-red-100" : "border-gray-300 focus:border-gray-600 ring-gray-100"
            }`}
          />
        )}
        {contactMethod === "email" && (
          <input
            type="email"
            placeholder={localeTextSite.components.reactComponents.feedbackForm.emailPlaceholder}
            name="contact"
            value={formValues.contact}
            onChange={handleInputChange}
            required
            className={`w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
              formErrors.contact ? "border-red-400 ring-red-100" : "border-gray-300 focus:border-gray-600 ring-gray-100"
            }`}
          />
        )}

        {formErrors.contact && (
          <p className="text-red-500 text-sm">
            {contactMethod === "phone"
              ? localeTextSite.components.reactComponents.feedbackForm.errorFormPhone
              : localeTextSite.components.reactComponents.feedbackForm.errorFormEmail}
          </p>
        )}
      </div>

      <div>
        <textarea
          name="message"
          rows={4}
          placeholder={cmContactUs.cmContactUs.formPlaceholderTextarea.value}
          value={formValues.message}
          onChange={handleInputChange}
          required
          className={`${cmContactUs.cmContactUs.isMessageActive.value ? "":"hidden"} w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
            formErrors.message ? "border-red-400 ring-red-100" : "border-gray-300 focus:border-gray-600 ring-gray-100"
          }`}
        ></textarea>
        {formErrors.message && <p className="text-red-500 text-sm">{localeTextSite.components.reactComponents.feedbackForm.errorFormMessage}</p>}
      </div>

      <div className="flex items-start gap-2">
  <input
  name="agreeToTerms"
    type="checkbox"
    id="agreeToTerms"
    checked={agreeToTerms}
    onChange={() => setAgreeToTerms(!agreeToTerms)}
    className="mt-1"
  />
  <label htmlFor="agreeToTerms" className="text-sm">
    Я соглашаюсь с <a href="/privacy-policy" target="_blank" className="text-blue-600 underline">политикой конфиденциальности</a> и <a href="/user-agreement" target="_blank" className="text-blue-600 underline">пользовательским соглашением</a>.
  </label>
</div>
{formErrors.terms && <p className="text-red-500 text-sm">Чтобы продолжить необходимо принять условия.</p>}

{textBurgerMenu.BurgerMenu.email && (
                <a
                  href={`mailto:${textBurgerMenu.BurgerMenu.email.title}`}
                  className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
                >
                  <TfiEmail size={24} />
                  <span>Email</span>
                </a>
              )}
              {textBurgerMenu.BurgerMenu.telegram_number.title && (<a
                href={`https://t.me/${textBurgerMenu.BurgerMenu.telegram_number.title}`}
                className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
              >
                <LiaTelegram size={24} />
                <span>Telegram</span>
              </a> )}

              {textBurgerMenu.BurgerMenu.whatsapp_number.title &&  <a
                href={`https://wa.me/${textBurgerMenu.BurgerMenu.whatsapp_number.title}`}
                className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
              >
                <IoLogoWhatsapp size={24} />
                <span>WhatsApp</span>
              </a>}
              {textBurgerMenu.BurgerMenu.vk_link.title &&  <a
                href={`https://vk.com/${textBurgerMenu.BurgerMenu.vk_link.title}`}
                className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
              >
                <img src={'/VKLogo.png'} width={24} height={24} alt="Logo VK" />
                <span>ВКонтакте</span>
              </a>}


      <YandexMetricaButton
        yaGoalTitle={seoData.yaGoalTitleContactForm}
        onClick={() => submit}
      >
        <button
          type="submit"
          disabled={!isFormValid || loadingSend}
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loadingSend ? localeTextSite.components.reactComponents.feedbackForm.btnSpinnerLoader : localeTextSite.components.reactComponents.feedbackForm.btnSend}
        </button>
      </YandexMetricaButton>

      {responseMessage && <p className="text-green-500 mt-4">{responseMessage}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </form>
  );
}