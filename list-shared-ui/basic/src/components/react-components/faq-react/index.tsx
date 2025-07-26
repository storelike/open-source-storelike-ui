import { useState } from 'react';
import textJsonFAQ from '../../../const/faq/faq.json';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQReact = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const handleAccordionClick = (index: number) => {
    setActiveAccordion((prevIndex) => (prevIndex === index ? null : index));
  };

  const isAccordionActive = (index: number) => activeAccordion === index;

  const faqItems: FaqItem[] = textJsonFAQ?.faqs;

  return (
    <section
   className=''>
      <div className="max-w-screen-md  p-5 mx-auto  "
      id="idFAQ"
      style={{
        backgroundColor: textJsonFAQ.bgFAQ, 
        color: textJsonFAQ.textColorFAQ,
        borderRadius: textJsonFAQ?.isRounded ? '30px' : '0',
      }}
      >
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-center lg:mb-8 lg:text-3xl">
          {textJsonFAQ.faq_title}
        </h2>
        <div className="max-w-screen-md mx-auto">
          <div id="accordion-flush" data-accordion="collapse">
            {faqItems.map((item, index) => (
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
                    <span>{item.question}</span>
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
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQReact;