import { FiPhone } from 'react-icons/fi';
import { LiaTelegram } from 'react-icons/lia';
import { IoLogoWhatsapp } from 'react-icons/io';
import { TfiEmail } from 'react-icons/tfi';
import { cmNavbarBurgerMenuReact, cmFooter } from '../../../../locale/cms-locale.json';

interface StyleProperty {
  label: string;
  value: string | boolean;
}

interface FooterData {
  labelSection: string;
  colorTextBoxLinkFooterPhone: StyleProperty;
  isRoundedBoxLinkFooterPhone: StyleProperty;
  bgBoxLinkFooterPhone: StyleProperty;
  colorTextBoxLinkFooterTelegram: StyleProperty;
  isRoundedBoxLinkFooterTelegram: StyleProperty;
  bgBoxLinkFooterTelegram: StyleProperty;
  colorTextBoxLinkFooterWhatsApp: StyleProperty;
  isRoundedBoxLinkFooterWhatsApp: StyleProperty;
  bgBoxLinkFooterWhatsApp: StyleProperty;
  colorTextBoxLinkFooterEmail: StyleProperty;
  isRoundedBoxLinkFooterEmail: StyleProperty;
  bgBoxLinkFooterEmail: StyleProperty;
}

interface BurgerMenuData {
  labelSection: string;
  links: Array<{
    path: string;
    label: string;
    isActive: boolean;
    badge: boolean;
    titleBadge: string;
    title?: string;
    link?: string;
  }>;
}

const FooterBoxLinks: React.FC = () => {
  // Приведение типов
  const footerData = cmFooter as unknown as FooterData;
  const burgerMenuData = cmNavbarBurgerMenuReact as unknown as BurgerMenuData;

  // Находим контактные данные в бургер-меню
  const phoneLink = burgerMenuData.links.find(link => link.label === "Номер телефона");
  const telegramLink = burgerMenuData.links.find(link => link.label === "Номер Telegram");
  const whatsappLink = burgerMenuData.links.find(link => link.label === "Номер WhatsApp");
  const vkLink = burgerMenuData.links.find(link => link.label === "ВКонтакте");
  const emailLink = burgerMenuData.links.find(link => link.label === "Электронная почта");

  // Извлекаем значения из StyleProperty объектов
  const phoneColor = footerData.colorTextBoxLinkFooterPhone?.value as string || '#000000';
  const phoneRounded = footerData.isRoundedBoxLinkFooterPhone?.value as boolean || false;
  const phoneBg = footerData.bgBoxLinkFooterPhone?.value as string || '#c8ddc6';

  const telegramColor = footerData.colorTextBoxLinkFooterTelegram?.value as string || '#000000';
  const telegramRounded = footerData.isRoundedBoxLinkFooterTelegram?.value as boolean || false;
  const telegramBg = footerData.bgBoxLinkFooterTelegram?.value as string || '#c8ddc6';

  const whatsappColor = footerData.colorTextBoxLinkFooterWhatsApp?.value as string || '#000000';
  const whatsappRounded = footerData.isRoundedBoxLinkFooterWhatsApp?.value as boolean || false;
  const whatsappBg = footerData.bgBoxLinkFooterWhatsApp?.value as string || '#c8ddc6';

  const emailColor = footerData.colorTextBoxLinkFooterEmail?.value as string || '#000000';
  const emailRounded = footerData.isRoundedBoxLinkFooterEmail?.value as boolean || false;
  const emailBg = footerData.bgBoxLinkFooterEmail?.value as string || '#c8ddc6';

  // Общий базовый стиль для всех ссылок
  const baseLinkStyle = `
    w-full text-center transition-colors duration-300
    p-2 flex justify-center items-center space-x-2
  `;

  return (
    <div className="flex flex-col items-center space-y-4 mt-4 w-[180px]">
      {phoneLink && phoneLink.path && (
        <a id='linkFooterPhone'
          href={`tel:${phoneLink.path}`}
          className={`${baseLinkStyle} ${phoneRounded ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: phoneColor,
            backgroundColor: phoneBg,
          }}
        >
          <FiPhone />
          <span>{phoneLink.path}</span>
        </a>
      )}

      {telegramLink && telegramLink.path && (
        <a id='linkFooterTelegram'
          href={`https://t.me/${telegramLink.path}`}
          className={`${baseLinkStyle} ${telegramRounded ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: telegramColor,
            backgroundColor: telegramBg,
          }}
        >
          <LiaTelegram />
          <span>Telegram</span>
        </a>
      )}

      {whatsappLink && whatsappLink.path && (
        <a id='linkFooterWhatsApp'
          href={`https://wa.me/${whatsappLink.path}`}
          className={`${baseLinkStyle} ${whatsappRounded ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: whatsappColor,
            backgroundColor: whatsappBg,
          }}
        >
          <IoLogoWhatsapp />
          <span>WhatsApp</span>
        </a>
      )}

      {vkLink && vkLink.path && (
        <a id='linkFooterVKLink'
          href={`https://vk.com/${vkLink.path}`}
          className={`${baseLinkStyle} ${whatsappRounded ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: whatsappColor,
            backgroundColor: whatsappBg,
          }}
        >
          <img src={'/VKLogo.png'} width={24} height={24} alt="Logo VK" />
          <span>ВКонтакте</span>
        </a>
      )}

      {emailLink && emailLink.path && (
        <a id='linkFooterEmail'
          href={`mailto:${emailLink.path}`}
          className={`${baseLinkStyle} ${emailRounded ? 'rounded-full' : 'rounded-md'}`}
          style={{
            color: emailColor,
            backgroundColor: emailBg,
          }}
        >
          <TfiEmail />
          <span>Email</span>
        </a>
      )}
    </div>
  );
};

export default FooterBoxLinks;