import React from 'react';
import styles from './styles.module.css';

interface FadeInWrapperProps {
  children: React.ReactNode;
}

const FadeInWrapperQuiz: React.FC<FadeInWrapperProps> = ({ children }) => {
  return (
    <div className={styles.fadeIn}>
      {children}
    </div>
  );
};

export default FadeInWrapperQuiz;


