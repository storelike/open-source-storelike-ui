import { useState, useEffect } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface StyleProperty {
  label: string;
  value: string | boolean;
}

interface FaqData {
  labelSection: string;
  bgFaq: StyleProperty;
  textColorFaq: StyleProperty;
  isRounded: StyleProperty;
  faqTitle: StyleProperty;
  faqs: FaqItem[];
}

const FAQReact = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FaqData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaqData = async () => {
      try {
        const data = await import('../../../locale/cms-locale.json');
        setFaqData(data.cmFaq as unknown as FaqData);
      } catch (error) {
        console.error('Ошибка загрузки данных FAQ:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFaqData();
  }, []);

  const handleAccordionClick = (index: number) => {
    setActiveAccordion((prevIndex) => (prevIndex === index ? null : index));
  };

  const isAccordionActive = (index: number) => activeAccordion === index;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!faqData) {
    return <div>Данные FAQ не загружены</div>;
  }

  const faqItems: FaqItem[] = faqData.faqs || [];

  // Значения по умолчанию
  const backgroundColor = faqData.bgFaq?.value as string || '#ffffff';
  const textColor = faqData.textColorFaq?.value as string || '#000000';
  const isRounded = faqData.isRounded?.value as boolean || false;
  const faqTitle = faqData.faqTitle?.value || 'FAQ';

  return (
    <section className=''>
      <div 
        className="max-w-screen-md p-5 mx-auto"
        id="idFAQ"
        style={{
          backgroundColor,
          color: textColor,
          borderRadius: isRounded ? '30px' : '0',
        }}
      >
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center lg:mb-8 lg:text-3xl">
          {faqTitle}
        </h2>
        <div className="max-w-screen-md mx-auto">
          <div id="accordion-flush" data-accordion="collapse">
            {faqItems.length === 0 ? (
              <div className="text-center py-5">
                <p>Нет данных для отображения</p>
              </div>
            ) : (
              faqItems.map((item, index) => (
                <div key={index}>
                  <h3 id={`accordion-flush-heading-${index + 1}`}>
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full py-5 font-medium text-left ${
                        isAccordionActive(index)
                          ? 'rounded-lg p-2 border-b border-gray-200 dark:border-gray-700'
                          : 'border-b border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => handleAccordionClick(index)}
                      aria-expanded={isAccordionActive(index)}
                      aria-controls={`accordion-flush-body-${index + 1}`}
                    >
                      <span>{item.question || 'Вопрос'}</span>
                      <svg
                        className={`w-6 h-6 ${isAccordionActive(index) ? 'rotate-180' : ''}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </h3>
                  <div
                    id={`accordion-flush-body-${index + 1}`}
                    className={`${isAccordionActive(index) ? '' : 'hidden'} py-5 border-b border-gray-200 dark:border-gray-700`}
                    aria-labelledby={`accordion-flush-heading-${index + 1}`}
                  >
                    <p className="mb-2 p-3 rounded-lg">
                      {item.answer || 'Ответ'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQReact;