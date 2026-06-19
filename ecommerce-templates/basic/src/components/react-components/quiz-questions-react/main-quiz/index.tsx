import React, { useState } from 'react';
import Quiz from '../Quiz'; // Quiz is the survey component
import { FaQuestionCircle } from 'react-icons/fa'; // Question-mark icon
import GiftBox from './gift-box';

const MainQuiz: React.FC = () => {
  const [showModalQuiz, setShowModalQuiz] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleStartQuiz = () => {
    setMinimized(false);
    setShowModalQuiz(true);
  };

  const handleCloseModal = () => {
    setMinimized(true); // Collapse back into the icon
  };

  const handleQuizComplete = () => {
    setShowModalQuiz(false);
    setMinimized(true); // Icon reappears after the quiz is closed
  };

  return (
    <div className='fixed bottom-4 right-4' style={{ zIndex: 16 }}>
      {/* On-screen icon when the modal is collapsed */}
      {minimized && (
        <div onClick={handleStartQuiz} className="cursor-pointer">
          <FaQuestionCircle size={40} color="blue" />
        </div>
      )}

      {/* Gift-box promo modal */}
      <GiftBox handleStartQuiz={handleStartQuiz} handleCloseModal={handleCloseModal} />

      {/* Quiz component */}
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
