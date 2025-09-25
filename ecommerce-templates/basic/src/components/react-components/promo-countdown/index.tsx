import React, { useState, useEffect } from 'react';

interface PromoCountdownProps {
  endDate: string; // Дата окончания акции в формате ISO (например, "2024-12-31T23:59:59")
}

const PromoCountdown: React.FC<PromoCountdownProps> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');  

  useEffect(() => {
    const interval = setInterval(() => {
      const targetDate = new Date(endDate).getTime();
      const currentDate = new Date().getTime();
      const distance = targetDate - currentDate;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft(''); // Показываем пустой компонент после завершения акции
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}д ${hours}ч ${minutes}м ${seconds}с`);
      }
    }, 1000);

    return () => clearInterval(interval); // Очистить интервал при размонтировании компонента
  }, [endDate]);

  if (!timeLeft) return null; // Если акция завершена, не выводим ничего

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-4">
        <p className="text-sm sm:text-lg font-semibold">Акция до 31.01.2025:</p>
        <div className="text-xl sm:text-2xl font-bold">{timeLeft}</div>
      </div>
    </div>
  );
};

export default PromoCountdown;
