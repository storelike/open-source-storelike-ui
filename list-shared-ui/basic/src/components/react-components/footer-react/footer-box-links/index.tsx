import { FiPhone } from 'react-icons/fi';
import { LiaTelegram } from 'react-icons/lia';
import { IoLogoWhatsapp } from 'react-icons/io';
import { TfiEmail } from 'react-icons/tfi';
import textBurgerMenu from '../../../../const/navbar/burger-menu-react.json';
import themeFooter from '../../../../const/footer/footer.json';

const FooterBoxLinks: React.FC = () => {
  // Извлекаем стили из JSON для каждой ссылки
  const {
    colorTextBoxLinkFooterPhone,
    isRoundedBoxLinkFooterPhone,
    bgBoxLinkFooterPhone,
    colorTextBoxLinkFooterTelegram,
    isRoundedBoxLinkFooterTelegram,
    bgBoxLinkFooterTelegram,
    colorTextBoxLinkFooterWhatsApp,
    isRoundedBoxLinkFooterWhatsApp,
    bgBoxLinkFooterWhatsApp,
    colorTextBoxLinkFooterEmail,
    isRoundedBoxLinkFooterEmail,
    bgBoxLinkFooterEmail,
  } = themeFooter;

  // Общий базовый стиль для всех ссылок
  const baseLinkStyle = `
    w-full text-center transition-colors duration-300
    p-2 flex justify-center items-center space-x-2
  `;

  return (
    <div className="flex flex-col items-center space-y-4 mt-4 w-[180px]">
      <a id='linkFooterPhone'
        href={`tel:${textBurgerMenu.BurgerMenu.phone.title}`}
        className={`${baseLinkStyle} ${isRoundedBoxLinkFooterPhone ? 'rounded-full' : 'rounded-md'}`}
        style={{
          color: colorTextBoxLinkFooterPhone,
          backgroundColor: bgBoxLinkFooterPhone,
        } as React.CSSProperties}
      >
        <FiPhone />
        <span>{textBurgerMenu.BurgerMenu.phone.title}</span>
      </a>

      {textBurgerMenu.BurgerMenu.telegram_number.title && <a id='linkFooterTelegram'
        href={`https://t.me/${textBurgerMenu.BurgerMenu.telegram_number.title}`}
        className={`${baseLinkStyle} ${isRoundedBoxLinkFooterTelegram ? 'rounded-full' : 'rounded-md'}`}
        style={{
          color: colorTextBoxLinkFooterTelegram,
          backgroundColor: bgBoxLinkFooterTelegram,
        } as React.CSSProperties}
      >
        <LiaTelegram />
        <span>Telegram</span>
      </a>}

     {textBurgerMenu.BurgerMenu.whatsapp_number.title && <a id='linkFooterWhatsApp'
        href={`https://wa.me/${textBurgerMenu.BurgerMenu.whatsapp_number.title}`}
        className={`${baseLinkStyle} ${isRoundedBoxLinkFooterWhatsApp ? 'rounded-full' : 'rounded-md'}`}
        style={{
          color: colorTextBoxLinkFooterWhatsApp,
          backgroundColor: bgBoxLinkFooterWhatsApp,
        } as React.CSSProperties}
      >
        <IoLogoWhatsapp />
        <span>WhatsApp</span>
      </a>}

      {textBurgerMenu.BurgerMenu.whatsapp_number.title && <a id='linkFooterVKLink'
        href={`https://vk.com/${textBurgerMenu.BurgerMenu.whatsapp_number.title}`}
        className={`${baseLinkStyle} ${isRoundedBoxLinkFooterWhatsApp ? 'rounded-full' : 'rounded-md'}`}
        style={{
          color: colorTextBoxLinkFooterWhatsApp,
          backgroundColor: bgBoxLinkFooterWhatsApp,
        } as React.CSSProperties}
      >
       <img src={'/VKLogo.png'} width={24} height={24} alt="Logo VK" />
       <span>ВКонтакте</span>
      </a>}

      {textBurgerMenu.BurgerMenu.email.title && (
        <a id='linkFooterEmail'
          href={`mailto:${textBurgerMenu.BurgerMenu.email.title}`}
          className={`${baseLinkStyle} ${isRoundedBoxLinkFooterEmail ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: colorTextBoxLinkFooterEmail,
            backgroundColor: bgBoxLinkFooterEmail,
          } as React.CSSProperties}
        >
          <TfiEmail />
          <span>Email</span>
        </a>
      )}
    </div>
  );
};

export default FooterBoxLinks;
