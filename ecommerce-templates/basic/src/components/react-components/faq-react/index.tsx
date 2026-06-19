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
        console.error('Failed to load FAQ data:', error);
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
    return <div>FAQ data could not be loaded</div>;
  }

  const faqItems: FaqItem[] = faqData.faqs || [];

  // Default values
  const backgroundColor = faqData.bgFaq?.value as string || '#ffffff';
  const textColor = faqData.textColorFaq?.value as string || '#000000';
  const isRounded = faqData.isRounded?.value as boolean || false;
  const faqTitle = faqData.faqTitle?.value || 'FAQ';

  return (
    <section className="py-20 lg:py-28">
      <div
        className="mx-auto max-w-screen-md border border-border p-8 lg:p-10"
        id="idFAQ"
        style={{
          backgroundColor,
          color: textColor,
          borderRadius: isRounded ? '12px' : '0',
        }}
      >
        <p className="text-center font-mono text-eyebrow uppercase tracking-[0.2em] text-muted">
          FAQ
        </p>
        <h2 className="mt-4 mb-8 text-center text-3xl tracking-tight sm:text-4xl">
          {faqTitle}
        </h2>
        <div className="mx-auto max-w-screen-md">
          <div id="accordion-flush" data-accordion="collapse">
            {faqItems.length === 0 ? (
              <div className="py-5 text-center">
                <p>Nothing to show yet</p>
              </div>
            ) : (
              faqItems.map((item, index) => (
                <div key={index}>
                  <h3 id={`accordion-flush-heading-${index + 1}`}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 border-b border-border py-5 text-left font-medium"
                      onClick={() => handleAccordionClick(index)}
                      aria-expanded={isAccordionActive(index)}
                      aria-controls={`accordion-flush-body-${index + 1}`}
                    >
                      <span>{item.question || 'Question'}</span>
                      <svg
                        className={`h-5 w-5 shrink-0 text-muted transition-transform ${isAccordionActive(index) ? 'rotate-180' : ''}`}
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
                    className={`${isAccordionActive(index) ? '' : 'hidden'} border-b border-border py-5`}
                    aria-labelledby={`accordion-flush-heading-${index + 1}`}
                  >
                    <p className="leading-relaxed opacity-80">
                      {item.answer || 'Answer'}
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