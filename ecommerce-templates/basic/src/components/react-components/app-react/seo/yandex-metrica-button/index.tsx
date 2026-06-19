import React, { type ReactNode, useRef } from 'react';
import cmData from '../../../../../locale/cms-locale.json';

interface YandexMetricaButtonProps {
  
  yaGoalTitle: string; // Goal (e.g. 'quiz-form')
  onClick?: () => void; // Optional extra click handler
  children: ReactNode; // Button inside the component
}

const YandexMetricaButton: React.FC<YandexMetricaButtonProps> = ({
  
  yaGoalTitle,
  onClick,
  children,
}) => {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    // Click the hidden input to fire the Yandex.Metrica event
    if (hiddenInputRef.current) {
      hiddenInputRef.current.click();
    }

    // Run the optional extra action
    if (onClick) {
      onClick();
    }
  };

  const yaGoalNumber = cmData.cmSeo.numberYandexMetric.value;

  return (
    <div>
      {/* Hidden input that triggers the metric */}
      <input
        type="button"
        ref={hiddenInputRef}
        style={{ display: 'none' }}
        onClick={() => {
          // Send the goal to Yandex.Metrica
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
      {/* The wrapped button */}
      <div onClick={handleClick} role="button" tabIndex={0}>
        {children}
      </div>
    </div>
  );
};

export default YandexMetricaButton;
