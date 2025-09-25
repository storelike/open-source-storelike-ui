import React, { useState } from 'react';
import Quiz from '../Quiz'; // Предполагается, что Quiz — это компонент с опросом
import { FaQuestionCircle } from 'react-icons/fa'; // Используем иконку вопроса
import GiftBox from './gift-box';

const MainQuiz: React.FC = () => {
  const [showModalQuiz, setShowModalQuiz] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleStartQuiz = () => {
    setMinimized(false);
    setShowModalQuiz(true);
  };

  const handleCloseModal = () => {
    setMinimized(true); // Сворачиваем в иконку
  };

  const handleQuizComplete = () => {
    setShowModalQuiz(false);
    setMinimized(true); // Иконка появляется снова после закрытия опроса
  };

  return (
    <div className='fixed bottom-4 right-4' style={{ zIndex: 16 }}>
      {/* Иконка на экране, когда модалка свернута */}
      {minimized && (
        <div onClick={handleStartQuiz} className="cursor-pointer">
          <FaQuestionCircle size={40} color="blue" />
        </div>
      )}

      {/* Модальное окно с опросом */}
      <GiftBox handleStartQuiz={handleStartQuiz} handleCloseModal={handleCloseModal} />
      
      {/* Компонент с опросом */}
      {showModalQuiz && (
        <div className="fixed  inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Quiz setShowModalQuiz={setShowModalQuiz} onQuizComplete={handleQuizComplete} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainQuiz;
