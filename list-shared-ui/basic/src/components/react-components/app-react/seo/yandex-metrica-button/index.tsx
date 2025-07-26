import React, { type ReactNode, useRef } from 'react';
import seoData from '../../../../../const/seo/seo-data-site.json';

interface YandexMetricaButtonProps {
  
  yaGoalTitle: string; // Цель (например, 'quiz-form')
  onClick?: () => void; // Дополнительный обработчик клика
  children: ReactNode; // Кнопка внутри компонента
}

const YandexMetricaButton: React.FC<YandexMetricaButtonProps> = ({
  
  yaGoalTitle,
  onClick,
  children,
}) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    // Нажать на скрытое поле для отправки события в Яндекс.Метрику
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }

    // Выполнить дополнительное действие
    if (onClick) {
      onClick();
    }
  };

  const yaGoalNumber = seoData.numberYandexMetric;

  return (
    <div>
      {/* Скрытое поле для вызова метрики */}
      <input
        type="button"
        ref={hiddenInputRef}
        style={{ display: 'none' }}
        onClick={() => {
          // Отправка цели в Яндекс.Метрику
          //@ts-ignore
          if (window.ym && typeof window.ym === 'function') {
             //@ts-ignore
            window.ym(yaGoalNumber, 'reachGoal', yaGoalTitle);
            console.log(`Goal "${yaGoalTitle}" with number ${yaGoalNumber} reached`);
          } else {
            console.warn('Yandex Metrica is not initialized.');
          }
        }}
      />
      {/* Кнопка, обёрнутая в компонент */}
      <div onClick={handleClick} role="button" tabIndex={0}>
        {children}
      </div>
    </div>
  );
};

export default YandexMetricaButton;
