import React, { useState, useEffect, useRef } from "react";
import { FiPhone } from "react-icons/fi";
import { LiaTelegram } from "react-icons/lia";
import { IoIosLogIn, IoLogoWhatsapp } from "react-icons/io";
import { TfiEmail } from "react-icons/tfi";
import BurgerMenuButton from "./button-burger-menu";
import { cmNavbar, cmNavbarBurgerMenuReact } from "../../../locale/cms-locale.json";

// интерфейс для одной ссылки
interface BurgerLink {
  path?: string;
  link?: string;
  label: string;
  title?: string;
  isActive: boolean;
  type: "link" | "phone" | "telegram" | "whatsapp" | "vk" | "email" | "login";
}

// нормализация ссылки (path vs link)
const getHref = (link: BurgerLink): string => {
  if (link.type === "login" && link.link) return link.link;
  return link.path ?? "#";
};

const BurgerMenuReact: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mouseInsideMenu, setMouseInsideMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    const closeMenuAfterDelay = setTimeout(() => {
      if (!mouseInsideMenu) setIsOpen(false);
    }, 5000);
    return () => clearTimeout(closeMenuAfterDelay);
  }, [isOpen, mouseInsideMenu]);

  const handleMouseEnter = () => setMouseInsideMenu(true);
  const handleMouseLeave = () => setMouseInsideMenu(false);

  const renderLink = (link: BurgerLink, index: number) => {
    switch (link.type) {
      case "phone":
        return (
          <a
            key={index}
            href={`tel:${link.path}`}
            className="w-full text-center text-[#00FF00] hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
          >
            <FiPhone size={24} />
            <span>{link.path}</span>
          </a>
        );

      case "telegram":
        return (
          <a
            key={index}
            href={`https://t.me/${link.path}`}
            className="w-full text-center text-[#00FF00] hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
          >
            <LiaTelegram size={24} />
            <span>Telegram</span>
          </a>
        );

      case "whatsapp":
        return (
          <a
            key={index}
            href={`https://wa.me/${link.path}`}
            className="w-full text-center text-[#00FF00] hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
          >
            <IoLogoWhatsapp size={24} />
            <span>WhatsApp</span>
          </a>
        );

      case "vk":
        return (
          <a
            key={index}
            href={`https://vk.com/${link.path}`}
            className="w-full text-center text-[#00FF00] hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
          >
            <img src="/VKLogo.png" width={24} height={24} alt="VK" />
            <span>ВКонтакте</span>
          </a>
        );

      case "email":
        return (
          <a
            key={index}
            href={`mailto:${link.path}`}
            className="w-full text-center text-[#00FF00] hover:text-[#FF00FF] bg-gray-900 rounded-lg p-2 flex justify-center items-center space-x-2"
          >
            <TfiEmail size={24} />
            <span>Email</span>
          </a>
        );

      case "login":
        return (
          <a
            key={index}
            href={getHref(link)}
            className="w-full text-center text-gray-900 py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-500 hover:text-white flex justify-center items-center space-x-2"
          >
            <IoIosLogIn size={24} />
            <span>{link.label}</span>
          </a>
        );

      default: // обычная навигационная ссылка
        return (
          <a
            key={index}
            href={getHref(link)}
            className="bg-blue-200 w-full text-center text-gray-900 py-2 px-4 rounded-lg transition-colors duration-300 hover:bg-blue-500 hover:text-white"
          >
            {link.label || link.title}
          </a>
        );
    }
  };

  return (
    <div>
      <BurgerMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />

      {isOpen && (
        <div
          ref={menuRef}
          className="overflow-y-auto fixed top-0 right-0 w-64 shadow-lg rounded-lg z-40 h-full p-4"
          style={{
            background: "#e6edf0",
            color: cmNavbar.textColorNavbar.value,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col items-center mt-4 space-y-4">
            <h2 className="mt-10 text-lg font-bold">
              {cmNavbarBurgerMenuReact.mainBurger.value}
            </h2>
            <p className="text-sm text-center">
              {cmNavbarBurgerMenuReact.mainBurgerSubtitle.value}
            </p>

            {/* ссылки */}
            <div className="flex flex-col items-center space-y-2 w-full">
              {(cmNavbarBurgerMenuReact.links as BurgerLink[])
                .filter((link) => link.isActive)
                .map(renderLink)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BurgerMenuReact;
