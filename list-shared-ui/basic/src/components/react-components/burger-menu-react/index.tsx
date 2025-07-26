import React, { useState, useEffect, useRef } from 'react';

import { FiPhone } from 'react-icons/fi';
import { LiaTelegram } from 'react-icons/lia';
import { IoIosLogIn, IoLogoWhatsapp } from 'react-icons/io';
import { TfiEmail } from 'react-icons/tfi';
import textBurgerMenu from '../../../const/navbar/burger-menu-react.json';
import BurgerMenuButton from './button-burger-menu';
import linksNavbar from '../../../const/navbar/navbar.json'

const BurgerMenuReact: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mouseInsideMenu, setMouseInsideMenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const closeMenuAfterDelay = setTimeout(() => {
      if (!mouseInsideMenu) {
        setIsOpen(false);
      }
    }, 5000);

    return () => clearTimeout(closeMenuAfterDelay);
  }, [isOpen, mouseInsideMenu]);

  const handleMouseEnter = () => setMouseInsideMenu(true);
  const handleMouseLeave = () => setMouseInsideMenu(false);

  return (
    <div >
      {/* Кнопка бургера */}
      
      <BurgerMenuButton isOpen={isOpen} toggleMenu={toggleMenu}  />
      {/* Меню */}
      {isOpen && (
        <div
        style={{
          background:'#e6edf0',
          color: linksNavbar.textColorNavbar}}
          ref={menuRef}
          className="overflow-y-auto fixed top-0 right-0 w-64  shadow-lg rounded-lg z-40 h-full p-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col items-center  mt-4 space-y-4 ">
            <h2 className="mt-10 text-lg font-bold">{textBurgerMenu.BurgerMenu.main_burger.title}</h2>
            <p className="text-sm text-center">{textBurgerMenu.BurgerMenu.main_burger_subtitle.title}</p>

            {/* Навигационные ссылки */}
            <div className="flex flex-col  items-center space-y-2 w-full 	">
              {Object.entries(textBurgerMenu.BurgerMenu).map(([key, value]: any) => (
                typeof value === 'object' && value.is_active && value.link && (
                  <a 
                    key={key} 
                    href={value.link} 
                    className="bg-blue-200 w-full text-center text-gray-900 py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-500 hover:text-white"
                  >
                    {value.title}
                  </a>
                )
              ))}
            </div>

            {/* Социальные ссылки */}
            <div className="flex flex-col items-center space-y-4 mt-4 w-full">
              <a
                href={`tel:${textBurgerMenu.BurgerMenu.phone.title}`}
                className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
              >
                <FiPhone size={24} />
                <span>{textBurgerMenu.BurgerMenu.phone.title}</span>
              </a>
              {textBurgerMenu.BurgerMenu.telegram_number.title && <a
                href={`https://t.me/${textBurgerMenu.BurgerMenu.telegram_number.title}`}
                className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
              >
                <LiaTelegram size={24} />
                <span>Telegram</span>
              </a>}
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
              {textBurgerMenu.BurgerMenu.email && (
                <a
                  href={`mailto:${textBurgerMenu.BurgerMenu.email.title}`}
                  className="w-full text-center text-[#00FF00] transition-colors duration-300 hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
                >
                  <TfiEmail size={24} />
                  <span>Email</span>
                </a>
              )}
              <a 
                href="/index-editor"
                className="w-full text-center text-gray-900 py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-500 hover:text-white flex justify-center items-center space-x-2"
              >
                <IoIosLogIn size={24} />
                <span>{textBurgerMenu.BurgerMenu.login.title}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BurgerMenuReact;