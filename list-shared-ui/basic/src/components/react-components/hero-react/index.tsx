import React from 'react';
import heroImage from '../../../assets/hero.webp'; 
import HeroCustomReact from '../hero-custom-react';
import MarkdownText from '../markdown-text';
import { useCmsText } from 'cms-context/useCMS';

const HeroReact = () => {
 
const { cmHero } = useCmsText();
// console.warn('cmHero', cmHero)

  const renderButtons = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {cmHero.isActiveBtnOne?.value && (
        <a
          href={cmHero.linkButtonOne.value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-1 items-center justify-center px-4 py-2 rounded-md transition-colors hover:opacity-90"
          style={{
            backgroundColor: cmHero.bgBtnOneStyleCm.value,
            color: cmHero.colorBtnOneStyleCm.value
          }}
        >
          <span className="text-blue-300">[Иконка 1]</span>
          {cmHero.buttonOne.value}
        </a>
      )}
      {cmHero.isActiveBtnTwo?.value && (
        <a
          href={cmHero.linkButtonTwo.value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-1 items-center justify-center px-4 py-2 rounded-md border transition-colors hover:opacity-90"
          style={{
            backgroundColor: cmHero.bgBtnTwoStyleCm.value,
            color: cmHero.colorBtnTwoStyleCm.value,
            borderColor: cmHero.colorBtnTwoStyleCm.value
          }}
        >
          <span className="text-orange-300">[Иконка 2]</span>
          {cmHero.buttonTwo.value}
        </a>
      )}
    </div>
  );

  const renderImage = (className = '') => (
    <img
      src={heroImage.src} 
      alt="Astronaut in the air"
      loading={cmHero.isHeroBackgroundImg?.value ? "eager" : "lazy"}
      width="600"   
      height="420"
      className={`
        ${cmHero.isRoundedMainImg.value ? 'rounded-2xl' : ''} 
        ${cmHero.isBlackAndWhitePhoto.value ? 'filter grayscale' : ''}
        ${className}
      `}
    />
  );
  

  if (cmHero.isCustomHero?.value) {
    return <HeroCustomReact />;
  }

  return (
    <section 
      style={{ color: cmHero.colorTextIsBackgroundImgStyleCm.value }}
      className="grid lg:grid-cols-2 place-items-center pt-16 pb-8 md:pt-12 md:pb-24"
    >
      <div className="order-first lg:order-none">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold lg:tracking-tight xl:tracking-tighter w-full">
          {cmHero.title.value}
        </h1>

        {!cmHero.isHeroBackgroundImg?.value && (
          <div className="py-6 order-last md:order-none md:block lg:hidden">
            {renderImage('w-full max-w-[620px]')}
          </div>
        )}

        <div className="text-lg max-w-xl">
          <MarkdownText text={cmHero.subtitle.value} />
        </div>

        {renderButtons()}
      </div>

      {!cmHero.isHeroBackgroundImg?.value && (
        <div className={`${cmHero.isRoundedMainImg.value ? 'rounded-full' : ''} py-6 order-none hidden lg:block`}>
          {renderImage('w-full max-w-[620px]')}
        </div>
      )}
    </section>
  );
};

export default HeroReact;