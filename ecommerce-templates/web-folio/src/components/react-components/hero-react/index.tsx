import React from 'react';
import HeroCustomReact from '../hero-custom-react';
import MarkdownText from '../markdown-text';
import { useCmsData } from 'cms-get-data/useCmsData';
import { MdOutlineContactPhone } from "react-icons/md";
import { PiTargetLight } from "react-icons/pi";

const HeroReact = () => {
  const { cmHero } = useCmsData();
  if (!cmHero) return <div>Loading...</div>;
  if (cmHero?.isCustomHero?.value) return <HeroCustomReact />;

  const colorText = cmHero?.colorThemeStyleCm?.value || '#ffffff';
  const mainBgUrl = cmHero?.mainBackground?.value || '/hero/hero-overlay.png';
  const overlayBgUrl = cmHero?.overlayBackground?.value || '/hero/hero.webp';

  const mainBgBlur = cmHero?.mainBgBlur?.value || 1.2;
  const mainBgBrightness = cmHero?.mainBgBrightness?.value || 0.55;

  const maskCenterSize = cmHero?.maskCenterSize?.value || 38;
  const maskEdgeSize = cmHero?.maskEdgeSize?.value || 80;

  const centerMaskInner = cmHero?.centerMaskInner?.value || 35;
  const centerMaskFade = cmHero?.centerMaskFade?.value || 75;

  const isGradientOverlay = cmHero?.isGradientOverlay?.value ?? true;
  const overlayOpacity = cmHero?.overlayOpacity?.value ?? 0.45;

  const renderButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      {cmHero?.isActiveBtnOne?.value && (
        <a
          href={cmHero?.linkButtonOne?.value || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2 items-center justify-center px-6 py-3 rounded-md font-semibold transition-all hover:opacity-90 text-base sm:text-lg md:text-xl"
          style={{
            backgroundColor: cmHero?.bgBtnOneStyleCm?.value || '#f8b84e',
            color: cmHero?.colorBtnOneStyleCm?.value || '#000',
          }}
        >
          <PiTargetLight className="text-lg sm:text-xl" />
          {cmHero?.buttonOne?.value || 'Посмотреть портфолио'}
        </a>
      )}
      {cmHero?.isActiveBtnTwo?.value && (
        <a
          href={cmHero?.linkButtonTwo?.value || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2 items-center justify-center px-6 py-3 rounded-md font-semibold border transition-all hover:opacity-90 text-base sm:text-lg md:text-xl"
          style={{
            backgroundColor: cmHero?.bgBtnTwoStyleCm?.value || 'transparent',
            color: cmHero?.colorBtnTwoStyleCm?.value || '#fff',
            borderColor: cmHero?.colorBtnTwoStyleCm?.value || '#fff',
          }}
        >
          <MdOutlineContactPhone className="text-lg sm:text-xl" />
          {cmHero?.buttonTwo?.value || 'Записаться на съёмку'}
        </a>
      )}
    </div>
  );

  return (
    <header
      className="relative flex flex-col justify-center items-center text-center min-h-[90vh] px-4 sm:px-6 py-10 overflow-hidden"
      style={{ color: colorText }}
    >
      {/* Фон по бокам */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${mainBgUrl})`,
          filter: `blur(${mainBgBlur}px) brightness(${mainBgBrightness})`,
          WebkitMaskImage: `radial-gradient(circle at center, transparent ${maskCenterSize}%, black ${maskEdgeSize}%)`,
          maskImage: `radial-gradient(circle at center, transparent ${maskCenterSize}%, black ${maskEdgeSize}%)`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'cover',
          maskSize: 'cover',
        }}
      />

      {/* Центральное фото */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[1]"
        style={{
          backgroundImage: `url(${overlayBgUrl})`,
          WebkitMaskImage: `radial-gradient(circle at center, black ${centerMaskInner}%, transparent ${centerMaskFade}%)`,
          maskImage: `radial-gradient(circle at center, black ${centerMaskInner}%, transparent ${centerMaskFade}%)`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'cover',
          maskSize: 'cover',
        }}
      />

      {isGradientOverlay && (
        <div
          className="absolute inset-0 z-[2]"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        />
      )}

      {/* Контент */}
      <div className="relative z-[3] max-w-3xl">
        <h1
          className="
            font-bold leading-tight drop-shadow-xl mb-4
            text-xl sm:text-4xl md:text-5xl lg:text-6xl
          "
        >
          {cmHero?.title?.value ||
            'Сохраняю улыбки и моменты детства в красивых школьных альбомах'}
        </h1>

        <div
          className="
            opacity-95 max-w-2xl mx-auto mb-8
            text-base sm:text-lg md:text-xl
          "
        >
          <MarkdownText
            text={
              cmHero?.subtitle?.value ||
              'Фотограф Соня Моллерова, г. Тайшет — съёмка выпускных, школьных и индивидуальных фотосессий.'
            }
          />
        </div>

        {renderButtons()}
      </div>

      {/* Градиент снизу */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent z-[2]" />
    </header>
  );
};

export default HeroReact;
