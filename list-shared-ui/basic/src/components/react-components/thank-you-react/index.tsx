import React from 'react';
import { useLocation } from 'react-router-dom';

const ThankYouReact: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const formData = {
    name: queryParams.get('name') || '',
    email: queryParams.get('email') || '',
    phone: queryParams.get('phone') || '',
    message: queryParams.get('message') || '',
  };

  return (
    <div className="flex items-center justify-center mt-20 mb-20">
      <div className="text-center">
     {formData.name && formData.name !== "NotName" && <p>{formData.name}!</p>}
        <p className="text-3xl font-bold">Спасибо за вашу заявку!</p>
        <div className="m-4">
          
          <p>С вами свяжутся в ближайшее время по данным, которые вы указали:</p>
          {formData.email && <p>Email: {formData.email}</p>}
          {formData.phone && <p>Телефон: {formData.phone}</p>}
          {formData.message && <p>Ваше сообщение отправлено: {formData.message}</p>}
        </div>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          На главную
        </a>
      </div>
    </div>
  );
};

export default ThankYouReact;
