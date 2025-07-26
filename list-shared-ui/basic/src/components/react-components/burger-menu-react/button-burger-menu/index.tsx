// BurgerMenuButton.tsx
import React from 'react';
import bgBurgerMenu from '../../../../const/navbar/navbar.json';
import styles from './styles.module.css'; // Импортируем стили
import { FaBars, FaTimes } from 'react-icons/fa';

// Функция для затемнения цвета
const darkenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Затемняем цвет
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

interface BurgerMenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const BurgerMenuButton: React.FC<BurgerMenuButtonProps> = ({ isOpen, toggleMenu }) => {
  const textColor = bgBurgerMenu.textColorBurger; // Получаем цвет из JSON
  const hoverColor = darkenColor(textColor, 0.2); // Затемняем цвет на 20%

  const style = {
    '--burger-color': textColor,
    '--burger-hover-color': hoverColor
  } as React.CSSProperties;

  return (
    <button
    id='btnBurger'
      className={`${styles.burgerButton} bg-[${bgBurgerMenu.bgBurger}] rounded-lg hover:scale-110
`}
      style={style}
      onClick={toggleMenu}
      aria-label="Menu"
    >
      {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
    </button>
  );
};

export default BurgerMenuButton;
