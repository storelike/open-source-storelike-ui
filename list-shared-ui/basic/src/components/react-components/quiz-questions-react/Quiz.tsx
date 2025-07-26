import React, { useState } from 'react';
import quizDataText from '../../../const/quiz/quiz.json';
import seoData from '../../../const/seo/seo-data-site.json';
import { FaWindowClose } from 'react-icons/fa';
import { sendToTelegram } from './utils/sendToTelegram';
import appConfigtext from '../../../const/app-config/app-config.json';
import ModalQuiz from '../../../components/react-components/quiz-questions-react/modal-quiz';
import { FaPhone, FaTelegramPlane, FaEnvelope } from 'react-icons/fa';
import ReactInputMask from 'react-input-mask';
import YandexMetricaButton from '../app-react/seo/yandex-metrica-button';
import textForm from "../../../const/contact-us/contact-us.json";

interface QuizProps {
  setShowModalQuiz: (show: boolean) => void;
  onQuizComplete: () => void;
}

const Quiz: React.FC<QuizProps> = ({ setShowModalQuiz, onQuizComplete }) => {
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [userData, setUserData] = useState({
    name: textForm.data.is_fio_form ? "":"NotName",
    phone: '',
    email: '',
    terms: false,
    contactMethod: 'phone',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
    setError('');
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      setError('Пожалуйста, выберите ответ перед продолжением.');
      return;
    }
    setError('');
    
    // Save the current answer and move to the next question
    setUserAnswers([
      ...userAnswers,
      { question: quizDataText.questions[currentQuestionIndex].question, answer: selectedAnswer },
    ]);
    setSelectedAnswer(null);

    if (currentQuestionIndex + 1 < quizDataText.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Go back to the previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]?.answer || null); // Set selected answer for the previous question
    }
  };

  const handleCloseQuiz = () => {
    setShowModalQuiz(false);
    onQuizComplete();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleContactMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prevData) => ({ ...prevData, contactMethod: e.target.value }));
  };

  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length === 11;
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    const { name, phone, email, contactMethod } = userData;

    if (!agreeToTerms) {
      setError('Вы должны принять условия!');
      return;
    }
  
    if (contactMethod === 'phone' && !validatePhone(phone)) {
      setError('Пожалуйста, введите корректный номер телефона!');
      return;
    }
    if (contactMethod === 'phone' && !phone) {
      setError('Пожалуйста, введите номер телефона!');
      return;
    }
  
    if (contactMethod === 'email' && !email) {
      setError('Пожалуйста, введите email!');
      return;
    }
    if (contactMethod === 'email' && !validateEmail(email)) {
      setError('Пожалуйста, введите корректный email!');
      return;
    }
  
    if (contactMethod === 'telegram' && !phone && !validatePhone(phone)) {
      setError('Пожалуйста, введите номер телефона для связи через Telegram!');
      return;
    }
  
    setError('');
  

    // Call sendToTelegram with userData and userAnswers
    const result = await sendToTelegram({
      api_token: appConfigtext.TOKEN_TELEGRAM,
      my_channel_name: appConfigtext.CHAT_ID_TELEGRAM,
      userData: userData,
      userAnswers: userAnswers,
      setOpenModalInit: () => { },
      setPhone: () => { },
      setName: () => { },
      setEmail: () => { },
      onClose: () => { },
    });
  
    if (result.success) {
      const queryString = new URLSearchParams({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
      }).toString();

      setSuccessMessage('Ваши ответы успешно отправлены!');
      setIsModalOpen(true);
      window.location.href = `/thank-you?${queryString}`;
    }
  };

  return (
    <div className="fixed  top-12 m-4 inset-0 flex items-center justify-center bg-black bg-opacity-80 transition-opacity duration-300">
      <ModalQuiz open={isModalOpen} onClose={() => [setIsModalOpen(false), handleCloseQuiz()]} message={successMessage} />
      <div className="relative w-[95%] max-w-md p-4 bg-gray-300 rounded-lg shadow-md transition-transform duration-300 transform max-h-[90vh] overflow-y-auto">        <button
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          onClick={handleCloseQuiz}
        >
          <FaWindowClose />
        </button>
        {isFinished ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{quizDataText.modal_title}</h2>
            <p className="text-lg">{quizDataText.modal_subtitle}</p>
            <div className="mt-4">


            <div className="flex flex-col mb-2 text-sm overflow-hidden sm:text-lg">
                <label className="font-semibold">Предпочтительный способ связи:</label>
                <div >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="phone"
                      checked={userData.contactMethod === 'phone'}
                      onChange={handleContactMethodChange}
                      className="mr-2"
                    />
                    <FaPhone className="text-xl mr-1" />
                    <span>Телефон</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="telegram"
                      checked={userData.contactMethod === 'telegram'}
                      onChange={handleContactMethodChange}
                      className="mr-2"
                    />
                    <FaTelegramPlane className="text-xl mr-1" />
                    <span>Telegram</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="email"
                      checked={userData.contactMethod === 'email'}
                      onChange={handleContactMethodChange}
                      className="mr-2"
                    />
                    <FaEnvelope className="text-xl mr-1" />
                    <span>Email</span>
                  </label>
                </div>
              </div>

          <input
  type="text"
  name="name"
  value={userData.name}
  placeholder="Ваше имя"
  onChange={handleInputChange}
  className={`${textForm.data.is_fio_form ? "":"hidden"} block w-full p-2 mb-2 border rounded`}
  required
/>

{(userData.contactMethod === 'phone' || userData.contactMethod === 'telegram') && (
  <ReactInputMask
    mask="+7 (999) 999-99-99"
    name="phone"
    value={userData.phone}
    placeholder="Ваш телефон"
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 border rounded"
    required
  />
)}

{userData.contactMethod === 'email' && (
  <input
    type="email"
    name="email"
    value={userData.email}
    placeholder="Ваш email"
    onChange={handleInputChange}
    className="block w-full p-2 mb-2 border rounded"
    required
  />
)}

<div className="flex items-start gap-2">
  <input
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

             
              {error && <div className="text-red-500 mb-4">{error}</div>}
            </div>
            {agreeToTerms ? <YandexMetricaButton
              yaGoalTitle={seoData.yaGoalTitleQuiz}
              onClick={handleSubmit}                      
            >
            <button             
              className={`
                ${
                  (agreeToTerms)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
                mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600`}
            >
              Отправить ответы
            </button>
            </YandexMetricaButton> : (<button  
            onClick={handleSubmit}             
              className={`
                ${
                  (agreeToTerms)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
                mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600`}
            >
              Отправить ответы
            </button>)}
          </div>
        ) : (
          <div >
            <h2 className="text-xl text-gray-500 font-bold mb-4">{quizDataText.title}</h2>
            <p className='text-gray-500'>{quizDataText.subtitle}</p>
            <hr />
            <h3 className="text-gray-500 text-sm font-semibold mb-4 sm:text-lg">
              {quizDataText.questions[currentQuestionIndex].question}
            </h3>
            <ul>
              {quizDataText.questions[currentQuestionIndex].options.map((option) => (
                <li
                  key={option}
                  className={`text-sm text-gray-500 cursor-pointer p-2 border rounded-md mb-2 transition-colors 
                  ${selectedAnswer === option ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => handleAnswerSelection(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
            <div className="flex text-sm justify-between mt-4 sm:text-lg">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                Назад
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Далее                 
              </button>
            </div>
            {error && <div className="text-red-500 mb-4 break-words text-sm">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
